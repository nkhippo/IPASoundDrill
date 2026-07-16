---
id: pj-2026-07-10-5c12
aliases:
- pj-2026-07-10-5c12
title: Cursor 指示書 — Phase 2 M2b（B2 拡充 101-200 語）
created: '2026-07-10'
---

# Cursor 指示書 — Phase 2 M2b（B2 拡充 101-200 語）

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 前提: M2a マージ済み（5,107語）
- 想定 branch: `feat/phase2-m2b-b2-100`

---

## 1. スコープ

M2a と同一方式。`rp_ipa` 同梱、`gen_rp_ipa.py`（API）実行不要。

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

- ✅ QA チェック 0 件
- ✅ 既存 5,107 語との重複ゼロ
- ✅ **フルパイプラインをサンドボックスで実行**（flap → respell → neighbors → ga_rp_same まで通した）— 前回 M2a で見積もりに `generate_flap_ipa.py` の効果を含めていなかった反省を反映
- ✅ `colleague` の IPA に誤った ASCII `g`（U+0067）が混入していたのを発見・修正（正しくは IPA の script-g `ɡ` U+0261）。修正版を同梱

### 期待値（マージ後、フルパイプライン実行込みの正確な見積もり）

| 指標 | 期待値 |
|---|---|
| 総語数 | 5,207 |
| B2 count | 709 |
| 全体 0近傍率 | 5%（変化なし） |
| M2b 100語の 0近傍率 | **9%** |
| M2b 100語の `ga_rp_same`（フラップT検出後） | **39%**（flap該当 15語を含む） |

## 3. 参考: `phase2b_respell_exceptions.json` について（M2bとは無関係）

サンドボックス実行中、`generate_respelling.py` が **pilot バッチの単語**（`abruptly`, `agony`, `amongst` 等 10語）で
`"unknown coda consonant 'ɐ'"` 等のエラーを exceptions リストに出力することを確認しました。

**調査結果**: 本番 wordlist の該当語の `ipa` / `ipa_actual_ga` フィールド自体は正常です（例: `abruptly` の `ipa` は正しく `/əˈbrʌptli/`）。
exceptions リストに記録される `/əbrˈɐptli/` のような文字列は、`generate_respelling.py` 内部の一時処理結果と見られ、
**wordlist 本体のデータ破損ではありません**。M2b の作業をブロックする必要はありませんが、
`generate_respelling.py` のログ出力ロジックにバグがある可能性があるため、余裕があれば別途調査を推奨します（優先度低）。

## 4. コミット

```bash
git add data/batches/phase2_m2b_100_with_gloss.json \
        wordlist_GA_a1a2_plus_phonics.json \
        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
        data/pipeline/ga_rp_same_report.json \
        data/derived/wordlist_with_neighbors.json \
        data/derived/wordlist_with_neighbors_slim.json \
        gas/BatchWords.gs gas/batch_words.csv \
        docs/reference/neighbors_report.md \
        docs/cursor/reports/cursor-implementation-report-phase2-m2b.md
git commit -m "feat: Phase 2 M2b — 100 B2 words (rp_ipa embedded)"
```

## 5. 次バッチ

M2c（201–300語）で継続。
