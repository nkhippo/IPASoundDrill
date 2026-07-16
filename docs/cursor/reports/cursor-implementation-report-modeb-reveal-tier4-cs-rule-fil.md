---
id: pj-2026-06-28-2b7a
aliases:
- pj-2026-06-28-2b7a
title: Cursor 実装レポート — Mode B Study 2段階 reveal + Tier 4 cs_rule.fil
created: '2026-06-28'
---

# Cursor 実装レポート — Mode B Study 2段階 reveal + Tier 4 cs_rule.fil

> 作成日: 2026-06-28  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-modeb-study-reveal-ux.md` / `docs/cursor-tier4-cs-rule-fil-merge.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

### Task A — Mode B Study reveal UX

Mode B Study フェーズで単語・語義が最初から表示され、音を聞く前に意味で答えが分かってしまう問題があった。**IPA + 音声を先に提示し、学習者が能動的に意味を開示する** 2段階フローへ変更。

### Task B — Tier 4 cs_rule.fil

タガログ語（fil）の Tier 4 として、連結句 201件 + 弱形 36件の reveal ルール文（`cs_rule.fil`）をマージ。これで fil の Tier 1–4 がすべて完了。

---

## 2. 実施内容

### 2-1. Mode B Study 2段階 reveal

| 項目 | 変更 |
|------|------|
| DOM | `#mbSWord` + `#mbSGloss` を `#mbSMeaning` でラップ。`#mbSRevealBtn` 追加 |
| Phase 1 | IPA + 音声のみ表示。「意味を確認する」ボタン |
| Phase 2 | reveal クリックで単語・語義フェードイン。「覚えた→次へ」表示 |
| CSS | `.btn-reveal`, `#mbSMeaning.hidden`, `@keyframes mbsFadeIn` |
| JS | `renderModeBStudy()` 初期状態リセット、`modeBDisplayGloss(c)` 新規 |
| i18n | `modeb.study.reveal_meaning` を 5言語に追加（152キー） |

**`modeBDisplayGloss(c)`:** 英語 UI で `gloss.en === w` の自己参照を検知し、`c.def` があれば定義文、なければ `(品詞)` を表示。MCQ の `modeBGloss()` は従来どおり `wordGloss()` を使用。

### 2-2. Tier 4 cs_rule.fil マージ

| 項目 | 結果 |
|------|------|
| 入力 | `data/cs-rule-fil-connected.json`（201件）、`data/cs-rule-fil-weak.json`（36件） |
| スクリプト | `tools/merge_cs_rule_fil.py` 新規 |
| CS マージ | applied=201, missing=[] |
| WF マージ | applied=36, missing=[] |
| アプリコード | 変更不要（既存 `csRuleText()` が `cs_rule[LANG] \|\| cs_rule.en`） |

---

## 3. 検証

```bash
python3 tools/validate_i18n.py   # ERROR 0（152キー × 5言語）
python3 tools/gen_audit_docs.py  # i18n-audit.md 再生成
python3 tools/merge_cs_rule_fil.py
# CS: applied=201, missing=[]
# WF: applied=36, missing=[]
```

| DoD 項目 | 結果 |
|----------|------|
| Study Phase 1: IPA + 音声のみ | ✅ |
| Study Phase 1: reveal ボタン（5言語） | ✅ |
| Study Phase 2: フェードイン + Got it | ✅ |
| 次カードで Phase 1 にリセット | ✅ |
| 英語 UI: 自己参照 gloss → (品詞) | ✅ |
| MCQ / Dict / Mode A 影響なし | ✅ |
| cs_rule.fil 237/237 | ✅ |
| validate_i18n ERROR 0 | ✅ |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `index.html` | DOM・CSS・`renderModeBStudy`・reveal handler・`modeBDisplayGloss` |
| `i18n/{en,ja,zh,ko,fil}.json` | `modeb.study.reveal_meaning` 追加 |
| `data/cs-rule-fil-connected.json` | 新規配置 |
| `data/cs-rule-fil-weak.json` | 新規配置 |
| `data/connected_speech.json` | 201件に `cs_rule.fil` 追加 |
| `data/weak_forms.json` | 36件に `cs_rule.fil` 追加 |
| `tools/merge_cs_rule_fil.py` | 新規 |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | Study reveal + Tier 4 完了反映 |
| `docs/i18n-language-scaling.md` | fil 全 Tier 完了・152キー |
| `docs/i18n-audit.md` | 再生成 |
| `docs/cursor-modeb-study-reveal-ux.md` | 指示書コピー |
| `docs/cursor-tier4-cs-rule-fil-merge.md` | 指示書コピー |

---

## 5. デプロイ

- **ブランチ:** `main` にマージ・push
- **GitHub Pages:** https://nkhippo.github.io/IPASoundDrill/

---

## 6. 申し送り（Claude 宛）

### fil 多言語 — すべて完了

| Tier | 内容 | 状態 |
|------|------|------|
| Tier 1 | UI 152キー + 言語ピッカー | ✅ |
| Tier 2 | gloss.fil 3,059語 | ✅ |
| Tier 3 | 音素解説 + 学習ガイド | ✅ |
| Tier 4 | cs_rule.fil 237件 | ✅ |

### 将来タスク: `def` フィールド

- 3,059語に英語定義文が必要（`gloss.en === w` は約 2,881語）
- `modeBDisplayGloss()` の `c.def` 分岐は実装済みで待機状態
- Tier 2 `gloss.fil` と同じバッチ方式で生成可能
