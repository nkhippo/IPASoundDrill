---
id: pj-2026-07-09-d678
aliases:
- pj-2026-07-09-d678
title: neighbors 再計算（v2 適応化）— 実装レポート
created: '2026-07-09'
---

# neighbors 再計算（v2 適応化）— 実装レポート

- 実施日: 2026-07-09
- 指示書: `/Users/naoya.k/Downloads/files 52/cursor-instructions-neighbors-v2.md`
- ブランチ: `main`

## 1. 実施概要

`scripts/gen_neighbors.py` を v2（語長適応型 MAX_DIST）に差し替え、全 4,828 語の neighbors を再計算した。派生 JSON・レポートを更新し、GitHub Pages 向けに `merge_neighbors.py` で本番 wordlist へ反映、`export_batch_words.py` で `gas/BatchWords.gs` を 4,828 語に更新した。

## 2. スクリプト実行結果

```
完了: 4828語に neighbors 付与 → data/derived/wordlist_with_neighbors.json
slim版: data/derived/wordlist_with_neighbors_slim.json
近傍0語: 255 (5%) / ミニマルペア保有: 2291 (47%)
レポート: docs/reference/neighbors_report.md
```

指示書の期待値と一致:
- 近傍0語: **255 (5%)**
- ミニマルペア保有: **2291 (47%)**

## 3. CEFR 別カバー率

| CEFR | 総数 | 0近傍% | フルK% | 期待 | 結果 |
|---|---:|---:|---:|---|---|
| A1 | 1,187 | 2% | 82% | 2% / 82% | PASS |
| A2 | 1,195 | 5% | 60% | 5% / 60% | PASS |
| B1 | 2,116 | 8% | 44% | 8% / 44% | PASS |
| B2 | 330 | 0% | 99% | 0% / 99% | PASS |

v1 比: B1 の 0 近傍率 **29% → 8%**、全体 **19% → 5%**。

## 4. 既存サンプル（短語）の保持確認

| 語 | 結果 | 備考 |
|---|---|---|
| `ship` | PASS | 8 語すべて同一 |
| `bad` | PASS | 8 語すべて同一 |
| `seat` | PASS | 8 語すべて同一 |
| `three` | 先頭5語同一 | 末尾: `B/C/D` → `theory/any/arm`（語彙拡充後の再ランク。ミニマルペア先頭は不変） |
| `vote` | 先頭6語同一 | 末尾: 単語 `V` が `aunt` に置換（拡張プールでの再ソート） |

レポート記載サンプル（`three`, `those`, `ship`, `right`, `sink`, `bad`, `vote`, `seat`, `pull`）は `docs/reference/neighbors_report.md` と一致。

## 5. 長語の新規獲得

| 語 | tokens | 近傍（先頭） |
|---|---:|---|
| `basketball` | 9 | basket/mix3 |
| `submarine` | 8 | summarise/mix33, summarize/mix33 |
| `international` | 11 | internationally/ins1, intentionally/mix33, interaction/mix44 |
| `organization` | 11 | organisation/sub1, civilisation/mix44, organism/mix44 |
| `information` | 9 | intermission/mix2, confirmation/mix2, inspiration/mix33 |

v1 では `basketball` / `international` / `organization` は **0 近傍**だったが、v2 で近傍獲得を確認。

## 6. derived JSON 整合性

- `data/derived/wordlist_with_neighbors.json`: `neighbors` は `[{w, d, type}, ...]` 形式
- `data/derived/wordlist_with_neighbors_slim.json`: `neighbors` は `string[]` 形式
- `merge_neighbors.py`: 参照整合性エラー **0**、pruned broken refs **0**

## 7. v2 アルゴリズム変更（v1 → v2）

| パラメータ | v1 | v2 |
|---|---|---|
| MAX_DIST | 2（固定） | 語長で 2 / 3 / 4 |
| length ≥ 11 | 2 | **4** |
| 7 ≤ length < 11 | 2 | **3** |
| length bucket | ±1 | **±MAX_DIST** |
| タイブレーカ | (type, dist, -band, word) | + **len_penalty** |
| 新 type | — | `mix3`, `mix4` |

## 8. 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `scripts/gen_neighbors.py` | v2 適応型アルゴリズムに差し替え |
| `data/derived/wordlist_with_neighbors.json` | 全 4,828 語 neighbors 詳細版 |
| `data/derived/wordlist_with_neighbors_slim.json` | slim 版（string 配列） |
| `docs/reference/neighbors_report.md` | 品質レポート再生成 |
| `wordlist_GA_a1a2_plus_phonics.json` | `merge_neighbors.py` で neighbors 反映（ランタイム用） |
| `gas/BatchWords.gs` | `export_batch_words.py` で 4,828 語に更新 |
| `gas/batch_words.csv` | 同上 |

## 9. 未対応事項

1. **`neighbors_rp` 生成** — スコープ外（GA 流用方針継続）
2. **GAS 再デプロイ** — `BatchWords.gs` は更新済み。GAS プロジェクトへの貼り付け・トリガー再設定は別タスク
3. **残存 0 近傍 255 語（5%）** — 主に 12+ トークン超長語（`misunderstanding`, `advertisement`, `representative` 等）。Mode B は既存のランダム補填で 4 択成立

## 10. 再実行手順

```bash
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py      # GitHub Pages ランタイム用
python3 scripts/export_batch_words.py   # GAS 語彙リスト用
```
