# -*- coding: utf-8 -*-
"""Merge def (English definitions) into wordlist_GA_a1a2_plus_phonics.json."""
import json
import glob
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WL = os.path.join(ROOT, "wordlist_GA_a1a2_plus_phonics.json")
BATCH_GLOB = os.path.join(ROOT, "data", "def-batch*.json")

wl = json.load(open(WL, encoding="utf-8"))
def_map = {}
files = sorted(glob.glob(BATCH_GLOB))
for f in files:
    def_map.update(json.load(open(f, encoding="utf-8")))

applied, missing = 0, []
for it in wl:
    v = def_map.get(it["w"])
    if v and v.strip():
        it["def"] = v
        applied += 1
    else:
        missing.append(it["w"])

json.dump(wl, open(WL, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"batches: {len(files)} | def entries: {len(def_map)} | "
      f"applied: {applied} | without def: {len(missing)}")
if missing:
    print("missing:", missing[:10])
