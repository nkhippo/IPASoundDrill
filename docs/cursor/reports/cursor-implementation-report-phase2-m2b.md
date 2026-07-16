---
id: pj-2026-07-10-4a8a
aliases:
- pj-2026-07-10-4a8a
title: Phase 2 M2b（B2 拡充 101–200 語）— 実装レポート
created: '2026-07-10'
---
# Phase 2 M2b（B2 拡充 101–200 語）— 実装レポート

- 実施日: 2026-07-10
- 指示書: `/Users/naoya.k/Downloads/files 57/cursor-instructions-phase2-m2b.md`
- 前提: M2a マージ済み（5,107 語）
- ブランチ: `main`

## 1. 実施概要

B2 拡充 **100 語**（`chunk` 〜 バッチ末尾）を `rp_ipa` 同梱付きでマージ。M2a と同一方式でフルパイプラインを実行。`gen_rp_ipa.py`（API）は未実行。

## 2. マージ結果

```
新規追加: 100語
スキップ: 0語
マージ後総語数: 5207
CEFR: A1=1187 / A2=1195 / B1=2116 / B2=709
```

ソース: `data/batches/phase2_m2b_100_with_gloss.json`

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
| flap 候補 | 495（R4 pending: 123） |
| respell 生成 | 5,074 語 |
| 全体 0 近傍 | 276（**5%**） |
| `BatchWords.gs` | 5,207 語 |

## 4. 品質検証（フルパイプライン実行込み）

| 指標 | 期待 | 実測 | 結果 |
|---|---|---|---|
| 総語数 | 5,207 | 5,207 | PASS |
| B2 count | 709 | 709 | PASS |
| 全体 0 近傍率 | 5% | 5% | PASS |
| M2b 0 近傍率 | 9% | 9% | PASS |
| M2b `ga_rp_same` | 39% | 39% | PASS |
| M2b `ga_allophony`（flap 該当） | 15 語 | 15 語 | PASS |
| M2b `rp_ipa` | 100/100 | 100/100 | PASS |
| gloss 5 言語 | 100/100 | 100/100 | PASS |
| 既存 5,107 語コア不変 | 0 変更 | 0 変更 | PASS |

### `colleague` IPA 修正確認

`colleague` の IPA は script-g `ɡ`（U+0261）を使用。ASCII `g`（U+0067）の混入はなし。

## 5. 変更ファイル

- `data/batches/phase2_m2b_100_with_gloss.json`
- `wordlist_GA_a1a2_plus_phonics.json`
- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
- `docs/reference/neighbors_report.md`
- `gas/BatchWords.gs`, `gas/batch_words.csv`

## 6. 備考

`phase2b_respell_exceptions.json` に pilot 語の一時エラーが記録される現象は指示書 §3 通り、wordlist 本体への影響なし。別途 `generate_respelling.py` ログ調査を推奨（優先度低）。

## 7. 次ステップ

**M2c**（201–300 語）— 同一方式で継続。
