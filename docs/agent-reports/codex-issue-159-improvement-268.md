---
id: pj-2026-07-24-issue159
aliases:
- pj-2026-07-24-issue159
title: 'Agent 運用ルール正典化 (#159) — 実装レポート'
created: '2026-07-24'
---

# Agent 運用ルール正典化 (#159) — 実装レポート

## 関連 Issue / PR

- Issue: #159
- PR: Draft PR（本レポート作成後に作成）
- Agent: codex
- Agent差異: Issueにready-forラベル指定なし。NaoyaからCodexへクラウド対応依頼があり、命名は実行agentに従った。

## Issue 背景（Issue 本文から要約）

PR #148 / #151 / #152 / #154 / #156 / #158で蓄積されたCursor / Codexの使い分けと、PR #158のNaoya-override実例を共通運用ルールへ正典化する。改善候補2 / 6 / 8を統合し、Scope外の自己判断変更と密接関連バグは事前相談を経る。L1 / C1、Category F = C。

## 実装内容

- §5「Agent 運用ルール」を§4と変更履歴の間へ追加
- Cursor想定 / Codex想定のdefault領域と実績PRを表形式で記載
- ready-for-cursor / ready-for-codexラベルとNaoya-overrideを明文化
- override時の透明性100%と実行agentに従うレポート命名を明文化
- Cursor自己判断によるScope外変更を避ける原則を追加
- scope密接関連バグの中断・Issue Comment・Naoya判断フローを追加
- 変更履歴にIssue #159と改善候補2 / 6 / 8統合を追加

## 変更ファイル

- docs/dev_project_common.md (M)
- docs/agent-reports/codex-issue-159-improvement-268.md (A)

## デグレ防止検証

- Phase 0: mainの既存§構造、PR #156 / #158 merge、PR #158 override記載を確認
- Phase 1–2: §5と変更履歴のみ追記
- Phase 3: mainとの差分が上記2ファイルだけであることをGitHub commit / tree比較で確認
- ブラックリスト / Runtime data contract: branch差分対象外のためblob完全不変
- 自己判断による追加変更: なし
- 実装中に発覚した懸念: なし

## 動作確認

| 受け入れアサーション | 結果 |
|---|---:|
| Cursor / Codex / ready-forラベル | 28 |
| Naoya-override / Naoya依頼 / agent変更 / 透明性100% | 9 |
| Agent想定領域 | 5 |
| 自己判断 / 密接関連バグ / 事前相談 | 13 |
| 2026-07-24 / Issue #159 | 1 |
| H2見出し | 7（変更前6、増加） |
| 既存§キーワード | 11（全て残置） |

- 既存機能への影響: なし（docsのみ）
- データ整合性: 対象外
- スクショ: 不要

## 実装過程での気づき

- PR #158レポートはIssue labelと実行agentの差異を明示しており、今回の透明性ルールの直接的な実例として利用できた。
- 現行文書にはPR #158のfont metrics基準が既に統合されており、新規§5を追加しても§1–4の構造を変更する必要はなかった。

## 後続への影響

- Issue起票・実行時にready-forラベルとdefault agent領域を共通基準として参照できる。
- agent変更と密接関連バグのScope拡張がIssue Comment / 実装レポートへ一貫して記録される。

## 残課題・申し送り

- なし

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 共通運用docs 1ファイルへの追記と必須レポート追加のみで、Runtime / schema / buildへの影響がない。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8パスへの影響なし
- [x] i18n schemaへの影響なし
- [x] URL構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI参照ドキュメントCategory Aはdev_project_commonのみ更新
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 5（Phase 0–4）
- 実際の Phase 数: 5（Phase 0–4）
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR作成可
- [ ] Level昇格提案
- [ ] Pattern追加提案

### 昇格・追加提案がある場合の詳細

なし
