#!/usr/bin/env python3
"""
Merge rule-generated ipa_actual_ga candidates into the wordlist.
Overwrites ipa_actual_ga for every word present in the candidates file,
regardless of whether the word already has a value (Phase 2a candidates
are the authoritative, audited source — see instructions §2 A-1
for the two words this intentionally corrects: middle, thirty).

Does NOT touch: ipa_actual_rp, respell_ga, respell_rp, or any other field.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORDLIST = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
CANDIDATES = ROOT / "phase2a_flap_candidates.json"


def main():
    data = json.loads(WORDLIST.read_text(encoding="utf-8"))
    candidates = json.loads(CANDIDATES.read_text(encoding="utf-8"))
    lookup = {w["w"]: w for w in data}

    merged, corrected, skipped = 0, [], []
    for c in candidates:
        word = c["w"]
        if word not in lookup:
            skipped.append(word)
            continue
        entry = lookup[word]
        old_val = entry.get("ipa_actual_ga")
        new_val = c["ipa_actual_ga"]
        if old_val is not None and old_val != new_val:
            corrected.append((word, old_val, new_val))
        entry["ipa_actual_ga"] = new_val
        merged += 1

    WORDLIST.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"merged {merged} / {len(candidates)} entries")
    if corrected:
        print(f"\ncorrected {len(corrected)} pre-existing values:")
        for word, old, new in corrected:
            print(f"  {word}: {old} -> {new}")
    if skipped:
        print(f"\nWARN: skipped (not in wordlist): {skipped}")


if __name__ == "__main__":
    main()
