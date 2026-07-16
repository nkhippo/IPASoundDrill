---
id: pj-2026-07-13-a4d2
aliases:
- pj-2026-07-13-a4d2
title: E2 Tally + X footer — 実装レポート
created: '2026-07-13'
---

# E2 Tally + X footer — 実装レポート

## 関連 Issue / PR

- Issue: #48
- PR: #49

## Issue 背景（Issue 本文から要約）

Phase 4 Feedback 側の最後の実装。Tally フォーム（`https://tally.so/r/xX1axk`）と X アカウント（`nkhippo123`）が手元で確定したため、トップ相当画面に Feedback ボタン（Tally modal）と X リンクを置き、OPERATIONS / LAUNCH-CHECKLIST を Phase 4 完了に更新する。

## 実装内容

- `src/index.template.html`: wrap 末尾に `site-footer`（Feedback + X）を新設、insights 直後に Tally embed.js を追加。プレイ中は footer 非表示
- `docs/OPERATIONS.md`: § 6.1 / § 10 の Tally URL を実 URL に更新
- `docs/LAUNCH-CHECKLIST.md`: Phase 4 を ✅ 完了、E2 URL・タスク／完了定義を更新

## 変更ファイル

```
- src/index.template.html (M)
- docs/OPERATIONS.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-e2-tally-x-footer.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショット（生成物除外）
- E1 insights script / Issue #46 VA opt-out IIFE: 不変（Tally script はその後に追加）
- OPERATIONS § 5 / § 5.6: 不変
- Phase 5 SEO ✅: 不変
- i18n: 未変更（Feedback / X は英語固定、Issue 指定）
- 実装中の自己判断: 既存 footer が無かったため `site-footer` を新設（デザインは mono pill で既存 UI に合わせた）
- 実装中に発覚した懸念: なし

### grep 確認結果

- `data-tally-open="xX1axk"` / `tally.so/widgets/embed.js` / `x.com/nkhippo123` 存在
- `va-disable` + `insights/script.js` 維持
- LAUNCH-CHECKLIST: `Phase 4: ... ✅ 完了`、`Phase 5: ... ✅ 完了`

## 動作確認

- 静的: footer / script 順序 / URL 記述 OK
- 動的: Preview / Production で Feedback → Tally modal、X → プロフィール新規タブ（マージ後 Naoya 確認）
- 既存機能への影響: setup 下部に footer 追加、`in-play` では非表示
- データ整合性: 対象外

## 実装過程での気づき

- Issue は「既存 footer に追加」と書いていたがテンプレートに footer は無く、同等の導線として `site-footer` を wrap 末尾に追加した
- Issue 本文の「Issue #45」参照は誤記と判断し、本 Issue #48 で記録

## 後続への影響

- Phase 4 完了 → Phase 6 法務以降に集中可能
- Feedback / X クリックの Analytics カスタムイベントは Track B

## 残課題・申し送り

- マージ後: Tally 送信メール通知と footer 動作の目視
- Feedback / X の i18n は Issue I1 想定

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: footer UI + 外部 widget script + docs 更新のみ。ビルド・URL・契約変更なし。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C4, C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（OPERATIONS / LAUNCH-CHECKLIST）
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
