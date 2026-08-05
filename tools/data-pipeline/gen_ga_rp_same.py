#!/usr/bin/env python3
"""
gen_ga_rp_same.py — Assign `ga_rp_same` / `ga_rp_same_reason` fields.

DEFINITION (STRICT + GA-allophony carve-out)
============================================
A word is `ga_rp_same = true` iff its GA and RP realisations differ ONLY
in transcription conventions that do not affect what a learner hears:

  * Length marks (ː)                              — GA omits, RP shows
  * Secondary-stress markers (ˌ)                  — dictionary-source variation
  * DRESS vowel notation (ɛ ↔ e)                  — same phoneme, editorial choice
  * Rhotic-vowel notation (ɚ ↔ ər, ɝ ↔ ɜːr)     — onset/intervocalic /r/ kept
    in both accents; GA fuses schwa+r into ɚ/ɝ

Everything else is `different`, in particular:

  * Primary-stress placement changes              — audible (baseball)
  * GOAT vowel (oʊ ↔ əʊ)                          — quality difference
  * LOT vowel (ɑ ↔ ɒ)                             — quality difference
  * Rhoticity (GA /r/, ɚ, ɝ vs RP schwa/long)     — structural
  * TRAP-BATH, CLOTH-LOT, yod-dropping, weak-vowel choice
  * GA-only allophony:
      – Flap-T/D [ɾ]        (city → [sɪɾi]; also common baked directly into
                             the phonemic `ipa` field itself, e.g. "better"
                             /ˈbɛɾɚ/ — see flap_variants() below)
      – Syllabic consonants (button → [bʌʔn̩])
      – Glottal stop [ʔ]    (pre-syllabic-n /t/, e.g. "written" /ˈrɪʔn̩/)
    These are audibly different from RP even when phonemic /ipa/ matches.

INTERVOCALIC /r/ (important)
=============================
GA /r/ is NOT dropped/merged when followed by a vowel (onset/intervocalic
position) — only true coda /r/ (word-final or pre-consonant) undergoes
non-rhotic merging. `apply_rhoticity()` and `apply_square_near_cure()` apply
this context check token-wise; naive string replacement would wrongly delete
/r/ in words like "sorry" (/ˈsɑri/), "fairy" (/ˈfɛri/) or "airport"
(/ˈɛrˌpɑrt/) where the /r/ survives into RP as an onset consonant. A further
wrinkle: a literal ɚ/ɝ token immediately after /r/ (e.g. "error" /ˈɛrɚ/,
"terror" /ˈtɛrɚ/) is itself the *next* syllable's own r-coloured vowel, not
a plain vowel that would make the preceding /r/ intervocalic — SQUARE/NEAR/
CURE conversion does not fire there.

REASON TAXONOMY
===============
same:
  identical               raw strings match
  length_marking_only     only ː differs
  stress_marking_only     only ˌ differs
  dress_notation_only     only ɛ↔e differs
  rhotic_vowel_notation   only ɚ↔ər / ɝ↔ɜːr differs (onset / intervocalic)
  notation_composite      combination of the above

different:
  ga_allophony            ipa_actual_ga ≠ ipa narrow-transcription carve-out,
                          OR a flap-T/D `ɾ` / glottal-stop `ʔ` baked into
                          `ipa` alone (with no other structural axis needed)
                          explains the whole difference once de-flapped
  stress_placement        primary stress on different syllable
  rhoticity               coda r-colouring resolves the whole difference
                          (free/always-tried baseline — also implicitly
                          satisfied whenever goat_vowel/lot_vowel/cot_caught/
                          trap_bath/weak_vowel/yod is the reported reason)
  goat_vowel              only oʊ↔əʊ remains after rhoticity
  lot_vowel               only ɑ↔ɒ remains after rhoticity
  trap_bath               only æ↔ɑː remains after rhoticity
  square_near_cure        r-coloured diphthong shifts (ɛr↔eə, ɪr↔ɪə, ʊr↔ʊə);
                          NOT free — searched as its own axis since the same
                          GA sequence can be a true SQUARE vowel (fairy) or a
                          plain DRESS/KIT vowel + onset /r/ (sheriff)
  yod                     GA drops /j/ where RP keeps it (new, tune, due)
  weak_vowel              schwa vs /ɪ/ etc. in unstressed syllables
  cot_caught              GA /ɑ/ merges with RP /ɔː/ (bought, thought)
  composite_structural    two or more of the axes above (square_near_cure /
                          goat_vowel / lot_vowel / cot_caught / trap_bath /
                          weak_vowel / yod / flap-T normalisation) are all
                          needed together, none alone explains the word
                          (e.g. "airport" = square_near_cure + cot_caught;
                          "forest" = lot_vowel + weak_vowel; "better" =
                          flap-T normalisation + rhoticity)
  structural_other        residual — cannot decompose into any of the above
                          combination (smallest axis-count wins; see
                          _search_structural_combo())

USAGE
=====
Runs from repo root. Rewrites the three JSON files in place unless --dry-run.
"""

from __future__ import annotations
import argparse
import itertools
import json
import sys
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))
from phonology_lexicon import is_bath_word

# --- normalisation helpers ---------------------------------------------------

def strip_slashes(s: str) -> str:
    return s.strip().lstrip("/").rstrip("/").strip()

def drop_length(s: str) -> str:
    return s.replace("ː", "").replace(":", "")

def drop_secondary(s: str) -> str:
    return s.replace("ˌ", "")

def drop_all_stress(s: str) -> str:
    return s.replace("ˈ", "").replace("ˌ", "")

def unify_dress(s: str) -> str:
    return s.replace("ɛ", "e")

def notation_norm(s: str) -> str:
    return unify_dress(drop_secondary(drop_length(strip_slashes(s))))

# --- tokenisation (mirrors ga_to_rp.py) -------------------------------------

MULTI = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ"]

VOWELS = {
    "i", "ɪ", "ɛ", "æ", "ʌ", "ɑ", "ɔ", "ʊ", "u", "ə", "ɝ", "ɚ",
    "aɪ", "aʊ", "eɪ", "ɔɪ", "oʊ",
}

STRESS = {"ˈ", "ˌ"}


def tokenize(ipa: str) -> list[str]:
    s = strip_slashes(ipa)
    out: list[str] = []
    i = 0
    while i < len(s):
        matched = None
        for x in MULTI:
            if s.startswith(x, i):
                matched = x
                break
        if matched:
            out.append(matched)
            i += len(matched)
        else:
            out.append(s[i])
            i += 1
    return out


def detokenize(tokens: list[str]) -> str:
    return "".join(tokens)


def _next_phoneme(tokens: list[str], i: int) -> str | None:
    j = i + 1
    while j < len(tokens):
        if tokens[j] not in STRESS:
            return tokens[j]
        j += 1
    return None


def _is_vowel_tok(tok: str | None) -> bool:
    return tok is not None and tok in VOWELS


def expand_ga_rhotic_vowels(ga_inner: str) -> str:
    """Split GA onset/intervocalic r-colored vowels for cross-accent comparison.

    Coda r-coloring (ɚ/ɝ not followed by a vowel) is left intact so that
    apply_rhoticity() can still detect true non-rhotic differences (actor, etc.).

    Stress-aware: /ɚˈɪ…/ → /əˈrɪ…/ (not /ərˈɪ…/) to align with RP notation.
    """
    tokens = tokenize(ga_inner)
    out: list[str] = []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok in ("ɚ", "ɝ"):
            nxt = tokens[i + 1] if i + 1 < len(tokens) else None
            nxt2 = tokens[i + 2] if i + 2 < len(tokens) else None
            vowel_tok = "ə" if tok == "ɚ" else "ɜː"

            # ɚˈV / ɝˈV  →  əˈrV / ɜːrV
            if nxt in STRESS and _is_vowel_tok(nxt2):
                out.append(vowel_tok)
                out.append(nxt)
                out.append("r")
                i += 2
                continue

            # ɚV / ɝV  (intervocalic, no primary-stress marker between)
            if _is_vowel_tok(nxt):
                out.append(vowel_tok)
                out.append("r")
                i += 1
                continue

            # Coda — keep r-colored vowel symbol unchanged
            out.append(tok)
            i += 1
            continue

        out.append(tok)
        i += 1
    return detokenize(out)


def vocalise_coda_rhotic_vowels(ga_inner: str) -> str:
    """Convert remaining (coda) ɚ/ɝ after onset expansion."""
    return ga_inner.replace("ɝ", "ɜː").replace("ɚ", "ə")


def ga_compare_norm(ga_raw: str) -> str:
    return notation_norm(expand_ga_rhotic_vowels(strip_slashes(ga_raw)))


def rp_compare_norm(rp_raw: str) -> str:
    return notation_norm(strip_slashes(rp_raw))

# --- primary-stress position ------------------------------------------------

def primary_syllable_index(s: str) -> int:
    """Index of the primary-stress ˈ in the string after removing length &
    secondary marks. -1 if no primary stress mark."""
    s = drop_length(drop_secondary(strip_slashes(s)))
    return s.find("ˈ")

# --- structural transformations (applied when trying to explain a diff) -----
#
# NOTE (intervocalic /r/): GA /r/ is NOT dropped/merged when it is followed by
# a vowel (onset / intervocalic position) — only true coda /r/ (word-final or
# pre-consonant) is subject to non-rhotic merging. `apply_rhoticity()` and
# `apply_square_near_cure()` below both apply this context check token-wise
# (mirrors `expand_ga_rhotic_vowels()`); a plain string .replace() would wrongly
# delete /r/ in words like "sorry" (/ˈsɑri/), "fairy" (/ˈfɛri/) or "airport"
# (/ˈɛrˌpɑrt/) where the /r/ survives into RP as an onset consonant.

RHOTICITY_BASE_MERGE = {
    "aʊ": "aʊə", "aɪ": "aɪə", "ɔɪ": "ɔɪə", "eɪ": "eɪə",
    "ɑ": "ɑː", "ɔ": "ɔː",
}

def apply_rhoticity(ga_inner: str) -> str:
    """Merge GA coda r-colouring into RP-style long vowels/diphthongs.

    Only fires when the /r/ is in coda position (not followed by a vowel).
    """
    s = vocalise_coda_rhotic_vowels(expand_ga_rhotic_vowels(ga_inner))
    tokens = tokenize(s)
    out: list[str] = []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok in RHOTICITY_BASE_MERGE and i + 1 < len(tokens) and tokens[i + 1] == "r":
            nxt = _next_phoneme(tokens, i + 1)
            if _is_vowel_tok(nxt):
                # intervocalic /r/ — keep both the vowel and the /r/ intact
                out.append(tok)
                i += 1
                continue
            out.append(RHOTICITY_BASE_MERGE[tok])
            i += 2
            continue
        out.append(tok)
        i += 1
    return detokenize(out)

SQUARE_NEAR_CURE_BASE = {"ɛ": "eə", "ɪ": "ɪə", "ʊ": "ʊə"}

def apply_square_near_cure(ga_inner: str) -> str:
    """Convert GA r-coloured SQUARE/NEAR/CURE vowels to RP centring diphthongs.

    Coda /r/ is dropped (bear /bɛr/ → beə); intervocalic /r/ is kept as an
    onset consonant after the diphthong (fairy /fɛri/ → feəri, not feəi).

    Does NOT fire when the /r/ is immediately followed by another r-coloured
    vowel (ɚ/ɝ) — that pattern is a plain DRESS/KIT/FOOT vowel + onset /r/
    starting the *next* syllable's own rhotic nucleus (error /ˈɛrɚ/, mirror
    /ˈmɪrɚ/, terror /ˈtɛrɚ/), not a SQUARE/NEAR/CURE diphthong.
    """
    tokens = tokenize(expand_ga_rhotic_vowels(ga_inner))
    out: list[str] = []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok in SQUARE_NEAR_CURE_BASE and i + 1 < len(tokens) and tokens[i + 1] == "r":
            nxt = _next_phoneme(tokens, i + 1)
            if nxt in ("ɚ", "ɝ"):
                # ambiguous — leave both tokens untouched, don't consume /r/
                out.append(tok)
                i += 1
                continue
            out.append(SQUARE_NEAR_CURE_BASE[tok])
            if _is_vowel_tok(nxt):
                out.append("r")
            i += 2
            continue
        out.append(tok)
        i += 1
    return detokenize(out)

# --- GA-only surface allophony normalisation (flap T/D, glottal stop) -------
#
# Some entries bake the GA-only narrow allophone directly into the phonemic
# `ipa` field (no distinct `ipa_actual_ga`), e.g. "better" /ˈbɛɾɚ/, "button"
# /ˈbʌʔn̩/. `ɾ` (flap) can realise either /t/ or /d/ depending on the word, and
# `ʔ` (glottal stop, pre-syllabic-n) realises /t/. We try each plausible
# de-flapped variant when the raw comparison fails, and — if a variant makes
# the word explainable — fold the flap/glottal substitution in as one more
# structural axis (see `reason_when_different`).

def flap_variants(ga_inner: str) -> list[str]:
    variants: list[str] = []
    bases = [ga_inner]
    if "ɾ" in ga_inner:
        bases = [ga_inner.replace("ɾ", "t"), ga_inner.replace("ɾ", "d")]
    for b in bases:
        v = b.replace("ʔ", "t") if "ʔ" in b else b
        if v != ga_inner and v not in variants:
            variants.append(v)
    return variants

# --- generalised structural-axis search --------------------------------------
#
# `rhoticity` (coda r-colouring merge) is treated as a "free" prerequisite
# baseline — exactly like the pre-existing single-step logic did (goat/lot/
# trap/cot checks were always built on top of the rhoticity-resolved form).
# This keeps already-correct single-axis classifications stable (e.g.
# "before" /bɪˈfɑr/→/bɪˈfɔː/ stays `cot_caught`, not `composite_structural`,
# even though it technically also needs coda-r resolution — same r-coloured
# vowel, one audible feature).
#
# `square_near_cure` is NOT free — whether GA /ɛr, ɪr, ʊr/ + vowel actually
# becomes an RP centring diphthong is lexically determined, not purely
# phonetic-context determined (fairy/vary → SQUARE, but sheriff/terrible →
# plain DRESS+onset-/r/). So it is searched as a toggle, like the other
# "quality" axes (GOAT / LOT-COT / TRAP-BATH / weak-vowel / yod): a single
# axis keeps its specific name; two or more combined (e.g. "airport":
# square_near_cure + cot_caught; "forest": lot_vowel + weak_vowel) are
# tagged `composite_structural`.

def _quality_axis_defs(word: str, ga_inner: str, rp_inner: str) -> list[tuple[str, list[tuple[str | None, object]]]]:
    """Each axis is (name, [(reason_label_or_None, transform_fn_or_None), ...])."""
    axis_defs: list[tuple[str, list[tuple[str | None, object]]]] = []

    if "j" in rp_inner and "j" not in ga_inner:
        axis_defs.append(("yod", [(None, None), ("yod", "YOD_SPECIAL")]))

    axis_defs.append(("square_near_cure",
                       [(None, None), ("square_near_cure", apply_square_near_cure)]))
    axis_defs.append(("goat_vowel",
                       [(None, None), ("goat_vowel", lambda s: s.replace("oʊ", "əʊ"))]))
    axis_defs.append(("lot_cot",
                       [(None, None),
                        ("lot_vowel", lambda s: s.replace("ɑ", "ɒ")),
                        ("cot_caught", lambda s: s.replace("ɑ", "ɔː"))]))
    if is_bath_word(word) or ("æ" in ga_inner and "ɑː" in rp_inner):
        axis_defs.append(("trap_bath",
                           [(None, None), ("trap_bath", lambda s: s.replace("æ", "ɑː"))]))
    axis_defs.append(("weak_vowel",
                       [(None, None),
                        ("weak_vowel", lambda s: s.replace("ə", "ɪ")),
                        ("weak_vowel", lambda s: s.replace("ɪ", "ə"))]))
    return axis_defs


def _search_structural_combo(word: str, ga_inner: str, rp_inner: str, rp_norm: str) -> str | None:
    """Free-resolve rhoticity, then search quality-axis combinations
    (square_near_cure / goat / lot-cot / trap-bath / weak-vowel / yod,
    smallest active-count first) against rp_norm.

    Returns a reason string, or None if no combination works.
    """
    ga_base = apply_rhoticity(ga_inner)
    if notation_norm(ga_base) == rp_norm:
        return "rhoticity"

    axis_defs = _quality_axis_defs(word, ga_inner, rp_inner)
    choice_lists = [a[1] for a in axis_defs]

    best: tuple[int, str] | None = None
    for combo in itertools.product(*choice_lists):
        active = [c for c in combo if c[0] is not None]
        n_active = len(active)
        if n_active == 0 or (best is not None and n_active >= best[0]):
            continue

        if any(name == "yod" for name, _ in active):
            s = apply_rhoticity(ga_inner.replace("u", "ju"))
        else:
            s = ga_base
        for name, fn in combo:
            if name is None or name == "yod":
                continue
            s = fn(s)

        if notation_norm(s) == rp_norm:
            reason = active[0][0] if n_active == 1 else "composite_structural"
            best = (n_active, reason)

    return best[1] if best else None

# --- reason detectors --------------------------------------------------------

def reason_when_same(ga_raw: str, rp_raw: str) -> str:
    ga = strip_slashes(ga_raw)
    rp = strip_slashes(rp_raw)
    ga_exp = expand_ga_rhotic_vowels(ga)
    if ga == rp:
        return "identical"
    if ga_exp == rp:
        return "rhotic_vowel_notation"
    only_length = drop_length(ga_exp) == drop_length(rp)
    only_stress = drop_secondary(ga_exp) == drop_secondary(rp)
    only_dress  = unify_dress(ga_exp) == unify_dress(rp)
    # single-axis wins
    if only_length and not only_stress and not only_dress:
        return "length_marking_only"
    if only_stress and not only_length and not only_dress:
        return "stress_marking_only"
    if only_dress and not only_length and not only_stress:
        return "dress_notation_only"
    return "notation_composite"

def reason_when_different(word: str, ga_raw: str, rp_raw: str) -> str:
    ga_inner = strip_slashes(ga_raw)
    rp_inner = strip_slashes(rp_raw)
    ga_norm = ga_compare_norm(ga_raw)
    rp_norm = rp_compare_norm(rp_raw)

    # 0. Stress-placement check (only if not just secondary-stress diff).
    ga_pri = primary_syllable_index(ga_inner)
    rp_pri = primary_syllable_index(rp_inner)
    if ga_pri >= 0 and rp_pri >= 0 and ga_pri != rp_pri:
        # Confirm rest matches when stress is stripped
        if ga_norm.replace("ˈ", "") == rp_norm.replace("ˈ", ""):
            return "stress_placement"

    # 1. Structural-axis search on the raw GA transcription (single quality
    #    axis keeps its specific name; 2+ → composite_structural; rhoticity /
    #    square_near_cure alone explaining it also keep their own names).
    reason = _search_structural_combo(word, ga_inner, rp_inner, rp_norm)
    if reason is not None:
        return reason

    # 2. GA-only surface allophony baked directly into `ipa` (flap T/D `ɾ`,
    #    glottal stop `ʔ` before syllabic n). Try plausible de-flapped
    #    variants:
    #      - flap alone (no rhoticity/square/quality axis needed) → `ga_allophony`
    #        (same category as the narrow-transcription carve-out in classify()).
    #      - flap + anything else needed → `composite_structural` (flap-T/D is
    #        a distinct notation-level axis from the phonological ones above).
    for variant in flap_variants(ga_inner):
        variant_expanded = expand_ga_rhotic_vowels(variant)
        if notation_norm(variant_expanded) == rp_norm:
            return "ga_allophony"
        if _search_structural_combo(word, variant, rp_inner, rp_norm) is not None:
            return "composite_structural"

    return "structural_other"

# --- main classifier --------------------------------------------------------

def classify(word: str, ipa: str, rp_ipa: str,
             ipa_actual_ga: str | None,
             ipa_actual_rp: str | None) -> tuple[bool, str]:
    if not ipa or not rp_ipa:
        return (False, "missing_data")

    # ---- CARVE-OUT: GA-only allophony (flap-T, syllabic C, glottal stop) ----
    # If GA has a narrow-level form that differs from its phonemic form, then
    # even when the phonemic forms match RP, the AUDIBLE forms differ.
    if ipa_actual_ga and ipa_actual_ga != ipa:
        rp_narrow = ipa_actual_rp or rp_ipa
        # Only overturn to different if the RP audible form does NOT match
        # the GA narrow form (defensive; ipa_actual_rp is currently empty
        # in this dataset).
        if notation_norm(ipa_actual_ga) != notation_norm(rp_narrow):
            return (False, "ga_allophony")

    # ---- Same-under-notation check ----
    if ga_compare_norm(ipa) == rp_compare_norm(rp_ipa):
        return (True, reason_when_same(ipa, rp_ipa))

    # ---- Different: find the best reason ----
    return (False, reason_when_different(word, ipa, rp_ipa))

# --- driver -----------------------------------------------------------------

SAME_REASONS = {"identical", "length_marking_only", "stress_marking_only",
                "dress_notation_only", "rhotic_vowel_notation", "notation_composite"}

def process(items: list[dict], word_field: str = "w") -> dict:
    stats: dict[str, int] = {}
    for it in items:
        w = it.get(word_field, "")
        ipa = it.get("ipa", "")
        rp = it.get("rp_ipa", "")
        actual_ga = it.get("ipa_actual_ga")
        actual_rp = it.get("ipa_actual_rp")
        is_same, reason = classify(w, ipa, rp, actual_ga, actual_rp)
        it["ga_rp_same"] = is_same
        it["ga_rp_same_reason"] = reason
        stats[reason] = stats.get(reason, 0) + 1
    return stats

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--wordlist", default="packages/core/data/wordlist.json")
    ap.add_argument("--connected", default="packages/core/data/connected_speech.json")
    ap.add_argument("--weak", default="packages/core/data/weak_forms.json")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--report", default=None,
                    help="Optional path to write a JSON report of counts and samples.")
    args = ap.parse_args()

    all_report: dict = {}

    for label, path in [("wordlist", args.wordlist),
                        ("connected", args.connected),
                        ("weak", args.weak)]:
        p = Path(path)
        if not p.exists():
            print(f"skip (not found): {path}", file=sys.stderr)
            continue
        with p.open() as f:
            items = json.load(f)
        stats = process(items)
        total = len(items)
        same_n = sum(v for k, v in stats.items() if k in SAME_REASONS)
        print(f"\n{path}: {total} items — {same_n} same, {total - same_n} different")
        for reason, n in sorted(stats.items(), key=lambda x: -x[1]):
            tag = "SAME" if reason in SAME_REASONS else "DIFF"
            print(f"  [{tag}] {reason:25s} {n:5d}")

        all_report[label] = {"total": total, "same": same_n,
                             "different": total - same_n, "by_reason": stats}

        if not args.dry_run:
            with p.open("w", encoding="utf-8") as f:
                json.dump(items, f, ensure_ascii=False, indent=2)
            print(f"  → wrote {path}")

    if args.report:
        with open(args.report, "w") as f:
            json.dump(all_report, f, ensure_ascii=False, indent=2)
        print(f"\nreport → {args.report}")

if __name__ == "__main__":
    main()
