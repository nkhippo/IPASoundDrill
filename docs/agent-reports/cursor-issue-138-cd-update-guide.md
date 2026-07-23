---
id: pj-2026-07-23-b558
aliases:
- pj-2026-07-23-b558
title: 'Place docs/claude-design/UPDATE-GUIDE.md (#138) — 実装レポート'
created: '2026-07-23'
---

# Place docs/claude-design/UPDATE-GUIDE.md (#138) — 実装レポート

## 関連 Issue / PR

- Issue: #138
- PR: #139（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #130 で Category F（CD 修正判定）を追加したが、CD 更新指示書の作成方法・セッション運用ルールは別ドキュメントに切り出す方針だった。本 Issue はその汎用ガイド `UPDATE-GUIDE.md` を `docs/claude-design/` に配置し、README からリンクする。

- **Complexity Level**: L1
- **Change Pattern**: C1 (Docs)
- **CD 修正判定**: 該当なし

## 実装内容

- `docs/claude-design/UPDATE-GUIDE.md` を提供ファイルどおり新規配置（md5 一致、セクション 1–9 確認）
- `docs/claude-design/README.md` にファイル構成行と「関連ドキュメント」リンクを追加

## 変更ファイル

```
- docs/claude-design/UPDATE-GUIDE.md (A)
- docs/claude-design/README.md (M)
- docs/agent-reports/cursor-issue-138-cd-update-guide.md (A)
```

## デグレ防止検証

- 変更範囲: ホワイトリスト 2 ファイル + 実装レポートのみ
- CD HTML / design-system / favicon / support.js は未変更
- 実装中の自己判断による追加変更: README ファイル構成表への `UPDATE-GUIDE.md` 行追加（発見性のため、リンクセクションと併記）
- 実装中に発覚した懸念: なし

## 動作確認

- [x] `UPDATE-GUIDE.md` に `## 1.`〜`## 9.` が存在
- [x] README に相対パス `./UPDATE-GUIDE.md` リンクあり
- [x] 運用ルール既存 4 項目は維持
- 既存機能への影響: なし
- データ整合性: 対象外

## 実装過程での気づき

- なし

## 後続への影響

- Category F「A. CD 修正必須」時に Claude が本ガイドに従って指示書を作成可能

## 残課題・申し送り

- なし

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 新規 MD 配置 + README リンク追記のみ

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1 (Docs)
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（claude-design README 軽微追記のみ）
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
