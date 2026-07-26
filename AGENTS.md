# IPASoundDrill Agent Guide

このリポジトリで作業するすべての AI エージェント（Codex / Cursor / Claude Code / その他）が守るべき運用規約。実装前に必ず読み、遵守すること。

**このファイルは Codex 自動読込用の薄い参照スタブ**。規約の正本は以下:

- `CLAUDE.md`（リポ root）— 絶対ルール・executor モデル・halt プロトコル・タスク種別 → 読むべき docs 対応表
- `docs/workflow.md` — Issue 起票・実装フロー・PR 作成・実装レポート・agent-agnostic な運用ルール全般
- `docs/guardrails.md` — 堅固化パターン・レビュー段階化・自己判断禁止事項・md5 検証
- `docs/change-classification.md` — Complexity Level（L1-L3）× Change Pattern（C1-C7）の判定

## 絶対厳守（本ファイル固有・要約のみ）

1. Naoya の個人情報を app に含めない（コミットメッセージ / コメント / UI 生成物すべて）
2. `main` への直接 push 禁止。すべての変更は PR 経由
3. ドキュメントに書かれていないことを推測で埋めない。判断に迷ったら halt（`CLAUDE.md` #halt プロトコル）
4. このリポジトリの統治原則: **"AI is faithful to what's documented, guesses at what isn't"**
5. UI 改修では `docs/claude-design/` を必ず参照する（視覚仕様の正典）。CD ファイルが配置されていない UI 改修 Issue は着手禁止

## Agent-specific notes

### Codex

- GitHub 操作は Codex 提供のネイティブ GitHub コネクタ（`mcp__codex_apps__github`）を使う
- 自前の GitHubApp-MCP や旧 Railway コネクタは使わない
- クラウドサンドボックスの隔離環境で作業するため、ローカル環境依存の副作用を残さない

### Cursor

- `.cursor/rules/dev-flow.mdc`（同じく薄い参照スタブ）を併読
- 実装レポートは `docs/agent-reports/cursor-issue-<N>-<slug>.md` に作成

### Claude Code

- `.claude/agents/issue-handler.md`（非同期委譲時）または同一セッションの指示に従う
