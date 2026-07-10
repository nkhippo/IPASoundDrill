# `docs/cursor/` — Cursor / Claude タスク履歴

AI エージェント向けの**作業指示・実装レポート・設計相談**を格納。アプリ runtime（`index.html`）からは参照されない。

## このフォルダの使い分け

| Subfolder | ファイル名パターン | いつ読むか |
|-----------|-------------------|------------|
| [`instructions/`](instructions/) | `cursor-instructions-*.md` | **これから実装する**タスクの手順・検証条件 |
| [`reports/`](reports/) | `cursor-implementation-report-*.md` | **完了した**タスクの結果報告（Claude への引き継ぎ用） |
| [`briefs/`](briefs/) | `cursor-*.md` | 実装**前**の設計相談・意思決定メモ |

**正本ドキュメント（目的・仕様・フォルダマップ）**は `docs/` 直下。タスク履歴と混同しないこと。

| 正本 | 内容 |
|------|------|
| [`../REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) | **最初に読む** — フォルダマップ・パイプライン・ランタイム契約 |
| [`../PURPOSE.md`](../PURPOSE.md) | 目的・2モード・評価方針 |
| [`../DESIGN.md`](../DESIGN.md) | 実装設計（SRS・TTS・データ整備） |
| [`../SPECIFICATION.md`](../SPECIFICATION.md) | 画面・JSON フィールド・localStorage |

**注意:** 古いレポート内のパス・語数は当時のスナップショット。現行の数値・パスは [`../REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) を正とする。

## 直近の主要タスク（2026-07-10）

| テーマ | 指示書 | レポート |
|--------|--------|----------|
| **Phase R**（RP パイプライン品質修正） | `instructions/cursor-instructions-phase-r-rp-pipeline-repair.md` | `reports/cursor-implementation-report-phase-r.md` |
| **Phase T**（TTS 1問目遅延解消） | `instructions/cursor-instructions-phase-t-tts-latency.md` | `reports/cursor-implementation-report-phase-t.md` |
| リポジトリ構成見直し（AI 向け README） | — | `reports/cursor-implementation-report-repo-structure-review.md` |
| Phase 2 M2 完了（B2 +569） | `instructions/cursor-instructions-phase2-m2*.md` | `reports/cursor-implementation-report-phase2-m2*.md` |
| 進捗チェック UI | `instructions/cursor-instructions-progress-checks.md` | `reports/cursor-implementation-report-progress-checks.md` |
| Phrases CEFR バッジ | `instructions/cursor-instructions-connected-weak-cefr-badges.md` | `reports/cursor-implementation-report-connected-weak-cefr-badges.md` |
| dignify RP ホットフィックス | `instructions/cursor-instructions-dignify-hotfix.md` | `reports/cursor-implementation-report-dignify-hotfix.md` |

## Claude への推奨読み順

1. `docs/REPOSITORY-STRUCTURE.md` — どこに何があるか
2. `docs/PURPOSE.md` — なぜそう作るか（本丸 vs サブテーマ）
3. タスクに応じて `DESIGN.md` または `SPECIFICATION.md`
4. 類似の過去タスクがあれば `instructions/` + `reports/` の該当ペア
