---
id: pj-2026-07-10-d270
aliases:
- pj-2026-07-10-d270
title: '`docs/` — ドキュメント索引（AI / 開発者向け）'
created: '2026-07-10'
---

> Last updated: 2026-07-20（Issue #114: governance v2、`agent-reports/` 索引追加）

# `docs/` — ドキュメント索引（AI / 開発者向け）

アプリの**正本仕様**と**タスク履歴**を分離して格納する。ブラウザからは fetch されない。

## 最初に読むファイル

| 優先 | ファイル | 何が書いてあるか |
|:---:|----------|------------------|
| 1 | [[pj-2026-07-09-80be|`REPOSITORY-STRUCTURE.md`]] | フォルダマップ・パイプライン手順・ランタイム契約（**Claude 共有用の入口**） |
| 2 | [[pj-2026-06-24-933a|`PURPOSE.md`]] | 目的・2モード・評価方針の正本 |
| 3 | [[pj-2026-06-24-1983|`DESIGN.md`]] | 実装設計（SRS・TTS・データ整備タスク） |
| 4 | [[pj-2026-06-24-1519|`SPECIFICATION.md`]] | 画面・JSON フィールド・localStorage の正本 |

**衝突時:** `PURPOSE.md` → `DESIGN.md` → `SPECIFICATION.md`（governance は repo root `AGENTS.md`）

## 運用ルール

以下のドキュメントは AI 協業と運用継続のための必読ガイド:

| ファイル | 何が書いてあるか |
|---|---|
| [[pj-2026-07-12-4049|`DOCUMENT-MAP.md`]] | 全ドキュメントの分類（Category A-E）と参照タイミング |
| [[pj-2026-07-12-fae7|`DEV-GUARDRAILS.md`]] | 堅固化パターン A/B、エージェント自己判断禁止事項 |
| [[pj-2026-07-12-c324|`DOC-SYNC-PLAYBOOK.md`]] | ソース ⇔ ドキュメント同期の 3 分岐マトリックス |
| [[pj-2026-07-12-3141|`agent-instruction-guide.md`]] | 指示の抽象度マトリックス、Pre-Issue Recon 運用 |

**Chat 起動時、Claude は Category B の以下を必ず取得**:
1. `HANDOFF-*.md`（Project Knowledge）
2. `CLAUDE.md`（リポルート）
3. `REPOSITORY-STRUCTURE.md`
4. `LAUNCH-CHECKLIST.md`
5. `DOCUMENT-MAP.md`

## サブフォルダ

| フォルダ | 役割 | README |
|----------|------|--------|
| [`agent-reports/`](agent-reports/) | AI エージェント（Codex / Cursor / Claude Code 等）の実装レポート統合（2026-07-20 以降の正本）。規約は repo root `AGENTS.md` | [`agent-reports/README.md`](agent-reports/README.md) |
| [`cursor/`](cursor/) | 指示書・設計ブリーフ・recon。`reports/` は historical archive（2026-07-20 以前） | [[pj-2026-07-10-a25d|`cursor/README.md`]] |
| [`design/`](design/) | Phase 1 デザイン入力・画面×データマッピング（例: `phase-1/screen-data-mapping.md`） | — |
| [`reference/`](reference/) | 監査・運用ガイド・意思決定メモ（人間＋AI 参照） | [[pj-2026-07-09-77a4|`reference/README.md`]] |
| [`testing/`](testing/) | 手動テストチェックリスト | — |
| [`archive/`](archive/) | 旧ドキュメント退避 | — |

## 現行スナップショット（2026-07-10）

- 語彙 **5,397**（B2=899、Phase 2 M2 完了）
- UI i18n **177 キー** × 6 言語（`vocab.back`・複合 POS `形容詞 / 副詞 / 間投詞` 含む）
- 語彙ブラウザ: 独立ページ `#vocabPage`（hash `#/vocab` / `#/vocab/phrases`）
- Phase R（RP パイプライン）— [[pj-2026-07-10-183d|`cursor/reports/cursor-implementation-report-phase-r.md`]]
- Phase T（TTS 1問目遅延・`?urls=1`）— [[pj-2026-07-10-0b3f|`cursor/reports/cursor-implementation-report-phase-t.md`]]
- Phase V（語彙ページ化）— [[pj-2026-07-10-6487|`cursor/reports/cursor-implementation-report-phase-v.md`]]
- Phase B（Phase 2 バッチ品質監査）— [[pj-2026-07-10-1069|`cursor/reports/cursor-implementation-report-phase-b-batch-audit.md`]]
- **手動残作業（GAS 再デプロイ等）:** [[pj-2026-07-10-dd2c|`reference/remaining-ops-checklist.md`]]
- 本番: https://ipasounddrill.app/（Vercel + カスタムドメイン、詳細は [[pj-2026-07-11-71a7|`OPERATIONS.md`]] § 1）

## 人間向け概要

ルートの [[pj-2026-06-24-2cd9|`README.md`]]（デモ URL・ローカル起動）も参照。
