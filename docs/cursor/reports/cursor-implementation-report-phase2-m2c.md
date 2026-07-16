---
id: pj-2026-07-10-dd18
aliases:
- pj-2026-07-10-dd18
title: Phase 2 M2c（B2 拡充 201–300 語）— 実装レポート
created: '2026-07-10'
---
# Phase 2 M2c（B2 拡充 201–300 語）— 実装レポート

- 実施日: 2026-07-10
- 指示書: `/Users/naoya.k/Downloads/files 58/cursor-instructions-phase2-m2c.md`
- 前提: M2b マージ済み（5,207 語）
- ブランチ: `main`

## 1. 実施概要

B2 拡充 **100 語**（`conversely` 〜 `destiny`）を `rp_ipa` 同梱付きでマージ。M2a/M2b と同一方式でフルパイプラインを実行。`gen_rp_ipa.py`（API）は未実行。

## 2. マージ結果

```
新規追加: 100語
スキップ: 0語
マージ後総語数: 5307
CEFR: A1=1187 / A2=1195 / B1=2116 / B2=809
```

ソース: `data/batches/phase2_m2c_100_with_gloss.json`

## 3. パイプライン

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
python3 scripts/export_batch_words.py
```

| 指標 | 結果 |
|---|---|
| flap 候補 | 515（R4 pending: 127） |
| respell 生成 | 5,170 語 |
| 全体 0 近傍 | 283（**5%**） |
| `BatchWords.gs` | 5,307 語 |

## 4. 品質検証（フルパイプライン実行込み）

| 指標 | 期待 | 実測 | 結果 |
|---|---|---|---|
| 総語数 | 5,307 | 5,307 | PASS |
| B2 count | 809 | 809 | PASS |
| 全体 0 近傍率 | 5% | 5% | PASS |
| M2c 0 近傍率 | 11% | 11% | PASS |
| M2c `ga_rp_same` | 53% | 53% | PASS |
| M2c `ga_allophony`（flap 該当） | 20 語 | 20 語 | PASS |
| M2c `rp_ipa` | 100/100 | 100/100 | PASS |
| gloss 5 言語 | 100/100 | 100/100 | PASS |
| 既存 5,207 語コア不変 | 0 変更 | 0 変更 | PASS |

## 5. 変更ファイル

- `data/batches/phase2_m2c_100_with_gloss.json`
- `wordlist_GA_a1a2_plus_phonics.json`
- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
- `docs/reference/neighbors_report.md`
- `gas/BatchWords.gs`, `gas/batch_words.csv`

## 6. 備考

`cripple`・`damn` は CEFR-J 標準収録語として採用。gloss で中立的注記付き（`gook`・`hell`・`bloody` と同様）。

## 7. 次ステップ

**M2d**（301–390 語、Phase 2 M2 最終バッチ）— 同一方式で継続。
