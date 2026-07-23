---
id: pj-2026-07-23-26ac
aliases:
- pj-2026-07-23-26ac
title: 'Operational improvements (#145) — 実装レポート'
created: '2026-07-23'
---

# Operational improvements (#145) — 実装レポート

## 関連 Issue / PR

- Issue: #145
- PR: （作成時に記入）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #128 / PR #140 後の反映漏れ振り返りから、検証手段のない Rv・命令形指示・スクショなし意匠確認を構造的に防ぐ運用ルール 5 項目を整備する。L2 / C1 / Pattern A+B。Runtime・UI・ビルドへの影響なし。

## 実装内容

1. **`docs/dev_project_common.md` 新規配置** — Repo に未存在だったため Issue ホワイトリストどおり新規作成。§1 Rv（raw fetch + 標的 grep）、§2 宣言形と削除掃討 3 種、§3 受け入れアサーション、§4 UI PR スクショ必須を記載。Vault 正典の全量コピーはせず、#145 追加分を Repo から読める形にした
2. **`CLAUDE.md` / `AGENTS.md`** — C6 UI 改修のスクショ必須・FAIL 条件・実機並行・`dev_project_common.md` §4 参照を追記
3. **`docs/claude-design/DIVERGENCE.md`** — 既知乖離 6 行の初期表を新設
4. **`docs/claude-design/README.md`** — DIVERGENCE.md へのリンクを追加

## 変更ファイル

```
- docs/dev_project_common.md (A)
- CLAUDE.md (M)
- AGENTS.md (M)
- docs/claude-design/DIVERGENCE.md (A)
- docs/claude-design/README.md (M)
- docs/agent-reports/cursor-issue-145-ops-improvements.md (A)  # AGENTS.md 必須。Issue ホワイトリスト外だが実装レポート義務のため追加
```

## デグレ防止検証

- 変更は docs / governance のみ。Runtime data contract・`src/`・i18n・ビルドに未着手
- 実装中の自己判断による追加変更: Vault `dev_project_common.md` 全量の Repo 移植は見送り（#145 の 5 項目を満たす Repo 配置文書として新規作成）。DOCUMENT-MAP / REPOSITORY-STRUCTURE は Issue 非対象のため未更新
- 実装中に発覚した懸念: Issue は `docs/dev_project_common.md` を `(M)` と記載していたが origin/main に当該ファイルが無かった → `(A)` として新規作成

## 動作確認

完了定義対応:

1. `rg -n 'raw fetch|標的 grep|自己申告' docs/dev_project_common.md` — ヒットあり
2. `rg -n '宣言形|言及の掃討|受け入れアサーション' docs/dev_project_common.md` — ヒットあり
3. `rg -n 'スクショ|C6' CLAUDE.md AGENTS.md docs/dev_project_common.md` — ヒットあり
4. `docs/claude-design/DIVERGENCE.md` — ヘッダ + 既知乖離 6 データ行
5. `rg -n 'DIVERGENCE' docs/claude-design/README.md` — ファイル一覧 + 関連ドキュメントリンク
6. `rg -n 'Phase 1-F' docs/claude-design/DIVERGENCE.md` — SP guide `?` btn 行あり

- 既存機能への影響: なし（docs only）
- データ整合性: 対象外

## 実装過程での気づき

- Vault 側に同名の共通運用文書（約 483 行）が既にある。Repo 側は Cursor/Codex が読むための #145 追記分に絞った。Vault 正典への同期は Naoya / Claude 側の別作業になり得る
- Issue ホワイトリストに agent-report が無いが、`AGENTS.md` は全実装で `docs/agent-reports/` 必須のためレポートを同梱した

## 後続への影響

- 以後の UI Issue 起票で宣言形・受け入れアサーション・スクショ対象リストが義務化される（Claude 起票時）
- Claude Rv は raw+grep とスクショ有無で観点 13 を運用可能
- DIVERGENCE.md の TBD 行は PC UI / About SRS 文言 / Phase 1-F の後続 Issue で解消する

## 残課題・申し送り

- Vault `00_meta/operations/dev_project_common.md` への同一追記は本 PR スコープ外（ブラックリスト）
- DOCUMENT-MAP への `dev_project_common.md` / `DIVERGENCE.md` 登録は Issue 非対象。必要なら別 docs Issue

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: docs 5 ファイル相当の運用追記＋新規 MD。Runtime 影響なし。後続 Issue 起票テンプレに影響するため L2 のまま妥当

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（本 Issue は DOCUMENT-MAP 更新を非対象とした）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1（docs 一括）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
