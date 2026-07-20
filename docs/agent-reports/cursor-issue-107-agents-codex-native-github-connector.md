---
id: pj-2026-07-20-issue-107
aliases:
- pj-2026-07-20-issue-107
title: 'docs: AGENTS.md の Codex 節を Codex ネイティブ GitHub コネクタ前提に補正 (#107) — 実装レポート'
created: '2026-07-20'
---

# docs: AGENTS.md の Codex 節を Codex ネイティブ GitHub コネクタ前提に補正 (#107) — 実装レポート

## 関連 Issue / PR

- Issue: #107
- PR: #108（open）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #107 は、Phase E 後に確定した「Codex は GitHub 操作・Vault 参照ともに Codex 提供のネイティブ GitHub コネクタを使う」という運用方針を AGENTS.md に反映する docs 変更である。事前分類は L1、Change Pattern はドキュメント内容更新（実装上は C1: Docs / behavior-invariant と解釈）、堅固化パターンは B。対象は AGENTS.md の Codex 節のみで、ランタイム契約・i18n・コードには触れない。

## 実装内容

- `AGENTS.md` の `Agent-specific notes > Codex` 節を Issue 本文の after ブロックに合わせて更新した。
- Codex の GitHub 操作は `mcp__codex_apps__github` を使うことを明記した。
- 旧 Railway コネクタ `IPASoundDrill GitHub` と自前 GitHubApp-MCP は Codex では使わないことを明記した。
- Vault 参照も Vault MCP ではなく Codex ネイティブコネクタの `_fetch_file` で行うことを明記した。

## 変更ファイル

```
- AGENTS.md (M)
- docs/agent-reports/cursor-issue-107-agents-codex-native-github-connector.md (A)
```

## デグレ防止検証

- Phase 0: `git ls-files -z | xargs -0 md5sum | sort > /tmp/issue-107/before-all.md5` で tracked file の事前 md5 を記録。
- Phase 1: `rg -n 'IPASoundDrill GitHub|Vault MCP|GitHubApp-MCP|Codex|Claude Code|Critical constraints' AGENTS.md` で対象箇所を確認し、旧記述が Codex 節のみであることを確認。
- Phase 2-4: AGENTS.md の Codex 節のみを置換し、diff が指定範囲に収まることを確認。
- Phase 7: 実装レポートを `docs/agent-reports/` に追加。
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: なし

## 動作確認

- `AGENTS.md` の Codex 節がネイティブ GitHub コネクタ前提に補正されていること: OK
- `rg -n 'IPASoundDrill GitHub' AGENTS.md` の結果が deprecated 明記文脈のみであること: OK
- Markdown 見出し構造（`### Codex` / `### Cursor` / `### Claude Code`）が維持されていること: OK
- 既存機能への影響: なし（docs-only）
- データ整合性: 対象外（wordlist / data / i18n / runtime contract 非接触）

## 実装過程での気づき

- この実行環境の Cursor Automation Tools には Issue Comment 投稿用ツールが公開されておらず、`gh` は読み取り専用として扱う必要があるため、開始コメントと PR URL 報告はツールから実施できなかった。
- 現行 AGENTS.md の指示に従い、新規実装レポートは historical archive の `docs/cursor/reports/` ではなく `docs/agent-reports/` に作成した。

## 後続への影響

- Codex 起動時に読む AGENTS.md が、GitHub 操作・Vault 参照の実態（Codex ネイティブ GitHub コネクタ）と一致する。
- Vault 側 SOP / project_aliases の Multi-AI 記述補正は Issue 本文どおり別途対応。

## 残課題・申し送り

- Issue Comment 投稿用ツールがないため、Issue への開始宣言・PR URL 報告は未実施。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: AGENTS.md の単一節を Issue 指定どおり置換した docs-only 変更で、ランタイム契約・i18n・URL・ビルドには影響しない。

### 事前 Change Pattern vs 実際

- 事前 Pattern: ドキュメント内容更新（C1: Docs / behavior-invariant として実施）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメントへの影響は AGENTS.md Codex 節のみ（Issue 明示範囲）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 5（Issue 記載の Phase 0, 1, 2-4, 7）
- 実際の Phase 数: 5
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
