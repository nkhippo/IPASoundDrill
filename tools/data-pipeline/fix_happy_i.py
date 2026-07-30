#!/usr/bin/env python3
"""
fix_happy_i.py — Correct rp_ipa for word-final happY position.

Two corrections:
  (1) rp_ipa ending in /iː/ where GA ends in /i/ and final syllable is unstressed
      → change trailing /iː/ to /i/ (modern RP happY convention)
  (2) rp_ipa ending in /ɪ/ (older Jones convention) → change to /i/

Orthographic filter: words ending in "ee" (employee, chimpanzee, carefree, ...)
are EXCLUDED because "-ee" is a Latin/French borrowing that retains length
even when prosodically weak.

Also updates data/connected_speech.json and data/weak_forms.json (should be no-op
but check for safety).
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths

VOWELS = set("iɪɛæʌɑɔʊuəɝɚ")
MULTI = ("tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ")


def is_happy_i_candidate(word: str, ga_ipa: str, rp_ipa: str) -> tuple[bool, str]:
    """Return (should_fix, reason). Applies both mechanical and orthographic filters."""
    if not ga_ipa or not rp_ipa:
        return False, "missing"

    # Orthographic exclusion: -ee and -free compounds keep /iː/
    wl = word.lower()
    if wl.endswith("ee") or wl.endswith("free"):
        return False, "ee_ending"

    ga_inner = ga_ipa.strip("/")
    rp_inner = rp_ipa.strip("/")

    # Case 1: /iː/ over-lengthening
    if rp_inner.endswith("iː") and ga_inner.endswith("i"):
        # Find LAST stress marker of any kind (both ˈ and ˌ)
        last_stress = max(ga_inner.rfind("ˈ"), ga_inner.rfind("ˌ"))
        if last_stress == -1:
            return False, "monosyllabic_no_stress"
        # Between last stress marker and final /i/, must have at least one other vowel
        tail = ga_inner[last_stress + 1:]
        body = tail[:-1]  # exclude the trailing 'i'
        has_other_vowel = any(ch in VOWELS for ch in body) or any(
            body[k:k+2] in MULTI for k in range(len(body))
        )
        if has_other_vowel:
            return True, "happy_i_over_lengthened"
        else:
            return False, "stressed_fleece"

    # Case 2: /ɪ/ notation drift
    if rp_inner.endswith("ɪ") and ga_inner.endswith("i"):
        # Same orthographic + stress filter
        last_stress = max(ga_inner.rfind("ˈ"), ga_inner.rfind("ˌ"))
        if last_stress == -1:
            return False, "monosyllabic_no_stress"
        tail = ga_inner[last_stress + 1:]
        body = tail[:-1]
        has_other_vowel = any(ch in VOWELS for ch in body) or any(
            body[k:k+2] in MULTI for k in range(len(body))
        )
        if has_other_vowel:
            return True, "jones_notation_drift"
        else:
            return False, "stressed_fleece"

    return False, "no_match"


def fix_entry(entry: dict) -> tuple[bool, str, str, str]:
    """Return (was_fixed, reason, old_rp, new_rp)."""
    word = entry.get("w", "")
    ga_ipa = entry.get("ipa", "")
    rp_ipa = entry.get("rp_ipa", "")
    should, reason = is_happy_i_candidate(word, ga_ipa, rp_ipa)
    if not should:
        return False, reason, rp_ipa, rp_ipa
    rp_inner = rp_ipa.strip("/")
    if rp_inner.endswith("iː"):
        new_inner = rp_inner[:-2] + "i"
    elif rp_inner.endswith("ɪ"):
        new_inner = rp_inner[:-1] + "i"
    else:
        return False, "unexpected_ending", rp_ipa, rp_ipa
    new_rp = "/" + new_inner + "/"
    entry["rp_ipa"] = new_rp
    return True, reason, rp_ipa, new_rp


def process_file(path: Path, label: str) -> list[tuple[str, str, str, str]]:
    if not path.exists():
        print(f"skip (not found): {path}", file=sys.stderr)
        return []
    with path.open(encoding="utf-8") as f:
        items = json.load(f)
    fixes = []
    for it in items:
        was_fixed, reason, old, new = fix_entry(it)
        if was_fixed:
            fixes.append((it.get("w", ""), reason, old, new))
    if fixes:
        with path.open("w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=1)
    print(f"{label}: {len(fixes)} rp_ipa entries corrected")
    return fixes


def main() -> None:
    all_fixes = []
    all_fixes += process_file(paths.WORDLIST, "wordlist")
    all_fixes += process_file(paths.CONNECTED_SPEECH, "connected_speech")
    all_fixes += process_file(paths.WEAK_FORMS, "weak_forms")

    print(f"\n=== TOTAL: {len(all_fixes)} corrections ===")

    # Breakdown by reason
    from collections import Counter
    by_reason = Counter(r for _, r, _, _ in all_fixes)
    for r, n in by_reason.most_common():
        print(f"  {r}: {n}")

    print(f"\n=== Sample of first 10 corrections (for eyeball verification) ===")
    for w, r, old, new in all_fixes[:10]:
        print(f"  {w:20s}  {old:22s} -> {new}   ({r})")

    print(f"\n=== Sample of last 10 corrections ===")
    for w, r, old, new in all_fixes[-10:]:
        print(f"  {w:20s}  {old:22s} -> {new}   ({r})")


if __name__ == "__main__":
    main()
