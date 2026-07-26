# MCP コネクタ記述を unified GitHubApp MCP に更新（Phase E） — 実装レポート

## 関連 Issue / PR

- Issue: #104
- PR: #105（draft）

## Issue 背景（Issue 本文から要約）

GitHubApp-MCP 移行 Phase E として、Vault 側更新に続き IPASoundDrill 本体の 4 ドキュメントで旧 per-app Railway MCP 記述を unified `GitHubApp MCP`（Cloudflare Workers）へ追従させる。実体は既に移行済みだが、AI エージェントが起動時に読む正典だけが旧コネクタを推奨していた。コード・ランタイム契約には触れず、ホワイトリスト 4 ファイルのみを堅固化パターン B で更新する。

## 実装内容

- `CLAUDE.md` I1(a): プロジェクト概要の MCP コネクタ行を `GitHubApp MCP` に更新、旧 `IPASoundDrill GitHub` は deprecated として残置
- `CLAUDE.md` I1(b): 起動時必須動作 項番 2 を `GitHubApp MCP` + 対象リポ明示に更新
- `docs/REPOSITORY-STRUCTURE.md` I3: Runtime infrastructure 表の MCP server 行を Cloudflare Workers に更新
- `docs/OPERATIONS.md` I4: §10 ダッシュボード URL 末尾 4 行を unified MCP に差し替え
- `docs/DEV-GUARDRAILS.md` I5: §6 例示行の「Railway MCP」→「GitHub MCP（Cloudflare Workers）」

## 変更ファイル

```
- CLAUDE.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/OPERATIONS.md (M)
- docs/DEV-GUARDRAILS.md (M)
- docs/cursor/reports/cursor-implementation-report-phase-e-mcp-doc-update.md (A)
```

## デグレ防止検証

- Phase 0: 全ファイル **436** 個の md5 ハッシュを `/tmp/before-all-104.md5` に記録
- Phase 1: `grep -rn -E 'ipasounddrill-production\.up\.railway\.app|IPASoundDrill GitHub|ipasounddrill-mcp'` — ホワイトリスト外ヒットは `docs/LAUNCH-CHECKLIST.md`（履歴）、`docs/cursor/**`（過去レポート）、`migration/**`（dry-run ログ）、`AGENTS.md`（別軸）のみ。いずれも非対象のため未編集
- Phase 4/6: `after-all-104.md5` と diff — **ホワイトリスト 4 ファイルのみ** md5 変化（436 件中 4 件）
- I2 非変更: `docs/REPOSITORY-STRUCTURE.md` L157「BE の Railway 化（GAS TTS からの脱却）」は diff に含まれず不変
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

## 動作確認

- `grep -rn 'IPASoundDrill GitHub' .`: deprecated 明記文脈 + `docs/cursor/**` 履歴 + `docs/LAUNCH-CHECKLIST.md` 履歴のみ — OK
- `grep -rn 'ipasounddrill-production.up.railway.app' .`: deprecated 明記文脈 + 上記履歴 + `migration/**` のみ — OK
- `docs/REPOSITORY-STRUCTURE.md` Runtime infrastructure 表: Markdown 表形式崩れなし — OK
- 既存機能への影響: なし（ドキュメントのみ）
- データ整合性: 対象外

## 実装過程での気づき

- Issue 指定の before/after が機械置換可能で、解釈の余地はなかった
- `docs/LAUNCH-CHECKLIST.md` にも旧 MCP 記述があるが、Issue の Category A 整合で「更新不要」と明示されており触れていない（Phase F または別 Issue 想定）

## 後続への影響

- Phase F（旧 Railway MCP 停止・`ipasounddrill-mcp` archive）で deprecated 残置記述を最終削除できる前提が整った
- Claude / Cursor 起動時に正しい unified コネクタ・エンドポイントを参照可能

## 残課題・申し送り

- Phase F: deprecated 明記の旧コネクタ参照を削除
- `docs/LAUNCH-CHECKLIST.md` / `AGENTS.md` の旧 MCP 記述は本 Issue スコープ外（必要なら別 Issue）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: ホワイトリスト 4 ファイルの文字列置換のみ。Runtime data contract / i18n / JS / URL 構造・ビルドへの影響なし

### 事前 Change Pattern vs 実際
- 事前 Pattern: ドキュメント内容更新
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（意図的編集 4 ファイルのみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### 総合判定
- **事前分類妥当** — 昇格・Pattern 追加提案なし
