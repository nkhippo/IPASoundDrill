#!/usr/bin/env python3
"""Merge rp_ipa from rp_complete.json into production wordlist."""

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths
import json
from pathlib import Path

WORDLIST = paths.WORDLIST
RP_SRC = paths.RP_COMPLETE
CONNECTED = paths.CONNECTED_SPEECH
CONNECTED_RP = paths.CONNECTED_SPEECH_RP
CLEAR = paths.GLOSS_CORRECTIONS


def apply_clear(rows, clear):
    by_w = {r["w"]: r for r in rows}
    for w, patch in clear.items():
        if w not in by_w:
            continue
        g = by_w[w].setdefault("gloss", {})
        g["en"] = w
        for lang, val in patch.items():
            g[lang] = val


def main():
    rows = json.loads(WORDLIST.read_text(encoding="utf-8"))
    rp_by_w = {r["w"]: r.get("rp_ipa") for r in json.loads(RP_SRC.read_text(encoding="utf-8"))}
    clear = json.loads(CLEAR.read_text(encoding="utf-8"))

    merged = 0
    for row in rows:
        w = row["w"]
        if w in rp_by_w and rp_by_w[w]:
            row["rp_ipa"] = rp_by_w[w]
            merged += 1

    apply_clear(rows, clear)
    WORDLIST.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    conn = json.loads(CONNECTED_RP.read_text(encoding="utf-8"))
    CONNECTED.write_text(json.dumps(conn, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"wordlist: {len(rows)} entries, rp_ipa merged: {merged}")
    print(f"connected_speech: {len(conn)} phrases with rp_ipa")
    assert merged == len(rows), f"expected all words to have rp_ipa, got {merged}"
    assert all(r.get("rp_ipa") for r in conn), "connected phrases missing rp_ipa"


if __name__ == "__main__":
    main()
