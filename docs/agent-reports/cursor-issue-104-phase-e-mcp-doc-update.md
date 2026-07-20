---
id: pj-2026-07-20-issue-104
aliases:
- cursor-issue-104-phase-e-mcp-doc-update
title: 'docs: MCP コネクタ記述を unified `GitHubApp MCP` に更新（Phase E / Railway 移行） (#104) — 実装レポート'
created: '2026-07-20'
---

# docs: MCP コネクタ記述を unified `GitHubApp MCP` に更新（Phase E / Railway 移行） (#104) — 実装レポート

## 関連 Issue / PR

- Issue: #104
- PR: #106（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

GitHubApp-MCP 移行 Phase E として、IPASoundDrill 本体リポ内に残っていた旧 Railway per-app MCP コネクタ表記を、稼働中の unified `GitHubApp MCP` 表記へ追従させる作業。Issue の事前分類は L1 / docs 内容更新（C1 相当）で、Runtime data contract・i18n・JS・ビルド・URL 構造への影響は対象外。堅固化パターン B により、ホワイトリスト 4 ファイル以外を md5 で不変確認する条件だった。

## 実装内容

- `CLAUDE.md` の claude.ai MCP コネクタ行を `GitHubApp MCP` / Cloudflare Workers SSE URL に更新。
- `CLAUDE.md` の起動時必須動作を `GitHubApp MCP` 経由、対象リポ `nkhippo/IPASoundDrill` 明記に更新。
- `docs/REPOSITORY-STRUCTURE.md` の Runtime infrastructure 表で MCP server を Railway から Cloudflare Workers / `githubapp-mcp` に更新。
- `docs/OPERATIONS.md` § 10 の MCP 関連 URL を Cloudflare Workers / Worker リポ / unified コネクタ名に更新。
- `docs/DEV-GUARDRAILS.md` § 6 の Runtime infrastructure 例示を `GitHub MCP（Cloudflare Workers）` に更新。
- 旧 Railway / `IPASoundDrill GitHub` / `ipasounddrill-mcp` は Issue 指定どおり deprecated 文脈だけで残置。

## 変更ファイル

```
- CLAUDE.md (M)
- docs/DEV-GUARDRAILS.md (M)
- docs/OPERATIONS.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/agent-reports/cursor-issue-104-phase-e-mcp-doc-update.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショットとして 413 ファイルの md5 を `/tmp/issue-104/before-all.md5` に記録。
- Phase 1: `ipasounddrill-production.up.railway.app|IPASoundDrill GitHub|ipasounddrill-mcp` を検索し、Issue ホワイトリスト 4 ファイル以外にも `AGENTS.md`、`docs/LAUNCH-CHECKLIST.md`、`docs/cursor/reports/**`、`migration/dry-run-02.log` の既存履歴ヒットを確認。Issue の非対象範囲・ホワイトリスト制約に従い不変更。
- Phase 4/6: 4 ドキュメント更新後の md5 比較で、変更ファイルは `CLAUDE.md`、`docs/DEV-GUARDRAILS.md`、`docs/OPERATIONS.md`、`docs/REPOSITORY-STRUCTURE.md` のみ。ホワイトリスト外 diff は 0 件。
- I2 非変更確認: `CLAUDE.md` の `BE 移管（Railway 化）` 行と `docs/REPOSITORY-STRUCTURE.md` の `BE の Railway 化` 行は `git diff HEAD~1 HEAD` に出現せず、変更なし。
- 実装中の自己判断による追加変更: なし。
- 実装中に発覚した懸念: Issue コメント投稿用 MCP がこの環境では公開されていないため、作業開始宣言・PR URL 報告はツール実行不可。検証内容は本レポートと PR 本文に記録。

## 動作確認

- I1(a)(b), I3, I4, I5 の before/after 置換: OK。
- 対象 4 ファイル内の旧 Railway MCP URL / 旧コネクタ名: deprecated 明記文脈のみで残置。
- 全リポ `IPASoundDrill GitHub` / Railway URL 検索: ホワイトリスト内の deprecated 文脈に加え、Issue 非対象の履歴・チェックリスト類で既存ヒットあり。不変確認済み。
- `docs/REPOSITORY-STRUCTURE.md` Runtime infrastructure 表: MCP server 行の Markdown 表構造を維持。
- 既存機能への影響: なし（docs-only）。
- データ整合性: 対象外（wordlist / data / i18n / fonts / gas 不変更）。

## 実装過程での気づき

- Issue 本文のレポート例は旧 `docs/cursor/reports/` を示していたが、現行 `AGENTS.md` は新規レポートを `docs/agent-reports/` に統一しているため、本レポートは `docs/agent-reports/` に作成した。
- 全リポ検索では `docs/LAUNCH-CHECKLIST.md` と `AGENTS.md` にも旧表記が残るが、Issue はホワイトリスト 4 ファイルのみ編集・その他 Category A は md5 一致確認と定義しているため、今回は不変更とした。

## 後続への影響

- Claude / Cursor が起動時に参照する主要ドキュメントでは、unified `GitHubApp MCP` と対象リポ限定運用が正として読めるようになった。
- Phase F で旧 Railway per-app MCP 停止・archive を行う際、deprecated 残置箇所を削除する追加 Issue の前提になる。

## 残課題・申し送り

- Issue コメント投稿ツールが未公開のため、Issue への作業開始宣言と PR URL 報告は未実施。
- `docs/LAUNCH-CHECKLIST.md` / `AGENTS.md` / 履歴ログ類の旧表記は Issue 非対象として残置。Phase F または別 Issue で必要に応じて整理する。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 変更は Issue が明示した 4 ドキュメント内の文字列更新のみで、Runtime data contract・i18n・JS・ビルド・公開 URL 構造には触れていない。複数ファイルだが、堅固化 B の md5 検証でホワイトリスト外不変を確認できた。

### 事前 Change Pattern vs 実際

- 事前 Pattern: ドキュメント内容更新（C1: Docs / behavior-invariant 相当）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響は Issue 明示の 4 ファイルのみ
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 7
- 実際の Phase 数: 7 相当（Phase 0/1 検証、Phase 2-5 編集、Phase 4/6 md5 差分確認、Phase 7 レポート/PR）
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
