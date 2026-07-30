#!/usr/bin/env python3
"""
tools/tts/gen_tts_batch.py — Mobile hybrid delivery 用の TTS 事前バッチ生成 (Issue #222 Phase 1)

`packages/core/data/wordlist.json` から「人気単語」を選定し、既存の GAS TTS プロキシ
（`tools/tts/gas/Code.gs`、`GAS_TTS_URL`）を叩いて GA/RP 両方の mp3 を取得し、
`apps/mobile/assets/audio/{ga,rp}/{word}.mp3` に保存する。

## 人気単語の選定ロジック（Issue #222 本文の union 定義に対応）

Issue 本文は次の union（重複除外）で上位 N 語を選ぶよう定義している:
  1. CEFR A1 全単語（`wordlist.json` の `cefr == "A1"` 全件、1,187 語）
  2. Web の学習履歴データ（GAS Analytics 利用不可の場合は CEFR A1 で埋める、と明記）
  3. UI の Step 1a/2a-d/3a-d のデフォルト表示単語
     （`apps/web/src/index.template.html` の `progressDefaultCefrLevels()` により、
     UI のデフォルト CEFR プールは `["A1", "A2"]` であることを確認済み）

本ツールが実装するアルゴリズム:
  - CEFR バンド優先順位 A1 → A2 → B1 → B2 で、各バンド内は `wordlist.json` 内の元の並び順を
    維持したままフラット化し、先頭から `--top-n` 件を採用する。
  - GAS Analytics（学習履歴データ）は本ツール実行環境から参照できないため、Issue 本文の指示
    どおり CEFR A1 優先順で埋める。
  - UI デフォルトプール（A1+A2）は上記の CEFR 優先順位に自然に内包される
    （A1 だけで 1,187 語 > デフォルト `--top-n 1000` のため、既定実行では A1 のみで充足する）。

## 使い方

    python3 tools/tts/gen_tts_batch.py --top-n 1000 --dry-run
    GAS_TTS_URL=https://script.google.com/... python3 tools/tts/gen_tts_batch.py --top-n 10

## 冪等性

既存 mp3 がある場合はスキップする。`--force` で強制的に全再生成する。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WORDLIST_PATH = REPO_ROOT / "packages" / "core" / "data" / "wordlist.json"
DEFAULT_OUT_DIR = REPO_ROOT / "apps" / "mobile" / "assets" / "audio"
ACCENTS = ("ga", "rp")
# Issue #222 本文: CEFR 優先順位（A1 → A2 → B1 → B2）
CEFR_PRIORITY = ("A1", "A2", "B1", "B2")


def slugify(word: str) -> str:
    """ファイルシステムに安全な slug を生成する（小文字化 + 非英数字を `_` に置換）。"""
    slug = re.sub(r"[^a-z0-9]+", "_", word.lower()).strip("_")
    return slug or "word"


def load_wordlist(path: Path) -> list[dict]:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def select_popular_words(entries: list[dict], top_n: int) -> list[str]:
    """CEFR 優先順位（A1→A2→B1→B2、各バンド内は元の並び順）で上位 top_n 語を選定する。"""
    by_band: dict[str, list[str]] = {band: [] for band in CEFR_PRIORITY}
    others: list[str] = []
    for entry in entries:
        word = entry.get("w")
        if not word:
            continue
        cefr = entry.get("cefr")
        if cefr in by_band:
            by_band[cefr].append(word)
        else:
            others.append(word)

    ordered: list[str] = []
    for band in CEFR_PRIORITY:
        ordered.extend(by_band[band])
    ordered.extend(others)

    seen: set[str] = set()
    unique_ordered: list[str] = []
    for word in ordered:
        if word not in seen:
            seen.add(word)
            unique_ordered.append(word)

    return unique_ordered[:top_n]


def planned_paths(words: list[str], out_dir: Path) -> list[tuple[str, str, Path]]:
    """(word, accent, output_path) のタプルの一覧を生成する。

    `wordlist.json` には大文字/小文字違いの別エントリ（例: 'A' の文字名 vs 'a' の冠詞）が
    共存しており、素朴な小文字化 slug だとファイル名が衝突して片方を無言で上書きしてしまう。
    衝突が発生した語には連番サフィックス（`_2`, `_3`, ...）を付与して一意化する。
    """
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


def fetch_mp3(gas_url: str, word: str, accent: str, timeout: float = 30.0) -> bytes:
    query = urllib.parse.urlencode({"word": word, "accent": accent})
    url = f"{gas_url}?{query}"
    req = urllib.request.Request(url, headers={"User-Agent": "gen_tts_batch/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as res:  # noqa: S310 (trusted internal GAS_TTS_URL)
        data = res.read()
    if not data:
        raise RuntimeError(f"empty response body for word={word!r} accent={accent!r}")
    return data


def run(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="TTS 事前バッチ生成 (popular words, GA/RP)")
    parser.add_argument("--top-n", type=int, default=1000, help="生成対象の単語数（既定: 1000）")
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=DEFAULT_OUT_DIR,
        help=f"出力先ディレクトリ（既定: {DEFAULT_OUT_DIR}）",
    )
    parser.add_argument(
        "--wordlist",
        type=Path,
        default=WORDLIST_PATH,
        help=f"wordlist.json のパス（既定: {WORDLIST_PATH}）",
    )
    parser.add_argument(
        "--gas-url",
        type=str,
        default=None,
        help="GAS TTS プロキシの URL（未指定時は環境変数 GAS_TTS_URL を使用）",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="実際に HTTP リクエストを送らず、生成予定の path 一覧のみ出力する",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="既存 mp3 があっても再生成する（既定は既存ファイルをスキップ）",
    )
    parser.add_argument(
        "--sleep",
        type=float,
        default=0.0,
        help="各リクエスト間の待機秒数（GAS のレート制限回避用、既定: 0）",
    )
    args = parser.parse_args(argv)

    import os

    entries = load_wordlist(args.wordlist)
    words = select_popular_words(entries, args.top_n)
    plan = planned_paths(words, args.out_dir)

    print(f"[gen_tts_batch] wordlist={args.wordlist}")
    print(f"[gen_tts_batch] selected {len(words)} words (top-n={args.top_n}), {len(plan)} mp3 planned (GA+RP)")

    if args.dry_run:
        for word, accent, out_path in plan:
            print(f"[dry-run] {word}\t{accent}\t{out_path.relative_to(REPO_ROOT)}")
        print(f"[gen_tts_batch] dry-run complete: {len(plan)} paths planned, 0 requests sent")
        return 0

    gas_url = args.gas_url or os.environ.get("GAS_TTS_URL")
    if not gas_url:
        print(
            "[gen_tts_batch] ERROR: GAS_TTS_URL is not set (env var or --gas-url). "
            "実際の mp3 生成には GAS_TTS_URL が必要です。--dry-run で計画のみ確認できます。",
            file=sys.stderr,
        )
        return 2

    generated = 0
    skipped = 0
    failed = 0
    for word, accent, out_path in plan:
        if out_path.exists() and not args.force:
            skipped += 1
            continue
        out_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            data = fetch_mp3(gas_url, word, accent)
            out_path.write_bytes(data)
            generated += 1
            print(f"[gen] {word}\t{accent}\t{out_path.relative_to(REPO_ROOT)} ({len(data)} bytes)")
        except (urllib.error.URLError, RuntimeError) as exc:
            failed += 1
            print(f"[FAIL] {word}\t{accent}: {exc}", file=sys.stderr)
        if args.sleep:
            time.sleep(args.sleep)

    print(
        f"[gen_tts_batch] done: generated={generated} skipped={skipped} failed={failed} "
        f"(total planned={len(plan)})"
    )
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(run())
