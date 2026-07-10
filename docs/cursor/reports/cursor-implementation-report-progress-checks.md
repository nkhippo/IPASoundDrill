# 進捗チェック機能（3 スロット × 3 モード）— 実装レポート

- 実施日: 2026-07-10
- 指示書: `/Users/naoya.k/Downloads/cursor-instructions-progress-checks.md`
- ブランチ: `main`

## 1. 実施概要

各語彙エントリに対し、練習モード別（`d` IPA→word / `e` word→IPA / `l` Listen）に 0〜3 の進捗チェックをユーザーが手動で付与できる機能を実装。チェック数に応じた頻度重み付けをセッションプール構築に統合。

## 2. データモデル

- localStorage キー: `ept_checks_v1`
- wordKey: 既存 `sessionItemKey(c)` と同一（連結音・弱形は `id`、単語は `w`）
- 値 0 のときキー削除でストレージ軽量化
- JSON 破損時は空オブジェクトにフォールバック

## 3. 実装内容

### 3-1. ヘルパー関数

`loadChecks` / `saveChecks` / `getCheckCount` / `setCheckCount` / `toggleCheckSlot` / `frequencyWeight` / `weightedShuffle` / `currentCheckMode` / `refreshChecksInDom` / `refreshRevealChecksPanel`

### 3-2. 頻度重み付け（セッションプール）

| 箇所 | 変更 |
|---|---|
| Mode B study | `weightedShuffle(..., frequencyWeight(it, "l"))` |
| 連結音タブ | `weightedShuffle(filteredCsPool(), frequencyWeight(it, currentCheckMode()))` |
| Mode A 通常語彙 | `buildSessionQueue` 最終行を `weightedShuffle` に変更 |

セッション途中でのチェック変更は現在の queue を再構築しない（次セッション開始時に反映）。

### 3-3. UI

| 場所 | 内容 |
|---|---|
| 語彙ブラウザ（Words / Phrases） | 3 モード × 3 スロットのドット行、クリックで toggle |
| Reveal 画面 | 現在モード分の 3 スロット（Next ボタン直前） |
| Mode B Study | Reveal meaning 後に `l` モード分 3 スロット |

### 3-4. i18n

6 言語すべてに `checks.progress` / `checks.mode_d` / `checks.mode_e` / `checks.mode_l` を追加。

## 4. 変更ファイル

- `index.html`
- `i18n/en.json`, `ja.json`, `ko.json`, `fil.json`, `zh-Hans.json`, `zh-Hant.json`
- `docs/cursor/instructions/cursor-instructions-progress-checks.md`

## 5. 動作確認（設計上の期待）

| # | 項目 | 状態 |
|---|---|---|
| 1 | ブラウザでチェック → リロード後保持 | 実装済み（localStorage） |
| 2 | 3/3 の語の出題頻度低下 | 実装済み（weight 1 vs 4） |
| 3 | セッション中チェックしても queue 不変 | 実装済み |
| 4 | d/e モード独立 | 実装済み |
| 5 | Mode B の l は Mode A に影響しない | 実装済み |
| 6 | 連結音は id キーで別管理 | 実装済み |
| 7 | localStorage 破損時フォールバック | 実装済み |
| 8 | vocab-row レイアウト | モバイル向け縮小 CSS 追加 |

## 6. スコープ外（指示書通り未実装）

サマリ画面への進捗表示、クラウド同期、リセット UI
