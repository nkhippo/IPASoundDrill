---
id: pj-2026-07-10-c977
aliases:
- pj-2026-07-10-c977
title: '`data/derived/` — 派生データ（非 runtime）'
created: '2026-07-10'
---

# `data/derived/` — 派生データ（非 runtime）

`gen_neighbors.py` / `gen_rp_ipa.py` 等が生成する**中間 JSON**。`merge_neighbors.py` が本番 wordlist へ反映する。ブラウザからは読み込まない。

| File | Role |
|------|------|
| `wordlist_with_neighbors.json` | neighbors 付き wordlist（フル） |
| `wordlist_with_neighbors_slim.json` | neighbors のみ配列（マージ推奨形式） |
| `rp_progress.json` | 語 → `rp_ipa` の進捗マップ |
| `rp_complete.json` | wordlist スナップショット（RP 作業用） |

パス正本: `scripts/paths.py`
