#!/usr/bin/env python3
"""Extract RP v3 rollout target words from wordlist.json.

Issue #287 Phase A: gpt-audio が有効なカテゴリの語を抽出し
~/tts-poc-v3/heal_v2.py の DEMO_TARGETS に投入するための JSON を生成する。

抽出条件 (handoff/2026-08-02_tts-ga-rp-improvement.md L292-297 準拠):
  - ga_rp_same == false
  - ga_rp_same_reason in {rhoticity, trap_bath, goat_vowel}
  - rhoticity: rp_ipa が 'ə' で終わる (word-final unstressed schwa)
  - goat_vowel: monosyllable (stress marker 0)
  - trap_bath: 全て

出力: tools/tts/v3_targets.json  ({word, rp_ipa, category} のリスト)
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORDLIST = ROOT / "packages/core/data/wordlist.json"
OUT = Path(__file__).parent / "v3_targets.json"

TARGET_REASONS = {"rhoticity", "trap_bath", "goat_vowel"}


def strip_ipa(ipa: str) -> str:
    return (ipa or "").strip().strip("/").strip("[]")


def is_monosyllable(rp_ipa: str) -> bool:
    s = strip_ipa(rp_ipa)
    return s.count("ˈ") + s.count("ˌ") == 0


def rhoticity_ok(rp_ipa: str) -> bool:
    return strip_ipa(rp_ipa).endswith("ə")


def main() -> None:
    wl = json.loads(WORDLIST.read_text(encoding="utf-8"))
    out = []
    for e in wl:
        if e.get("ga_rp_same") is not False:
            continue
        reason = e.get("ga_rp_same_reason")
        if reason not in TARGET_REASONS:
            continue
        rp = e.get("rp_ipa") or ""
        w = e.get("w")
        if reason == "rhoticity" and not rhoticity_ok(rp):
            continue
        if reason == "goat_vowel" and not is_monosyllable(rp):
            continue
        out.append({"word": w, "rp_ipa": rp, "category": reason})

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")

    from collections import Counter
    counts = Counter(e["category"] for e in out)
    print(f"wrote {OUT.relative_to(ROOT)}  total={len(out)}")
    for cat, n in counts.most_common():
        print(f"  {cat}: {n}")


if __name__ == "__main__":
    main()
