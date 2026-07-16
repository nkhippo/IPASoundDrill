---
id: pj-2026-07-10-b7de
aliases:
- pj-2026-07-10-b7de
title: Cursor 指示書 — Phase 2 M2c（B2 拡充 201-300 語）
created: '2026-07-10'
---

# Cursor 指示書 — Phase 2 M2c（B2 拡充 201-300 語）

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 前提: M2b マージ済み（5,207語）
- 想定 branch: `feat/phase2-m2c-b2-100`

---

## 1. スコープ

M2a/M2b と同一方式。`rp_ipa` 同梱、`gen_rp_ipa.py`（API）実行不要。

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
python3 scripts/gen_neighbors.py
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
python3 scripts/export_batch_words.py
```

## 2. Claude 側で実施済みの検証

- ✅ QA チェック 0 件（`ː`混入・**ASCII-g混入（前回の教訓を反映）**・重複・フィールド欠落すべてゼロ）
- ✅ 既存 5,207 語との重複ゼロ
- ✅ フルパイプライン（flap → respell → neighbors → ga_rp_same）をサンドボックスで実行済み

### 期待値（マージ後）

| 指標 | 期待値 |
|---|---|
| 総語数 | 5,307 |
| B2 count | 809 |
| 全体 0近傍率 | 5%（変化なし） |
| M2c 100語の 0近傍率 | 11% |
| M2c 100語の `ga_rp_same` | 53% |
| M2c 100語の `ga_allophony`（flap該当） | 20語 |

### 語彙メモ

`cripple`（差別的とされる古い語）、`damn`（軽い俗語）を含みます。CEFR-J v1.5 の標準収録語のため採用しましたが、
既存の `gook`（差別語）、`hell`、`bloody` と同様、gloss で注記を付けて中立的に扱っています。

## 3. コミット

```bash
git add data/batches/phase2_m2c_100_with_gloss.json \
        wordlist_GA_a1a2_plus_phonics.json \
        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
        data/pipeline/ga_rp_same_report.json \
        data/derived/wordlist_with_neighbors.json \
        data/derived/wordlist_with_neighbors_slim.json \
        gas/BatchWords.gs gas/batch_words.csv \
        docs/reference/neighbors_report.md \
        docs/cursor/reports/cursor-implementation-report-phase2-m2c.md
git commit -m "feat: Phase 2 M2c — 100 B2 words (rp_ipa embedded)"
```

## 4. 次バッチ

M2d（301-400語、Phase 2 M2 最終100語）で継続。M2完了後 B2拡充は合計 ~509+400=909語規模に到達見込み。
