---
id: pj-2026-07-12-09f1
aliases:
- pj-2026-07-12-09f1
title: Vercel Build rollback — 実装レポート
created: '2026-07-12'
---

# Vercel Build rollback — 実装レポート

## 関連 Issue / PR

- Issue: #37
- PR: #38

## Issue 背景（Issue 本文から要約）

F2 で Vercel Build を初導入する前に、OPERATIONS.md の Rollback 節が静的サイト前提のままだったため、Build 失敗時の対処と Build 設定変更時の事前チェックが未整備だった。Issue #33 / #35 に続く F2 先行整備の 3 番目として、§ 2.4（失敗時対応: パターン α/β）と § 2.5（設定変更 8 項目チェックリスト）を追加し、LAUNCH-CHECKLIST に完了を記録する。

## 実装内容

- `docs/OPERATIONS.md` § 2.3 直後に § 2.4「Vercel Build 失敗時の対応」を追加（6 失敗パターン、検知手順、α/β、判断フロー、別 Issue 切り出し基準）
- 同ファイルに § 2.5「Build Command / Output Directory 変更時の事前チェックリスト」（8 項目）を追加
- `docs/LAUNCH-CHECKLIST.md` Phase 1 完了マークと Phase 5「先行 2」に Issue #37 URL を記録

## 変更ファイル

```
- docs/OPERATIONS.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-vercel-build-rollback.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショット、全ファイル 348 個の md5 ハッシュ記録
- Phase 1–2: ホワイトリスト 2 ファイルのみ編集（コミット分離どおり）
- Phase 3: `before-all.md5` vs `after-phase2.md5` — 差分は OPERATIONS.md / LAUNCH-CHECKLIST.md のハッシュ差のみ
- ブラックリスト不変（`git diff main` で 0 行）: `index.html`、wordlist、CHANGE-CLASSIFICATION、DEV-GUARDRAILS、CLAUDE.md、`dev-flow.mdc`
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

### grep 確認結果（Issue 指定）

```
docs/OPERATIONS.md: ### 2.4 / ### 2.5 / パターン α / パターン β — 存在確認済み
docs/LAUNCH-CHECKLIST.md: Vercel Build 失敗時 rollback — Phase 1 完了行 + 先行 2 URL（Issue #37）
```

## 動作確認

- 内部参照 § 2.1 / § 2.2 は既存セクションと一致
- § 2.4 / § 2.5 の見出し階層は § 2.1–2.3 と揃えている
- 既存機能への影響: なし（docs のみ）
- データ整合性: 対象外

## 実装過程での気づき

- Issue 本文の § 2.4 / § 2.5 はほぼそのまま貼れる完全仕様だったため、既存 § 1–2.3 と § 3–10 を触らず挿入のみで完了
- § 1.1 の「ビルドコマンド: なし」は本 Issue 対象外（F2 実装時に更新）と明記されており、触っていない

## 後続への影響

- F2 本体起票時に OPERATIONS § 2.4 / § 2.5 を参照できる（F2 先行整備 3 件が揃った）
- Track B の Build 設定変更 Issue でも § 2.5 チェックリストを再利用可能

## 残課題・申し送り

- LAUNCH-CHECKLIST の `PR #YY` は本 PR 番号確定後に置換（同一 PR 内）
- § 1.1 / § 5（Plausible→Vercel Analytics）は別 Issue（F2 / E1）の範囲

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: Category A の OPERATIONS へのサブセクション追加のみ。フロー再設計・ビルド初導入・URL 変更は含まず、影響はホワイトリスト 2 ファイルに閉じた。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C2
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし（手順文書のみ。実際の Build 設定変更は F2）
- [x] AI 参照ドキュメント Category A への影響なし（既存 OPERATIONS / LAUNCH-CHECKLIST への追記のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 6（Phase 0–5）
- 実際の Phase 数: 6
- 相互依存の発生有無: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
