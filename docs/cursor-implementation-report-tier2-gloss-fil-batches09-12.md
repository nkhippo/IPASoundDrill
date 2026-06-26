# Cursor 実装レポート — Tier 2: `gloss.fil` batch02–05 更新 + batch09–12 追加

> 作成日: 2026-06-27  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tier2-gloss-fil-merge.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

Tier 2（wordlist 3,059語への `gloss.fil` 追加）の続き。前回 **640/3,059語**（batch01–08）に加え、Claude 生成の **batch02–05 改訂版** と **batch09–12 新規** をマージ。

---

## 2. 実施内容

### 2-1. 配置したバッチ

| ファイル | 語数 | 備考 |
|----------|------|------|
| `gloss-fil-batch02.json` | 80 | 改訂（例: `before` → `bago, dati`） |
| `gloss-fil-batch03.json` | 81 | 改訂 |
| `gloss-fil-batch04.json` | 54 | 改訂 |
| `gloss-fil-batch05.json` | 74 | 改訂 |
| `gloss-fil-batch09.json` | 78 | **新規**（`minute` … `owner`） |
| `gloss-fil-batch10.json` | 82 | **新規**（`P` … `reason`） |
| `gloss-fil-batch11.json` | 80 | **新規**（`red` … `shown`） |
| `gloss-fil-batch12.json` | 80 | **新規**（`shy` … `successful`） |

既存 batch01 / 06 / 07 / 08 は変更なし。リポジトリ内 **計 12 バッチ**。

### 2-2. マージ実行

```bash
python3 tools/merge_gloss_fil.py
```

```
batches: 12 | fil entries: 960 | applied: 960 | words still without fil: 2099
identical fil cells (Mode B distractor-collision candidates): 0
```

| 指標 | 前回 | 今回 |
|------|------|------|
| マージ済み語数 | 640 | **960 / 3,059** |
| 新規追加 | — | **+320語**（batch09–12） |
| batch02–05 更新 | — | 4語バッチを改訂版で上書き |
| 未マージ語数 | 2,419 | **2,099** |
| identical fil cells | 0 | **0** |

### 2-3. 検証サンプル

| 語 | `gloss.fil` |
|----|-------------|
| minute | minuto |
| before | bago, dati（改訂） |
| successful | matagumpay |
| sugar | （未マージ・en フォールバック） |

---

## 3. DoD

| 項目 | 結果 |
|------|------|
| 指定バッチをマージ | ✅ applied=960 |
| 空値なし | ✅ |
| 既存 gloss.{en,ja,zh,ko} 不変 | ✅ |
| identical fil cells | ✅ **0件** |
| 全 3,059語完走 | ⬜ 2,099語残 |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/gloss-fil-batch02.json` … `05.json` | files 20 版で上書き |
| `data/gloss-fil-batch09.json` … `12.json` | 新規 |
| `wordlist_GA_a1a2_plus_phonics.json` | +320語 `gloss.fil`（計960語） |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | 960/3,059 に更新 |

---

## 5. デプロイ

| 項目 | 内容 |
|------|------|
| ブランチ | `main` |
| GitHub Pages | https://nkhippo.github.io/English-Pronunciation-Trainer/ |

**実機確認:** 設定 → Filipino → Mode B。`minute` / `successful` はタガログ語義、`sugar` は en フォールバック。

---

## 6. 申し送り

- 残り **2,099語**（batch13 以降）
- 追加後: `python3 tools/merge_gloss_fil.py` を再実行

---

## 7. コミット

- **SHA:** `1effae9`
- **メッセージ:** Add gloss.fil Tier 2 batches 09–12 and refresh batches 02–05 (960/3059).
