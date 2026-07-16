---
id: pj-2026-06-26-d66d
aliases:
- pj-2026-06-26-d66d
title: Cursor 実装レポート — 連結句キャリア文出題
created: '2026-06-26'
---

# Cursor 実装レポート — 連結句キャリア文出題

> 作成日: 2026-06-26  
> 対象ブランチ: `main`（`ee34157`）  
> 指示書: `docs/cursor-connected-carriers.md`（Claude 設計）

Claude 側への作業報告用サマリー。

---

## 1. 背景

連結句タブは従来、連結 IPA 単体（例 `/breɪkəˈprɑmɪs/`）を提示していた。パターン暗記を防ぐため、**英文キャリア文の中に IPA だけを埋め込む**出題形式に変更。

---

## 2. 実施内容

### 2-1. データ（`data/connected_speech.json`）

| 項目 | 内容 |
|------|------|
| 置換 | `connected_speech_with_carriers.json` で全201句を更新 |
| 追加フィールド | `carriers`（各4個の英文テンプレート） |
| `{P}` | フレーズ位置。出題時に IPA 表示に置換 |
| 検証 | 201句すべて carriers×4、`{P}` は各1個 |

### 2-2. クライアント（`index.html`）

| 項目 | 内容 |
|------|------|
| `normalizeConnected` | `carriers` を保持 |
| `pickCarrier(c)` | 出題確定時にランダム1種選択 → `S.curCarrier` |
| `buildIpaHtml` / `bindIpaSegments` | `renderIpaInto` を分割（単語モードは従来どおり） |
| `renderConnectedPrompt` | キャリア文 + IPA 埋め込み描画 |
| スタイル | `.carrier`（文脈テキスト）、`.connected-prompt`（混在レイアウト） |

### 2-3. 意図的に不変

| 項目 | 扱い |
|------|------|
| 採点 | 入力対象は元フレーズ `w` のみ（`spellCheck` 不変） |
| 音声 ▶ | `c.w` の TTS のみ（GA 固定） |
| reveal | キャリア文は表示しない |
| 単語 / Encode / Mode B | 描画ロジック不変 |

---

## 3. DoD

| 項目 | 結果 |
|------|------|
| 201句に carriers（各4個） | ✅ |
| 文中 IPA 埋め込み表示 | ✅ |
| 出題ごとランダム・再描画固定 | ✅（`S.curCarrier`） |
| IPA タップ解説 | ✅ |
| 採点・音声・reveal 不変 | ✅ |
| API 呼び出しゼロ | ✅ |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/connected_speech.json` | carriers 付き201句に置換 |
| `index.html` | キャリア文出題 UI |
| `docs/cursor-connected-carriers.md` | 設計指示書 |
| `docs/DESIGN.md` | §1.8 追記 |

---

## 5. Git / デプロイ

| 項目 | 値 |
|------|-----|
| ブランチ | `main`（`ee34157`） |
| GitHub Pages | push 後即反映 |
| GAS | 変更なし |

---

## 6. Claude への申し送り

- キャリア文は英文固定（多言語化不要）。RP 選択時は `{P}` 部分が `rp_ipa` に切替
- 文頭 `{P}` のキャリアは IPA 大文字化なし（データ検証済み）
- フェーズ2言語ガイド等とは独立タスク
