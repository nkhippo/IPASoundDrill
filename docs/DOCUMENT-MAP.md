---
id: pj-2026-07-12-4049
aliases:
- pj-2026-07-12-4049
title: DOCUMENT-MAP — IPA Sound Drill ドキュメント運用マップ
created: '2026-07-12'
---

# DOCUMENT-MAP — IPA Sound Drill ドキュメント運用マップ

> **Last updated**: 2026-07-23（Issue #130: Category F（CD 修正判定）を追加）
> **Purpose**: プロジェクト内の全ドキュメントと CD 修正判定を Category A-F に分類し、更新義務・参照タイミング・レビュー頻度を一枚で見られるようにする。
>
> **§ 4 縮約（2026-07-20, Issue #114）:** Category C/D 分離と Issue タイプ別の細分化テーブルを廃止し、全 Issue 共通の必須参照に統合。エージェント混在時代には起票時・実装時で同一 docs を読むケースが大半であり、トークン効率と判断コスト削減を優先した。

---

## 1. Category 定義

| Cat | 名称 | 参照タイミング | 更新義務 |
|---|---|---|---|
| **A** | 常時最新化義務 | 変更のたび | PR blocker（未更新はマージ不可） |
| **B** | Chat 起動時に必ず取得 | Claude セッション開始時 | CLAUDE.md にルール化 |
| **C** | Issue 起票時に参照 | Naoya + Claude で Issue 本文作成時 | 参照義務 |
| **D** | Issue 対応時に参照 | 実装エージェントが実装開始時 | 必読 |
| **E** | 定期レビュー | 月次 or ローンチ後 | Naoya さんが定期実施 |
| **F** | CD(Claude Design)修正判定 | UI 改修 Issue 起票時 | 改修分類ブロックに判定を明記 |

> **Note:** Category C と D は Issue #114 以降、§ 4 の「全 Issue 共通必須参照」に実質統合。Category 定義は履歴上の分類として § 2 に残す。

## 2. ドキュメント分類表

### Category A: 常時最新化義務

| ファイル | 更新トリガー | 更新責任者 |
|---|---|---|
| `AGENTS.md` (repo root) | 全エージェント共通運用規約・検証ルールの変更 | Claude が Issue で提案 → Naoya 承認 |
| `CLAUDE.md` | プロジェクトルール変更、AI 起動フロー変更 | Claude が Issue で提案 → Naoya 承認 |
| `.cursor/rules/dev-flow.mdc` | Cursor 開発ルール変更 | Naoya + Claude |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR 本文テンプレ構造の変更 | 該当 governance Issue |
| `.github/ISSUE_TEMPLATE/agent-task.md` | エージェント Issue テンプレの変更 | 該当 governance Issue |
| `docs/REPOSITORY-STRUCTURE.md` | ディレクトリ変更、新ファイル追加、Runtime infra 変更 | 変更 Issue の実装エージェント |
| `docs/LAUNCH-CHECKLIST.md` | Phase 進捗、Issue 起票・完了 | Issue 起票時と PR マージ時に更新 |
| `docs/OPERATIONS.md` | 運用手順変更（Vercel / GAS / DNS / Analytics 等） | 該当変更 Issue で同時更新 |
| `docs/README.md` | docs/ 配下のファイル追加・削除 | 該当変更 Issue で同時更新 |
| `data/README.md` | data/ 配下の役割変更 | 該当変更 Issue で同時更新 |
| `docs/DOCUMENT-MAP.md`（本ファイル） | 新規ドキュメント追加、Category 割当変更 | 新規ドキュメント作成時に Issue で更新 |
| `docs/CHANGE-CLASSIFICATION.md` | 分類軸変更、Pattern 追加、運用ルール調整 | Claude が Issue で提案 → Naoya 承認 |
| `docs/agent-instruction-guide.md` | 抽象度マトリックス・Recon 運用の変更 | Claude が Issue で提案 → Naoya 承認 |
| `docs/design/phase-1/screen-data-mapping.md` | Setup/プロフィール項目・LS キー・CEFR/IPA カバレッジ・`3c` 検索の変更 | Phase 1-C / 1-D / 1-E 等の該当 Issue |
| `docs/CSS-CONVENTIONS.md` | CSS 変数命名・`--legacy-*` 運用・Track A CSS 技術制約の変更 | 該当 CSS / Phase 1 UI Issue |
| `docs/agent-reports/README.md` | 実装レポート命名規則・対応エージェント種類の追加 | 変更 Issue の実装エージェント |
| `docs/agent-reports/TEMPLATE.md` | レポートテンプレの構造変更（Retrospective セクションの改変等） | Claude が Issue で提案 → Naoya 承認 |

### Category B: Chat 起動時に必ず取得

Claude セッション起動時、以下の順で MCP 経由取得:

1. Project Knowledge の `HANDOFF-*.md`
2. `CLAUDE.md`
3. `docs/REPOSITORY-STRUCTURE.md`
4. `docs/LAUNCH-CHECKLIST.md`
5. `docs/DOCUMENT-MAP.md`（本ファイル）

以降は Issue の性質に応じて Claude が判断して追加取得（§ 4 付録参照）。

### Category C: Issue 起票時に参照

Issue の性質に応じて Naoya + Claude が確認:

| 該当ケース | 参照ドキュメント |
|---|---|
| 機能追加・変更 | `docs/PURPOSE.md`, `docs/DESIGN.md`, `docs/SPECIFICATION.md`, `docs/REPOSITORY-STRUCTURE.md` |
| Phase 1 デザイン・LP・タグライン | `docs/design/tagline-candidates.md`, `docs/PURPOSE.md`（Personas & Learning Journey） |
| Phase 1 UI 実装（プロフィール / ドリル / 語彙・IPA ピッカー） | `docs/design/phase-1/screen-data-mapping.md`, `docs/design/phase-1/visual-tokens.md`, `docs/PURPOSE.md` v4.0, `docs/DESIGN.md`, `docs/SPECIFICATION.md` |
| 運用系変更 | `docs/OPERATIONS.md`, `docs/REPOSITORY-STRUCTURE.md` |
| バグ修正 | `docs/bug-knowledge.md`, `docs/SPECIFICATION.md` |
| ドキュメント整備 | `docs/DOCUMENT-MAP.md`, `docs/DEV-GUARDRAILS.md` |
| ローンチ進捗 | `docs/LAUNCH-CHECKLIST.md` |

### Category D: Issue 対応時に参照

§ 4「全 Issue 共通の必須参照」に統合（Issue #114）。個別ケースの追加参照は § 4 付録。

| ファイル | 参照タイミング | 備考 |
|---|---|---|
| `docs/claude-design/`（`README.md`, `design-system.dc.html`, `sp.dc.html`, `pc.dc.html`, `favicon.svg`, `support.js`, `update-log.md`） | UI 改修 Issue の実装開始時（必須） | UI/UX の正典。セクション ID（例: `#1a-ja`, `#3a`）で画面特定。CD 未配置の UI Issue は着手禁止（`CLAUDE.md` / `AGENTS.md`） |

### Category E: 定期レビュー

| ファイル | レビュー頻度 | 実施者 |
|---|---|---|
| `docs/bug-knowledge.md` | 月次（ローンチ後） | Naoya + Opus 分析 |
| `docs/PURPOSE.md` | 四半期 or 大きな方針変更時 | Naoya |
| `docs/agent-reports/` 群 | 月次（エージェント混在品質分析用。2026-07-20 以降の実装レポート正本） | Naoya + Claude |
| `docs/cursor/reports/` 群 | historical archive（2026-07-20 以前）。月次レビュー時は必要に応じ参照 | Naoya + Claude |
| `docs/cursor/recon/` 群 | UI/UX・インフラ調査時（Pre-Issue Recon）。段階 2 突合の入力。長期は Track B React 化の対応マップ | Naoya + Claude |
| `docs/agent-instruction-guide.md` の抽象度マトリックス | 月次（見積もり精度レビュー） | Naoya + Claude |

### Category F: CD(Claude Design)修正判定

UI 改修 Issue 起票時、Claude は必ず以下 3 分類のいずれに該当するかを判定し、Issue 本文の「改修分類」ブロックに **CD 修正判定** として明示する。

| 分類 | 状況 | 対応 |
|---|---|---|
| **A. CD 修正必須** | 実装が CD 準拠を目指すべきだが、CD が古い/不足 | CD 更新指示書作成 → CD 更新 PR → UI 改修 Issue の順 |
| **B. CD 意図的乖離** | 実装が CD と意図的に異なる(Phase 一時措置等) | UI 改修 Issue 内に「CD 意図的乖離」セクションで明記 |
| **C. CD 修正不要** | CD が最新と一致 | UI 改修 Issue のみ起票 |

CD 更新指示書の作成ルール、多言語対応方針、セッション運用ルールは `docs/claude-design/UPDATE-GUIDE.md` を参照(配置後)。

CD 修正判定は、Docs 改修(C1)や Bug 修正(C2)など UI に影響しない Issue では「該当なし」と記載する。

## 3. 新規ドキュメント作成判定フロー

Naoya さんが Chat で「〇〇について資料を作りたい」または「〇〇について整理したい」と相談した場合、Claude は以下のフローで判定する:

```
1. 内容が「一時的なメモ / 個別議論」
   → Chat 内で完結、MD 作成しない

2. 内容が「AI エージェント実装レポート」
   → docs/agent-reports/ に配置（命名: <agent>-issue-<N>-<slug>.md）
   → README.md / TEMPLATE.md は Category A。個別レポート本体は Category E（月次レビュー）
   ※ docs/cursor/reports/ は 2026-07-20 以前の historical archive。新規配置先ではない

3. 内容が「意思決定記録」
   → Obsidian の decisions/ に配置提案、Category 対象外

4. 内容が「Track B スコープ」
   → track-b ラベル Issue に残す、MD 化保留

5. 内容が「Runtime infra / 運用ルール」
   → OPERATIONS.md に追記 or 単独 MD で Category A

6. 内容が「AI 参照ドキュメント」
   → 単独 MD で Category A/B、DOCUMENT-MAP.md に追加

7. 内容が「バグ / トラブルシューティング」
   → bug-knowledge.md に追記、Category E
```

新規 MD を作る判断になった場合、以下を Naoya さんと合意:

- Category (A-F) 判定
- 更新トリガー
- 更新責任者
- レビュー頻度（Category E の場合）

合意後、Issue 本文に以下を含める:

- 該当 MD の新規追加（Phase A、堅固化パターン A）
- `docs/DOCUMENT-MAP.md` の更新（新規 MD 行を § 2 に追加、Phase B、堅固化パターン B）
- `docs/README.md` の索引更新（Phase B、堅固化パターン B）

## 4. 全 Issue 共通の必須参照

Issue 起票時・実装時を問わず、**すべての Issue** で以下を参照する（Category C/D 統合、Issue #114）:

| ドキュメント | 役割 |
|---|---|
| `AGENTS.md` | 絶対厳守事項、改修分類、PR/レポート/検証ルールの正本 |
| `docs/CHANGE-CLASSIFICATION.md` | Complexity Level × Change Pattern 判定 |
| `docs/REPOSITORY-STRUCTURE.md` | ホワイトリスト、Runtime contract、directory tree |
| `docs/DEV-GUARDRAILS.md` | 堅固化パターン、md5 検証、自己判断禁止 |
| `docs/DOCUMENT-MAP.md` | 本ファイル（Category 更新義務の確認） |
| Issue 本文 | 完了定義・スコープ・改修分類ブロックの正本 |

### 付録: 特定タイプで追加参照

| 条件 | 追加で読むもの |
|---|---|
| `feature`（機能追加・UI 変更） | `docs/PURPOSE.md`, `docs/DESIGN.md`, `docs/SPECIFICATION.md` |
| `feature`（Runtime infra） | `docs/OPERATIONS.md` |
| `bug` | `docs/bug-knowledge.md`, `docs/SPECIFICATION.md` |
| `docs` | `docs/DOC-SYNC-PLAYBOOK.md`, `docs/agent-instruction-guide.md` |
| `chore`（運用） | `docs/OPERATIONS.md` |
| `chore`（手動タスク） | `docs/LAUNCH-CHECKLIST.md` |
| Phase 1 UI / デザイン | `docs/design/` 配下の該当ファイル |
| UI 改修（視覚仕様・CD 準拠） | `docs/claude-design/`（正典）。`docs/design/` はブリーフ・マッピング補助 |
| Cursor 実装 | `.cursor/rules/dev-flow.mdc`（Cursor 固有。他 agent は不要） |

## 5. 運用の継続性

このマップは以下の運用で維持される:

- 新規 Issue で新ドキュメント追加時、必ず本ファイル § 2 の該当 Category 表に追加
- Category 変更時、必ず本ファイルを更新
- 月次で Category A のリストを Naoya さんが確認、実態と乖離がないか点検
- CI での自動チェック（新規 MD 追加時に本ファイル未更新なら CI failure）は Track B スコープ
