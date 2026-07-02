#!/usr/bin/env python3
"""Merge pilot 30-word narrow IPA + respelling data into wordlist."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORDLIST = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
PILOT = ROOT / "pilot-30words.json"


def main():
    data = json.loads(WORDLIST.read_text(encoding="utf-8"))
    pilot = json.loads(PILOT.read_text(encoding="utf-8"))
    entries = {e["w"]: e for e in pilot["entries"]}
    lookup = {w["w"]: w for w in data}

    merged, skipped = 0, []
    for word, patch in entries.items():
        if word not in lookup:
            skipped.append(word)
            continue
        w = lookup[word]
        # Keep null values for ipa_actual_* so "no narrow change" is explicit.
        for key in ("ipa_actual_ga", "ipa_actual_rp", "respell_ga", "respell_rp"):
            if key in patch:
                w[key] = patch[key]
        merged += 1

    WORDLIST.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"merged {merged} / {len(entries)} entries")
    if skipped:
        print(f"WARN: skipped (not in wordlist): {skipped}")


if __name__ == "__main__":
    main()
