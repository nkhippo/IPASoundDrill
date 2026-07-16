---
id: pj-2026-07-10-2e6a
aliases:
- pj-2026-07-10-2e6a
title: '`data/batches/` — 語彙マージ用ソース JSON'
created: '2026-07-10'
---

# `data/batches/` — 語彙マージ用ソース JSON

Cursor / Claude が生成し、マージスクリプト（またはインライン Python）で `wordlist_GA_a1a2_plus_phonics.json` に取り込むバッチ。**ブラウザからは読み込まない。**

## 命名規則

| パターン | 意味 |
|----------|------|
| `phase1_mN_*_with_gloss.json` | Phase 1 B1 拡充（M1–M5） |
| `phase2_pilot_*_with_gloss.json` | Phase 2 B2 パイロット |
| `phase2_m2{a-d}_*_with_gloss.json` | Phase 2 M2 B2 拡充（100/100/100/90 語） |
| `gap_*.json` | 将来拡充のギャップ分析（未マージ） |
| `cefr_proposals_merge_ready.json` | CEFR 提案のマージ待ち |

## 現行バッチ一覧（2026-07-10）

| File | 語数 | 内容 |
|------|-----:|------|
| `phase1_pilot_180_with_gloss.json` | 180 | Phase 1 M1 |
| `phase1_m2_400_with_gloss.json` | 400 | Phase 1 M2 |
| `phase1_m3_400_with_gloss.json` | 400 | Phase 1 M3 |
| `phase1_m4_400_with_gloss.json` | 400 | Phase 1 M4 |
| `phase1_m5_389_with_gloss.json` | 389 | Phase 1 M5 |
| `phase2_pilot_180_with_gloss.json` | 179 | Phase 2 pilot（B2） |
| `phase2_m2a_100_with_gloss.json` | 100 | Phase 2 M2a |
| `phase2_m2b_100_with_gloss.json` | 100 | Phase 2 M2b |
| `phase2_m2c_100_with_gloss.json` | 100 | Phase 2 M2c |
| `phase2_m2d_90_with_gloss.json` | 90 | Phase 2 M2d（M2 最終） |

Phase 2 以降のバッチは **`rp_ipa` 同梱**（`gen_rp_ipa.py` API 不要）。

マージ後の標準パイプライン: [[pj-2026-07-09-80be|`docs/REPOSITORY-STRUCTURE.md`]] § Common pipeline commands
