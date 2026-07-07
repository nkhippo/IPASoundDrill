#!/usr/bin/env python3
"""
⚠️ HISTORICAL / DO NOT RUN AGAINST PRODUCTION DATA ⚠️

This script was used in Phase 0-a (2026-07-07) to null the cefr field on
652 phonics-source words, based on an UNVERIFIED assumption that these
were placeholder labels rather than genuine CEFR-J vocabulary.

Direct verification against the CEFR-J Wordlist v1.5 primary source
(openlanguageprofiles/olp-en-cefrj) showed all 652 words are 100%
genuine, correctly-labeled CEFR-J B1/B2 vocabulary. The change was
reverted; see docs/wordlist-cefr-audit.md "訂正" section and
docs/cursor-instructions-cefr-phase0a-revert.md for details.

This script is kept for historical record only. Do not run it again.

<original docstring follows>

Phase 0-a: Null out the cefr field on all phonics-source words that are
currently labeled B1 or B2. These 652 entries were assigned B1/B2 during
initial data generation because they were not present in the CEFR-J A1/A2
lists, but they are basic phonics-practice words (ache, ad, aid, aim, ant,
...) rather than genuine intermediate vocabulary. Nulling their cefr moves
them out of the CEFR axis entirely; they remain accessible via the
independent phonics axis (src: "phonics") for Mode A phonics drills.

See docs/wordlist-cefr-audit.md for before/after statistics.
"""
import json
import pathlib
import sys
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]
INPUT = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
BACKUP = ROOT / "wordlist_GA_a1a2_plus_phonics.pre-phase0a.json"


def main():
    data = json.loads(INPUT.read_text(encoding="utf-8"))

    before = Counter(w.get("cefr") for w in data)

    changed = 0
    for w in data:
        if w.get("src") == "phonics" and w.get("cefr") in ("B1", "B2"):
            w["cefr"] = None
            changed += 1

    after = Counter(w.get("cefr") for w in data)

    expected = 652
    if changed != expected:
        print(
            f"ERROR: expected to change {expected} entries, actually changed "
            f"{changed}. Source data may have drifted. Aborting without write.",
            file=sys.stderr,
        )
        sys.exit(1)

    original = json.loads(INPUT.read_text(encoding="utf-8"))
    BACKUP.write_text(
        json.dumps(original, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    INPUT.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Changed: {changed} entries (expected {expected}) — OK")
    print()
    print("=== CEFR distribution ===")
    print(f"{'cefr':10s} {'before':>8s} {'after':>8s}")
    all_cefr = sorted(set(before) | set(after), key=lambda x: (x is None, x or ""))
    for c in all_cefr:
        print(f"{str(c):10s} {before.get(c, 0):>8d} {after.get(c, 0):>8d}")
    print()
    print("Backup written to:", BACKUP)
    print("Updated file:", INPUT)


if __name__ == "__main__":
    main()
