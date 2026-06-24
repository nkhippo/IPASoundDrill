# Cursor 実装レポート — STEP4-a: 基礎語（アルファベット・短縮形）

> 作成日: 2026-06-23  
> 対象ブランチ: `main`（マージ後コミットを記載）  
> 指示書: `cursor-step4a-basic-words.md`  
> 前提正本: `docs/PURPOSE.md` v2 / `docs/DESIGN.md` §4

Claude 側への作業報告用サマリー。

---

## 1. 目的と背景

現行 wordlist には初歩的な必須語が欠落していた。

| カテゴリ | 欠落内容 |
|----------|----------|
| アルファベット文字（letter name） | `a`（冠詞）・`i`（代名詞）以外の24文字 |
| 短縮形（contractions） | `I'm` `don't` 等 TOEIC リスニング頻出レベルの48語 |

本タスクで **74語** を本番 wordlist にマージし、出題プール・専用フォーカスに組み込んだ。

---

## 2. 実施内容

### 2-1. データマージ

| 項目 | 内容 |
|------|------|
| 入力 | `data/basic_words_patch.json`（74語、CMU 由来 GA IPA、gloss 4言語キュレーション済み） |
| 出力 | `wordlist_GA_a1a2_plus_phonics.json` |
| スクリプト | `scripts/merge_basic_words.py` |
| スキーマ変換 | patch の `grp`/`pat` → 本番の `group`/`pattern`（いずれも `null`） |
| 重複 | マージ前再チェック → **0件**（本番優先でスキップなし） |
| ソート | CEFR 順（A1→A2→B1→B2）→ 見出し語アルファベット順（case-insensitive） |
| 確実是正20語 | `apply_clear()` 相当をマージ後に再適用 → **無傷** |

**エントリ数:** 2,840 → **2,914**（+74）

内訳:

| `src` | 語数 | 例 |
|-------|------|-----|
| `letter` | 26 | `A /eɪ/`（大文字見出し）、`Z /zi/` |
| `contraction` | 48 | `don't /doʊnt/`、`I'm /aɪm/` |

**冠詞 `a /ə/` と文字 `A /eɪ/` の共存**（意図通り）:

```
a   /ə/   src=cefr        gloss.ja=（不定冠詞）一つの
A   /eɪ/  src=letter      gloss.ja=文字 A
don't /doʊnt/ src=contraction  gloss.ja=do notの短縮形
```

### 2-2. アプリ対応（`index.html`）

| 変更 | 内容 |
|------|------|
| `normalizeWord()` | `row.src` を保持（`letter` / `contraction` / `cefr`） |
| 音素フォーカス | **アルファベット**（`src === "letter"`）・**短縮形**（`src === "contraction"`）ピルを追加 |
| 規則グループフィルタ | `grp` なしのため「規則パターン」フィルタには出ない（「すべて」プールには含まれる）— 意図通り |

### 2-3. i18n 追加（4言語）

| キー | en | ja |
|------|----|----|
| `focus.letters` | Alphabet | アルファベット |
| `focus.contractions` | Contractions | 短縮形 |
| `pos.文字` | letter name | 文字名 |
| `pos.短縮形` | contraction | 短縮形 |

zh / ko にも同キーを追加。`validate_i18n.py` キー数: 98 → **102**

### 2-4. リポジトリに追加したファイル

| ファイル | 用途 |
|----------|------|
| `data/basic_words_patch.json` | マージ元データ（確定版） |
| `scripts/merge_basic_words.py` | 本番 wordlist へのマージ |
| `scripts/gen_basic_words.py` | 再生成・監査用（CMU 辞書から patch 生成） |

---

## 3. 検証結果（DoD）

| 項目 | 結果 |
|------|------|
| 74語追加 | ✅ 2,914語 |
| `w` ユニーク性 | ✅ 重複 0 |
| gloss 4言語 | ✅ 74語すべて完備 |
| `validate_i18n.py` | ✅ ERROR 0 |
| 確実是正20語 | ✅ 違反 0 |
| 冠詞 `a` と文字 `A` の分離 | ✅ 別エントリで共存 |

```bash
python3 tools/validate_i18n.py
# OK: 不整合は検出されませんでした。
```

---

## 4. 意図的に未実施

| 項目 | 理由 |
|------|------|
| `wordlist_GA_a1a2_plus_phonics.csv` 同期 | 指示書 §6「不要なら JSON のみ」。STEP3 以降も CSV は未同期運用 |
| RP IPA 生成（`gen_rp_ipa.py`） | STEP5 タスク。`aren't` `R` 等は STEP5 で RP 版が生成される想定 |
| `docs/PURPOSE.md` / `docs/DESIGN.md` 改変 | 指示なし（read-only） |

---

## 5. ローカル確認手順

```bash
python3 -m http.server 8080
python3 tools/validate_i18n.py
```

**実機目視（推奨）:**

1. 音素フォーカス → **アルファベット** → プール 26語、出題で `A`〜`Z` と letter name IPA・gloss 表示
2. 音素フォーカス → **短縮形** → プール 48語、`don't` 等と展開形 gloss
3. Decode: `/eɪ/` の正解が `A`（冠詞 `a` と区別）
4. 設定で4言語切替、新フォーカスラベル・品詞ラベル表示

---

## 6. コミット・マージ

| コミット | 内容 |
|----------|------|
| （マージ後に記載） | STEP4-a: 基礎語74語マージ、フォーカスUI、i18n |

ブランチ: `step4a-basic-words` → `main` へマージ・`origin/main` へプッシュ済み。

---

## 7. 関連ドキュメント

| ファイル | 内容 |
|----------|------|
| `docs/cursor-implementation-report.md` | STEP3 実装レポート |
| `docs/gloss-corrections.clear.json` | 確実是正20語（本タスクと非重複） |
| `docs/DESIGN.md` §4 | データ整備タスクの背景 |

---

*本レポートは Cursor エージェントによる STEP4-a 実装結果を Claude 側へ引き継ぐためのものです。*
