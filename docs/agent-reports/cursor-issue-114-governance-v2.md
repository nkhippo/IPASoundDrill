---
id: pj-2026-07-21-a114
aliases:
- pj-2026-07-21-a114
title: 'governance v2: AGENTS.md 拡張・DOCUMENT-MAP § 4 縮約 (#114) — 実装レポート'
created: '2026-07-21'
---

# governance v2: AGENTS.md 拡張・DOCUMENT-MAP § 4 縮約 (#114) — 実装レポート

## 関連 Issue / PR

- Issue: #114
- PR: #116（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

2026-07-20 の Codex/Cursor 並行検証で、UI 動作検証・md5 baseline・scaffolding noise・PR template 重複・Step 2 agent 依存・DOCUMENT-MAP § 4 冗長・CURSOR-INSTRUCTION-GUIDE の agent 特化が課題として判明。governance v2 として Phase 1-5 を単一 PR で一括整合。L2 × C1 + C7。

## 実装内容

### Phase 1: `.github/` templates

- `.github/PULL_REQUEST_TEMPLATE.md` 新設（AGENTS.md 埋め込みテンプレを外出し）
- `.github/ISSUE_TEMPLATE/agent-task.md` 新設（改修分類ブロック pre-fill、classic `.md` 形式）

### Phase 2: AGENTS.md v2

- PR description template 本文削除 → `.github/PULL_REQUEST_TEMPLATE.md` 参照
- 新設: Runtime UI 動作検証 / md5 baseline 検証（DEV-GUARDRAILS § 2 参照）/ Scaffolding tool noise cleanup / Step 2 コメント format（agent-agnostic）

### Phase 3: DOCUMENT-MAP § 4 縮約

- Category C/D 分離テーブル廃止、全 Issue 共通必須参照（6 項目）+ 付録に縮小
- 縮約根拠を冒頭に注記

### Phase 4: agent-instruction-guide 化

- **オプション A 採用**: `docs/CURSOR-INSTRUCTION-GUIDE.md` → `docs/agent-instruction-guide.md` にリネーム、内容を agent-agnostic 化
- 旧パスに MOVED stub を残置（後方互換）
- CLAUDE.md / LAUNCH-CHECKLIST / CHANGE-CLASSIFICATION / DOC-SYNC-PLAYBOOK の参照を更新

### Phase 5: 正本 docs 整合（元 #100 相当）

- DOCUMENT-MAP: Category A に agent-reports / AGENTS.md / `.github/` templates 追加、Category E 更新、§ 3 ケース 2 汎用化
- REPOSITORY-STRUCTURE: Canonical 表・directory tree・Quick orientation・historical archive 注記
- docs/README: `agent-reports/` 索引追加
- DEV-GUARDRAILS: md5 baseline 必須明記（§ 2）

### 判断ポイントへの回答

1. **Issue template 形式**: classic `.md`（既存 feature/bug/docs と同型、改修分類の自由度）
2. **md5 baseline**: DEV-GUARDRAILS § 2 に手順追記、AGENTS.md は一行参照
3. **§ 4 共通必須**: AGENTS.md, CHANGE-CLASSIFICATION, REPOSITORY-STRUCTURE, DEV-GUARDRAILS, DOCUMENT-MAP, Issue 本文
4. **Phase 4**: オプション A（リネーム + agent-agnostic + stub）
5. **AGENTS.md 優先順位**: governance 層として独立（PURPOSE 系列には加えない）

## 変更ファイル

```
- .github/PULL_REQUEST_TEMPLATE.md (A)
- .github/ISSUE_TEMPLATE/agent-task.md (A)
- AGENTS.md (M)
- docs/DEV-GUARDRAILS.md (M)
- docs/DOCUMENT-MAP.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/README.md (M)
- docs/agent-instruction-guide.md (R from CURSOR-INSTRUCTION-GUIDE.md, M)
- docs/CURSOR-INSTRUCTION-GUIDE.md (A stub redirect)
- CLAUDE.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/CHANGE-CLASSIFICATION.md (M)
- docs/DOC-SYNC-PLAYBOOK.md (M)
- docs/agent-reports/cursor-issue-114-governance-v2.md (A)
```

## デグレ防止検証

- 変更範囲: governance docs + `.github/` metadata のみ
- 実装中の自己判断による追加変更: CLAUDE.md 等の参照パス更新（Phase 4 に伴う必須連動）
- 実装中に発覚した懸念: なし

## 動作確認

- [x] `.github/PULL_REQUEST_TEMPLATE.md` 新設
- [x] `.github/ISSUE_TEMPLATE/agent-task.md` 新設
- [x] AGENTS.md v2 の 4 セクション追加 + PR template 外出し
- [x] DOCUMENT-MAP § 4 縮約 + 冒頭注記
- [x] DOCUMENT-MAP Category A/E + § 3 ケース 2 更新
- [x] REPOSITORY-STRUCTURE / docs/README 更新
- [x] agent-instruction-guide 化（オプション A）
- [x] Runtime / i18n / URL 影響なし
- 既存機能への影響: なし
- データ整合性: 対象外

## 実装過程での気づき

- `.github/` templates は GitHub metadata であり C2（build tooling）には該当しない（Issue 判定どおり）
- historical `docs/cursor/reports/` は archive のためパス参照は更新せず

## 後続への影響

- 全エージェントが AGENTS.md v2 の検証ルール（ブラウザ確認・md5・scaffolding cleanup）に従う
- Track B React Phase 1 再実装 Issue は本 governance を前提に起票可能

## 残課題・申し送り

- `.cursor/rules/dev-flow.mdc` の Step 2 ヘッダーは Cursor 固有のまま（本 Issue スコープ外）。AGENTS.md が agent-agnostic 正本

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 複数 governance docs の横断更新だが Runtime/ビルド/構造転換なし。Phase 1-5 は単一 PR で完結し L3 昇格不要

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1, C7
- 実装中に追加が必要になった Pattern: なし
- Phase 1 `.github/` templates の C2 再検討: **非該当**（GitHub metadata、本番 build/deploy パイプラインではない）

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響あり（本 Issue 自体が Category A 更新）
- [x] 既存ファイルパスへの依存関係が壊れていない（旧パス stub 残置）

### Phase 分割の妥当性

- 想定 Phase 数: 5（Issue 定義どおり）
- 実際の Phase 数: 5（単一 PR 内で順次実施）
- 相互依存の発生有無: Phase 4→5 の参照更新のみ（想定内）

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 昇格・追加提案がある場合の詳細

なし
