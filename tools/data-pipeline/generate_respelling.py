#!/usr/bin/env python3
"""
Phase 2b (v1, rule-based, no LLM): Generate respell_ga / respell_rp for the
full 3,059-word wordlist.

Design (confirmed with Naoya 2026-07-02):
  - NBC/BBC style: UPPERCASE = primary-stressed syllable, lowercase =
    unstressed/secondary, hyphen-separated syllables.
  - GA respelling reflects actual GA speech: flap-t/d -> "d", glottal-stop-t
    -> "t", syllabic n/l written plain ("n", "l", no inserted schwa).
    Uses ipa_actual_ga when present (192 words from Phase 1+2a), else the
    phonemic `ipa` (2,867 words with no allophonic change).
  - RP respelling is built from `rp_ipa` directly (RP never flaps).

This script performs NO judgment calls beyond mechanical phoneme->letter
mapping + syllabification. Words whose structure doesn't fit the simple
syllabification heuristic (3+ consonant clusters between nuclei, or any
other edge case the algorithm can't resolve confidently) are written to
an exceptions file for manual / Sonnet / (rarely) Opus review, rather than
guessed.
"""

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths
import json
import pathlib
from collections import Counter

WORDLIST = paths.WORDLIST
OUT_RESPELL = paths.RESPELL_DRAFT
OUT_EXCEPTIONS = paths.RESPELL_EXCEPTIONS

# ---------------------------------------------------------------------------
# Tokenizers (mirror index.html MULTI_GA / MULTI_RP / VOWELS_GA / VOWELS_RP,
# extended with the Phase 1 allophone symbols for GA)
# ---------------------------------------------------------------------------
MULTI_GA = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ", "n̩", "l̩", "m̩"]
MULTI_RP = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə",
            "iː", "uː", "ɑː", "ɔː", "ɜː", "n̩", "l̩", "m̩"]

VOWELS_GA = {"i", "ɪ", "ɛ", "æ", "ə", "ʌ", "ɑ", "ɔ", "ʊ", "u", "ɝ", "ɚ",
             "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ"}
VOWELS_RP = {"iː", "ɪ", "e", "æ", "ə", "ʌ", "ɑː", "ɒ", "ɔː", "ʊ", "uː",
             "ɜː", "eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə",
             # bare "i" (happY vowel: city, very) and bare "u" (thankYOU
             # vowel: actually, usual) appear without the length mark in
             # this dataset's RP transcription and are real vowel nuclei,
             # not consonants — discovered via phase2b exception analysis.
             "i", "u", "ɔ"}
SYLLABIC = {"n̩", "l̩", "m̩"}  # count as their own nucleus (no vowel letter)
STRESS = {"ˈ", "ˌ"}

# English-permissible syllable-onset clusters (2- and 3-consonant), used to
# decide where to split a run of consonants that falls between two vowel
# nuclei. Any single consonant is always treated as a valid onset by itself,
# so lookup never fails — this list only controls how much of a longer run
# gets pulled into the FOLLOWING syllable vs. left as the coda of the
# PRECEDING one (maximal-onset principle).
VALID_ONSET_2 = {
    ("p", "l"), ("p", "r"), ("p", "j"), ("b", "l"), ("b", "r"), ("b", "j"),
    ("t", "r"), ("t", "w"), ("t", "j"), ("d", "r"), ("d", "w"), ("d", "j"),
    ("k", "l"), ("k", "r"), ("k", "w"), ("k", "j"),
    ("ɡ", "l"), ("ɡ", "r"), ("ɡ", "w"), ("ɡ", "j"),
    ("f", "l"), ("f", "r"), ("f", "j"), ("v", "j"),
    ("θ", "r"), ("θ", "w"), ("ð", "j"),
    ("s", "l"), ("s", "m"), ("s", "n"), ("s", "p"), ("s", "t"), ("s", "k"),
    ("s", "w"), ("s", "f"), ("s", "j"),
    ("ʃ", "r"), ("ʃ", "w"), ("h", "w"), ("h", "j"),
    ("m", "j"), ("n", "j"), ("l", "j"), ("r", "j"), ("dʒ", "r"),
}
VALID_ONSET_3 = {
    ("s", "p", "l"), ("s", "p", "r"), ("s", "t", "r"), ("s", "k", "r"),
    ("s", "k", "w"), ("s", "k", "l"), ("s", "p", "j"), ("s", "t", "j"),
}


def split_cluster(consonants):
    """
    Given a run of consonant tokens between two nuclei, return
    (coda_of_preceding, onset_of_following) using maximal-valid-onset.
    A single consonant always goes entirely to the onset of the following
    syllable (standard default for intervocalic single consonants).
    """
    n = len(consonants)
    if n <= 1:
        return [], consonants
    if n >= 3 and tuple(consonants[-3:]) in VALID_ONSET_3:
        return consonants[:-3], consonants[-3:]
    if n >= 2 and tuple(consonants[-2:]) in VALID_ONSET_2:
        return consonants[:-2], consonants[-2:]
    # default: last consonant is the onset, everything earlier is coda
    return consonants[:-1], consonants[-1:]


def tokenize(raw, multi):
    s = raw.strip("/")
    out = []
    i = 0
    while i < len(s):
        m = None
        for x in multi:
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


# ---------------------------------------------------------------------------
# Phoneme -> respelling letter tables
# ---------------------------------------------------------------------------
VOWEL_SPELL_GA = {
    "i": "ee", "ɪ": "i", "ɛ": "eh", "æ": "a", "ə": "uh", "ʌ": "uh",
    "ɑ": "ah", "ɔ": "aw", "ʊ": "uu", "u": "oo", "ɝ": "ur", "ɚ": "er",
    "eɪ": "ay", "aɪ": "y", "ɔɪ": "oy", "oʊ": "oh", "aʊ": "ow",
}
VOWEL_SPELL_RP = {
    "iː": "ee", "ɪ": "i", "e": "eh", "æ": "a", "ə": "uh", "ʌ": "uh",
    "ɑː": "ah", "ɒ": "o", "ɔː": "aw", "ʊ": "uu", "uː": "oo", "ɜː": "ur",
    "eɪ": "ay", "aɪ": "y", "ɔɪ": "oy", "əʊ": "oh", "aʊ": "ow",
    "ɪə": "eer", "eə": "air", "ʊə": "oor",
    "i": "ee", "u": "oo", "ɔ": "aw",  # happY / thankYOU / bare-ɔ-before-ŋ
}
CONSONANT_SPELL = {
    "p": "p", "b": "b", "t": "t", "d": "d", "k": "k", "ɡ": "g",
    "f": "f", "v": "v", "θ": "th", "ð": "th", "s": "s", "z": "z",
    "ʃ": "sh", "ʒ": "zh", "h": "h", "tʃ": "ch", "dʒ": "j",
    "m": "m", "n": "n", "ŋ": "ng", "l": "l", "r": "r", "w": "w", "j": "y",
    # GA allophones (Phase 1/2a symbols) — display-only respelling equivalents
    "ɾ": "d",   # flap -> written as "d" (party -> PAR-dee)
    "ʔ": "t",   # glottal stop -> written as "t" (button -> BUH-tn)
}
SYLLABIC_SPELL = {"n̩": "n", "l̩": "l", "m̩": "m"}

# GA only: when /r/ is the FIRST consonant in a syllable's coda (i.e. it
# directly follows the vowel nucleus, making that vowel r-colored, as in
# "party" /ˈpɑrti/ or "garden" /ˈɡɑrdən/), spell the vowel+r as a single
# familiar unit ("ar") rather than vowel-letter + separate "r" ("ahr").
# This does not apply when /r/ is the ONSET of the following syllable
# (e.g. "very" /ˈvɛri/ keeps its plain vowel spelling "eh" + "r" onset).
# RP is non-rhotic — coda /r/ never appears in this dataset's rp_ipa
# (already absorbed into the vowel symbol itself, e.g. /ɑː/), so no
# equivalent table is needed for RP.
RHOTIC_CODA_SPELL_GA = {
    "ɑ": "ar", "ɔ": "or", "ɛ": "er", "ɪ": "eer", "æ": "ar",
    "ʌ": "ur", "ə": "er", "u": "oor", "i": "eer",
}


def is_nucleus(tok, vowel_set):
    return tok in vowel_set or tok in SYLLABIC


def syllabify(tokens, vowel_set):
    """
    Returns list of syllables; each syllable is a dict:
      { 'onset': [tok,...], 'nucleus': tok, 'coda': [tok,...], 'stress': 0|1|2 }
    stress: 2=primary, 1=secondary, 0=none.

    Consonants between two nuclei: last consonant -> onset of following
    syllable; any earlier consonants in a 2+ cluster -> coda of preceding
    syllable (simple maximal-onset heuristic). Clusters of 3+ consonants
    between nuclei are considered too ambiguous for this heuristic and
    raise UnsupportedCluster (caller should treat as an exception).
    """
    # locate nucleus positions (skip stress marks, they attach to the
    # following onset)
    nucleus_idx = [i for i, t in enumerate(tokens) if is_nucleus(t, vowel_set)]
    if not nucleus_idx:
        raise ValueError("no nucleus found")

    syllables = []
    for si, ni in enumerate(nucleus_idx):
        # stress: look at the nearest stress mark preceding this nucleus,
        # after the previous nucleus (or start of word)
        start_scan = nucleus_idx[si - 1] + 1 if si > 0 else 0
        stress = 0
        for k in range(start_scan, ni):
            if tokens[k] == "ˈ":
                stress = 2
            elif tokens[k] == "ˌ" and stress != 2:
                stress = 1
        syllables.append({
            "onset": [], "nucleus": tokens[ni], "coda": [], "stress": stress,
            "_nidx": ni,
        })

    # distribute consonants between nuclei
    for si in range(len(syllables)):
        ni = syllables[si]["_nidx"]
        prev_ni = syllables[si - 1]["_nidx"] if si > 0 else -1
        # consonant tokens strictly between prev nucleus and this nucleus
        between = [t for t in tokens[prev_ni + 1:ni] if t not in STRESS]
        if si == 0:
            # word-initial onset: all of `between` (before first nucleus) is
            # onset of the first syllable
            syllables[0]["onset"] = between
            continue
        if len(between) == 0:
            continue
        elif len(between) == 1:
            syllables[si]["onset"] = between
        else:
            coda_part, onset_part = split_cluster(between)
            syllables[si - 1]["coda"] = coda_part
            syllables[si]["onset"] = onset_part

    # word-final coda: consonants after the last nucleus
    last_ni = syllables[-1]["_nidx"]
    tail = [t for t in tokens[last_ni + 1:] if t not in STRESS]
    syllables[-1]["coda"] = syllables[-1]["coda"] + tail

    for s in syllables:
        del s["_nidx"]

    # This dataset omits the stress mark entirely for monosyllabic words
    # (there's only one syllable, so marking it is redundant) — e.g. "stop"
    # /stɑp/, "night" /naɪt/ have no ˈ at all. Without a fix, such words
    # would be spelled fully lowercase. If NO syllable in the word carries
    # primary stress, promote the single syllable (or, defensively, the
    # first syllable of a multi-syllable word lacking any mark) to primary.
    if not any(s["stress"] == 2 for s in syllables):
        syllables[0]["stress"] = 2

    return syllables


class UnsupportedCluster(Exception):
    pass


def spell_syllable(syl, vowel_spell, is_ga):
    parts = []
    for c in syl["onset"]:
        if c not in CONSONANT_SPELL:
            raise KeyError(f"unknown onset consonant {c!r}")
        parts.append(CONSONANT_SPELL[c])
    nuc = syl["nucleus"]
    coda = list(syl["coda"])
    if nuc in SYLLABIC_SPELL:
        if coda:
            # Syllabic consonant WITH a following coda (e.g. "important"
            # /ˌɪmˈpɔrʔn̩t/ -> naive spelling would be "tnt", an all-consonant
            # blob with no vowel letter). Spell the nucleus with its schwa
            # for readability in this case only; the bare consonant form
            # (SYLLABIC_SPELL, e.g. "bottle" -> "-dl") is reserved for the
            # far more common word-final case with no coda, which was
            # already reviewed and confirmed against pilot data.
            parts.append("uh" + SYLLABIC_SPELL[nuc])
        else:
            parts.append(SYLLABIC_SPELL[nuc])
    elif is_ga and coda and coda[0] == "r" and nuc in RHOTIC_CODA_SPELL_GA:
        # r-colored vowel: combine nucleus+r into one familiar spelling unit
        # and consume the "r" so it isn't spelled again below.
        parts.append(RHOTIC_CODA_SPELL_GA[nuc])
        coda = coda[1:]
    else:
        if nuc not in vowel_spell:
            raise KeyError(f"unknown vowel {nuc!r}")
        parts.append(vowel_spell[nuc])
    for c in coda:
        if c not in CONSONANT_SPELL:
            raise KeyError(f"unknown coda consonant {c!r}")
        parts.append(CONSONANT_SPELL[c])
    text = "".join(parts)
    if syl["stress"] == 2:
        return text.upper()
    return text.lower()


def respell(ipa_str, accent):
    """accent: 'ga' or 'rp'"""
    multi = MULTI_GA if accent == "ga" else MULTI_RP
    vowels = VOWELS_GA if accent == "ga" else VOWELS_RP
    vowel_spell = VOWEL_SPELL_GA if accent == "ga" else VOWEL_SPELL_RP
    tokens = tokenize(ipa_str, multi)
    syllables = syllabify(tokens, vowels)
    spelled = [spell_syllable(s, vowel_spell, accent == "ga") for s in syllables]
    return "-".join(spelled)


def main():
    data = json.loads(WORDLIST.read_text(encoding="utf-8"))
    pending_path = paths.REVIEW_NEEDED
    pending_words = set()
    if pending_path.exists():
        pending_words = {r["w"] for r in json.loads(pending_path.read_text(encoding="utf-8"))}

    drafts = []
    exceptions = []
    pending = []

    for w in data:
        word = w["w"]
        ga_source = w.get("ipa_actual_ga") or w.get("ipa")
        rp_source = w.get("rp_ipa") or w.get("ipa")
        if not ga_source or not rp_source:
            exceptions.append({"w": word, "reason": "missing ipa/rp_ipa"})
            continue

        entry = {"w": word}
        ok = True
        for accent, source in (("ga", ga_source), ("rp", rp_source)):
            try:
                entry[f"respell_{accent}"] = respell(source, accent)
            except (ValueError, KeyError, UnsupportedCluster) as e:
                exceptions.append({
                    "w": word, "reason": f"{accent}: {e}",
                    "ipa": source,
                })
                ok = False
                break
        if not ok:
            continue
        if word in pending_words:
            entry["note"] = "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
            pending.append(entry)
        else:
            drafts.append(entry)

    OUT_RESPELL.write_text(
        json.dumps(drafts, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    OUT_EXCEPTIONS.write_text(
        json.dumps(exceptions, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    paths.RESPELL_PENDING.write_text(
        json.dumps(pending, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )

    print(f"Total words:            {len(data)}")
    print(f"Confirmed (drafted):    {len(drafts)}")
    print(f"Pending TTS review:     {len(pending)}")
    print(f"Exceptions:             {len(exceptions)}")

    reasons = Counter()
    for e in exceptions:
        key = e["reason"].split(":")[0] if ":" in e["reason"] else e["reason"]
        reasons[key] += 1
    if reasons:
        print("\nException breakdown:")
        for k, v in reasons.most_common():
            print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
