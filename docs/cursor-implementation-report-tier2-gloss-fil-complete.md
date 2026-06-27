# Cursor 実装レポート — Tier 2: `gloss.fil` 全語完走（改訂 + batch21–34）

> 作成日: 2026-06-28  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tier2-gloss-fil-merge.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

Tier 2（wordlist 3,059語への `gloss.fil` 追加）の**最終マージ**。前回 **1,600/3,059語**（batch01–20）に加え、Claude 生成の **batch01/03–20 改訂版** と **batch21–34 新規**（batch34 は 419語の完走バッチ）をマージ。

**batch02** は files 23 に含まれず、既存版を維持。

---

## 2. 実施内容

### 2-1. 配置したバッチ

| 区分 | バッチ | 内容 |
|------|--------|------|
| 改訂 | 01, 03–20 | files 23 版で上書き（**46語**の語義修正） |
| 新規 | 21–33 | 各 80語（**1,040語**） |
| 完走 | 34 | **419語**（残り全語） |
| 維持 | 02 | 変更なし |

リポジトリ内 **計 34 バッチ**（batch01–34、batch02 除く欠番なし）。

### 2-2. マージ実行

```bash
python3 tools/merge_gloss_fil.py
```

```
batches: 34 | fil entries: 3059 | applied: 3059 | words still without fil: 0
identical fil cells (Mode B distractor-collision candidates): 0
```

| 指標 | 前回 | 今回 |
|------|------|------|
| マージ済み語数 | 1,600 | **3,059 / 3,059** ✅ |
| 新規追加 | — | **+1,459語** |
| 語義改訂 | — | **46語** |
| 未マージ語数 | 1,459 | **0** |
| identical fil cells | 0 | **0** |

### 2-3. 改訂サンプル（46語中）

| 語 | 旧 `gloss.fil` | 新 `gloss.fil` |
|----|----------------|----------------|
| address | tirahan | tirahan, address |
| almost | halos | halos na |
| cop | pulis | pulis (impormal) |
| does | gumagawa | gumagawa (3rd person) |

### 2-4. 新規追加サンプル

| 語 | `gloss.fil` |
|----|-------------|
| fashion | moda |
| fault | kasalanan |
| zoom | mag-zoom |

---

## 3. DoD

| 項目 | 結果 |
|------|------|
| 指定バッチをマージ | ✅ applied=3059 |
| `words still without fil == 0` | ✅ |
| 空値なし | ✅ |
| identical fil cells | ✅ **0件** |
| 全 3,059語完走 | ✅ **完了** |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/gloss-fil-batch01.json` / `03–34.json` | files 23 版で上書き or 新規 |
| `data/gloss-fil-batch02.json` | 変更なし |
| `data/gloss-fil-batch21.json` … `34.json` | 新規 |
| `wordlist_GA_a1a2_plus_phonics.json` | 全語に `gloss.fil` |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | Tier 2 完了に更新 |

---

## 5. デプロイ

| 項目 | 内容 |
|------|------|
| ブランチ | `main` |
| GitHub Pages | https://nkhippo.github.io/English-Pronunciation-Trainer/ |

**実機確認:** 設定 → Filipino → Mode B。任意の語でタガログ語義が表示される（en フォールバックなし）。

---

## 6. 申し送り

- **Tier 2 完了。** 以降は語義品質の点検・差別化のみ
- **Tier 4**（`cs_rule.fil`）は別タスク
- identical fil cells は 0 件のまま（Mode B MCQ 衝突なし）

---

## 7. コミット

（push 後に SHA を記載）
