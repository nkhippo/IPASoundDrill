"""Shared phonological lexicons for GA↔RP pipeline scripts.

Consolidates lists that were previously duplicated in ga_to_rp.py and
gen_ga_rp_same.py to prevent drift.
"""
from __future__ import annotations

# TRAP-BATH split: words where GA /æ/ maps to RP /ɑː/
# Union of prior lists in ga_to_rp.py (22 words) and gen_ga_rp_same.py (32 words),
# plus common B1/B2 additions verified against Wells LPD.
BATH_WORDS_BASE = frozenset({
    # Original ga_to_rp.py list
    "after", "answer", "ask", "bath", "branch", "castle", "chance", "class",
    "dance", "example", "fast", "glass", "graph", "half", "laugh", "last",
    "master", "pass", "past", "path", "plant", "rather", "staff",
    # Extras from gen_ga_rp_same.py
    "aunt", "banana", "afternoon", "advantage", "advance", "afterwards",
    "france", "french", "grass", "can't", "aren't",
    # Additional B1/B2 additions verified against LPD
    "basket", "blast", "broadcast", "cast", "chant", "command", "contrast",
    "craft", "demand", "disaster", "draft", "forecast", "glance", "grasp",
    "mask", "plaster", "sample", "task", "vast",
})


def is_bath_word(word: str) -> bool:
    """Check if a word (or a simple morphological derivative) is BATH-class.

    Handles common English suffixes: -s, -es, -ed, -ing, -er, -est, -ly, -room,
    -work, -most. If the base after suffix stripping is in BATH_WORDS_BASE,
    the derivative is treated as BATH too.
    """
    if not word:
        return False
    wl = word.lower()
    if wl in BATH_WORDS_BASE:
        return True
    # Try stripping common suffixes
    SUFFIXES = ("est", "ing", "ed", "es", "s", "er", "ly", "room", "work", "most")
    for suf in SUFFIXES:
        if wl.endswith(suf) and len(wl) > len(suf) + 2:
            base = wl[:-len(suf)]
            if base in BATH_WORDS_BASE:
                return True
            # Some derivatives require +e (e.g. "asking" -> "ask" not "aski")
            if suf in ("ing", "ed") and (base + "e") in BATH_WORDS_BASE:
                return True
    return False


# PALM lexical set: GA /ɑ/ maps to RP /ɑː/ (not /ɒ/)
# Minimal list of common core PALM words (word-final /ɑ/ + a few pre-C cases).
PALM_WORDS = frozenset({
    "spa", "bra", "pa", "ma", "grandpa", "grandma", "ah",
    "father", "rather",  # note: "rather" is also BATH — overlap OK
    "palm", "calm", "balm", "psalm", "qualm",
    "drama", "llama", "lava", "sonata", "plaza",
})


# Coronal consonants that trigger yod-retention in RP after /uː/
# (GA drops the /j/, RP keeps it)
YOD_CORONALS = frozenset({"t", "d", "n", "s", "z", "l", "θ"})
