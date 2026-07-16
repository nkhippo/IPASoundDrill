---
id: pj-2026-06-25-3e95
aliases:
- pj-2026-06-25-3e95
title: 'Cursor 実装レポート — STEP4-d: 薄い音素の補強'
created: '2026-06-25'
---

# Cursor 実装レポート — STEP4-d: 薄い音素の補強

> 作成日: 2026-06-23  
> 対象ブランチ: `main`（`96684ee`）  
> 指示書: `cursor-step4d-thin-phonemes.md`  
> 前提正本: `docs/PURPOSE.md` v2 / `docs/DESIGN.md` §4

Claude 側への作業報告用サマリー。

---

## 1. 目的と背景

3,004語 wordlist の音素カバレッジ実測で、以下の音素が薄く Mode A/B の学習成立を阻害していた。

| 音素 | 補強前 | 問題 |
|------|--------|------|
| `ʒ` | 8語 | 選択肢固定化。日本人苦手音なのに練習量不足 |
| `ɔɪ` | 29語 | やや不足 |
| `ð` | 48語 | 機能語偏重（the/this/that） |
| `ʊ` | 59語 | book/look 系に偏り |

**自然な日常頻出語40語**（`src: phoneme_fill`）を追加し、各音素の最低語数を確保した。

---

## 2. 実施内容

### 2-1. データマージ

| 項目 | 内容 |
|------|------|
| 入力 | `data/thin_phoneme_patch.json`（40語、キュレーション gloss） |
| 出力 | `wordlist_GA_a1a2_plus_phonics.json` |
| スクリプト | `scripts/merge_thin_phonemes.py` |
| 重複 | 0件 |
| CEFR | A2: 15語 / B1: 25語 |
| 確実是正20語 | マージ後 `apply_clear()` → **無傷** |

**語数:** 3,004 → **3,044**（+40）

### 音素別補強結果

| 音素 | 補強前 | 追加 | 補強後 |
|------|--------|------|--------|
| `ʒ` | 8 | +14 | **22** |
| `ɔɪ` | 29 | +10 | **39** |
| `ð` | 48 | +7 | **55** |
| `ʊ` | 59 | +9 | **68** |

**追加語サンプル（`ʒ`）:** version, decision, division, vision, visual, measure, casual, occasion, exposure, luxury, massage, revision, conclusion, collision

**gloss 例:**

| 語 | ja |
|----|-----|
| `decision` | 決定、決断 |
| `division` | 分割、部門、割り算 |
| `employ` | 雇う、使う |

### 2-2. neighbors 再生成（必須）

全 **3,044語**で `gen_neighbors.py` → `merge_neighbors.py` を実行。

| 指標 | STEP4-c 後 | STEP4-d 後 |
|------|-------------|------------|
| 総語数 | 3,004 | **3,044** |
| 近傍0語 | 425 | **436** |
| ミニマルペア保有 | 1,822 | **1,837** |
| broken ref | 0 | **0** |

**ʒ 系の近傍改善（再生成後）:**

| 語 | neighbors（先頭） |
|----|-------------------|
| `decision` | division |
| `vision` | version, chicken, given, kitchen, listen, ribbon |
| `version` | vision, certain, person |

多音節の新語（collision, conclusion, tourism 等）は近傍0のまま（設計通り・Mode B ランダム補填パス）。短い `ʒ` 語同士のリンクが Mode B distractor 多様化に寄与。

### 2-3. アプリ対応

**変更なし（意図通り）。** `src: phoneme_fill` は既存の音素フォーカス（トラップ音 `ʒ`/`ð` 等）と「すべて」プールに自動統合。専用フォーカスピルは不要（指示書 §5.2）。

### 2-4. リポジトリに追加したファイル

| ファイル | 用途 |
|----------|------|
| `data/thin_phoneme_patch.json` | マージ元（確定版40語） |
| `scripts/merge_thin_phonemes.py` | 本番 wordlist へのマージ |
| `scripts/gen_thin_phoneme_words.py` | 再生成・監査用 |
| `data/wordlist_with_neighbors.json` | neighbors 詳細版（再生成） |
| `data/wordlist_with_neighbors_slim.json` | neighbors slim 版（再生成） |
| `docs/neighbors_report.md` | neighbors 品質レポート（更新） |

---

## 3. 検証結果（DoD）

| 項目 | 結果 |
|------|------|
| 40語追加 | ✅ 3,044語 |
| `w` ユニーク性 | ✅ 重複 0 |
| gloss 4言語完備 | ✅ 40語すべて |
| en 完全一致セル | ✅ 0 |
| 確実是正20語 | ✅ 違反 0 |
| neighbors 再生成 | ✅ 全語に `neighbors`、参照整合性 0 |
| 音素カバレッジ | ✅ ʒ22 / ɔɪ39 / ð55 / ʊ68 |
| `validate_i18n.py` | ✅ ERROR 0 |

```bash
python3 scripts/merge_thin_phonemes.py
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py
python3 tools/validate_i18n.py
```

---

## 4. 意図的に未実施

| 項目 | 理由 |
|------|------|
| 専用フォーカス `phoneme_fill` | 既存音素フォーカスで十分（指示書 §5.2） |
| CSV 同期 | JSON のみ運用 |
| RP IPA / RP neighbors | STEP5 タスク |
| ʒ の更なる追加 | 22語が実用上限（指示書 §7） |

---

## 5. ローカル確認手順

```bash
python3 -m http.server 8080
```

1. 音素フォーカス → **トラップ音** → `ʒ` 含む語のプールが増加（22語）
2. 出題: `decision` / `vision` / `version` — reveal で多義 gloss 表示
3. `vision` ↔ `version` が neighbors に相互参照

---

## 6. コミット・マージ

| コミット | 内容 |
|----------|------|
| `96684ee` | STEP4-d: 薄い音素40語、neighbors 再生成 |

ブランチ: `step4d-thin-phonemes` → `main` へマージ・`origin/main` へプッシュ済み。

---

## 7. 関連ドキュメント

| ファイル | 内容 |
|----------|------|
| `docs/cursor-implementation-report-step4c.md` | 不規則変化形 |
| `docs/neighbors_report.md` | neighbors 再生成レポート |
| `docs/DESIGN.md` §2.2 / §4 | distractor 設計・データ整備 |

**残タスク:** STEP4-e（カジュアル表現 wanna/gonna/kinda…）

---

*本レポートは Cursor エージェントによる STEP4-d 実装結果を Claude 側へ引き継ぐためのものです。*
