---
id: pj-2026-07-21-a117
aliases:
- pj-2026-07-21-a117
title: 'governance: Step 2 SSoT 化 + stub 削除予定日注記 (#117) — 実装レポート'
created: '2026-07-21'
---

# governance: Step 2 SSoT 化 + stub 削除予定日注記 (#117) — 実装レポート

## 関連 Issue / PR

- Issue: #117
- PR: （draft・作成時に番号追記）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

PR #116 レビュー残課題の総仕上げ。(a) `.cursor/rules/dev-flow.mdc` の Step 2 が Cursor hardcode のまま AGENTS.md と二重管理、(b) `docs/CURSOR-INSTRUCTION-GUIDE.md` stub に削除予定日がない。L1 × C1、2 ファイルのみ。

## 実装内容

- `.cursor/rules/dev-flow.mdc`: Step 2 の詳細フォーマット・hardcode テンプレ・持ち帰り判定表を削除し、`AGENTS.md` § Step 2 への参照に置換。Cursor 固有の「実施タイミング」（launch-blocker / 複数ファイル / タイプ A 省略可）は維持（オプション B 寄り）
- `docs/CURSOR-INSTRUCTION-GUIDE.md`: MOVED 見出し直下に「削除予定: 2026-10-21」を追記

### 判断ポイントへの回答

1. **Phase 1**: オプション B（実施タイミングの概要は残し、詳細フォーマットのみ AGENTS.md 参照）
2. **Phase 2 削除予定日**: **2026-10-21**（Issue 推奨、リネームから 90 日後）
3. **注記位置**: MOVED 見出し直下

## 変更ファイル

```
- .cursor/rules/dev-flow.mdc (M)
- docs/CURSOR-INSTRUCTION-GUIDE.md (M)
- docs/agent-reports/cursor-issue-117-governance-ssot.md (A)
```

## デグレ防止検証

- 変更範囲: 上記 2 ファイル + 本レポートのみ
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: なし

## 動作確認

- [x] dev-flow.mdc Step 2 が AGENTS.md 参照に置換
- [x] stub に削除予定日 2026-10-21 追記
- [x] Runtime / i18n / URL 影響なし
- 既存機能への影響: なし
- データ整合性: 対象外

## 実装過程での気づき

- dev-flow.mdc の「実施タイミング」ブロックは Cursor ワークフロー固有のため AGENTS.md にはなく、残置が妥当

## 後続への影響

- 2026-10-21 以降に stub 削除 Issue を起票する際、本注記を参照可能

## 残課題・申し送り

- stub の実削除は本 Issue スコープ外（2026-10-21 以降の follow-up）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 2 ファイルの一行参照・注記追加のみ。構造転換なし

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 2（独立）
- 実際の Phase 数: 2（単一 PR で完結、相互依存なし）

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 昇格・追加提案がある場合の詳細

なし
