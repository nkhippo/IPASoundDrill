# モーダル Escape キー対応 — 実装レポート

## 関連 Issue / PR

- Issue: #65
- PR: #(作成後)

## Issue 背景（Issue 本文から要約）

Phase 0 Recon で 3 モーダルすべて Escape 未対応と判明。Q-9-A により Escape 対応を追加。Exit Confirm は誤セッション終了防止のため No 相当、Settings/Guide は閉じる。キーボードアクセシビリティ（WCAG 2.1 A）の基本要件。

## 実装内容

- `src/index.template.html`: 統合 `keydown` リスナー `onModalEscapeKey` を追加
  - 優先順位: Exit Confirm > Settings > Guide
  - open 判定は既存どおり `.hidden` クラス（HTML `hidden` 属性ではない）
  - Escape 時のみ `preventDefault`、他キーは既存挙動維持
- `docs/SPECIFICATION.md` §4.0.2: Escape 列を更新し Modal Keyboard Interaction を追記

## 変更ファイル

```
- src/index.template.html (M)
- docs/SPECIFICATION.md (M)
- docs/cursor/reports/cursor-implementation-report-modal-escape-support.md (A)
```

## デグレ防止検証

- 既存関数を再利用: `closeExitConfirm` / `closeSettings` / `closeGuide`（新規 close ロジックなし）
- i18n / wordlist / runtime data: 未変更
- 実装中の自己判断による追加変更: 0 件（フォーカストラップ・ARIA 網羅は非対象）

## 動作確認

- 静的: リスナー登録位置はモーダル click ハンドラ近傍、JSDoc 付き
- 動的: Naoya さんによるデスクトップブラウザ手動確認を推奨（Chrome / Firefox / Safari）

## 残課題・申し送り

- フォーカストラップ / Escape 後のフォーカス復帰は Track B 検討（Issue 非対象）
- モーダル同時 open は現状なし（`openGuide` が `closeSettings` 呼出）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L1
- 実装後の妥当性判定: **妥当**
- 判定根拠: テンプレート 1 関数追加 + SPEC 追記のみ。既存 close 関数を再利用。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C2
- 実装中に追加 Pattern: なし（SPEC 同期は Issue 明示の意図的編集）

### 構造・契約への影響点検
- [x] Runtime data contract 影響なし
- [x] i18n schema 影響なし
- [x] Category A: SPECIFICATION のみ意図的更新（Issue 指定）

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 不明点
- Issue 例示の `.hidden` プロパティ判定は現行 DOM と不一致 → `classList.contains("hidden")` を採用（既存コードと整合）
