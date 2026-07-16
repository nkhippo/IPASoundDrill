---
id: pj-2026-07-10-f620
aliases:
- pj-2026-07-10-f620
title: Phase 2 M2d（B2 拡充 301–390 語・M2 最終バッチ）— 実装レポート
created: '2026-07-10'
---
# Phase 2 M2d（B2 拡充 301–390 語・M2 最終バッチ）— 実装レポート

- 実施日: 2026-07-10
- 指示書: `/Users/naoya.k/Downloads/files 60/cursor-instructions-phase2-m2d.md`
- 前提: M2c マージ済み（5,307 語）
- ブランチ: `main`

## 1. 実施概要

**Phase 2 M2 の最終バッチ**として B2 拡充 **90 語**（`detach` 〜 `ecstatic`）を `rp_ipa` 同梱付きでマージ。M2a–c と同一方式でフルパイプラインを実行。`gen_rp_ipa.py`（API）は未実行。

Phase 2 M2 完了: M2a(100) + M2b(100) + M2c(100) + M2d(90) = **390 語**（pilot 179 語と合わせ B2 **899 語**）。

## 2. マージ結果

```
新規追加: 90語
スキップ: 0語
マージ後総語数: 5397
CEFR: A1=1187 / A2=1195 / B1=2116 / B2=899
```

ソース: `data/batches/phase2_m2d_90_with_gloss.json`

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
| flap 候補 | 529（R4 pending: 127） |
| respell 生成 | 5,260 語 |
| 全体 0 近傍 | 284（**5%**） |
| `BatchWords.gs` | 5,397 語 |

## 4. 品質検証（フルパイプライン実行込み）

| 指標 | 期待 | 実測 | 結果 |
|---|---|---|---|
| 総語数 | 5,397 | 5,397 | PASS |
| B2 count | 899 | 899 | PASS |
| 全体 0 近傍率 | 5% | 5% | PASS |
| M2d 0 近傍率 | 5% | 5%（5/90 語） | PASS |
| M2d `ga_rp_same` | 52%（47/90） | 52%（47/90） | PASS |
| M2d `ga_allophony` | 14 語 | 14 語 | PASS |
| M2d `rp_ipa` | 90/90 | 90/90 | PASS |
| gloss 5 言語 | 90/90 | 90/90 | PASS |
| 既存 5,307 語コア不変 | 0 変更 | 0 変更 | PASS |

### `dignify` / `dignity` IPA 修正確認

Claude 側 QA で発見された母音 `ɪ` 脱字はバッチデータで修正済み:

| 語 | IPA |
|---|---|
| `dignify` | `/ˈdɪɡnəˌfaɪ/` |
| `dignity` | `/ˈdɪɡnəti/` |

## 5. 変更ファイル

- `data/batches/phase2_m2d_90_with_gloss.json`
- `wordlist_GA_a1a2_plus_phonics.json`
- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
- `docs/reference/neighbors_report.md`
- `gas/BatchWords.gs`, `gas/batch_words.csv`

## 6. Phase 2 M2 完了サマリ

| バッチ | 語数 | 累計語数 | B2 |
|---|---|---|---|
| pilot | 179 | 5,007 | 509 |
| M2a | 100 | 5,107 | 609 |
| M2b | 100 | 5,207 | 709 |
| M2c | 100 | 5,307 | 809 |
| M2d | 90 | **5,397** | **899** |

## 7. 次ステップ

- Phase 3（C1 拡充）着手検討 — `docs/reference/c1-expansion-scope-design.md` 参照
- R4 pending 累計（M1–M5 110 語 + pilot 以降増加分）の整理
