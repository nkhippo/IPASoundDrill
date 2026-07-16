---
id: pj-2026-07-10-d866
aliases:
- pj-2026-07-10-d866
title: Phase 2 M2a（B2 拡充 100 語）— 実装レポート
created: '2026-07-10'
---

# Phase 2 M2a（B2 拡充 100 語）— 実装レポート

- 実施日: 2026-07-10
- 指示書: `/Users/naoya.k/Downloads/files 56/cursor-instructions-phase2-m2a.md`
- 前提: RP IPA バグ修正（`ga_to_rp.py` v2）適用済み
- ブランチ: `main`

## 1. 実施概要

B2 拡充 **100 語**（`bio` 〜 バッチ末尾）を `rp_ipa` 同梱付きでマージ。narrow IPA / respelling / neighbors / `ga_rp_same` を再計算。`gen_rp_ipa.py`（API）は**未実行**（バッチに `rp_ipa` 同梱済み）。

## 2. マージ結果

```
新規追加: 100語
スキップ: 0語
マージ後総語数: 5107
CEFR: A1=1187 / A2=1195 / B1=2116 / B2=609
```

ソース: `data/batches/phase2_m2a_100_with_gloss.json`

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
| flap 候補 | 480（R4 pending: 122） |
| respell 生成 | 4,975 語 |
| 全体 0 近傍 | 268（**5%**） |
| `BatchWords.gs` | 5,107 語 |

## 4. 品質検証

| 指標 | 期待 | 実測 | 結果 |
|---|---|---|---|
| 総語数 | 5,107 | 5,107 | PASS |
| B2 count | 609 | 609 | PASS |
| 全体 0 近傍率 | 5% | 5% | PASS |
| M2a 0 近傍率 | 11% | 11% | PASS |
| M2a `ga_rp_same` | 54% | **48%** | 差異あり（§5） |
| M2a `rp_ipa` | 100/100 | 100/100 | PASS |
| gloss 5 言語 | 100/100 | 100/100 | PASS |
| GA IPA `ː` 混入 | 0 | 0 | PASS |
| 既存 4,828 語（pilot 前）コア不変 | 0 変更 | 0 変更 | PASS |

### r 保持サンプル（バグ修正効果）

| 語 | GA | RP |
|---|---|---|
| `bureaucracy` | `/bjʊˈrɑkrəsi/` | `/bjʊˈrɒkrəsiː/` |
| `broaden` | `/ˈbrɔdən/` | `/ˈbrɔːdən/` |
| `burglary` | `/ˈbɝɡləri/` | `/ˈbɜːɡləriː/` |

いずれも母音前 /r/ が正しく保持。

## 5. `ga_rp_same` 48% vs 期待 54%

サンドボックスシミュレーション（54%）との差は **6 語**。主因は neighbors 再計算後の wordlist 全体再スキャンによる境界語の reason 分類差と、本番 wordlist 上の `ga_rp_same` 再計算タイミングの違い。M2a 100 語すべて `missing_data` ではなく正常分類済み。

## 6. 変更ファイル

- `data/batches/phase2_m2a_100_with_gloss.json`
- `wordlist_GA_a1a2_plus_phonics.json`
- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
- `docs/reference/neighbors_report.md`
- `gas/BatchWords.gs`, `gas/batch_words.csv`

## 7. 次ステップ

- **M2b**（101–200 語）— 同一方式（`rp_ipa` 同梱）で継続
- Phase 2 M2 完了目標: M2a–d 各 100 語 × 4 = 400 語
