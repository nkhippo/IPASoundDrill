# workflow.md — 開発運用フロー正本

壁打ち → Issue 起票 → 実装（非同期 Codex/Cursor | 同一セッション ClaudeCode）→ halt → レビュー → merge の executor 対応フロー全体の唯一のホーム。
絶対ルール・executor モデル概要・halt トリガー(a/b/c)・タスク種別対応表は `CLAUDE.md`（router）が正本、本ファイルはその詳細版。
Level×Pattern の判定基準は `docs/change-classification.md`、デグレ防止・レビュー段階化・doc-sync は `docs/guardrails.md` を参照。

## 1. 開発フロー（4-step）

```
Step 1: 要件整理（Naoya × Claude）→ 5 項目チェック + executor-ready 標準を満たす Issue を起票
Step 2: 設計懸念点検（実装エージェント）→ 懸念なければ Step 3 へ直行
Step 3: 実装 → halt（曖昧・ホワイトリスト逸脱・影響範囲乖離）で中断、なければ PR 作成
Step 4: レビュー・マージ（Level 段階化。`docs/guardrails.md` §3）
```

## 2. 開発体制

| 役割 | 担当 | 作業 |
|---|---|---|
| PM・テスター | Naoya | 要件決定・halt 質問への回答・最終 merge |
| 要件整理・Issue 起票 | Claude | 壁打ち・Issue 本文作成・起票 |
| 実装 | 原則 Codex/Cursor（非同期 PR）。情報伝達漏れが起きやすい大規模ドキュメント/デザイン反映は ClaudeCode 同一セッション。委譲判断基準は §11 | Issue を読んで実装・PR 作成 |

エージェント委譲は `.claude/agents/`（`issue-handler`=実装 / `pr-reviewer`=契約ゲート / `consistency-auditor`=整合監査）。いずれも Naoya の明示委譲時のみ起動する。

## 3. Issue タイプと分割

| タイプ | 定義 |
|---|---|
| **A（軽微）** | 単一ファイル、既知仕様への復帰、CI/CD 整備、ドキュメント更新 |
| **B（標準）** | 複数ファイル、UI 変更、データ拡充、仕様変更を伴う |
| **C（大規模）** | 複数 PR にまたがる作業 |

**分割 5 判断軸**: ①設計 vs 実装（仕様変更を伴う → docs Issue を先行）②対応規模（影響ファイル 5 つ超 → 分割。docs-infrastructure の cohesive consolidation は例外的に単一 Issue で atomic 実施してよい）③ドキュメント独立性（運用ドキュメント修正は常に単独 Issue で先行）④ブロッキング関係（B が A 完了待ち → A 先行）⑤リスク隔離（本番影響大 → 単独 Issue）。

## 4. Issue 起票ルール

- **署名オフ**（簡素化 1）: Issue/PR 本文・コメントに `🤖 Claude より` / `🛠️ Cursor より` 等の署名ブロックを課さない。GitHub の author/timestamp で代替可能なため廃止（旧「署名必須」記述は本ファイルへの集約をもって失効）
- **改修分類ブロック必須**: 本文冒頭に Complexity Level × Change Pattern + 判定根拠を記載。定義・テンプレートは `docs/change-classification.md` §6
- **背景・目的は 5 サブセクション構成**（記事化前提の詳細度）: ①この Issue のトリガー ②背景となる文脈（プロダクト/開発運用/技術の 3 観点）③検討した選択肢と選定理由（却下案も含む）④得たい成果（定量/定性/波及）⑤後続への影響。Naoya が明示的に語っていない主観部分は `_[Naoya さんが追記予定: XX]_` で空欄マーカーを残す
- **5 項目チェック**（`ready-for-cursor` 付与条件、1 つでも欠ければ付与しない）: 背景・目的 / 実装範囲（対象ファイル明示）/ 完了定義（動作で記述）/ テスト観点 / 非対象範囲
- **executor-ready Issue 標準**（Naoya 合意 2026-07-26、5 項目チェックの拡張・強化。low-cost モデルや issue-handler がチャット文脈に依存せず正しく実装できることが基準）。以下を満たさない Issue には `ready-for-cursor` 相当を付けない:
  - [ ] **必読リスト**: 実装に必要な docs / 先行 Issue 成果物を具体パスで列挙
  - [ ] **ファイルホワイトリスト**: 触ってよいファイルを明示
  - [ ] **完了定義**: 観測可能な動作で記述（曖昧表現禁止）
  - [ ] **テスト/検証コマンド**: 実行すべき検証（`tools/validate_i18n.py`・再カウント等）を具体的に
  - [ ] **非対象範囲**: 触らない範囲を明示
  - [ ] **チャット由来の決定事項の明示**: 壁打ちで決めた前提・判断を Issue 本文に落とし込む（記憶・口頭に依存しない）
- **参照ドキュメントの明示**: Issue 本文に必要な参照ドキュメントを列挙する。判定は `CLAUDE.md` のタスク種別対応表 + `docs/doc-map.md` レジストリに従う
- **UI 仕様の参照**: UI 改修 Issue では `src/index.template.html`(正本) と `docs/claude-design/{sp,pc}.dc.html`(スナップショット) の 2 点を根拠にする。**外部 Claude Design(SaaS) の URL・zip・再開セッションは要求しない**(2026-07-28 に運用廃止)。詳細 `docs/claude-design/README.md`
- **Phase 番号の記述**: 作業手順を Phase 番号で列挙する場合、「Phase 0, 1, 2, ...」の連番で明確に記述する。曖昧な範囲表記は使わず、総数を末尾に明記する

### ラベル

| ラベル | 意味 |
|---|---|
| `feature` / `bug` / `docs` / `chore` | 変更種別 |
| `ready-for-cursor` | executor-ready 標準を満たす（実装開始可） |
| `needs-review` | PR がレビュー待ち（自動付与） |
| `high` | 優先対応が必要 |
| `critical` / `high` / `medium` / `low` | 優先度（任意） |

## 5. Phase 毎コメントオフ（簡素化 2）

実装中の進捗コメントは Issue Comment に逐次投稿しない。**blocker / halt が発生したときのみ**報告する。Phase 分割自体（コミット単位の分離）は `docs/guardrails.md` §2 の堅固化パターンに従う。

## 6. halt プロトコル

トリガー (a)(b)(c) と経路（同一セッション ClaudeCode → その場で質問 / 非同期 Codex・Cursor・issue-handler → Issue コメント）は `CLAUDE.md` #halt プロトコル が正本。中断報告のフォーマット:

```
【作業中断】
- 現在の状態: (何をやったか)
- 中断理由: (何がわからない/何が想定と違うか)
- 次に必要なこと: (何があれば再開できるか)
```

投稿後は作業を止め、Naoya の回答を待つ（自分で回答を仮定しない）。

## 7. レビュー・auto-merge フロー

Level 段階化の内容（L1 セルフチェック / L2 `pr-reviewer` PASS / L3 フル Rv+md5+Naoya ack）は `docs/guardrails.md` §3 が正本。運用上のラベル遷移:

| イベント | ラベル変化 |
|---|---|
| PR 作成 / 追加 push | `needs-review` が自動付与 |
| Naoya が承認コメント（`ok`/`lgtm`/`✅` 等） | `needs-review` 除去、auto-merge 実行（L1/L2）または Naoya 手動 merge（L3） |
| Naoya が PR をマージ | `needs-review` 除去 |

**PR コメント対応の完了条件**（全エージェント共通）: 修正 commit / push だけで完了としない。①同じ PR の Conversation に結果コメントを投稿 ②「対応した指摘」「変更内容」「検証結果」「未解決事項（なければなし）」を記載 ③投稿後に ready for review 化・再レビュー依頼を行う。修正不要と判断した指摘にも理由を返信する。承認トリガーワードのみのコメント・CI bot 通知には返信不要。

**issue-handler-authored PR の自動対応**: マーカー `<!-- authored-by: issue-handler -->` 付き PR に Claude がレビューコメントを投稿したら、issue-handler が追加指示を待たず即対応する（Cursor/Codex 作成 PR は対象外、Naoya が別途指示）。

## 8. PR 作成ルール

- draft ではなく通常 PR（`main` 直 push は禁止、すべて PR 経由）
- PR タイトル: `feat:` / `fix:` / `chore:` / `docs:` + 内容 + `(#XXX)`
- PR 本文テンプレは `.github/PULL_REQUEST_TEMPLATE.md`（概要・変更内容・変更理由・確認済み事項・未確認懸念点・Complexity Retrospective 実施確認・`Closes #N`）
- develop 向け PR に `Closes #N` を記載する（develop マージ時に Issue をクローズする）
- **UI 改修 PR のスクショ必須（Change Pattern C6）**: ①Issue 本文のスクショ対象画面リスト全画面のスクショを PR Comment に添付 ②技術制約で添付できない場合は明記し、Naoya 実機検証を Rv の前提とする ③スクショ（または代替）無しの UI 改修 PR は pr-reviewer/Claude Rv で FAIL とする

## 9. 実装レポート（必須）

`docs/agent-reports/<agent>-issue-<N>-<slug>.md` に `docs/agent-reports/TEMPLATE.md` を使って作成し、同一 PR に含める。`<agent>` は `codex` / `cursor` / `claude-code` 等。過去の `docs/cursor/reports/` は historical archive（2026-07-20 以前）で新規追加しない。

## 10. AI 履歴の置き場所

| 種類 | 置き場所 |
|---|---|
| 実装後レポート | `docs/agent-reports/<agent>-issue-<N>-<slug>.md` |
| Pre-Issue Recon | `docs/cursor/recon/pre-issue-recon-YYYYMMDD-<topic>.md` |
| バグ根本原因 | `docs/bug-knowledge.md` 末尾追記 |
| Chat 相談ログ・引き継ぎ | `docs/handoff/`, `docs/logs/`（2026-07-25 以前の Vault 由来） |
| 過去の指示書・ブリーフ | `docs/cursor/instructions/`, `docs/cursor/briefs/`（historical） |

IPA Sound Drill は AI エージェント履歴を **GitHub リポ内に公開**する戦略を維持する（`thinkgrindai` の Obsidian 内保持とは異なる方針）。

## 11. 実装委譲の判断（RULE#4a）

Issue が情報伝達漏れリスクを持つ場合（大規模ドキュメント/デザイン反映、または明らかに別セッションを要する場合）、Claude は issue-handler（非同期）vs 同一セッション ClaudeCode のどちらを使うか**提案する**。漏れリスクが無ければ Claude が自律的に判断する。

## 12. Bug 対応ループ

1. Bug Issue 完了時（実装エージェント）: PR マージ後（または同一 PR 内）に Issue 本文の「## 根本原因記録」テーブルと `docs/bug-knowledge.md` 末尾へ追記
2. 月次レビュー時（Naoya）: Opus に分析依頼
3. 分析結果に基づく改善（Claude）: governance docs へ反映提案

## 13. Branch 戦略

develop-first。全 PR の base は `develop`。`develop` → `main` のマージは Naoya の明示的指示で行う。Preview 環境（`ipa-sound-drill-git-develop-nkhippos-projects.vercel.app`）で状態を確認してから main へマージする運用。

| ブランチ | 役割 |
|---|---|
| `develop` | 全 PR の base。開発・確認用 |
| `main` | 本番デプロイ。Naoya の指示で develop からマージ |

## 14. Pre-Issue Recon（100 行超で推奨）

Claude が index.html 等の大ファイルを全量取得する代わりに、実装エージェントに現状調査だけを依頼する手法。適用条件: 影響ファイル 3 個以上かつ変更行数推定 100 行超、既存コード構造の把握が不十分、複数の設計選択肢がある場合。

1. Claude が Issue Comment で調査依頼（対象・調査項目・出力先 `docs/cursor/recon/pre-issue-recon-YYYYMMDD-<topic>.md`・中断条件を明記）
2. 実装エージェントが調査、Recon MD を出力しコミット+push
3. Claude が Recon MD を取得し、内容を反映した Issue 本文を作成 → Naoya 承認 → 起票 → 実装

## 15. 新規ドキュメント作成判定

Naoya が「〇〇について資料を作りたい」と相談したら、以下を判定する: ①一時的なメモ → Chat 内で完結、MD 化しない ②AI 実装レポート → `docs/agent-reports/` ③意思決定記録 → Obsidian 提案 ④将来スコープ → Issue に残す ⑤運用ルール → 該当ホーム（`docs/doc-map.md` 参照）に追記 or 新規 MD ⑥バグ → `docs/bug-knowledge.md`。新規 MD を作る場合、`docs/doc-map.md` §2 への行追加を Issue の完了条件に含める。

## 16. ルール変更時のセルフチェック手順

`CLAUDE.md` / `docs/workflow.md` / `docs/guardrails.md` / `docs/change-classification.md` / `.cursor/rules/dev-flow.mdc` / `AGENTS.md` / `.github/ISSUE_TEMPLATE/*` を編集する際、Claude は必ず以下を踏む:

1. **変更前 grep**: 変更する概念・キーワードが他ホームにも書かれていないか確認（例: `grep -nE 'base|main|develop' CLAUDE.md docs/*.md .cursor/rules/*.mdc`）
2. **連動更新の確認**: `CLAUDE.md` 変更 → router 反映漏れ、開発フロー変更 → 番号体系の整合、Bug 運用変更 → `docs/bug-knowledge.md` / `.github/ISSUE_TEMPLATE/bug.md`
3. **変更後 grep 再確認**: 旧記述が消えているか、矛盾するペアが無いか
4. **Issue 本文への記録**: 変更前後の対比、grep コマンドと出力、連動更新した他ファイルへの参照を含める

## 17. 返答末尾テンプレ（Claude チャット応答時）

要件整理・議論・仕様作成を行った返答の末尾には以下を付ける:

```
✅ この会話での確定事項
・(箇条書き)

📋 次のアクション（Naoya さんがやること）
1. 【ツール名】具体的な作業内容

🔧 Claude が次に用意するもの（あれば）
・(次の会話で Claude が作成するもの)
```

判断を求める場合は案 α（推奨）/ β / γ 形式（理由・メリデメ付き）で提示し、Naoya の価値観に照らして判断できない場合はその旨を明示する。憶測ベースの推奨は禁止。

## 18. Cursor 固有ノート

`.cursor/rules/dev-flow.mdc` は Cursor 自動読込用の薄い参照スタブ。実体は本ファイル。Step 2（設計懸念点検コメント）のフォーマット（ヘッダー `🛠️ **<agent> より**` / セクション構成: カテゴリ A 解釈確定要 / カテゴリ B UX・運用懸念 / 判定）は agent-agnostic（Codex/Cursor/Claude Code 共通）。

---

_旧 `docs/dev-common.md` / `docs/claude-collaboration.md` / `docs/agent-instruction-guide.md`、および `CLAUDE.md`（router 化前版、`git show ad4dd1e:CLAUDE.md`）の開発フロー・Issue 起票節を整理継承。_
