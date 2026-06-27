# Cursor 実装レポート — Tier 2: `gloss.fil` batch04 更新 + batch17–20 追加

> 作成日: 2026-06-27  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tier2-gloss-fil-merge.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

Tier 2（wordlist 3,059語への `gloss.fil` 追加）の続き。前回 **1,280/3,059語**（batch01–16）に加え、Claude 生成の **batch04 改訂版** と **batch17–20 新規** をマージ。

---

## 2. 実施内容

### 2-1. 配置したバッチ

| ファイル | 語数 | 備考 |
|----------|------|------|
| `gloss-fil-batch04.json` | 54 | 改訂 |
| `gloss-fil-batch17.json` | 63 | **新規**（`balcony` … `businesswoman`） |
| `gloss-fil-batch18.json` | 90 | **新規**（`cab` … `convenient`） |
| `gloss-fil-batch19.json` | 87 | **新規**（`cooker` … `downtown`） |
| `gloss-fil-batch20.json` | 80 | **新規**（`drawer` … `fascinating`） |

リポジトリ内 **計 20 バッチ**（batch01–20）。

### 2-2. マージ実行

```bash
python3 tools/merge_gloss_fil.py
```

```
batches: 20 | fil entries: 1600 | applied: 1600 | words still without fil: 1459
identical fil cells (Mode B distractor-collision candidates): 0
```

| 指標 | 前回 | 今回 |
|------|------|------|
| マージ済み語数 | 1,280 | **1,600 / 3,059** |
| 新規追加 | — | **+320語**（batch17–20） |
| batch04 更新 | — | 改訂版で上書き |
| 未マージ語数 | 1,779 | **1,459** |
| identical fil cells | 0 | **0** |

### 2-3. 検証サンプル

| 語 | `gloss.fil` |
|----|-------------|
| balcony | balkon |
| convenient | maginhawa |
| downtown | sentro ng lungsod |
| fascinating | kahali-halina |
| fashion | （未マージ・en フォールバック） |

---

## 3. DoD

| 項目 | 結果 |
|------|------|
| 指定バッチをマージ | ✅ applied=1600 |
| 空値なし | ✅ |
| 既存 gloss.{en,ja,zh,ko} 不変 | ✅ |
| identical fil cells | ✅ **0件** |
| 全 3,059語完走 | ⬜ 1,459語残 |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/gloss-fil-batch04.json` | files 22 版で上書き |
| `data/gloss-fil-batch17.json` … `20.json` | 新規 |
| `wordlist_GA_a1a2_plus_phonics.json` | +320語 `gloss.fil`（計1,600語） |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | 1,600/3,059 に更新 |

---

## 5. デプロイ

| 項目 | 内容 |
|------|------|
| ブランチ | `main` |
| GitHub Pages | https://nkhippo.github.io/English-Pronunciation-Trainer/ |

**実機確認:** 設定 → Filipino → Mode B。`balcony` / `downtown` はタガログ語義、`fashion` は en フォールバック。

---

## 6. 申し送り

- 残り **1,459語**（batch21 以降）
- 追加後: `python3 tools/merge_gloss_fil.py` を再実行

---

## 7. コミット

（push 後に SHA を記載）
