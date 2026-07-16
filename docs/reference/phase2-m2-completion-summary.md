---
id: pj-2026-07-10-f8f3
aliases:
- pj-2026-07-10-f8f3
title: Phase 2 M2（B2 拡充）— 完了サマリ
created: '2026-07-10'
---
# Phase 2 M2（B2 拡充）— 完了サマリ

- 完了日: 2026-07-10
- ブランチ: `main`（pilot / M2a / M2b / M2c / M2d 全マージ済み）
- 実装レポート: `docs/cursor/reports/cursor-implementation-report-phase2-*.md`（5 本）

---

## 1. Executive summary

CEFR-J v1.5 の B2 語彙拡充を完了。**569 語を新規追加**し、**総語数 5,397**、**B2 = 899 語**に到達（Phase 2 開始時 4,828/330 から）。

- 元スコープ: CEFR-J v1.5 B2 単一語のうち app 未収録の 1,992 語
- 本 M2 で追加: 569 語（うち pilot 179 + M2 バッチ 4 本 = 390）
- **達成率: 569 / 1,992 = 28.6%**
- 残: 約 1,423 語（Phase 2 M3 以降の対象）

**方針変更（大きい成果）:**
- **RP IPA を Claude が直接同梱**する方式に移行（pilot までは `gen_rp_ipa.py` が Cursor 側で必要だったが、pilot QA でルールベース `ga_to_rp.py` のバグを発見・修正した副産物として、Claude 側の修正済みルールをサンドボックスで直接実行して RP を導出する方式が確立された）
- これにより Cursor 環境の API キー有無に依存しない安定品質を実現

---

## 2. バッチ内訳

| バッチ | 語数 | 累計語数 | B2 数 | 実施日 |
|---|---:|---:|---:|---|
| pilot | 179 | 5,007 | 509 | 2026-07-09 |
| M2a | 100 | 5,107 | 609 | 2026-07-10 |
| M2b | 100 | 5,207 | 709 | 2026-07-10 |
| M2c | 100 | 5,307 | 809 | 2026-07-10 |
| M2d | 90 | **5,397** | **899** | 2026-07-10 |

M2d が 90 語なのは、`disguise`（名詞/動詞）と `divorce`（名詞/動詞）を統合したため（既存慣例）。

---

## 3. 品質検証（Phase 2 M2 完了時点）

### 3-1. 全 5,397 語のフィールド完備度

| フィールド | カバー率 |
|---|---:|
| `ipa` (GA phonemic) | 100% (5,397) |
| `rp_ipa` | 100% (5,397) |
| `def` (英語定義) | 100% (5,397) |
| `gloss.en / ja / zh / ko / fil` | 100% × 5 |
| `pos` | 87% (4,745)（B2=330 の旧データが `None`、既知の残作業） |
| `neighbors` (非空) | 94% (5,113) |
| `ga_rp_same` | 100% (5,397) |
| `respell_ga` / `respell_rp` | 98% (5,322)（R4 pending 分は保留） |
| `ipa_actual_ga` (flap-T 等) | 9% (529 語) |

### 3-2. `ga_rp_same` 判定分布

同一判定（同じ発音扱い）: **2,668 語 / 49%**

| reason | 数 | 分類 |
|---|---:|---|
| identical | 1,507 | same |
| length_marking_only | 574 | same |
| dress_notation_only | 446 | same |
| notation_composite | 69 | same |
| stress_marking_only | 35 | same |
| rhotic_vowel_notation | 37 | same |
| rhoticity | 798 | different |
| structural_other | 631 | different |
| ga_allophony (flap-T 等) | 529 | different |
| goat_vowel | 287 | different |
| lot_vowel | 258 | different |
| weak_vowel | 102 | different |
| trap_bath | 72 | different |
| stress_placement | 30 | different |
| yod | 22 | different |

### 3-3. neighbors 品質

- 全体 0近傍率: **5%（284 語）** — Phase 1 完了時と同水準（v2 適応化で維持）
- ミニマルペア保有率: 44%

---

## 4. 実施の技術的意義（Phase 1 との差分）

### 4-1. パイプライン改善

| 側面 | Phase 1 (B1) | Phase 2 (B2) |
|---|---|---|
| RP IPA 生成 | Cursor 側で `gen_rp_ipa.py`（Claude API）実行 | **Claude がバッチ JSON に同梱** |
| 依存 | Cursor 環境の API キー | なし（決定的ルール） |
| バッチサイズ | 180 + 400×4 = 1,769 | 179 + 100×3 + 90 = 569 |
| バッチ粒度の理由 | 400 で品質担保できていた | pilot で発覚したバグ調査を反映し、100 単位で厳密 QA |
| QA 自動チェック | 基本項目のみ | 母音欠落検出・ASCII-g 検出を追加 |

### 4-2. 副次的成果（Phase 2 で発見・修正）

1. **`ga_to_rp.py` の onset/intervocalic /r/ 誤脱落バグ**（pilot 発覚）
   - 17 語の rp_ipa を修正、`ga_rp_same` 10 語が反転
   - 修正コミット: `fix: preserve onset/intervocalic /r/ in GA→RP rule fallback`
2. **`colleague` の IPA 文字コードミス**（M2b 発覚）
   - ASCII `g` (U+0067) を IPA script-`ɡ` (U+0261) に修正
   - 以降のバッチで自動検出を組み込み再発防止
3. **`dignify` / `dignity` の母音欠落**（M2d 発覚）
   - `ipa` は修正したが `rp_ipa` の再導出漏れ → ホットフィックスで別途対応（`fix/dignify-dignity-rp-typo`）

---

## 5. 変更ファイル（Phase 2 M2 全体）

### コアデータ

- `wordlist_GA_a1a2_plus_phonics.json`（+569 語、既存語不変）
- `data/batches/phase2_pilot_180_with_gloss.json`（179 エントリ）
- `data/batches/phase2_m2a_100_with_gloss.json`
- `data/batches/phase2_m2b_100_with_gloss.json`
- `data/batches/phase2_m2c_100_with_gloss.json`
- `data/batches/phase2_m2d_90_with_gloss.json`

### 派生・インフラ

- `data/derived/wordlist_with_neighbors.json` / `_slim.json`
- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`, `r4_pending_review_list.*`
- `docs/reference/neighbors_report.md`
- `gas/BatchWords.gs`, `gas/batch_words.csv`

### スクリプト修正

- `scripts/ga_to_rp.py`（onset/intervocalic r 保持バグ修正）

### 補足パッチ

- `data/patches/rp_ipa_bugfix_patch.json`（17 語）
- `data/patches/dignify_dignity_rp_hotfix.json`（2 語、別コミット）

### ドキュメント

- `docs/reference/c1-expansion-scope-design.md`（Phase 2/3 全体設計）
- `docs/reference/phase2-m2-completion-summary.md`（本ドキュメント）
- `docs/cursor/reports/cursor-implementation-report-phase2-*.md`（5 本）

---

## 6. 残作業（Phase 2 M2 完了時点）

### 6-1. 直近

| # | 作業 | 優先度 | 担当 |
|---|---|---|---|
| 1 | `dignify`/`dignity` RP ホットフィックス適用 | 高 | Cursor（別指示書済） |
| 2 | R4 pending の累計整理（M1-M5 の 110 語 + Phase 2 で増加分） | 中 | Sonnet + Naoya |
| 3 | 連結音・弱形の CEFR バッジ UI 配線 | 中 | Sonnet + Cursor |
| 4 | 進捗チェック機能実装（3 スロット × 3 モード） | 中 | Cursor（指示書提出済） |
| 5 | 既存 B2=330 語の `pos` 埋め（現状 `None`） | 低 | 別タスク |

### 6-2. Phase 2 の残り（Phase 2 M3 以降）

- CEFR-J v1.5 B2 の残り約 1,423 語
- **本 M2 と同じ方式で継続可能**（Sonnet でバッチ生成）
- 100 語 × 14 バッチ程度で完了見込み

### 6-3. Phase 3（C1 拡充）

- Octanove Vocabulary Profile C1/C2 v1.0 の C1 約 1,015 語
- Naoya 指示により **Phase 2 完了後に着手**（他タスク全完了後）
- 設計文書は既に完成: `docs/reference/c1-expansion-scope-design.md`

---

## 7. Naoya から見た次のマイルストーン

Phase 2 M2 完了により、**B2 語彙の主要 4 割弱がカバー**されました。App 内から見た変化:

- Mode A/B の CEFR フィルタで B2 選択時の出題語数が 330 → 899 に増加
- 語彙ブラウザの B2 収録範囲が大幅拡大
- 連結音・弱形は本 Phase では変更なし

**次に体感的な変化を得たい場合の推奨:**
1. **進捗チェック機能**（既に指示書提出）→ 学習効率の実感
2. **Phase 2 M3+ 継続**→ B2 語彙のさらなる拡充
3. **連結音 CEFR バッジ UI**→ 実装済みデータの可視化

---

## 8. 変更履歴反映用（`docs/PURPOSE.md` 追記推奨）

`docs/PURPOSE.md` の変更履歴表に以下を追記:

```
| 2026-07-10 | v3.20 | Phase 2 M2 完了: pilot(179)+M2a-d(390)で B2 拡充 569 語。総語数 5,397、B2=899（+569）。`rp_ipa` を Claude 直接同梱方式へ移行、`ga_to_rp.py` r-脱落バグ修正、adaptive neighbors、`ga_rp_same` フラグ、進捗チェック機能設計、を包括。CEFR-J B2 単一語（1,992）のうち 28.6% 完了。 |
```

同 §「1 行サマリ」下のステータス行を以下に更新推奨:

```
> **更新日:** 2026-07-10 ／ **ステータス:** 語彙 **5,397語**（Phase 2 M2 完了、B2 拡充 28.6% 到達）。GA/RP 切替・連結句・弱形・RP TTS・語彙ブラウザ・TTS プリフェッチ・無制限セッション・離脱確認モーダル・UI 6言語・narrow IPA・`ga_rp_same` フラグ・neighbors v2 対応済み。
```
