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

## PR requirements

### 必須事項

- **draft PR** として作成する (通常 PR 禁止)
- 本文冒頭で `Closes #N` キーワードで対応 Issue を自動クローズさせる
- Complexity Retrospective 実施確認セクションを必ず含める

### PR description template

以下のテンプレートを必ず使用する:

```markdown
## 概要

(1-3 行で PR の目的)

## 変更内容

- (箇条書きで具体的な変更ファイルと変更内容)

## 変更理由

- Issue #N (タイトル) の対応として、(理由を 1-3 行)

## 確認済み事項

- [x] (Issue の完了定義の項目)
- [x] (デグレ防止の確認)
- [x] (該当する場合) 動作確認・テスト実行

## 未確認・懸念点

- (発見した懸念があれば記載、なければ「なし」)

## Complexity Retrospective 実施確認

- [x] 実装レポートに Retrospective セクションを記載済み
- [x] 総合判定: 事前分類妥当 / Level 昇格提案 / Pattern 追加提案
- [x] 昇格・追加提案があった場合、Issue Comment で報告済み: 該当なし / #M

## 関連 Issue

Closes #N
```

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
- MCP: 利用可能なら Vault MCP や IPASoundDrill GitHub MCP を活用し、過去の意思決定・handoff を参照してよい
- クラウドサンドボックスの隔離環境で作業するため、ローカル環境依存の副作用を残さない

### Cursor

- `.cursor/rules/dev-flow.mdc` の独自ルールと本 AGENTS.md を併読
- 実装レポートは `docs/agent-reports/cursor-issue-<N>-<slug>.md` に作成 (既存 `docs/cursor/reports/` には**新規追加しない**)

### Claude Code

- 導入時に本セクションを追記
