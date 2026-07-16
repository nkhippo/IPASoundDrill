---
id: pj-2026-07-10-d270
aliases:
- pj-2026-07-10-d270
title: '`docs/` — ドキュメント索引（AI / 開発者向け）'
created: '2026-07-10'
---
> Last updated: 2026-07-12（Phase 3.5 完了、DOCUMENT-MAP.md / DEV-GUARDRAILS.md / DOC-SYNC-PLAYBOOK.md / CURSOR-INSTRUCTION-GUIDE.md 追加）

# `docs/` — ドキュメント索引（AI / 開発者向け）

アプリの**正本仕様**と**タスク履歴**を分離して格納する。ブラウザからは fetch されない。

## 最初に読むファイル

| 優先 | ファイル | 何が書いてあるか |
|:---:|----------|------------------|
| 1 | [`REPOSITORY-STRUCTURE.md`](REPOSITORY-STRUCTURE.md) | フォルダマップ・パイプライン手順・ランタイム契約（**Claude 共有用の入口**） |
| 2 | [`PURPOSE.md`](PURPOSE.md) | 目的・2モード・評価方針の正本 |
| 3 | [`DESIGN.md`](DESIGN.md) | 実装設計（SRS・TTS・データ整備タスク） |
| 4 | [`SPECIFICATION.md`](SPECIFICATION.md) | 画面・JSON フィールド・localStorage の正本 |

**衝突時:** `PURPOSE.md` → `DESIGN.md` → `SPECIFICATION.md`

## 運用ルール

以下のドキュメントは AI 協業と運用継続のための必読ガイド:

| ファイル | 何が書いてあるか |
|---|---|
| [`DOCUMENT-MAP.md`](DOCUMENT-MAP.md) | 全ドキュメントの分類（Category A-E）と参照タイミング |
| [`DEV-GUARDRAILS.md`](DEV-GUARDRAILS.md) | 堅固化パターン A/B、Cursor 自己判断禁止事項、実装レポートテンプレート |
| [`DOC-SYNC-PLAYBOOK.md`](DOC-SYNC-PLAYBOOK.md) | ソース ⇔ ドキュメント同期の 3 分岐マトリックス |
| [`CURSOR-INSTRUCTION-GUIDE.md`](CURSOR-INSTRUCTION-GUIDE.md) | Cursor 指示の抽象度マトリックス、Pre-Issue Recon 運用 |

**Chat 起動時、Claude は Category B の以下を必ず取得**:
1. `HANDOFF-*.md`（Project Knowledge）
2. `CLAUDE.md`（リポルート）
3. `REPOSITORY-STRUCTURE.md`
4. `LAUNCH-CHECKLIST.md`
5. `DOCUMENT-MAP.md`

## サブフォルダ

| フォルダ | 役割 | README |
|----------|------|--------|
| [`cursor/`](cursor/) | Cursor / Claude の指示書・実装レポート・設計ブリーフ | [`cursor/README.md`](cursor/README.md) |
| [`reference/`](reference/) | 監査・運用ガイド・意思決定メモ（人間＋AI 参照） | [`reference/README.md`](reference/README.md) |
| [`testing/`](testing/) | 手動テストチェックリスト | — |
| [`archive/`](archive/) | 旧ドキュメント退避 | — |

## 現行スナップショット（2026-07-10）

- 語彙 **5,397**（B2=899、Phase 2 M2 完了）
- UI i18n **177 キー** × 6 言語（`vocab.back`・複合 POS `形容詞 / 副詞 / 間投詞` 含む）
- 語彙ブラウザ: 独立ページ `#vocabPage`（hash `#/vocab` / `#/vocab/phrases`）
- Phase R（RP パイプライン）— [`cursor/reports/cursor-implementation-report-phase-r.md`](cursor/reports/cursor-implementation-report-phase-r.md)
- Phase T（TTS 1問目遅延・`?urls=1`）— [`cursor/reports/cursor-implementation-report-phase-t.md`](cursor/reports/cursor-implementation-report-phase-t.md)
- Phase V（語彙ページ化）— [`cursor/reports/cursor-implementation-report-phase-v.md`](cursor/reports/cursor-implementation-report-phase-v.md)
- Phase B（Phase 2 バッチ品質監査）— [`cursor/reports/cursor-implementation-report-phase-b-batch-audit.md`](cursor/reports/cursor-implementation-report-phase-b-batch-audit.md)
- **手動残作業（GAS 再デプロイ等）:** [`reference/remaining-ops-checklist.md`](reference/remaining-ops-checklist.md)
- 本番: https://ipasounddrill.app/（Vercel + カスタムドメイン、詳細は [`OPERATIONS.md`](OPERATIONS.md) § 1）

## 人間向け概要

ルートの [`README.md`](../README.md)（デモ URL・ローカル起動）も参照。
