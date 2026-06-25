#!/usr/bin/env python3
"""Merge irregular_forms_patch.json into production wordlist."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORDLIST = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
PATCH = ROOT / "data" / "irregular_forms_patch.json"
CLEAR = ROOT / "docs" / "gloss-corrections.clear.json"

CEFR_ORDER = {"A1": 0, "A2": 1, "B1": 2, "B2": 3}


def to_production(entry):
    return {
        "w": entry["w"],
        "ipa": entry["ipa"],
        "cefr": entry["cefr"],
        "pos": entry["pos"],
        "src": entry["src"],
        "pattern": entry.get("pat") or entry.get("pattern"),
        "group": entry.get("grp") or entry.get("group"),
        "gloss": entry["gloss"],
    }


def apply_clear(rows, clear):
    by_w = {r["w"]: r for r in rows}
    for w, patch in clear.items():
        if w not in by_w:
            continue
        g = by_w[w].setdefault("gloss", {})
        g["en"] = w
        for lang, val in patch.items():
            g[lang] = val


def sort_key(row):
    return (CEFR_ORDER.get(row.get("cefr", ""), 99), row["w"].lower(), row["w"])


def main():
    rows = json.loads(WORDLIST.read_text(encoding="utf-8"))
    patch = json.loads(PATCH.read_text(encoding="utf-8"))
    existing = {r["w"] for r in rows}
    clear = json.loads(CLEAR.read_text(encoding="utf-8"))

    added = 0
    skipped = []
    for entry in patch:
        w = entry["w"]
        if w in existing:
            skipped.append(w)
            print(f"skip duplicate: {w}")
            continue
        rows.append(to_production(entry))
        existing.add(w)
        added += 1

    rows.sort(key=sort_key)
    apply_clear(rows, clear)
    WORDLIST.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"added: {added}")
    print(f"skipped: {len(skipped)}")
    print(f"total: {len(rows)}")
    assert added == len(patch) - len(skipped), f"expected {len(patch) - len(skipped)} added, got {added}"


if __name__ == "__main__":
    main()
