#!/usr/bin/env python3
"""Apply Phase 2a final narrow IPA candidates (52 VntV words) to the wordlist."""

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths
import json
from pathlib import Path

ROOT = paths.ROOT
WORDLIST = paths.WORDLIST
FINAL = paths.FINAL_CANDIDATES


def main():
    data = json.loads(WORDLIST.read_text(encoding="utf-8"))
    final = json.loads(FINAL.read_text(encoding="utf-8"))
    lookup = {w["w"]: w for w in data}

    set_count = cleared = corrected = 0
    for f in final:
        word = f["w"]
        entry = lookup.get(word)
        if not entry:
            continue
        new_val = f.get("ipa_actual_ga")
        old_val = entry.get("ipa_actual_ga")
        if new_val is None:
            if old_val is not None:
                entry["ipa_actual_ga"] = None
                cleared += 1
            elif "ipa_actual_ga" in entry:
                entry.pop("ipa_actual_ga", None)
                cleared += 1
            continue
        if old_val != new_val:
            entry["ipa_actual_ga"] = new_val
            corrected += 1
            set_count += 1
        elif old_val == new_val:
            set_count += 1

    WORDLIST.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"processed {len(final)} final candidates")
    print(f"cleared ipa_actual_ga: {cleared}")
    print(f"corrected ipa_actual_ga: {corrected}")
    print(f"confirmed with value: {set_count}")


if __name__ == "__main__":
    main()
