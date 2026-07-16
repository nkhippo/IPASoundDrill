---
id: pj-2026-07-10-86a5
aliases:
- pj-2026-07-10-86a5
title: Cursor 指示書 — Phase 2 pilot (B2 拡充・パイロット 180)
created: '2026-07-10'
---

# Cursor 指示書 — Phase 2 pilot (B2 拡充・パイロット 180)

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 目的: CEFR-J v1.5 B2 の先頭 180 語（`attribute` 名詞+動詞の統合により実 179 エントリ）を wordlist にマージし、以降の Phase 2 M2-M6 の品質基盤とする
- 参照:
  - `docs/reference/c1-expansion-scope-design.md`（Wave 2/3 全体設計）
  - Phase 1 M5 実装レポート（同型パイプラインの前例）
- 想定 branch: `feat/phase2-pilot-b2-180`

---

## 1. スコープ

### 1-1. 実施すること

| # | 作業 | ファイル |
|---|---|---|
| 1 | pilot データを配置 | `data/batches/phase2_pilot_180_with_gloss.json`（別途受領・179 エントリ） |
| 2 | wordlist へマージ | `wordlist_GA_a1a2_plus_phonics.json`（+179 → 5,007 語） |
| 3 | narrow IPA / respell 生成 | `data/pipeline/phase2a_*.json` / `phase2b_*.json` |
| 4 | RP IPA バッチ生成 | Britfone + `gen_rp_ipa.py` |
| 5 | `neighbors` 再計算 | `data/derived/wordlist_with_neighbors.json` |
| 6 | `ga_rp_same` 再計算 | 派生フィールド更新 |
| 7 | 品質検証 | 表 4-1 のチェック |
| 8 | 実装レポート | `docs/cursor/reports/cursor-implementation-report-phase2-pilot.md` |

### 1-2. やらないこと

- CEFR-J v1.5 の複数語エントリ（`according to` 等）は本 Wave 対象外
- `_generation_source` フィールドの追加は不要（マージ時に削除される想定）
- 既存 4,828 語の書き換えは行わない

---

## 2. 実行手順

```bash
# 1. pilot 配置
cp /path/to/phase2_pilot_180_with_gloss.json data/batches/

# 2. マージ（Phase 1 と同型スクリプト or inline Python）
#    Merge 前後で total 4828 → 5007 を確認

# 3. 派生生成
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py

# 4. RP IPA 生成（Claude API バッチ）
python3 scripts/gen_rp_ipa.py    # rp_progress.json で再開可
python3 scripts/merge_rp_ipa.py

# 5. 派生再計算
python3 scripts/gen_neighbors.py
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json

# 6. コミット
git add wordlist_GA_a1a2_plus_phonics.json \
        data/batches/phase2_pilot_180_with_gloss.json \
        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
        data/derived/wordlist_with_neighbors.json \
        data/derived/wordlist_with_neighbors_slim.json \
        docs/reference/neighbors_report.md \
        docs/cursor/reports/cursor-implementation-report-phase2-pilot.md
git commit -m "feat: Phase 2 pilot — CEFR-J v1.5 B2 first 179 words"
```

---

## 3. データ品質保証（Claude 側で完了済み）

### 3-1. Pilot 生成物の Claude 側検証結果（レポートに転記）

Opus 品質で以下を確認済み:

- ✅ 179 エントリすべてに `ipa` / `pos` / `def` / `gloss.{en,ja,zh,ko,fil}` が存在
- ✅ GA IPA に RP 長音記号 `ː` 混入ゼロ
- ✅ POS 表記は既存 wordlist の慣例（`名詞`, `動詞`, `形容詞`, `副詞`, `前置詞`, `名詞 / 動詞` 等）
- ✅ `attribute` は同綴りの名詞・動詞を統合 → `名詞 / 動詞`
- ✅ IPA の rhotic 表記が既存慣例と整合（unstressed final r は `ɚ`）
- ✅ 既存 4,828 語との重複ゼロ

### 3-2. マージ後の期待値（Claude 側でシミュレーション実施）

| 指標 | Merge 後の期待値 | 検証コマンド |
|---|---|---|
| 総語数 | **5,007** | `python3 -c "import json; print(len(json.load(open('wordlist_GA_a1a2_plus_phonics.json'))))"` |
| CEFR 分布 | A1:1187 / A2:1195 / B1:2116 / **B2:509**（既存 330 + pilot 179） | 同上 |
| `neighbors` 全体 0近傍率 | 5%（既存維持） | `docs/reference/neighbors_report.md` の 0近傍% |
| pilot 179 語の 0 近傍率 | 13%（許容範囲。B2 特有の phonetic sparsity） | 手動集計 |
| pilot 179 語の フル K 率 | 31%（56 語） | 同上 |
| `ga_rp_same` 実行結果 | pilot 179 は `missing_data`（RP IPA が後付けのため） | 実行後の分布ログ |

RP IPA 生成 (`gen_rp_ipa.py`) 完了後、`ga_rp_same` 再実行で pilot 179 も正しく same/different に分類される。

### 3-3. Britfone 実測（本 pilot で確定させる指標）

Wave 2/3 全体の Britfone RP カバー率推定（設計時 82-87%）を、この pilot 179 語で **実測**:

```bash
# rp_progress.json の完了メタから抽出（例）
python3 -c "
import json
p = json.load(open('data/derived/rp_progress.json'))
# Britfone 直接一致 vs Claude API fill の内訳（実装依存）
"
```

実測値を実装レポートに記録し、Phase 2 M2 以降の見積根拠とする。

---

## 4. 品質検証チェックリスト

### 4-1. 定量チェック（実装後実施）

| # | チェック項目 | 期待値 | 実測（実装後） |
|---|---|---|---|
| A | 総語数 | 5,007 | |
| B | B2 count | 509 | |
| C | pilot 179 語すべてに `rp_ipa` 付与 | 179/179 | |
| D | pilot 179 語で `ga_rp_same` != `missing_data` | 179/179 | |
| E | `neighbors` 全体 0近傍率 | ≤ 5% | |
| F | pilot 179 語 0近傍率 | ≤ 20%（設計基準） | |
| G | Britfone 直接一致率 | ≥ 82% | |
| H | 既存 4,828 語のフィールド不変 | 全一致 | |
| I | GA IPA に `ː` 混入 | 0 件 | |
| J | 5言語 gloss 完備 | 179/179 | |

### 4-2. Naoya 目視レビュー（サンプル 30 語）

pilot からランダム 30 語を抽出し、以下観点で品質判定:

- 日本語訳の自然さ・簡潔さ
- POS 表記の妥当性
- 英語 def の理解しやすさ
- IPA の GA としての妥当性（Kenyon-Knott 型か）

---

## 5. 想定される質問

**Q1. `attribute` を「名詞 / 動詞」で 1 エントリにしたのはなぜか？**  
→ 既存 wordlist の慣例（A1 の `book` = `名詞 / 動詞` 等、Phase 1 でも継続採用）を踏襲。同綴り同 IPA の場合は 1 エントリに統合が原則。異なる IPA の同綴り語（例: `record` 名詞 `/ˈrɛkərd/` vs 動詞 `/rɪˈkɔrd/`）が出現した場合のみ別エントリ扱い。本 pilot にはそのようなケースなし。

**Q2. `Olympia`, `Shakespearean` などの固有名詞を含めていいか？**  
→ CEFR-J v1.5 の B2 リストに含まれているので採用。既存 wordlist にも `China`, `Japan` 等の固有名詞が存在するため慣例整合。

**Q3. `amongst` `aubergine` などの英式表現の扱いは？**  
→ 個別エントリとして採用。gloss.ja で `（英）` を明示。既存 `pavement` `queue` 等と同じ扱い。

**Q4. pilot で 0 近傍率 13% は高すぎないか？**  
→ B2 特有。追加語彙が多く phonetic-island 化しやすいため。Wave 2 全体 (~2,000 語) 完了後は wordlist 内 phonetic density が上がり、既存 pilot 語も追加 neighbors を獲得する見込み。**Mode B 側ランダム補填で 4 択は成立するため機能性に問題なし**。

**Q5. pilot 実施後、Phase 2 M2 の生成タイミングは？**  
→ pilot の Naoya 目視レビュー完了、および Britfone 実測値 (項 3-3) の判定後。M2 の 400 語生成は Sonnet で対応可能。

---

## 6. 依存関係

- **前提**: `neighbors` v2 (`gen_neighbors.py`) と `ga_rp_same` (`gen_ga_rp_same.py`) がリポジトリに反映済みであること
- **並行可**: `gas/BatchWords.gs` の 5,007 語版更新は本 pilot コミット後に別タスクで対応
- **後続**: Phase 2 M2 (400 語) — pilot 承認後
