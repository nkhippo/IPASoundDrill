---
id: pj-2026-07-12-c704
aliases:
- pj-2026-07-12-c704
title: Docs infrastructure overhaul — 実装レポート
created: '2026-07-12'
---

# Docs infrastructure overhaul — 実装レポート

## 関連 Issue / PR

- Issue: #20
- PR: #21

## Issue 背景（Issue 本文から要約）

Day 4-5 の壁打ちで、Naoya さんから「MCP からデータ構造を辿れるようにしたい」「既存 `REPOSITORY-STRUCTURE.md` を最新化したい」「ドキュメント分類と更新義務を整えたい」「Cursor Haiku でも同等品質で docs 刷新できるようにしたい」「Issue 背景を事細かに書いて発信素材化したい」という複数要望が出た。単発対応ではなく、DOCUMENT-MAP / DEV-GUARDRAILS / DOC-SYNC-PLAYBOOK / CURSOR-INSTRUCTION-GUIDE の新設と、CLAUDE.md・REPOSITORY-STRUCTURE・docs/README の拡張を一括で整備する docs infrastructure Issue として実施した。

## 実装内容

- 新規追加 4 ファイル: DOCUMENT-MAP.md, DEV-GUARDRAILS.md, DOC-SYNC-PLAYBOOK.md, CURSOR-INSTRUCTION-GUIDE.md（Issue 完成形とバイト一致）
- 既存編集 3 ファイル: CLAUDE.md, REPOSITORY-STRUCTURE.md, docs/README.md
- Rule 1（機械置換）と Rule 2（意図的編集）をコミット分離
- REPOSITORY-STRUCTURE.md の JS map セクションを初回作成（index.html 全スキャン結果反映、主要 88 関数を 10 グループに分類）

## 変更ファイル

```
- docs/DOCUMENT-MAP.md (A)
- docs/DEV-GUARDRAILS.md (A)
- docs/DOC-SYNC-PLAYBOOK.md (A)
- docs/CURSOR-INSTRUCTION-GUIDE.md (A)
- CLAUDE.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/README.md (M)
- docs/cursor/reports/cursor-implementation-report-docs-infrastructure-overhaul.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショット、全 335 ファイルの md5 記録
- Phase A: 新規 4 MD 追加、既存 0 件変更を md5 で確認
- Phase B Rule 1: 機械置換、対象 2 ファイルのみ変更を確認
- Phase B Rule 2: 意図的編集、ホワイトリスト 3 ファイルのみ変更を確認
- Phase C: 実装レポート追加、他ファイル変更 0 件を確認
- 自己判断による追加変更: 0 件
- 補足: Rule 1 事前 grep で `docs/` 配下に歴史的な「GitHub Pages」記述が 58 件（SPECIFICATION / cursor reports 等）。本 Issue 非対象のため未変更

## 動作確認

- Markdown レンダリング（GitHub Web UI）: 全 7 ファイル OK（PR 上で確認想定）
- 相互参照リンク: DOCUMENT-MAP ⇔ DEV-GUARDRAILS ⇔ DOC-SYNC-PLAYBOOK ⇔ CURSOR-INSTRUCTION-GUIDE を配置
- CLAUDE.md の新ルール: 起動時必須動作 / Issue 背景 / 起票時 / 対応時 / 参照ドキュメント明示
- REPOSITORY-STRUCTURE.md の JS map: 88 個記録（初期化・モード・判定・TTS・i18n・アクセント・語彙・Reveal・進捗・その他）
- 既存機能への影響: なし（index.html、data/、gas/、i18n/、fonts/ 全て未変更）

## 実装過程での気づき

- index.html の `function` / `const x = (` パターンは約 230 件。Issue 指示のグループに合わせて主要 88 関数に絞り、行番号付き表にした（全件列挙は Cursor Haiku の推論負荷を上げるため）
- `reveal` は Reveal グループと判定グループの双方で参照価値があるため、判定・解答処理と Reveal の両方に掲載
- CLAUDE.md には Issue 記載の「既存：起動時の必須動作」セクションがリポ上に無かったため、変更後内容を新セクションとして追加（Chat 側 Project Knowledge 由来の記述をリポへ定着）
- DOC-SYNC-PLAYBOOK の `code_ref` / `Last synced with code` は新規 MD・新セクションに導入。既存 PURPOSE/DESIGN/SPEC への遡及付与は Issue K-3 スコープ

## 後続への影響

- Issue K-3（PURPOSE / DESIGN / SPECIFICATION 刷新）が本 PR 内 4 MD を参照して Cursor 主体で回せるようになった
- Issue F1 以降で REPOSITORY-STRUCTURE.md の JS map / i18n schema を参照した Cursor 指示書が書けるようになった
- Pre-Issue Recon 運用が可能になり、Claude のトークン消費削減が期待できる
- 次回 Chat 起動時に Claude は Category B の 5 ファイルを自動取得、把握時間短縮

## 残課題・申し送り

- Track B スコープ Issue K2（REPOSITORY-STRUCTURE.md の動的セクション自動生成）は保留
- Runtime infrastructure の Analytics 行は「Issue #19 で有効化予定」のまま（Issue 完成形準拠）。#19 完了後に DOC-SYNC で更新可
- 歴史的ドキュメント内の GitHub Pages 記述は未更新（意図的）
