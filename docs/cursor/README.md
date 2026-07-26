# `docs/cursor/` — Cursor / Claude タスク履歴

AI エージェント向けの**作業指示・実装レポート・設計相談**を格納。アプリ runtime（`index.html`）からは参照されない。

## このフォルダの使い分け

| Subfolder | ファイル名パターン | いつ読むか |
|-----------|-------------------|------------|
| [`instructions/`](instructions/) | `cursor-instructions-*.md` | **これから実装する**タスクの手順・検証条件 |
| [`reports/`](reports/) | `cursor-implementation-report-*.md` | **完了した**タスクの結果報告（Claude への引き継ぎ用） |
| [`briefs/`](briefs/) | `cursor-*.md` | 実装**前**の設計相談・意思決定メモ |
| [`recon/`](recon/) | `pre-issue-recon-*.md` | **読み取り専用調査**の機械抽出（DOM / 関数 / i18n）。Phase 0 UI 監査や Pre-Issue Recon |

**正本ドキュメント（目的・仕様・フォルダマップ）**は `docs/` 直下。タスク履歴と混同しないこと。

| 正本 | 内容 |
|------|------|
| `../repo-map.md` | **最初に読む** — フォルダマップ。パイプラインは `../pipeline.md`、ランタイム契約は `../data-contract.md` |
| `../product.md` | 目的・ポジショニング・評価方針 |
| `../features/<id>.md` | 各機能の挙動・画面・採点則+定数・データ・i18n（索引: `../features/README.md`） |
| `../data-contract.md` | 画面・JSON フィールド・localStorage |

**注意:** 古いレポート内のパス・語数は当時のスナップショット。現行の数値・パスは `../repo-map.md` / `../data-contract.md` / `../history.md` を正とする。

## 直近の主要タスク（2026-07-10）

| テーマ | 指示書 | レポート |
|--------|--------|----------|
| **Phase B**（Phase 2 バッチ品質監査） | `instructions/cursor-instructions-phase-b-batch-audit.md` | `reports/cursor-implementation-report-phase-b-batch-audit.md` |
| **Phase V**（語彙ブラウザのページ化 + UI 整備） | `instructions/cursor-instructions-phase-v-vocab-page.md` | `reports/cursor-implementation-report-phase-v.md` |
| **Phase R**（RP パイプライン品質修正） | `instructions/cursor-instructions-phase-r-rp-pipeline-repair.md` | `reports/cursor-implementation-report-phase-r.md` |
| **Phase T**（TTS 1問目遅延解消） | `instructions/cursor-instructions-phase-t-tts-latency.md` | `reports/cursor-implementation-report-phase-t.md`（**GAS 再デプロイは残作業** → `../reference/remaining-ops-checklist.md`） |
| リポジトリ構成見直し（AI 向け README） | — | `reports/cursor-implementation-report-repo-structure-review.md` |
| Phase 2 M2 完了（B2 +569） | `instructions/cursor-instructions-phase2-m2*.md` | `reports/cursor-implementation-report-phase2-m2*.md` |
| 進捗チェック UI | `instructions/cursor-instructions-progress-checks.md` | `reports/cursor-implementation-report-progress-checks.md` |
| Phrases CEFR バッジ | `instructions/cursor-instructions-connected-weak-cefr-badges.md` | `reports/cursor-implementation-report-connected-weak-cefr-badges.md` |
| dignify RP ホットフィックス | `instructions/cursor-instructions-dignify-hotfix.md` | `reports/cursor-implementation-report-dignify-hotfix.md` |

## Claude への推奨読み順

1. `docs/repo-map.md` — どこに何があるか
2. `docs/product.md` — なぜそう作るか（目的・ポジショニング）
3. タスクに応じて `docs/features/<id>.md`（挙動・画面・採点則・データ・i18n）
4. 類似の過去タスクがあれば `instructions/` + `reports/` の該当ペア
5. 運用の手動残作業は `docs/reference/remaining-ops-checklist.md`
