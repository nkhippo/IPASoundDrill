---
id: pj-2026-06-27-4dff
aliases:
- pj-2026-06-27-4dff
title: 'Cursor 実装レポート — Tier 2: `gloss.fil` batch02/06–08 更新 + batch13–16 追加'
created: '2026-06-27'
---

# Cursor 実装レポート — Tier 2: `gloss.fil` batch02/06–08 更新 + batch13–16 追加

> 作成日: 2026-06-27  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tier2-gloss-fil-merge.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

Tier 2（wordlist 3,059語への `gloss.fil` 追加）の続き。前回 **960/3,059語**（batch01–12）に加え、Claude 生成の **batch02/06–08 改訂版** と **batch13–16 新規** をマージ。

---

## 2. 実施内容

### 2-1. 配置したバッチ

| ファイル | 語数 | 備考 |
|----------|------|------|
| `gloss-fil-batch02.json` | 80 | 改訂 |
| `gloss-fil-batch06.json` | 74 | 改訂 |
| `gloss-fil-batch07.json` | 65 | 改訂 |
| `gloss-fil-batch08.json` | 132 | 改訂 |
| `gloss-fil-batch13.json` | 72 | **新規**（`sugar` … `thrown`） |
| `gloss-fil-batch14.json` | 79 | **新規**（`thursday` … `way`） |
| `gloss-fil-batch15.json` | 76 | **新規**（`we` … `zoo`） |
| `gloss-fil-batch16.json` | 93 | **新規**（`ability` … `badminton`） |

リポジトリ内 **計 16 バッチ**（batch01–16）。

### 2-2. マージ実行

```bash
python3 tools/merge_gloss_fil.py
```

```
batches: 16 | fil entries: 1280 | applied: 1280 | words still without fil: 1779
identical fil cells (Mode B distractor-collision candidates): 0
```

| 指標 | 前回 | 今回 |
|------|------|------|
| マージ済み語数 | 960 | **1,280 / 3,059** |
| 新規追加 | — | **+320語**（batch13–16） |
| batch02/06–08 更新 | — | 4バッチを改訂版で上書き |
| 未マージ語数 | 2,099 | **1,779** |
| identical fil cells | 0 | **0** |

### 2-3. 検証サンプル

| 語 | `gloss.fil` |
|----|-------------|
| sugar | asukal |
| water | tubig |
| zoo | zoo, hayopan |
| badminton | badminton |
| balcony | （未マージ・en フォールバック） |

---

## 3. DoD

| 項目 | 結果 |
|------|------|
| 指定バッチをマージ | ✅ applied=1280 |
| 空値なし | ✅ |
| 既存 gloss.{en,ja,zh,ko} 不変 | ✅ |
| identical fil cells | ✅ **0件** |
| 全 3,059語完走 | ⬜ 1,779語残 |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/gloss-fil-batch02.json` / `06–08.json` | files 21 版で上書き |
| `data/gloss-fil-batch13.json` … `16.json` | 新規 |
| `wordlist_GA_a1a2_plus_phonics.json` | +320語 `gloss.fil`（計1,280語） |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | 1,280/3,059 に更新 |

---

## 5. デプロイ

| 項目 | 内容 |
|------|------|
| ブランチ | `main` |
| GitHub Pages | https://nkhippo.github.io/IPASoundDrill/ |

**実機確認:** 設定 → Filipino → Mode B。`sugar` / `water` はタガログ語義、`balcony` は en フォールバック。

---

## 6. 申し送り

- 残り **1,779語**（batch17 以降）
- 追加後: `python3 tools/merge_gloss_fil.py` を再実行

---

## 7. コミット

- **SHA:** `8479a47`
- **メッセージ:** Add gloss.fil Tier 2 batches 13–16 and refresh batches 02/06–08 (1280/3059).
