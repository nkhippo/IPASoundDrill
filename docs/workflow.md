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

## 2a. Issue-first 原則（2026-07-29 追加）

**壁打ちから実装に移る際、Issue が起票されていなければ halt する**（`CLAUDE.md` halt トリガー (d)）。同一セッション内の ClaudeCode 実装であっても**例外なし**。

**platform 明示義務**（monorepo 化・EPIC #209 以降）: Issue 起票時、本文または `platform:web` / `platform:mobile` / `platform:shared` / `platform:tools` ラベルのいずれかで対象 platform を明示する。1 Issue で複数 platform に触れる場合は全て列挙する。未明示の Issue には `ready-for-cursor` を付与しない。

### なぜ必要か

2026-07-28〜29 の UI 改修セッション（PR #195〜#202）で、壁打ち→直接実装→PR という流れが常態化し、以下の問題が発生した:

1. **設計書（`docs/features/*.md`）が更新されない**: Issue の完了定義に spec 更新が含まれないため、実装と設計書が乖離
2. **変更の追跡が困難**: Issue 番号がないため、PR から「なぜこの変更をしたのか」の根拠が辿れない
3. **レビューの品質が低下**: Issue 本文のホワイトリスト・完了定義がないため、pr-reviewer が契約検証できない

### 壁打ちから実装への正規フロー

```
壁打ち（Naoya × Claude）
  ↓ 合意形成
Issue 起票（Claude が draft → Naoya 確認 → 起票）
  ↓ ready-for-cursor
実装（ClaudeCode 同一セッション or issue-handler 委譲）
  ↓
PR 作成（Closes #N 必須）
```

壁打ちが細かいラウンドで進む場合（例: UI フィードバック→修正→再フィードバック）、**ラウンドごとに個別 Issue を起票する必要はない**。1 つの Issue にまとめてよい。ただし、壁打ちで合意した内容を Issue 本文に落とし込んでから実装に着手すること。

### spec 同期の完了条件

UI 改修 Issue の完了定義には、影響を受ける `docs/features/<id>.md` の更新を含めること。spec が最新でない PR は pr-reviewer で指摘対象となる。

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
  - [ ] **テスト/検証コマンド**: 実行すべき検証（`tools/validate/validate_i18n.py`・再カウント等）を具体的に
  - [ ] **非対象範囲**: 触らない範囲を明示
  - [ ] **チャット由来の決定事項の明示**: 壁打ちで決めた前提・判断を Issue 本文に落とし込む（記憶・口頭に依存しない）
- **参照ドキュメントの明示**: Issue 本文に必要な参照ドキュメントを列挙する。判定は `CLAUDE.md` のタスク種別対応表 + `docs/doc-map.md` レジストリに従う
- **UI 仕様の参照**: 見た目の確認は Web は **Vercel branch preview URL**、Mobile は **実機・シミュレータ**で行う（CLAUDE.md §6 と整合）。UI 仕様の正本・確認手段の詳細・凍結フレームカタログの扱いは `docs/guardrails.md` §9 が正本。本ファイルではこれ以上重複記載しない（one-fact-one-home）。**外部 Claude Design(SaaS) の URL・zip・再開セッションは要求しない**(2026-07-28 に運用廃止)
- **ファイルホワイトリスト表現（monorepo 4 ゾーン、EPIC #209 以降）**: Issue 本文のファイルホワイトリストは、対象ファイルが 4 ゾーン（`apps/web/`, `apps/mobile/`, `packages/core/`, `tools/`）のどれに属するかを明示する。**ゾーン跨ぎの Issue は原則分割**する（本ファイル §3 分割 5 判断軸 ②に準拠）。例外として、`packages/core/` の契約変更に伴う `apps/web/` / `apps/mobile/` 双方の追随のような cohesive な一体変更は、単一 Issue で atomic に実施してよい（例外を選ぶ場合は Issue 本文にその理由を明記）。ゾーン跨ぎで halt が発生した場合は `CLAUDE.md` halt トリガー (c) に従う
- **Mobile 両プラットフォーム影響 or `packages/core` 公開 API 変更は Level 自動 L3**: 対象プラットフォームが iOS/Android 両方に及ぶ変更、または `packages/core` の公開 API を変更する Issue は、`docs/change-classification.md` §2 条件⑤により Level を自動的に L3 とする（起票者の裁量で L2 に留めない）
- **スクショ対象範囲（Web / Mobile 別記載義務）**: UI 改修 Issue でスクショ対象画面を指定する場合、Web 画面（ブラウザ / Vercel preview）と Mobile 画面（iOS / Android シミュレータ・実機）を別リストとして明示する。Mobile 実装が無い期間は「Mobile: 該当なし」と明記する
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

Level 段階化の内容（L1 セルフチェック / L2 `pr-reviewer` PASS / L3 フル Rv+md5+Naoya ack）は `docs/guardrails.md` §3 が正本。Mobile 両プラットフォーム影響 or `packages/core` 公開 API 変更は `docs/change-classification.md` §2 条件⑤により Level=L3 自動化のため、本表の auto-merge（L1/L2）対象にはならない。

**ゾーン別レビュー深度（monorepo 4 ゾーン、EPIC #209 以降）**: `packages/core/` の変更は、`apps/web/` と `apps/mobile/`（実装後）の**両方**への回帰確認を Issue の完了定義・PR の確認済み事項に含める（core は shared 契約のため、単一ゾーンの動作確認だけでは不十分）。`tools/` の変更（パイプライン・validate スクリプト）は生成物を消費する `packages/core/data` 経由で `apps/web` / `apps/mobile` 双方への影響有無を確認する。

### 自動 Rv → merge パイプライン（issue-handler PR）

issue-handler がマーカー付き PR を作成した後、オーケストレーション Claude（壁打ちセッション）は以下を**自動的に**実行する（Naoya の追加指示を待たない）:

```
issue-handler PR 作成
  ↓ 自動
pr-reviewer 起動（契約検証）
  ↓
┌─ PASS + L1/L2 → オーケストレーション Claude が gh pr merge --squash --delete-branch で auto-merge
│                  → Closes #N により Issue 自動クローズ
└─ PASS + L3    → Naoya に ack を求める（auto-merge しない）
  ↓
┌─ FAIL → issue-handler を再起動して指摘対応 → 修正後に pr-reviewer を再起動
└─（ループ: PASS まで繰り返し）
```

**前提条件**: auto-merge を実行するのはオーケストレーション Claude のみ。issue-handler / pr-reviewer は merge しない（各エージェント定義で禁止）。

運用上のラベル遷移:

| イベント | ラベル変化 |
|---|---|
| PR 作成 / 追加 push | `needs-review` が自動付与 |
| pr-reviewer PASS（L1/L2） | auto-merge 実行、`needs-review` 除去 |
| Naoya が承認コメント（`ok`/`lgtm`/`✅` 等） | `needs-review` 除去、auto-merge 実行（L3 含む） |
| Naoya が PR をマージ | `needs-review` 除去 |

**PR コメント対応の完了条件**（全エージェント共通）: 修正 commit / push だけで完了としない。①同じ PR の Conversation に結果コメントを投稿 ②「対応した指摘」「変更内容」「検証結果」「未解決事項（なければなし）」を記載 ③投稿後に ready for review 化・再レビュー依頼を行う。修正不要と判断した指摘にも理由を返信する。承認トリガーワードのみのコメント・CI bot 通知には返信不要。

**issue-handler-authored PR の自動対応**: マーカー `<!-- authored-by: issue-handler -->` 付き PR に Claude がレビューコメントを投稿したら、issue-handler が追加指示を待たず即対応する（Cursor/Codex 作成 PR は対象外、Naoya が別途指示）。

### Issue 自動クローズ

develop マージ時の Issue 自動クローズは GitHub 標準機能を利用する。PR 本文に `Closes #N` を記載し、`develop`（default branch）へのマージで自動クローズされる。`.github/workflows/approval.yml` の permissions に `issues: write` を含めること（欠落すると `github-actions[bot]` によるマージ時に自動クローズが発火しない）。

## 8. PR 作成ルール

- draft ではなく通常 PR（`main` 直 push は禁止、すべて PR 経由）
- PR タイトル: `feat:` / `fix:` / `chore:` / `docs:` + 内容 + `(#XXX)`
- PR 本文テンプレは `.github/PULL_REQUEST_TEMPLATE.md`（概要・変更内容・変更理由・確認済み事項・未確認懸念点・Complexity Retrospective 実施確認・`Closes #N`）
- develop 向け PR に `Closes #N` を記載する（develop マージ時に Issue をクローズする）
- **UI 改修 PR のスクショ必須（Change Pattern C6）**: ①Issue 本文のスクショ対象画面リスト全画面のスクショを PR Comment に添付 ②技術制約で添付できない場合は明記し、Naoya 実機検証を Rv の前提とする ③スクショ（または代替）無しの UI 改修 PR は pr-reviewer/Claude Rv で FAIL とする
- **PR 作成直後のセルフチェック**（PR #302 の `Closes` 漏れ landing）: `gh pr view <N> --json body,closingIssuesReferences` で ① 本文に `Closes #<N>` 行が存在する ② `closingIssuesReferences` が空配列でない — の 2 点を確認する。片方でも欠けている場合は `gh pr edit <N> --body` で本文を修正（Issue の手動 close 事後リカバリを避けるため）

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

## 13a. 新言語追加プロトコル（EPIC #297/#299/#301 で確立）

UI i18n の新規言語追加は runtime 契約 8 パスに触れる L3 変更（`docs/data-contract.md` §5）。以下を必ず踏む:

**1. EPIC 単位で Issue 起票**（Issue-first 原則、§2a）
- 1 EPIC につき 3–5 言語をまとめる（例: #297 Latin 3 / #299 CJK・Latin 3 / #301 non-Latin 4）
- Issue 本文に対象言語 code の一覧、`platform:web` ラベル、Complexity Level=L3 を明記

**2. データ完成の順序**
- (a) `packages/core/i18n/<lang>.json` を `en.json` 400 leaves と 1:1 で作成（[A] check 必須）
- (b) `packages/core/i18n/phonemes/<lang>.json` は任意（未提供でも build 時に `readI18nWithFallback` で en fallback、Issue #297 baseline）
- (c) 音素の gloss / `connected_speech.<lang>.gloss` / `weak_forms.<lang>.cs_rule` / `guide.<lang>` は独立 backlog（現状 6 言語のみ、Issue #303 で 8 言語追加を検討）

**3. コード側の連動更新（見落とし頻発）**
- `apps/web/src/index.template.html` の `LANG_CODE_MAP`（言語切替チップ表示）— 追加漏れは全ユーザーで "EN" フォールバック表示になる（#306 教訓）
- `apps/web/scripts/build-i18n-html.js` の言語配列（build ターゲット）
- `apps/web/middleware.ts` / hreflang / sitemap の言語ルーティング
- Chip 命名規約: Latin 2–3 文字大文字（`ES` / `PT` / `VI`）。CJK 曖昧回避のみ native char（`簡` / `繁`）

**4. docs 反映（差分マージ、本 PR で漏らさない）**
- `docs/data-contract.md` §1 / §3 / §5 / §6 / §7 の言語数・列挙・整合性チェック行
- `docs/repo-map.md` 生成物リスト・build script 説明
- `docs/guardrails.md` L3 md5 対象言語数・[A] check 説明

**5. 検証（完了定義）**
- `python3 tools/validate/validate_i18n.py` PASS（[A]/[C]/[G]/[H]/[I] 全緑、[B] は subset 緩和）
- Vercel Preview URL で `/<lang>/` を全新言語目視確認（chip 表示 / 言語切替 dropdown / 主要画面のかな残留・placeholder 崩れ・HTML タグ）
- md5 一致確認: `packages/core/i18n/*.json` → build 後 `apps/web/public/i18n/*.json`

## 14. Pre-Issue Recon（100 行超で推奨）

Claude が `apps/web/src/index.template.html` 等の大ファイルを全量取得する代わりに、実装エージェントに現状調査だけを依頼する手法。適用条件: 影響ファイル 3 個以上かつ変更行数推定 100 行超、既存コード構造の把握が不十分、複数の設計選択肢がある場合。

1. Claude が Issue Comment で調査依頼（対象・調査項目・出力先 `docs/cursor/recon/pre-issue-recon-YYYYMMDD-<topic>.md`・中断条件を明記）
2. 実装エージェントが調査、Recon MD を出力しコミット+push
3. Claude が Recon MD を取得し、内容を反映した Issue 本文を作成 → Naoya 承認 → 起票 → 実装

**monorepo 化後の出力先（変更なし）**: Recon MD の出力先は `docs/cursor/recon/` のまま維持する（EPIC #209 の monorepo 物理移設は `docs/**` を対象外としたため、Recon の置き場所自体は変わらない）。調査対象パスの記述のみ 4 ゾーン（`apps/web/`, `apps/mobile/`, `packages/core/`, `tools/`）を踏まえて具体化する。

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
