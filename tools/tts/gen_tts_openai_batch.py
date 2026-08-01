#!/usr/bin/env python3
"""
tools/tts/gen_tts_openai_batch.py — Practical Phonemic TTS 量産 (Issue #237 Phase 3)

OpenAI `gpt-4o-mini-tts` をローカルから直接呼び出し、
`packages/core/data/wordlist.json` の全語について GA/RP 両アクセントの mp3 を生成。
出力先: `tools/tts/audio/{ga,rp}/{word}.mp3`

    python3 tools/tts/gen_tts_openai_batch.py --dry-run
    OPENAI_API_KEY=sk-... python3 tools/tts/gen_tts_openai_batch.py --workers 3

冪等: 既存 mp3 はスキップ。`--force` で全再生成。
"""

from __future__ import annotations

import argparse
import concurrent.futures
import json
import re
import sys
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WORDLIST_PATH = REPO_ROOT / "packages" / "core" / "data" / "wordlist.json"
DEFAULT_OUT_DIR = REPO_ROOT / "tools" / "tts" / "audio"
ACCENTS = ("ga", "rp")

OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech"
TTS_MODEL = "gpt-4o-mini-tts"
TTS_VOICE = "alloy"
TTS_SPEED = 0.8
MAX_RETRIES = 8

TTS_INSTRUCTIONS_GA = (
    "Speak in a natural General American English accent. Pronounce the word "
    "clearly at a normal, unhurried pace as if in a pronunciation reference."
)
TTS_INSTRUCTIONS_RP = (
    "Speak in a natural British Received Pronunciation (RP) accent. Pronounce "
    "the word clearly at a normal, unhurried pace as if in a pronunciation "
    "reference."
)
INSTRUCTIONS_BY_ACCENT = {"ga": TTS_INSTRUCTIONS_GA, "rp": TTS_INSTRUCTIONS_RP}


def slugify(word: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", word.lower()).strip("_")
    return slug or "word"


def load_wordlist(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def all_words(entries: list[dict]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for e in entries:
        w = e.get("w")
        if w and w not in seen:
            seen.add(w)
            unique.append(w)
    return unique


def planned_paths(words: list[str], out_dir: Path) -> list[tuple[str, str, Path]]:
    used_slugs: set[str] = set()
    slug_for_word: dict[str, str] = {}
    for word in words:
        base_slug = slugify(word)
        slug = base_slug
        suffix = 2
        while slug in used_slugs:
            slug = f"{base_slug}_{suffix}"
            suffix += 1
        used_slugs.add(slug)
        slug_for_word[word] = slug

    plan = []
    for word in words:
        slug = slug_for_word[word]
        for accent in ACCENTS:
            plan.append((word, accent, out_dir / accent / f"{slug}.mp3"))
    return plan


def fetch_mp3(api_key: str, word: str, accent: str, timeout: float = 60.0) -> bytes:
    payload = json.dumps({
        "model": TTS_MODEL,
        "voice": TTS_VOICE,
        "input": word,
        "instructions": INSTRUCTIONS_BY_ACCENT[accent],
        "response_format": "mp3",
        "speed": TTS_SPEED,
    }).encode("utf-8")

    for attempt in range(MAX_RETRIES):
        req = urllib.request.Request(
            OPENAI_TTS_URL,
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as res:
                data = res.read()
            if not data:
                raise RuntimeError(f"empty response for {word!r} {accent}")
            return data
        except urllib.error.HTTPError as exc:
            if exc.code == 429 and attempt < MAX_RETRIES - 1:
                wait = min(2 ** (attempt + 2), 120)
                print(f"[429] {word}\t{accent} — retrying in {wait}s (attempt {attempt + 1}/{MAX_RETRIES})", file=sys.stderr)
                time.sleep(wait)
                continue
            raise

    raise RuntimeError(f"max retries exceeded for {word!r} {accent}")


def process_one(
    api_key: str, word: str, accent: str, out_path: Path,
    force: bool, counters: dict, lock: threading.Lock,
) -> None:
    if out_path.exists() and not force:
        with lock:
            counters["skipped"] += 1
        return
    out_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        data = fetch_mp3(api_key, word, accent)
        out_path.write_bytes(data)
        with lock:
            counters["generated"] += 1
            n = counters["generated"]
        if n % 100 == 0:
            print(f"[progress] generated={n}")
    except (urllib.error.URLError, urllib.error.HTTPError, RuntimeError) as exc:
        with lock:
            counters["failed"] += 1
        print(f"[FAIL] {word}\t{accent}: {exc}", file=sys.stderr)


def run(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="TTS 量産 (OpenAI 直接, Issue #237)")
    parser.add_argument("--out-dir", type=Path, default=DEFAULT_OUT_DIR)
    parser.add_argument("--wordlist", type=Path, default=WORDLIST_PATH)
    parser.add_argument("--api-key", type=str, default=None)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--workers", type=int, default=3, help="並列数（既定: 3）")
    args = parser.parse_args(argv)

    import os

    entries = load_wordlist(args.wordlist)
    words = all_words(entries)
    if args.limit is not None:
        words = words[:args.limit]
    plan = planned_paths(words, args.out_dir)

    print(f"[gen_tts] {len(words)} words, {len(plan)} mp3 planned (GA+RP)")

    if args.dry_run:
        for word, accent, out_path in plan:
            print(f"[dry-run] {word}\t{accent}\t{out_path.relative_to(REPO_ROOT)}")
        print(f"[gen_tts] dry-run: {len(plan)} paths, 0 requests")
        return 0

    api_key = args.api_key or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("[gen_tts] ERROR: OPENAI_API_KEY not set.", file=sys.stderr)
        return 2

    counters = {"generated": 0, "skipped": 0, "failed": 0}
    lock = threading.Lock()

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = [
            pool.submit(process_one, api_key, word, accent, out_path, args.force, counters, lock)
            for word, accent, out_path in plan
        ]
        for f in concurrent.futures.as_completed(futures):
            f.result()

    print(
        f"[gen_tts] done: generated={counters['generated']} "
        f"skipped={counters['skipped']} failed={counters['failed']} "
        f"(total={len(plan)})"
    )
    return 1 if counters["failed"] else 0


if __name__ == "__main__":
    raise SystemExit(run())
