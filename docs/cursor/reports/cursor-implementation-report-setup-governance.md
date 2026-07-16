---
id: pj-2026-07-11-acf6
aliases:
- pj-2026-07-11-acf6
title: Setup governance — 実装レポート
created: '2026-07-11'
---

# Setup governance — 実装レポート

## 関連 Issue / PR
- Issue: #1
- PR: #(作成後に記入)

## 実装内容
- CLAUDE.md（プロジェクト共通ルール、Track A/B 分離、4-step フロー等）を新規追加
- .cursor/rules/dev-flow.mdc（Cursor 向け開発ルール詳細）を新規追加
- .github/ISSUE_TEMPLATE/{feature,bug,docs}.md（3種）を新規追加
- .github/workflows/{trigger-cursor-on-ready,approval,label-pr-needs-review}.yml（3種）を新規追加
- docs/LAUNCH-CHECKLIST.md（10日間タスク一覧）を新規追加
- docs/OPERATIONS.md（Vercel/GAS/ドメイン運用）を新規追加
- docs/bug-knowledge.md（骨格）を新規追加

## 変更ファイル
.cursor/rules/dev-flow.mdc
.github/ISSUE_TEMPLATE/bug.md
.github/ISSUE_TEMPLATE/docs.md
.github/ISSUE_TEMPLATE/feature.md
.github/workflows/approval.yml
.github/workflows/label-pr-needs-review.yml
.github/workflows/trigger-cursor-on-ready.yml
CLAUDE.md
docs/LAUNCH-CHECKLIST.md
docs/OPERATIONS.md
docs/bug-knowledge.md
docs/cursor/reports/cursor-implementation-report-setup-governance.md

## デグレ防止検証
- Phase 1: 事前スナップショット、既存ファイル 305 個の md5 ハッシュを記録
- Phase 2: 追加されたファイル 11 個、期待リストと完全一致（`diff /tmp/added-files.txt /tmp/expected-files-sorted.txt` 差分なし）
- Phase 3: 事前ハッシュとの比較で既存ファイル 0 件変更を確認
- 実装中に自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

## 動作確認
- Markdown レンダリング（GitHub Web UI で確認）: 対象ファイルすべて OK
- YAML workflow が Actions タブに表示される: OK（Secrets 未登録のため実動作テストは Issue #2 以降で）
- 既存機能への影響: なし（`index.html` / `data/` / `scripts/` / `gas/` / `i18n/` / `fonts/` 未変更）
- データ整合性: 対象外（wordlist 未変更）

## 残課題・申し送り（2026-07-12 更新）
- Secrets 登録: **完了**（`CURSOR_AUTOMATION_WEBHOOK_URL` / `CURSOR_AUTOMATION_WEBHOOK_TOKEN`）
- Branch Protection on main: **完了**（Rulesets）
- ラベル整備: **完了**（Issue #3）
- Cursor Automation webhook: 疎通確認済み。Cloud Agent 起動は `resource_exhausted` のため見送り（追加コストなしで現状 OK）

## 今後の派生 Issue 候補
- （完了）Issue #4: Vercel + custom domain docs
- （完了）Issue #12: dedicated MCP server on Railway
- （任意）Cloud Agent 枠に余裕が出たら `ready-for-cursor` end-to-end 再テスト
