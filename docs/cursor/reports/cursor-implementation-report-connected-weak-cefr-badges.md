---
id: pj-2026-07-10-5028
aliases:
- pj-2026-07-10-5028
title: 連結音・弱形 CEFR バッジ UI 配線 — 実装レポート
created: '2026-07-10'
---

# 連結音・弱形 CEFR バッジ UI 配線 — 実装レポート

- 実施日: 2026-07-10
- 指示書: `/Users/naoya.k/Downloads/files 61/cursor-instructions-connected-weak-cefr-badges.md`
- ブランチ: `main`

## 1. 実施概要

`data/connected_speech.json`（201 句）に既に付与済みの `cefr` フィールドを、語彙ブラウザ **Phrases タブ**にバッジとして表示。練習中カードの CEFR 表示は既存 `setCardCefr()` が対応済みのため新規実装なし（動作確認のみ）。

## 2. 実装内容

### 2-1. `renderVocabPhrases()` 変更

`vocab-type-badge` と `vocab-level` の間に CEFR バッジ列を追加:

```javascript
const cefrLabel = itemCefrLabel(c);
const cefrBadge = cefrLabel
  ? `<span class="vocab-cefr-badge vocab-cefr-${cefrLabel}">${escHtml(cefrLabel)}</span>`
  : "";
```

### 2-2. CSS

`.vocab-cefr-badge` を追加（card-top `.cefr` と同系の `--signal` / `--signal-soft` 配色）。

### 2-3. Weak forms の Phrases タブ統合

指示書推奨 **(A) 現状維持** — 連結音のみ表示。weak forms は練習時のみ。

## 3. 確認結果

| 項目 | 結果 |
|---|---|
| `an apple` の cefr データ | A1（`connected_speech.json` 確認済み） |
| `setCardCefr` 連結音・弱形対応 | 既存ロジックで `cefr` あり時はラベル表示 |
| レイアウト | type-badge / level / play ボタン位置維持 |

## 4. 変更ファイル

- `index.html`
- `docs/cursor/instructions/cursor-instructions-connected-weak-cefr-badges.md`

## 5. スコープ外

- Weak forms の vocab browser 追加
- 単語タブ（Words）への CEFR バッジ追加
- CEFR バッジ表示のオン/オフ切替
