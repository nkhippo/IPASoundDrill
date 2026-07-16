---
id: pj-2026-07-10-9073
aliases:
- pj-2026-07-10-9073
title: Cursor 指示書 — Phase 2 M2a（B2 拡充 100 語）
created: '2026-07-10'
---

# Cursor 指示書 — Phase 2 M2a（B2 拡充 100 語）

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 前提: `cursor-instructions-rp-ipa-bugfix.md` の適用が完了していること（必須）
- 想定 branch: `feat/phase2-m2a-b2-100`

---

## 1. 方針変更（重要）

**本バッチから `rp_ipa` を Claude が直接同梱**します。Cursor 側で `gen_rp_ipa.py`（Claude API 呼び出し）を実行する必要はありません。RP IPA は**修正済み `ga_to_rp.py`** をこちらのサンドボックスで実行して導出済みです（pilot で発覚した r 脱落バグの修正後バージョンを使用）。

## 2. スコープ

| # | 作業 |
|---|---|
| 1 | `data/batches/phase2_m2a_100_with_gloss.json` 配置（`rp_ipa` 同梱・100 エントリ） |
| 2 | wordlist へマージ（5,007 → **5,107**） |
| 3 | narrow IPA / respell 生成（4 コマンド、Phase 1/pilot と同じ） |
| 4 | **RP IPA 生成はスキップ**（既に同梱済み） |
| 5 | `neighbors` 再計算 |
| 6 | `ga_rp_same` 再計算 |
| 7 | 品質検証 |

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
python3 scripts/gen_neighbors.py
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
python3 scripts/export_batch_words.py
```

## 3. Claude 側で実施済みの検証（レポートに転記）

- ✅ QA チェック 0 件（`ː`混入・フィールド欠落・重複ゼロ）
- ✅ 既存 5,007 語との重複ゼロ
- ✅ RP IPA は修正済み `ga_to_rp.py` で機械的に導出（手作業転記なし）
- ✅ マージ・neighbors・ga_rp_same をサンドボックスでシミュレーション済み

### 期待値（マージ後）

| 指標 | 期待値 |
|---|---|
| 総語数 | 5,107 |
| B2 count | 609 |
| 全体 0近傍率 | 5%（変化なし） |
| M2a 100語の 0近傍率 | 11% |
| M2a 100語の `ga_rp_same` | 54/100 (54%) |

### r 保持の確認サンプル（バグ修正の効果確認）

| 語 | GA | RP（母音前rが正しく保持） |
|---|---|---|
| `bureaucracy` | /bjʊˈrɑkrəsi/ | /bjʊˈrɒkrəsiː/ |
| `broaden` | /ˈbrɔdən/ | /ˈbrɔːdən/ |
| `burglary` | /ˈbɝɡləri/ | /ˈbɜːɡləriː/ |

## 4. コミット

```bash
git add data/batches/phase2_m2a_100_with_gloss.json \
        wordlist_GA_a1a2_plus_phonics.json \
        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
        data/pipeline/ga_rp_same_report.json \
        data/derived/wordlist_with_neighbors.json \
        data/derived/wordlist_with_neighbors_slim.json \
        gas/BatchWords.gs gas/batch_words.csv \
        docs/reference/neighbors_report.md \
        docs/cursor/reports/cursor-implementation-report-phase2-m2a.md
git commit -m "feat: Phase 2 M2a — 100 B2 words (rp_ipa embedded from Claude)"
```

## 5. 次バッチ

M2b（101-200）以降も同一方式で継続。合計 400 語（M2a-d、各100語）で Phase 2 M2 完了。
