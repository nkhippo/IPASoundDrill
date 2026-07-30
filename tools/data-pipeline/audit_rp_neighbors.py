#!/usr/bin/env python3
"""Audit GA neighbors validity under RP IPA (priority decision support)."""

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

WORDLIST = paths.WORDLIST

MULTI_GA = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ"]
MULTI_RP = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə", "iː", "uː", "ɑː", "ɔː", "ɜː"]
VOWEL_BASE = set("iɪeæəʌɑɔʊuɒ")


def tokenize(ipa: str, multi: list[str]) -> list[str]:
    s = ipa.replace("/", "").replace("ˈ", "").replace("ˌ", "")
    out: list[str] = []
    i = 0
    while i < len(s):
        matched = None
        for x in multi:
            if s.startswith(x, i):
                matched = x
                break
        if matched:
            out.append(matched)
            i += len(matched)
        elif s[i] == "ː" and out and out[-1] in VOWEL_BASE:
            out[-1] = out[-1] + "ː"
            i += 1
        else:
            out.append(s[i])
            i += 1
    return out


def edit_dist(a: list[str], b: list[str]) -> int:
    la, lb = len(a), len(b)
    dp = [[0] * (lb + 1) for _ in range(la + 1)]
    for i in range(la + 1):
        dp[i][0] = i
    for j in range(lb + 1):
        dp[0][j] = j
    for i in range(1, la + 1):
        for j in range(1, lb + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    return dp[la][lb]


def main():
    rows = json.loads(WORDLIST.read_text(encoding="utf-8"))
    by_w = {r["w"]: r for r in rows}
    ga_toks = {r["w"]: tokenize(r["ipa"], MULTI_GA) for r in rows}
    rp_toks = {r["w"]: tokenize(r.get("rp_ipa") or r["ipa"], MULTI_RP) for r in rows}

    pairs = 0
    rp_near = 0
    ga_minimal = 0
    ga_minimal_rp_tight = 0
    valid_neighbor_counts: Counter[int] = Counter()

    for row in rows:
        w = row["w"]
        valid = 0
        for nb in row.get("neighbors") or []:
            if nb not in by_w:
                continue
            pairs += 1
            ga_d = edit_dist(ga_toks[w], ga_toks[nb])
            rp_d = edit_dist(rp_toks[w], rp_toks[nb])
            if rp_d <= 2:
                rp_near += 1
                valid += 1
            if ga_d == 1:
                ga_minimal += 1
                if rp_d <= 1:
                    ga_minimal_rp_tight += 1
        valid_neighbor_counts[valid] += 1

    n = len(rows)
    two_plus = sum(c for k, c in valid_neighbor_counts.items() if k >= 2)
    one = valid_neighbor_counts.get(1, 0)
    zero = valid_neighbor_counts.get(0, 0)

    print(f"words: {n}")
    print(f"neighbor pairs: {pairs}")
    print(f"RP still near (dist<=2): {rp_near} ({rp_near * 100 / pairs:.1f}%)")
    if ga_minimal:
        print(
            f"GA minimal pairs tight in RP (dist<=1): "
            f"{ga_minimal_rp_tight}/{ga_minimal} ({ga_minimal_rp_tight * 100 / ga_minimal:.1f}%)"
        )
    print(f"words with >=2 valid RP neighbors: {two_plus} ({two_plus * 100 / n:.1f}%)")
    print(f"words with 1 valid RP neighbor: {one} ({one * 100 / n:.1f}%)")
    print(f"words with 0 valid RP neighbors: {zero} ({zero * 100 / n:.1f}%)")


if __name__ == "__main__":
    main()
