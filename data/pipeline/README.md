---
id: pj-2026-07-10-7d3b
aliases:
- pj-2026-07-10-7d3b
title: '`data/pipeline/` — IPA / respelling ステージング'
created: '2026-07-10'
---
# `data/pipeline/` — IPA / respelling ステージング

`scripts/generate_flap_ipa.py` 等が読み書きする**中間 JSON**。ブラウザからは読み込まない。

| File | Role |
|------|------|
| `phase2a_flap_candidates.json` | narrow IPA（flap-T 等）候補 |
| `phase2a_review_needed.json` | R4 VntV — TTS レビュー待ち（**127 語**） |
| `phase2b_respell_draft.json` | respelling ドラフト（マージ元） |
| `phase2b_respell_pending.json` | respell マージ対象外（R4 pending 等） |
| `phase2b_respell_exceptions.json` | respell 生成例外ログ |
| `ga_rp_same_report.json` | `gen_ga_rp_same.py` の集計レポート |
| `r4_pending_review_list.json` / `.csv` | R4 レビュー作業用リスト（`phase2a_review_needed` 拡張版） |

レビュー手順: [`docs/reference/r4-pending-review-guide.md`](../../docs/reference/r4-pending-review-guide.md)

パス正本: `scripts/paths.py`
