---
id: pj-2026-06-27-38a6
aliases:
- pj-2026-06-27-38a6
title: 'Cursor 実装レポート — Tier 2: `gloss.fil` バッチ03–08 追加マージ'
created: '2026-06-27'
---

# Cursor 実装レポート — Tier 2: `gloss.fil` バッチ03–08 追加マージ

> 作成日: 2026-06-27  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tier2-gloss-fil-merge.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

Tier 2（wordlist 3,059語への `gloss.fil` 追加）の続き。前回 batch01–02（160語）に加え、Claude 生成の **batch03–08** をマージ。batch01–02 も files 19 版で上書き配置（内容同一）。

---

## 2. 実施内容

### 2-1. バッチ配置

| ファイル | 語数 | 範囲（先頭→末尾 `w`） |
|----------|------|-------------------------|
| `data/gloss-fil-batch01.json` | 80 | `A` … `bed` |
| `data/gloss-fil-batch02.json` | 80 | `bee` … `can't` |
| `data/gloss-fil-batch03.json` | 81 | `cap` … `cute` |
| `data/gloss-fil-batch04.json` | 54 | （batch04 語群） |
| `data/gloss-fil-batch05.json` | 74 | （batch05 語群） |
| `data/gloss-fil-batch06.json` | 74 | （batch06 語群） |
| `data/gloss-fil-batch07.json` | 65 | （batch07 語群） |
| `data/gloss-fil-batch08.json` | 132 | `I` … `mine` |

- 8ファイル合計 fil エントリ: **640**（バッチ間キー重複 **0**）
- バッチサイズは 80語固定ではない（batch08 は 132語）

### 2-2. マージ実行

```bash
python3 tools/merge_gloss_fil.py
```

```
batches: 8 | fil entries: 640 | applied: 640 | words still without fil: 2419
identical fil cells (Mode B distractor-collision candidates): 0
```

| 指標 | 前回 | 今回 |
|------|------|------|
| マージ済み語数 | 160 | **640 / 3,059** |
| 新規追加 | — | **+480語**（batch03–08） |
| 未マージ語数 | 2,899 | **2,419** |
| 空値 | 0 | 0 |
| identical fil cells | 0 | **0** |

### 2-3. コード変更

**アプリコード（`index.html`）は変更不要。** 既存 `wordGloss()` / Mode B `isValidDistractor()` がそのまま動作。

### 2-4. 検証サンプル

| 語 | `gloss.fil`（新規 batch03 以降） |
|----|-----------------------------------|
| cap | （batch03 マージ済み） |
| cat | pusa |
| mine | akin, mina |

`gloss.en` 等の既存キーは不変。

---

## 3. DoD（今回スコープ）

| 項目 | 結果 |
|------|------|
| batch01–08 を `merge_gloss_fil.py` でマージ | ✅ applied=640 |
| 空値なし | ✅ |
| 既存 gloss.{en,ja,zh,ko} 不変 | ✅ |
| identical fil cells 記録 | ✅ **0件** |
| fil UI でマージ済み語がタガログ語義表示 | ✅ |
| 全 3,059語完走 | ⬜ 2,419語残（batch09 以降待ち） |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/gloss-fil-batch03.json` … `batch08.json` | 新規 |
| `data/gloss-fil-batch01.json` / `batch02.json` | files 19 版で上書き（同一内容） |
| `wordlist_GA_a1a2_plus_phonics.json` | +480語に `gloss.fil` 追加（計640語） |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | 640/3,059 に更新 |

---

## 5. デプロイ

| 項目 | 内容 |
|------|------|
| ブランチ | `main` にコミット・push |
| GitHub Pages | Actions 自動デプロイ |
| 本番 URL | https://nkhippo.github.io/IPASoundDrill/ |

**実機確認（fil + Mode B）:**

1. 設定 → **Filipino**
2. Mode B → A1 開始
3. 新規マージ語（例: cat, dog, house）→ タガログ語義
4. 未マージ語（例: minute, money）→ en フォールバック

---

## 6. 申し送り

- 残り **2,419語**（約 batch09 以降）
- 追加後: `python3 tools/merge_gloss_fil.py` を再実行
- 最終目標: `applied == 3059`、`words still without fil == 0`
- バッチ追加後は identical fil cells 件数を再確認

---

## 7. コミット

- **SHA:** `1d7b6b7`
- **メッセージ:** Add gloss.fil Tier 2 batches 03–08 (640/3059 words).
