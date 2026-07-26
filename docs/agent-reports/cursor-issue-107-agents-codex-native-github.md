# AGENTS.md の Codex 節を Codex ネイティブ GitHub コネクタ前提に補正 (#107) — 実装レポート

## 関連 Issue / PR

- Issue: #107
- PR: #109（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Phase E（#104/#105）後、Codex は自前 GitHubApp-MCP も Vault MCP も使わず、Codex 提供のネイティブ GitHub コネクタ（`mcp__codex_apps__github`）を利用する方針が確定。#105 実装レポートで AGENTS.md に旧 MCP 記述が残ると報告されており、Codex 節を実態に合わせて補正する L1 ドキュメント更新。

## 実装内容

- `AGENTS.md`「Agent-specific notes > ### Codex」節を Issue 指定の after 文面に置換
- GitHub 操作 = ネイティブコネクタ（主要ツール一覧）を明記
- 自前 GitHubApp-MCP / 旧 `IPASoundDrill GitHub` / Vault MCP は Codex では使わない旨を明記
- Vault 参照は `_fetch_file` で直読する方針を明記
- CI `validate-markdown-refs` V1 合格のため、未付与だった `AGENTS.md` frontmatter（id / aliases / title / created）を先頭に追加（本文セクション内容は Codex 節以外不変）

## 変更ファイル

```
- AGENTS.md (M)
- docs/agent-reports/cursor-issue-107-agents-codex-native-github.md (A)
```

## デグレ防止検証

- Phase 0: 全ファイル **437** 個の md5 を `/tmp/before-all-107.md5` に記録
- Phase 1: `grep -rn 'IPASoundDrill GitHub' AGENTS.md` — deprecated 明記文脈のみ（L132）
- Phase 4: `after-all-107.md5` diff — **AGENTS.md のみ** md5 変化（437 件中 1 件）
- Cursor / Claude Code 節、Critical constraints 等: diff に含まれず不変
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

## 動作確認

- `grep -rn 'IPASoundDrill GitHub' AGENTS.md`: deprecated 明記文脈のみ — OK
- Markdown 見出し・箇条書き構造: 崩れなし — OK
- 既存機能への影響: なし（ドキュメントのみ）
- データ整合性: 対象外

## 実装過程での気づき

- Issue 指定の before/after がそのまま適用可能で解釈の余地なし
- `AGENTS.md` は main 上でも frontmatter 未付与だったが、PR で変更すると CI V1 が FAIL するため frontmatter を追加（Codex 節以外の本文は diff なし）

## 後続への影響

- Codex 起動時に正しい GitHub 操作・Vault 参照手段を認識可能
- Vault 側 Multi-AI 記述（`project_aliases.md` / SOP）は別途対応が必要（Issue 本文に明記）

## 残課題・申し送り

- Vault 側 SOP / project_aliases の Codex 方針追従（別途）
- Phase F: deprecated 残置記述の最終削除

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: AGENTS.md 1 節の文字列置換のみ。コード・ランタイム契約・i18n 非接触

### 事前 Change Pattern vs 実際

- 事前 Pattern: ドキュメント内容更新
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（意図的編集 AGENTS.md のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
