#!/usr/bin/env python3
"""Translate phoneme reference JSON files from i18n/phonemes/en.json."""
import json
import time
from pathlib import Path

from deep_translator import GoogleTranslator

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "i18n" / "phonemes"
EN_PATH = OUT / "en.json"
SLEEP = 0.15


def translate_text(text, target):
    if not text or text == "—":
        return text
    for attempt in range(3):
        try:
            return GoogleTranslator(source="en", target=target).translate(text)
        except Exception:
            time.sleep(1 + attempt)
    return text


def translate_ph(ph, target):
    out = {}
    for sym, row in ph.items():
        out[sym] = {
            "lab": translate_text(row["lab"], target),
            "ex": translate_text(row["ex"], target),
            "mouth": translate_text(row["mouth"], target),
            "trap": translate_text(row["trap"], target),
            "t": row["t"],
        }
        time.sleep(SLEEP)
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    if not EN_PATH.exists():
        raise SystemExit(f"Missing {EN_PATH}")
    en = json.loads(EN_PATH.read_text(encoding="utf-8"))
    for code, name in [("ja", "ja"), ("zh-CN", "zh"), ("ko", "ko")]:
        dest = OUT / f"{name}.json"
        if dest.exists():
            print(f"skip {name} (exists)")
            continue
        print(f"Translating phonemes -> {name}...")
        tr = translate_ph(en, code)
        dest.write_text(json.dumps(tr, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Done.")


if __name__ == "__main__":
    main()
