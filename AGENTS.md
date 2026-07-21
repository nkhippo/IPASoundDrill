---
id: pj-2026-07-20-107b
aliases:
- pj-2026-07-20-107b
title: IPASoundDrill Agent Guide
created: '2026-07-20'
---

# IPASoundDrill Agent Guide

このリポジトリで作業するすべての AI エージェント (Codex / Cursor / Claude Code / その他) が守るべき運用規約。実装前に必ず読み、遵守すること。

## Critical constraints (絶対厳守)

1. Naoya の個人情報を app に含めない (コミットメッセージ / コメント / UI 生成物すべて)
2. `main` への直接 push 禁止。すべての変更は draft PR 経由
3. AGENTS.md や参照ドキュメントに書かれていないことを推測で埋めない。判断に迷ったら Issue Comment で Naoya に確認する
4. このリポジトリの統治原則: **"AI is faithful to what's documented, guesses at what isn't"**

## Before any implementation (実装前に必読)

以下のドキュメントを必ず参照する:

1. `docs/CHANGE-CLASSIFICATION.md` — Complexity Level × Change Pattern の分類正本 (**最重要**)
2. `docs/DEV-GUARDRAILS.md` — 堅固化パターン A/B/C の適用条件
3. `docs/OPERATIONS.md` — 運用手順とロールバック
4. `docs/REPOSITORY-STRUCTURE.md` — Runtime contract と directory tree
5. `docs/DOCUMENT-MAP.md` — Category A-E ドキュメントの更新義務と参照タイミング
6. Issue 本文 (改修分類ブロックがあればそれに従う)

## Change classification (改修分類の判定 — 必須)

実装前に必ず以下を判定し、実装レポートに記載する:

- **Complexity Level**: L1 / L2 / L3 (境界曖昧なら上位を選ぶ)
- **Change Pattern**: C1-C7 から該当するもの全て (複数選択可)
- **判定根拠**: 1-2 行で必ず書く

判定基準の詳細は `docs/CHANGE-CLASSIFICATION.md` § 2, § 3 を参照。

Issue に改修分類ブロックが未記載でも、エージェント側で判定して実装レポートに残す。

## Branch naming

- `<agent>/issue-<N>-<slug>` を推奨: 例 `codex/issue-123-tts-latency-fix`
- または Change Pattern prefix: 例 `docs/xxx`, `feat/xxx`, `fix/xxx`
- ブランチ名に issue 番号を含めること (追跡容易性のため)

## Step 2: 設計懸念点検コメント (agent-agnostic)

実装開始前に、判断ポイント・UX 懸念・Runtime 影響への疑義があれば Issue Comment で投稿する。判断ポイントゼロの単純 Issue では省略可。

**コメントヘッダー:** `🛠️ **<agent> より**`（`<agent>` は `codex` / `cursor` / `claude-code` 等）

**コメント末尾:** `_<agent> による自動投稿_`

**セクション構成:**

1. **カテゴリ A: 解釈確定が必要な箇所** — 表形式（解釈A / 解釈B / 採用案）
2. **カテゴリ B: UX・運用・データ整合性の懸念** — 表形式（影響度: 大/中/小）
3. **判定** — 実装続行 / 持ち帰り / 中断

カテゴリ A が 1 件以上、またはカテゴリ B で影響度「大」が 1 件以上ある場合は実装を開始せず Naoya に持ち帰る。

参考実物: Issue #100 の Step 2 コメント (2026-07-20)。

## Runtime UI 動作検証

Runtime UI やインタラクション (event handler, form 送信, DOM 変更, React state 等) を含む **L2 以上**の改修では、ブラウザでの実行確認を必須とする。

- `npm run dev`、または静的サイトの場合はローカル HTTP サーバーで起動し、実際の操作を確認する
- 実装レポートに「ブラウザで確認した具体操作」を列挙する（例: どのボタン押下 → どの表示変化、console warning/error がゼロであること）
- **`npm run build` 成功のみは動作確認とみなさない**

対象外: docs 純粋更新、CI 設定のみ、Runtime UI に触れない chore 等。

## md5 baseline 検証

堅固化パターン A（既存編集ゼロ）を宣言した改修では、`docs/DEV-GUARDRAILS.md` § 2 の md5 baseline 手順に従う。

- Phase 0: `origin/main` から隔離した worktree で全既存ファイルの md5 スナップショットを記録
- Phase 完了時: 全既存ファイルの md5 が Phase 0 と一致することを検証
- 実装レポートに「Phase 0 md5 baseline 取得」「Phase 完了時 md5 全一致確認」を明記

## Scaffolding tool noise cleanup

`npm create`, `yarn create`, `create-*` 系スキャフォールディングで生成された成果物のうち、**本 Issue のスコープに関係ないものは削除してから commit** する。

具体例:

- `create-vite` の `public/icons.svg`（他社製品宣伝アイコン）
- プロジェクト固有 favicon がある場合の template `public/favicon.svg`
- README template の placeholder 文言

判断基準: 「この Issue の本旨に必要か」。迷ったら削除。

## PR requirements

### 必須事項

- **draft PR** として作成する (通常 PR 禁止)
- 本文冒頭で `Closes #N` キーワードで対応 Issue を自動クローズさせる
- Complexity Retrospective 実施確認セクションを必ず含める

### PR description template

GitHub が新規 PR 作成時に自動挿入する **`.github/PULL_REQUEST_TEMPLATE.md`** を使用する。テンプレ更新時の single source of truth は当該ファイル。

## Implementation report (必須)

すべての実装で `docs/agent-reports/<agent>-issue-<N>-<slug>.md` に実装レポートを作成する。

- **Path 命名**: `docs/agent-reports/codex-issue-94-readme-integration-test.md` のように `<agent>-issue-<N>-<slug>.md`
- **`<agent>`** の値: `codex` / `cursor` / `claude-code` など
- **テンプレート**: `docs/agent-reports/TEMPLATE.md` を必ず使用
- **書式**: Frontmatter (id / aliases / title / created) + 本文の全セクション

過去の Cursor レポート (`docs/cursor/reports/`) は historical archive として保持。新規レポートはすべて `docs/agent-reports/` に統一する。

## Complexity Retrospective (PR 作成前の必須点検)

実装完了後、PR 作成前に Retrospective を実施し、実装レポートに記載する。

### 総合判定の 3 分岐

| 判定 | 意味 | 次アクション |
|---|---|---|
| **事前分類妥当** | Level / Pattern が実態と一致 | PR 作成可 |
| **Level 昇格提案** | 実態がより重い (例: L2→L3) | **PR 作成せず** Issue Comment で中断。Naoya の承認後に再開 |
| **Pattern 追加提案** | 既存 C1-C7 で表現できない性質 | 同上。`docs/CHANGE-CLASSIFICATION.md` § 10 の追加フローへ |

降格提案 (過大見積もり) は Retrospective に書いてよいが、続行可。

**Step 3b 未実施の PR は作成禁止**。Retrospective なしの PR はマージ拒否対象。

## Trouble shooting

### Codex 固有: GitHub App の PR 作成が 403 で失敗する場合

Codex の内蔵 GitHub App で PR 作成 API が `Resource not accessible by integration` (403) を返すことがある (既知バグ: openai/codex #17475, #21387)。この場合は認証済み `gh` CLI にフォールバックして draft PR を作成すること。フォールバックしたことを実装レポートの「実装過程での気づき」セクションに明記する。

### 判断迷い

- 改修範囲が Issue 記載を超えると気づいたら、実装を止めて Issue Comment で確認
- 未定義のルールに直面したら、推測で埋めず Naoya に確認
- 既存 draft PR が同 issue に存在する場合、それを踏襲するか新規に作るか判断迷いなら Issue Comment で確認

## Agent-specific notes

### Codex

- ChatGPT Plus / Pro の使用枠は 5 時間ウィンドウで管理 (`/status` で残枠確認)
- **GitHub 操作は Codex 提供のネイティブ GitHub コネクタ (`mcp__codex_apps__github`) を使う**。主なツール: Issue = `_create_issue` / `_update_issue` / `_add_issue_labels` / `_remove_issue_label` / `_add_comment_to_issue`、PR = `_create_pull_request` / `_get_pr_info` / `_get_pr_diff` / `_list_pr_changed_filenames` / `_merge_pull_request` / `_add_review_to_pr`、ファイル = `_fetch_file`（読み取り。`get_file_content` は無い）/ `_create_file` / `_update_file` / `_delete_file` / `_create_branch`。ツールは遅延公開方式のため、必要に応じて追加ツールが見つかる
- **自前の GitHubApp-MCP や旧 Railway コネクタ `IPASoundDrill GitHub` は Codex では使わない**（`IPASoundDrill GitHub` は Claude 用・deprecated。Phase F で削除予定）
- 過去の意思決定・handoff（`nkhippo/Vault`）を参照する場合も、**Codex ネイティブコネクタの `_fetch_file` で Vault の md を直読する（Vault MCP は使わない）**
- クラウドサンドボックスの隔離環境で作業するため、ローカル環境依存の副作用を残さない

### Cursor

- `.cursor/rules/dev-flow.mdc` の独自ルールと本 AGENTS.md を併読
- 実装レポートは `docs/agent-reports/cursor-issue-<N>-<slug>.md` に作成 (既存 `docs/cursor/reports/` には**新規追加しない**)

### Claude Code

- 導入時に本セクションを追記
