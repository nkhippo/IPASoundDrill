#!/usr/bin/env python3
"""Add gloss.{en,ja,zh,ko} to wordlist with per-language checkpointing."""
import csv
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
CSV_PATH = ROOT / "wordlist_GA_a1a2_plus_phonics.csv"
CHECKPOINT_DIR = ROOT / "scripts"
BATCH = 50
SLEEP = 0.15
TARGETS = [("ja", "ja"), ("zh-CN", "zh"), ("ko", "ko")]


def log(msg):
    print(msg, flush=True)


def lang_path(lang):
    return CHECKPOINT_DIR / f".gloss_{lang}.json"


def load_lang(lang):
    path = lang_path(lang)
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return []


def save_lang(lang, data):
    path = lang_path(lang)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


def translate_batches(words, code, lang):
    tr = GoogleTranslator(source="en", target=code)
    out = load_lang(lang)
    for i in range(len(out), len(words), BATCH):
        chunk = words[i : i + BATCH]
        for attempt in range(4):
            try:
                out.extend(tr.translate_batch(chunk))
                break
            except Exception as e:
                log(f"  {lang} retry {attempt + 1} @ {i}: {e}")
                time.sleep(2 * (attempt + 1))
        else:
            out.extend(chunk)
        save_lang(lang, out)
        log(f"  {lang}: {len(out)}/{len(words)}")
        time.sleep(SLEEP)
    return out


def main():
    rows = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    words = [r["w"] for r in rows]
    done = {}

    pending = [lang for _, lang in TARGETS if len(load_lang(lang)) < len(words)]
    if pending:
        mapping = {lang: code for code, lang in TARGETS}
        with ThreadPoolExecutor(max_workers=len(pending)) as pool:
            futs = {pool.submit(translate_batches, words, mapping[lang], lang): lang for lang in pending}
            for fut in as_completed(futs):
                lang = futs[fut]
                done[lang] = fut.result()
    for _, lang in TARGETS:
        if lang not in done:
            done[lang] = load_lang(lang)

    for i, row in enumerate(rows):
        row["gloss"] = {
            "en": row["w"],
            "ja": done["ja"][i],
            "zh": done["zh"][i],
            "ko": done["ko"][i],
        }

    with CSV_PATH.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        for col in ("gloss_en", "gloss_ja", "gloss_zh", "gloss_ko"):
            if col not in fieldnames:
                fieldnames.append(col)
        csv_rows = list(reader)

    by_word = {r["w"]: r for r in rows}
    for row in csv_rows:
        w = row.get("headword") or row.get("w")
        g = by_word.get(w, {}).get("gloss", {})
        row["gloss_en"] = g.get("en", "")
        row["gloss_ja"] = g.get("ja", "")
        row["gloss_zh"] = g.get("zh", "")
        row["gloss_ko"] = g.get("ko", "")

    JSON_PATH.write_text(json.dumps(rows, ensure_ascii=False, indent=0), encoding="utf-8")
    with CSV_PATH.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(csv_rows)

    for _, lang in TARGETS:
        p = lang_path(lang)
        if p.exists():
            p.unlink()
    log(f"Updated {len(rows)} words")


if __name__ == "__main__":
    main()
