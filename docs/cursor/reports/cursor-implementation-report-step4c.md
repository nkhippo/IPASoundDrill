---
id: pj-2026-06-25-e72b
aliases:
- pj-2026-06-25-e72b
title: 'Cursor 実装レポート — STEP4-c: 不規則変化形'
created: '2026-06-25'
---
# Cursor 実装レポート — STEP4-c: 不規則変化形

> 作成日: 2026-06-23  
> 対象ブランチ: `main`（`6a57e15`）  
> 指示書: `cursor-step4c-irregular-forms.md`  
> 前提正本: `docs/PURPOSE.md` v2 / `docs/DESIGN.md` §4

Claude 側への作業報告用サマリー。

---

## 1. 目的と背景

原形（go, make, child, man…）は収録済みだが、**不規則変化形**（went, made, children, men…）が欠落していた。リスニング超高頻度語として追加する。

| `src` | 語数 | 例 |
|-------|------|-----|
| `irregular_verb` | 75 | `went /wɛnt/`、`made /meɪd/`、`said /sɛd/` |
| `irregular_plural` | 14 | `children /ˈtʃɪldrən/`、`men /mɛn/`、`feet /fit/` |
| `cefr` | 1 | `goose /ɡus/`（geese の原形補完） |

**合計 +90語**

### gloss 設計（方針A: 原形併記）

原形の既存 gloss を流用し、役割注記を付与。多義語原形は複数訳を継承。

| 語 | ja gloss 例 |
|----|-------------|
| `went` | 行く（goの過去形） |
| `bought` | 買う（buyの過去形・過去分詞） |
| `children` | 子供（childの複数形） |

**意図的に未追加:** `read /rɛd/`（原形 `read /rid/` と綴り衝突）、`was/were/been`（次バッチ検討）

---

## 2. 実施内容

### 2-1. データマージ

| 項目 | 内容 |
|------|------|
| 入力 | `data/irregular_forms_patch.json`（90語） |
| 出力 | `wordlist_GA_a1a2_plus_phonics.json` |
| スクリプト | `scripts/merge_irregular_forms.py` |
| 重複 | 0件（スキップなし） |
| 確実是正20語 | マージ後 `apply_clear()` → **無傷** |

**語数:** 2,914 → **3,004**（+90）

### 2-2. neighbors 再生成（必須）

語彙追加に伴い `scripts/gen_neighbors.py`（K=8, MAX_DIST=2）で全語再計算し、`scripts/merge_neighbors.py` で本番へ反映。

| 指標 | STEP4-b（2,914語） | STEP4-c 再生成後（3,004語） |
|------|---------------------|------------------------------|
| 近傍0語 | 426（14%） | **425**（14%） |
| ミニマルペア保有 | 1,737（59%） | **1,822**（60%） |
| broken ref | 0 | **0** |

**新語の neighbors サンプル:**

| 語 | neighbors（先頭） |
|----|-------------------|
| `men` | man, mean, met, mine, moon, pen |
| `went` | 8語付与 |
| `made` | 8語付与 |
| `children` | 0（多音節・設計通りランダム補填パス） |

`gen_neighbors.py` を拡張し、詳細版と **slim 版**（`data/wordlist_with_neighbors_slim.json`）を同時出力するよう改善。

### 2-3. アプリ対応

| 変更 | 内容 |
|------|------|
| 音素フォーカス | **不規則変化** ピル追加（`irregular_verb` + `irregular_plural`） |
| i18n | `focus.irregular`、`pos.動詞（不規則変化）`、`pos.名詞（不規則複数）` を4言語追加 |
| 出題プール | `group`/`pattern` なし → 「すべて」プールに含まれる（letter/contraction と同様） |

### 2-4. リポジトリに追加したファイル

| ファイル | 用途 |
|----------|------|
| `data/irregular_forms_patch.json` | マージ元（確定版90語） |
| `scripts/merge_irregular_forms.py` | 本番 wordlist へのマージ |
| `scripts/gen_irregular_forms.py` | 再生成・監査用 |
| `data/wordlist_with_neighbors.json` | neighbors 詳細版（再生成） |
| `data/wordlist_with_neighbors_slim.json` | neighbors slim 版（再生成） |
| `docs/neighbors_report.md` | neighbors 品質レポート（更新） |

---

## 3. 検証結果（DoD）

| 項目 | 結果 |
|------|------|
| 90語追加 | ✅ 3,004語 |
| `w` ユニーク性 | ✅ 重複 0 |
| gloss 4言語完備 | ✅ 90語すべて |
| 確実是正20語 | ✅ 違反 0 |
| neighbors 再生成 | ✅ 全3,004語に `neighbors`、参照整合性 0 |
| `validate_i18n.py` | ✅ ERROR 0（キー数 105） |

```bash
python3 scripts/merge_irregular_forms.py
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py
python3 tools/validate_i18n.py
```

---

## 4. 意図的に未実施

| 項目 | 理由 |
|------|------|
| CSV 同期 | JSON のみ運用（従来通り） |
| RP IPA / RP neighbors | STEP5 タスク |
| `read` 過去形 `/rɛd/` | 綴り衝突（指示書 §7） |
| `was/were/been` | 次バッチ検討（指示書 §7） |

---

## 5. ローカル確認手順

```bash
python3 -m http.server 8080
```

1. 音素フォーカス → **不規則変化** → プール 89語（irregular_verb 75 + irregular_plural 14）
2. 出題: `went` / `made` / `children` / `men` — reveal で原形併記 gloss 表示
3. `men` の neighbors に `man` が含まれること（Mode B 向けデータ品質）

---

## 6. コミット・マージ

| コミット | 内容 |
|----------|------|
| `6a57e15` | STEP4-c: 不規則変化形90語、neighbors 再生成、フォーカスUI |

ブランチ: `step4c-irregular-forms` → `main` へマージ・`origin/main` へプッシュ済み。

---

## 7. 関連ドキュメント

| ファイル | 内容 |
|----------|------|
| `docs/cursor-implementation-report-step4a.md` | 基礎語（letter/contraction） |
| `docs/cursor-implementation-report-step4b.md` | neighbors 初回導入 |
| `docs/neighbors_report.md` | neighbors 再生成レポート |
| `docs/DESIGN.md` §4 | 欠落必須語の追加 |

---

*本レポートは Cursor エージェントによる STEP4-c 実装結果を Claude 側へ引き継ぐためのものです。*
