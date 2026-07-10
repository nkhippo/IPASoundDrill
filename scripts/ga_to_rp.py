"""Rule-based GA IPA → RP IPA conversion (STEP5 offline fallback).

v2 fix (2026-07-09): r-coloured vowel merging and coda-r vocalisation must
only apply when /r/ is NOT followed by a vowel. RP is non-rhotic only in
CODA position (before a consonant or at the end of a word). Onset /r/ and
intervocalic /r/ (e.g. "barometer", "arrogant", "aircrew", "artistry") are
ALWAYS pronounced in RP and must be preserved.

v1 bug (found during Phase 2 pilot QA, 2026-07-09): the previous
implementation used context-blind substring replacement (e.g. every "ɑr"
became "ɑː", every "r" was dropped), which incorrectly deleted /r/ in
~40% of words containing an intervocalic or onset /r/ — e.g.:
  barometer  /bəˈrɑmətɚ/  → (v1, WRONG) /bəˈɒmətə/   (v2) /bəˈrɒmətə/
  arrogant   /ˈærəɡənt/   → (v1, WRONG) /ˈæəɡənt/    (v2) /ˈærəɡənt/
  aircrew    /ˈɛrˌkru/    → (v1, WRONG) /ˈeəˌkuː/    (v2) /ˈeəˌkruː/
  artistry   /ˈɑrtəstri/  → (v1, WRONG) /ˈɑːtəstiː/  (v2) /ˈɑːtəstriː/

This module is the OFFLINE FALLBACK only — the primary RP source is
Britfone direct lookup, with scripts/gen_rp_ipa.py (Claude API) filling
remaining gaps. This script exists for words neither source covers.
"""
from __future__ import annotations

MULTI = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ"]

# Full monophthong + diphthong + rhotic-vowel inventory (verified against
# corpus token scan, 2026-07-09). Anything not in this set is a consonant
# or stress mark.
VOWELS = {
    "i", "ɪ", "ɛ", "æ", "ʌ", "ɑ", "ɔ", "ʊ", "u", "ə", "ɝ", "ɚ",
    "aɪ", "aʊ", "eɪ", "ɔɪ", "oʊ",
}

BATH_WORDS = {
    "after", "answer", "ask", "bath", "branch", "castle", "chance", "class",
    "dance", "example", "fast", "glass", "graph", "half", "laugh", "last",
    "master", "pass", "past", "path", "plant", "rather", "staff",
}

OVERRIDES = {
    "Z": "/zɛd/",
    "R": "/ɑː/",
}

# Vowel-coloured-by-coda-r -> RP non-rhotic vowel, used ONLY when /r/ is
# in coda position (i.e. NOT followed by a vowel token).
SIMPLE_RCOLOR = {"ɑ": "ɑː", "ɔ": "ɔː", "ɪ": "ɪə", "ɛ": "eə", "ʊ": "ʊə"}
DIPHTHONG_RCOLOR = {"aʊ": "aʊə", "aɪ": "aɪə", "ɔɪ": "ɔɪə", "eɪ": "eɪə"}


def tokenize(ipa: str) -> list[str]:
    s = ipa.replace("/", "").replace("ˈ", "ˈ").replace("ˌ", "ˌ")
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
    return "/" + "".join(tokens) + "/"


def _is_vowel(tok: str | None) -> bool:
    return tok is not None and tok in VOWELS


def ga_to_rp(word: str, ga_ipa: str) -> str:
    if word in OVERRIDES:
        return OVERRIDES[word]

    inner = ga_ipa.strip("/")

    # TRAP-BATH before other vowel rules (word-triggered, unaffected by r-bug)
    if word in BATH_WORDS:
        inner = inner.replace("æ", "ɑː")

    tokens = tokenize("/" + inner + "/")
    n = len(tokens)

    # --- PASS 1: context-sensitive rhoticity resolution ---------------
    pass1: list[str] = []
    i = 0
    while i < n:
        tok = tokens[i]
        nxt = tokens[i + 1] if i + 1 < n else None

        # Diphthong + r
        if tok in DIPHTHONG_RCOLOR and nxt == "r":
            after = tokens[i + 2] if i + 2 < n else None
            if _is_vowel(after):
                # onset/intervocalic r after diphthong — keep r, keep diphthong as-is
                pass1.append(tok)
                pass1.append("r")
            else:
                pass1.append(DIPHTHONG_RCOLOR[tok])
            i += 2
            continue

        # Simple vowel + r
        if tok in SIMPLE_RCOLOR and nxt == "r":
            after = tokens[i + 2] if i + 2 < n else None
            if _is_vowel(after):
                pass1.append(tok)
                pass1.append("r")
            else:
                pass1.append(SIMPLE_RCOLOR[tok])
            i += 2
            continue

        # ɝ / ɚ are inherently rhotic vowels (fused r-colouring); always
        # vocalise. (No known corpus case of these followed by a vowel.)
        if tok == "ɝ":
            pass1.append("ɜː")
            i += 1
            continue
        if tok == "ɚ":
            pass1.append("ə")
            i += 1
            continue

        # Standalone /r/ not captured by a vowel+r cluster above: this is
        # onset r (e.g. "red"), or an r following a consonant in an onset
        # cluster (e.g. "tr" in "artistry", "cr" in "aircrew"). RP keeps
        # onset /r/ always — only DROP if truly coda (not followed by a
        # vowel and not part of an onset cluster). Since onset clusters by
        # definition precede a vowel, checking "followed by vowel" is
        # sufficient and correct for both cases.
        if tok == "r":
            if _is_vowel(nxt):
                pass1.append("r")
            # else: true coda r with no following vowel — drop (rare;
            # a preceding vowel+r case above normally already consumed it)
            i += 1
            continue

        pass1.append(tok)
        i += 1

    # --- PASS 2: notation-only vowel mapping ---------------------------
    final: list[str] = []
    j = 0
    m = len(pass1)
    while j < m:
        t = pass1[j]
        nx = pass1[j + 1] if j + 1 < m else None
        if t in ("ˈ", "ˌ"):
            final.append(t)
        elif t == "oʊ":
            final.append("əʊ")
        elif t == "i":
            final.append("iː")
        elif t == "u":
            final.append("uː")
        elif t == "ɔ" and nx != "ː":
            final.append("ɔː")
        elif t == "ɛ":
            final.append("e")
        elif t == "ɑ" and nx != "ː":
            final.append("ɒ")
        else:
            final.append(t)
        j += 1

    rp = detokenize(final)
    if not rp.startswith("/") or len(rp) < 3:
        return ga_ipa
    return rp
