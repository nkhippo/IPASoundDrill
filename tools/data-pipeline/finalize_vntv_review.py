#!/usr/bin/env python3
"""
Phase 2a finalizer — converts Naoya's TTS-listening judgments (exported from
tools/review-vntv.html) into confirmed `ipa_actual_ga` for the 52 VntV/VndV
words that generate_flap_ipa.py could not resolve automatically.

INPUT 1: phase2a_review_needed.json  (the 52-word list; already have this)
INPUT 2: review-vntv-export.json     (Naoya's export from the review tool)
  Expected format (one entry per word):
    [
      {"w": "winter", "nasal": "kept|deleted|unsure",
                       "consonant": "flap|plain|inaudible", "note": "..."},
      ...
    ]

OUTPUT:
  phase2a_final_candidates.json   — words with a confident, mechanical
                                     transform applied (ready to merge)
  phase2a_still_unresolved.json   — words where nasal="unsure" or
                                     consonant="inaudible" (needs a human/
                                     Sonnet judgment call on the actual note
                                     text, or a re-listen)

Transform rules (mechanical, applied to the ORIGINAL phonemic token at the
flagged nasal+t/d position — the same position generate_flap_ipa.py's R4
check identified):
  nasal=deleted, consonant=flap  -> remove the /n/, replace t/d with /ɾ/
                                     (e.g. winter /ˈwɪntɚ/ -> /ˈwɪɾɚ/)
  nasal=kept,    consonant=flap  -> keep /n/, replace t/d with /ɾ/
                                     (nasalized flap; honors the listener's
                                     judgment even though it's less common)
  nasal=kept,    consonant=plain -> no change at all (word is left exactly
                                     as its existing phonemic `ipa`)
  nasal=deleted, consonant=plain -> remove /n/ only, t/d unchanged
  anything with "unsure"/"inaudible" -> routed to still_unresolved, NOT
                                     auto-applied

For the 3 words that also appear in phase2a_flap_candidates.json (their
OTHER t/d already flapped via R1/R3: granddaughter, independence,
underwater), this script starts from that candidate's ipa_actual_ga
instead of the raw phonemic ipa, so both changes end up combined in the
final result.
"""

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths
import json
import pathlib

REVIEW_LIST = paths.REVIEW_NEEDED
EXPORT = paths.VNTV_EXPORT
EXISTING_CANDIDATES = paths.FLAP_CANDIDATES
OUT_FINAL = paths.FINAL_CANDIDATES
OUT_UNRESOLVED = paths.STILL_UNRESOLVED

MULTI_GA = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ", "n̩", "l̩", "m̩"]
VOWELS_GA = {"i", "ɪ", "ɛ", "æ", "ə", "ʌ", "ɑ", "ɔ", "ʊ", "u", "ɝ", "ɚ",
             "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ"}
STRESS = {"ˈ", "ˌ"}


def tokenize(raw):
    s = raw.strip("/")
    out = []
    i = 0
    while i < len(s):
        m = None
        for x in MULTI_GA:
            if s.startswith(x, i):
                m = x
                break
        if m:
            out.append(m)
            i += len(m)
        else:
            out.append(s[i])
            i += 1
    return out


def is_vowel(t):
    return t in VOWELS_GA


def next_real_index(tk, i):
    j = i + 1
    while j < len(tk) and tk[j] in STRESS:
        j += 1
    return j


def prev_real_index(tk, i):
    j = i - 1
    while j >= 0 and tk[j] in STRESS:
        j -= 1
    return j


def find_vntv_position(tk):
    """
    Locate the (n_index, td_index) pair matching the R4-VntV pattern:
    vowel + n + t/d + unstressed vowel. Returns None if not found
    (shouldn't happen for words genuinely in the 52-word list, but guarded
    defensively).
    """
    for idx, t in enumerate(tk):
        if t not in ("t", "d"):
            continue
        if idx > 0 and tk[idx - 1] == "ˈ":
            continue  # primary-stressed onset, never a flap candidate
        pj = prev_real_index(tk, idx)
        if pj < 0 or tk[pj] != "n":
            continue
        pv2 = prev_real_index(tk, pj)
        if pv2 < 0 or not is_vowel(tk[pv2]):
            continue
        nj = next_real_index(tk, idx)
        nxt = tk[nj] if nj < len(tk) else None
        immediate_next = tk[idx + 1] if idx + 1 < len(tk) else None
        if immediate_next in STRESS:
            continue
        if nxt and is_vowel(nxt):
            return pj, idx
    return None


def apply_judgment(ipa_str, nasal, consonant):
    tk = tokenize(ipa_str)
    pos = find_vntv_position(tk)
    if pos is None:
        return None  # couldn't locate the expected pattern; needs manual look
    n_idx, td_idx = pos
    td_char = tk[td_idx]

    new_tk = list(tk)
    if consonant == "flap":
        new_tk[td_idx] = "ɾ"
    # consonant == "plain": leave td_char as-is

    if nasal == "deleted":
        new_tk[n_idx] = None  # mark for removal

    result = "".join(t for t in new_tk if t is not None)
    return "/" + result + "/"


def main():
    review_list = {r["w"]: r for r in json.loads(REVIEW_LIST.read_text(encoding="utf-8"))}

    if not EXPORT.exists():
        print(f"NOTE: {EXPORT} not found. This is a dry-run using synthetic")
        print("placeholder answers ONLY to verify the script logic — replace")
        print(f"with Naoya's real export at {EXPORT} before actual use.\n")
        # Synthetic answers for self-test purposes only (NOT real judgments)
        answers = {w: {"nasal": "deleted", "consonant": "flap", "note": "(dry-run placeholder)"}
                   for w in review_list}
    else:
        answers = {a["w"]: a for a in json.loads(EXPORT.read_text(encoding="utf-8"))}

    existing = {}
    if EXISTING_CANDIDATES.exists():
        existing = {c["w"]: c for c in json.loads(EXISTING_CANDIDATES.read_text(encoding="utf-8"))}

    final, unresolved = [], []

    for word, review_entry in review_list.items():
        ans = answers.get(word)
        if ans is None:
            unresolved.append({"w": word, "reason": "no answer in export"})
            continue
        nasal, consonant = ans.get("nasal"), ans.get("consonant")
        if nasal == "unsure" or consonant == "inaudible" or not nasal or not consonant:
            unresolved.append({
                "w": word, "reason": "unsure/inaudible",
                "nasal": nasal, "consonant": consonant,
                "note": ans.get("note", ""),
            })
            continue

        # start from the already-confirmed candidate (if this word also had
        # an unrelated flap resolved in Phase 2a) or from raw phonemic ipa
        source_ipa = existing[word]["ipa_actual_ga"] if word in existing else review_entry["ipa"]

        new_ipa = apply_judgment(source_ipa, nasal, consonant)
        if new_ipa is None:
            unresolved.append({
                "w": word, "reason": "pattern not found in source ipa",
                "source_ipa": source_ipa,
            })
            continue

        final.append({
            "w": word,
            "ipa": review_entry["ipa"],
            "ipa_actual_ga": new_ipa,
            "nasal": nasal, "consonant": consonant,
            "note": ans.get("note", ""),
        })

    OUT_FINAL.write_text(json.dumps(final, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_UNRESOLVED.write_text(json.dumps(unresolved, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Reviewed words:     {len(review_list)}")
    print(f"Resolved:           {len(final)}")
    print(f"Still unresolved:   {len(unresolved)}")
    if final:
        print("\nSample resolved:")
        for f in final[:8]:
            print(f"  {f['w']:15s} {f['ipa']:20s} -> {f['ipa_actual_ga']}  (nasal={f['nasal']}, consonant={f['consonant']})")


if __name__ == "__main__":
    main()
