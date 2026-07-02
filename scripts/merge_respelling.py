#!/usr/bin/env python3
"""
Merge rule-generated respell_ga / respell_rp into the wordlist.
Overwrites both fields for every word present in phase2b_respell_draft.json.
Does NOT touch ipa, rp_ipa, ipa_actual_ga, ipa_actual_rp, or any other field.

The 52 words in phase2b_respell_pending.json are intentionally NOT included
in phase2b_respell_draft.json (their GA narrow IPA is still awaiting TTS
review from Phase 2a) — this script only processes the draft file, so those
52 words are left untouched (no respell_ga/respell_rp added yet).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORDLIST = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
DRAFT = ROOT / "phase2b_respell_draft.json"
PENDING = ROOT / "phase2b_respell_pending.json"


def main():
    data = json.loads(WORDLIST.read_text(encoding="utf-8"))
    draft = json.loads(DRAFT.read_text(encoding="utf-8"))
    pending_words = set()
    if PENDING.exists():
        pending_words = {r["w"] for r in json.loads(PENDING.read_text(encoding="utf-8"))}
    lookup = {w["w"]: w for w in data}

    cleared = 0
    for word in pending_words:
        entry = lookup.get(word)
        if not entry:
            continue
        had = "respell_ga" in entry or "respell_rp" in entry
        entry.pop("respell_ga", None)
        entry.pop("respell_rp", None)
        if had:
            cleared += 1

    merged, skipped = 0, []
    for d in draft:
        word = d["w"]
        if word not in lookup:
            skipped.append(word)
            continue
        entry = lookup[word]
        entry["respell_ga"] = d["respell_ga"]
        entry["respell_rp"] = d["respell_rp"]
        merged += 1

    WORDLIST.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"merged {merged} / {len(draft)} entries")
    if cleared:
        print(f"cleared respell on {cleared} pending-review words")
    if skipped:
        print(f"WARN: skipped (not in wordlist): {skipped}")


if __name__ == "__main__":
    main()
