#!/usr/bin/env python3
"""Generate data/derived/rp_complete.json via rule-based GA→RP conversion."""

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths
import json
from pathlib import Path

from ga_to_rp import ga_to_rp

INPUT = paths.WORDLIST
OUTPUT = paths.RP_COMPLETE


def main():
    rows = json.loads(INPUT.read_text(encoding="utf-8"))
    out = []
    for row in rows:
        item = dict(row)
        item["rp_ipa"] = ga_to_rp(row["w"], row["ipa"])
        out.append(item)
    OUTPUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    missing = sum(1 for r in out if not r.get("rp_ipa"))
    print(f"generated: {len(out)} entries -> {OUTPUT}")
    print(f"missing rp_ipa: {missing}")


if __name__ == "__main__":
    main()
