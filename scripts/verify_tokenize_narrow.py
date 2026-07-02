#!/usr/bin/env python3
"""Verify tokenizer can parse every ipa_actual_ga entry without errors."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORDLIST = ROOT / "wordlist_GA_a1a2_plus_phonics.json"

MULTI_GA = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ", "n̩", "l̩", "m̩"]


def tokenize(raw):
    s = raw.replace("/", "")
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


def main():
    rows = json.loads(WORDLIST.read_text(encoding="utf-8"))
    narrow_rows = [r for r in rows if r.get("ipa_actual_ga")]
    bad = []
    for r in narrow_rows:
        w = r["w"]
        ipa = r["ipa_actual_ga"]
        try:
            tk = tokenize(ipa)
            if not tk:
                bad.append((w, ipa, "empty tokens"))
        except Exception as exc:  # noqa: BLE001
            bad.append((w, ipa, str(exc)))

    print(f"narrow entries checked: {len(narrow_rows)}")
    print(f"tokenize failures: {len(bad)}")
    if bad:
        for w, ipa, msg in bad[:20]:
            print(f"  {w}: {ipa} -> {msg}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
