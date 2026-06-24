#!/usr/bin/env python3
"""Merge neighbors field from slim wordlist into production wordlist."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORDLIST = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
NEIGHBORS_SRC = ROOT / "data" / "wordlist_with_neighbors_slim.json"
CLEAR = ROOT / "docs" / "gloss-corrections.clear.json"


def apply_clear(rows, clear):
    by_w = {r["w"]: r for r in rows}
    for w, patch in clear.items():
        if w not in by_w:
            continue
        g = by_w[w].setdefault("gloss", {})
        g["en"] = w
        for lang, val in patch.items():
            g[lang] = val


def validate(rows):
    errors = []
    by_w = {r["w"]: r for r in rows}
    if len(rows) != len(by_w):
        errors.append(f"duplicate w: {len(rows) - len(by_w)}")

    zero = 0
    for r in rows:
        w = r["w"]
        if "neighbors" not in r:
            errors.append(f"missing neighbors key: {w}")
            continue
        nb = r["neighbors"]
        if not isinstance(nb, list):
            errors.append(f"neighbors not list: {w}")
            continue
        if not nb:
            zero += 1
        for ref in nb:
            ref_w = ref["w"] if isinstance(ref, dict) else ref
            if ref_w not in by_w:
                errors.append(f"broken ref: {w} -> {ref_w}")

    return errors, zero


def main():
    rows = json.loads(WORDLIST.read_text(encoding="utf-8"))
    src = json.loads(NEIGHBORS_SRC.read_text(encoding="utf-8"))
    src_by_w = {r["w"]: r.get("neighbors", []) for r in src}
    prod_ws = {r["w"] for r in rows}

    merged = 0
    empty = 0
    for r in rows:
        w = r["w"]
        if w in src_by_w:
            r["neighbors"] = list(src_by_w[w])
            merged += 1
        else:
            r["neighbors"] = []
            empty += 1

    # reference integrity: drop refs to words not in wordlist
    pruned = 0
    for r in rows:
        nb = r["neighbors"]
        cleaned = []
        for ref in nb:
            ref_w = ref["w"] if isinstance(ref, dict) else ref
            if ref_w in prod_ws:
                cleaned.append(ref)
            else:
                pruned += 1
        r["neighbors"] = cleaned

    clear = json.loads(CLEAR.read_text(encoding="utf-8"))
    apply_clear(rows, clear)

    errors, zero = validate(rows)
    if errors:
        for e in errors[:20]:
            print("ERROR", e)
        print(f"... {len(errors)} errors total")
        sys.exit(1)

    WORDLIST.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"words: {len(rows)}")
    print(f"neighbors merged: {merged}")
    print(f"empty neighbors (no src): {empty}")
    print(f"pruned broken refs: {pruned}")
    print(f"zero-neighbor words: {zero}")


if __name__ == "__main__":
    main()
