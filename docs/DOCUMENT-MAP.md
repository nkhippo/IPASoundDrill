---
id: pj-2026-07-12-4049
aliases:
- pj-2026-07-12-4049
title: DOCUMENT-MAP — IPA Sound Drill ドキュメント運用マップ
created: '2026-07-12'
---
# DOCUMENT-MAP — IPA Sound Drill ドキュメント運用マップ

> **Last updated**: 2026-07-16
> **Purpose**: プロジェクト内の全ドキュメントを Category A-E に分類し、更新義務・参照タイミング・レビュー頻度を一枚で見られるようにする。

---

## 1. Category 定義

| Cat | 名称 | 参照タイミング | 更新義務 |
|---|---|---|---|
| **A** | 常時最新化義務 | 変更のたび | PR blocker（未更新はマージ不可） |
| **B** | Chat 起動時に必ず取得 | Claude セッション開始時 | CLAUDE.md にルール化 |
| **C** | Issue 起票時に参照 | Naoya + Claude で Issue 本文作成時 | 参照義務 |
| **D** | Issue 対応時（Cursor 実装時）に参照 | Cursor 指示書内でリンク・言及 | Cursor 必読 |
| **E** | 定期レビュー | 月次 or ローンチ後 | Naoya さんが定期実施 |

## 2. ドキュメント分類表

### Category A: 常時最新化義務

| ファイル | 更新トリガー | 更新責任者 |
|---|---|---|
| `CLAUDE.md` | プロジェクトルール変更、AI 起動フロー変更 | Claude が Issue で提案 → Naoya 承認 |
| `.cursor/rules/dev-flow.mdc` | Cursor 開発ルール変更 | Naoya + Claude |
| `docs/REPOSITORY-STRUCTURE.md` | ディレクトリ変更、新ファイル追加、Runtime infra 変更 | 変更 Issue の Cursor 実装内で更新 |
| `docs/LAUNCH-CHECKLIST.md` | Phase 進捗、Issue 起票・完了 | Issue 起票時と PR マージ時に更新 |
| `docs/OPERATIONS.md` | 運用手順変更（Vercel / GAS / DNS / Analytics 等） | 該当変更 Issue で同時更新 |
| `docs/README.md` | docs/ 配下のファイル追加・削除 | 該当変更 Issue で同時更新 |
| `data/README.md` | data/ 配下の役割変更 | 該当変更 Issue で同時更新 |
| `docs/DOCUMENT-MAP.md`（本ファイル） | 新規ドキュメント追加、Category 割当変更 | 新規ドキュメント作成時に Issue で更新 |
| `docs/CHANGE-CLASSIFICATION.md` | 分類軸変更、Pattern 追加、運用ルール調整 | Claude が Issue で提案 → Naoya 承認 |

### Category B: Chat 起動時に必ず取得

Claude セッション起動時、以下の順で MCP 経由取得:

1. Project Knowledge の `HANDOFF-*.md`
2. `CLAUDE.md`
3. `docs/REPOSITORY-STRUCTURE.md`
4. `docs/LAUNCH-CHECKLIST.md`
5. `docs/DOCUMENT-MAP.md`（本ファイル）

以降は Issue の性質に応じて Claude が判断して追加取得（Category C）。

### Category C: Issue 起票時に参照

Issue の性質に応じて Naoya + Claude が確認:

| 該当ケース | 参照ドキュメント |
|---|---|
| 機能追加・変更 | `docs/PURPOSE.md`, `docs/DESIGN.md`, `docs/SPECIFICATION.md`, `docs/REPOSITORY-STRUCTURE.md` |
| Phase 1 デザイン・LP・タグライン | `docs/design/tagline-candidates.md`, `docs/PURPOSE.md`（Personas & Learning Journey） |
| 運用系変更 | `docs/OPERATIONS.md`, `docs/REPOSITORY-STRUCTURE.md` |
| バグ修正 | `docs/bug-knowledge.md`, `docs/SPECIFICATION.md` |
| ドキュメント整備 | `docs/DOCUMENT-MAP.md`, `docs/DEV-GUARDRAILS.md`（本 Issue のような場合） |
| ローンチ進捗 | `docs/LAUNCH-CHECKLIST.md` |

### Category D: Issue 対応時（Cursor 実装時）に参照

Cursor 指示書内で明示的に参照させるドキュメント:

| ファイル | Cursor での役割 |
|---|---|
| `docs/REPOSITORY-STRUCTURE.md` | ホワイトリスト・ブラックリスト決定の基礎、影響ファイル特定 |
| `.cursor/rules/dev-flow.mdc` | Cursor 標準開発ルール |
| `docs/DEV-GUARDRAILS.md` | 堅固化パターン A/B、md5 検証、自己判断禁止事項 |
| `docs/DOC-SYNC-PLAYBOOK.md` | ドキュメント同期作業時の 3 分岐マトリックス |
| `docs/CURSOR-INSTRUCTION-GUIDE.md` | Cursor 実装レポートテンプレート、抽象度ガイド |
| 該当機能の `DESIGN.md` / `SPECIFICATION.md` | 実装意図の確認 |
| `docs/design/` | Phase 1 デザイン入力（タグライン・ペルソナ要約の公開版） |

### Category E: 定期レビュー

| ファイル | レビュー頻度 | 実施者 |
|---|---|---|
| `docs/bug-knowledge.md` | 月次（ローンチ後） | Naoya + Opus 分析 |
| `docs/PURPOSE.md` | 四半期 or 大きな方針変更時 | Naoya |
| `docs/cursor/reports/` 群 | 月次（Cursor 品質分析用） | Naoya + Claude |
| `docs/cursor/recon/` 群 | UI/UX・インフラ調査時（Pre-Issue Recon）。段階 2 突合の入力。長期は Track B React 化の対応マップ | Naoya + Claude |
| `docs/CURSOR-INSTRUCTION-GUIDE.md` の抽象度マトリックス | 月次（見積もり精度レビュー） | Naoya + Claude |

## 3. 新規ドキュメント作成判定フロー

Naoya さんが Chat で「〇〇について資料を作りたい」または「〇〇について整理したい」と相談した場合、Claude は以下のフローで判定する:

```
1. 内容が「一時的なメモ / 個別議論」
   → Chat 内で完結、MD 作成しない

2. 内容が「Cursor 実装レポート」
   → docs/cursor/reports/ に配置、Category 対象外

3. 内容が「意思決定記録」
   → Obsidian の decisions/ に配置提案、Category 対象外

4. 内容が「Track B スコープ」
   → track-b ラベル Issue に残す、MD 化保留

5. 内容が「Runtime infra / 運用ルール」
   → OPERATIONS.md に追記 or 単独 MD で Category A

6. 内容が「AI 参照ドキュメント（Cursor 用 / Claude 用）」
   → 単独 MD で Category B/C/D、DOCUMENT-MAP.md に追加

7. 内容が「バグ / トラブルシューティング」
   → bug-knowledge.md に追記、Category E
```

新規 MD を作る判断になった場合、以下を Naoya さんと合意:

- Category (A-E) 判定
- 更新トリガー
- 更新責任者
- レビュー頻度（Category E の場合）

合意後、Issue 本文に以下を含める:

- 該当 MD の新規追加（Phase A、堅固化パターン A）
- `docs/DOCUMENT-MAP.md` の更新（新規 MD 行を § 2 に追加、Phase B、堅固化パターン B）
- `docs/README.md` の索引更新（Phase B、堅固化パターン B）

## 4. Issue タイプ別の必須参照リスト

Issue 起票時、Claude が Naoya さんに以下を提示:

| Issue タイプ | 必須参照 (Category C) |
|---|---|
| すべて | CHANGE-CLASSIFICATION.md（分類ブロック構築のため） |
| `feature` (機能追加) | PURPOSE, DESIGN, SPECIFICATION, REPOSITORY-STRUCTURE |
| `feature` (Runtime infra) | OPERATIONS, REPOSITORY-STRUCTURE |
| `bug` | bug-knowledge, SPECIFICATION |
| `docs` | DOCUMENT-MAP, DEV-GUARDRAILS |
| `chore` (運用) | OPERATIONS, REPOSITORY-STRUCTURE |
| `chore` (手動タスク) | LAUNCH-CHECKLIST |

Issue 対応時（Cursor 実装時）、Cursor に以下を明示的に読ませる:

| Issue タイプ | 必須参照 (Category D) |
|---|---|
| すべて | REPOSITORY-STRUCTURE, DEV-GUARDRAILS, .cursor/rules/dev-flow.mdc, CHANGE-CLASSIFICATION.md（分類ブロック確認・Retrospective 実施のため） |
| `docs` | 加えて DOC-SYNC-PLAYBOOK, CURSOR-INSTRUCTION-GUIDE |
| `feature` (機能追加) | 加えて DESIGN, SPECIFICATION |

## 5. 運用の継続性

このマップは以下の運用で維持される:

- 新規 Issue で新ドキュメント追加時、必ず本ファイル § 2 の該当 Category 表に追加
- Category 変更時、必ず本ファイルを更新
- 月次で Category A のリストを Naoya さんが確認、実態と乖離がないか点検
- CI での自動チェック（新規 MD 追加時に本ファイル未更新なら CI failure）は Track B スコープ
