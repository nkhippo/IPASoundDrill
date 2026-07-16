---
id: pj-2026-06-27-1bd2
aliases:
- pj-2026-06-27-1bd2
title: 'Cursor 実装レポート — Tier 2: `gloss.fil` バッチ01–02 マージ'
created: '2026-06-27'
---
# Cursor 実装レポート — Tier 2: `gloss.fil` バッチ01–02 マージ

> 作成日: 2026-06-26  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tier2-gloss-fil-merge.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

タガログ語 UI（fil）の **Tier 2** として、wordlist 3,059語に `gloss.fil`（タガログ語義）を追加する作業。Claude が 80語/バッチで生成し、Cursor が wordlist にマージする増分方式。

**今回の入力:** `gloss-fil-batch01.json`（語 1–80）・`gloss-fil-batch02.json`（語 81–160）。以降の batch03 以降は別タスク。

---

## 2. 実施内容

### 2-1. バッチ配置

| ファイル | 語数 | 範囲（例） |
|----------|------|------------|
| `data/gloss-fil-batch01.json` | 80 | `A` … `bed` |
| `data/gloss-fil-batch02.json` | 80 | `bee` … `can't` |

バッチ間のキー重複: **0**（`w` キーでユニーク）。

### 2-2. マージスクリプト

`tools/merge_gloss_fil.py` を新規作成。

- `data/gloss-fil-batch*.json` を glob で読み込み、`wordlist_GA_a1a2_plus_phonics.json` の各エントリ `gloss.fil` にマージ
- 既存 `gloss.{en,ja,zh,ko}` は変更しない（`fil` を足すだけ）
- マージ後に **identical fil cells**（Mode B distractor 衝突候補）を Counter でレポート

### 2-3. マージ実行結果

```
batches: 2 | fil entries: 160 | applied: 160 | words still without fil: 2899
identical fil cells (Mode B distractor-collision candidates): 0
```

| 指標 | 値 |
|------|-----|
| マージ済み語数 | **160 / 3,059** |
| 未マージ語数 | 2,899（en フォールバック継続） |
| 空値 | 0 |
| 同一 fil 語義（衝突候補） | **0件** |

### 2-4. コード変更

**アプリコード（`index.html`）は変更不要。**

既存 `wordGloss()` が `c.gloss[LANG] || c.gloss.en` を返すため、UI=fil かつ `gloss.fil` がある語は自動的にタガログ語義を表示。未マージ語は en にフォールバック。

Mode B MCQ の `isValidDistractor()` も `modeBGloss()` 経由で同一 gloss を除外するため、今回の 160語では衝突 0件。

### 2-5. 検証サンプル

| 語 | `gloss.en` | `gloss.fil`（マージ後） |
|----|------------|-------------------------|
| about | about | tungkol sa |
| can | can | kaya, lata |
| A | letter A | titik A |
| ate | ate | kumain (past tense ng eat) |

`gloss.en` 等の既存キーは変更なしを確認済み。

---

## 3. DoD（今回スコープ）

| 項目 | 結果 |
|------|------|
| batch01–02 を `merge_gloss_fil.py` でマージ | ✅ applied=160 |
| 空値なし | ✅ |
| 既存 gloss.{en,ja,zh,ko} 不変 | ✅（サンプル確認） |
| identical fil cells 記録 | ✅ **0件** |
| fil UI で Mode B 意味がタガログになる（マージ済み語） | ✅（`wordGloss` 既存実装） |
| 全 3,059語完走 | ⬜ 別バッチ待ち（2899語残） |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/gloss-fil-batch01.json` | 新規 |
| `data/gloss-fil-batch02.json` | 新規 |
| `tools/merge_gloss_fil.py` | 新規 |
| `wordlist_GA_a1a2_plus_phonics.json` | 160語に `gloss.fil` 追加 |
| `docs/cursor-tier2-gloss-fil-merge.md` | 指示書配置 |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | Tier 2 進行状況を反映 |

---

## 5. デプロイ

| 項目 | 内容 |
|------|------|
| ブランチ | `main` にコミット・push |
| GitHub Pages | Actions 自動デプロイ |
| 本番 URL | https://nkhippo.github.io/IPASoundDrill/ |

**実機確認手順（fil + Mode B）:**

1. 設定 → Language → **Filipino**
2. Learning mode → **Sound → Vocabulary**
3. バンド A1 で開始し、マージ済み語（例: about, can, baby）の Study / MCQ でタガログ語義が表示されること
4. 未マージ語（例: cat, car）は英語 gloss（en フォールバック）のまま

---

## 6. 申し送り（次バッチ）

- 追加バッチは `data/gloss-fil-batchNN.json` として配置し、`python3 tools/merge_gloss_fil.py` を再実行（glob で自動拾い・増分マージ可）
- 最終目標: `applied == 3059`、`words still without fil == 0`
- バッチ追加後は **identical fil cells** 件数を再確認。増えた場合は Claude 側で語義差別化
- Tier 4（`cs_rule.fil`）は本作業とは独立

---

## 7. コミット

- **SHA:** `1c3b3d1`
- **メッセージ:** Add gloss.fil Tier 2 batches 01–02 (160/3059 words).
