---
id: pj-2026-07-10-e12c
aliases:
- pj-2026-07-10-e12c
title: リポジトリ構成見直し — 実装レポート
created: '2026-07-10'
---
# リポジトリ構成見直し — 実装レポート

- 実施日: 2026-07-10
- ブランチ: `main`
- 目的: AI（Claude）がディレクトリの役割を推測しやすいよう、フォルダ README と正本ドキュメントを現状（5,397 語・Phase 2 M2 完了）に同期

## 1. 方針

| 原則 | 内容 |
|------|------|
| ランタイムと非ランタイムの分離 | ブラウザが fetch する JSON は `data/` 直下 + ルート wordlist のみ |
| パイプライン中間物は `data/pipeline/` | R4 作業リストなど機械可読データを `docs/reference/` から移動 |
| 各階層に README | `data/`, `data/batches/`, `data/pipeline/`, `data/archive/`, `docs/cursor/` |
| 正本ドキュメント更新 | `REPOSITORY-STRUCTURE.md`, `PURPOSE.md`, `DESIGN.md`, `SPECIFICATION.md`, `README.md` |
| 情報量の維持 | 移動はコピーではなく `git mv`。ドキュメント内の参照パスを更新 |

## 2. ファイル移動

| 変更 | From | To |
|------|------|-----|
| R4 作業リスト | `docs/reference/r4_pending_review_list.{json,csv}` | `data/pipeline/` |
| wordlist バックアップ | ルート `*.pre-phase0a.json` | `data/archive/`（gitignore 対象のまま） |

**移動しなかったもの（理由）**

- `docs/reference/r4-pending-review-guide.md` — 人間向け手順書のため `docs/reference/` に維持
- `wordlist_GA_a1a2_plus_phonics.json` — `index.html` がルート固定 fetch のため変更不可
- `docs/cursor/reports/` 62 本 — 履歴として保持（パス注記は `docs/cursor/README.md` で案内）

## 3. 新規 README

| File | 役割 |
|------|------|
| `data/README.md` | runtime / batches / pipeline / derived / patches / archive の見分け |
| `data/batches/README.md` | バッチ命名規則と現行一覧 |
| `data/pipeline/README.md` | ステージング JSON の一覧 |
| `data/archive/README.md` | ローカル退避の説明 |
| `docs/cursor/README.md` | instructions / reports / briefs の索引 |

## 4. コード・設定

- `scripts/paths.py` — `DATA` 定義順の修正、`R4_REVIEW_LIST_*`, `GA_RP_SAME_REPORT`, `ARCHIVE` 追加
- `.gitignore` — `scripts/*.log` 追加

## 5. 正本ドキュメント更新内容

| File | 主な更新 |
|------|----------|
| `docs/REPOSITORY-STRUCTURE.md` | 5,397 語、Phase 2 バッチ、進捗チェック、R4 パス、パイプライン手順 |
| `docs/PURPOSE.md` | v3.20、`ga_rp_same`・進捗チェック・Phase 2 M2 セクション |
| `docs/DESIGN.md` | `ept_checks_v1`、頻度重み付けシャッフル |
| `docs/SPECIFICATION.md` | localStorage `ept_checks_v1`、語彙数 |
| `README.md` | 重複セクション整理、現行語数 |
| `docs/reference/README.md` | Phase 2 資料、pipeline との役割分担 |

## 6. 参照パス訂正

- `docs/reference/r4-pending-review-guide.md`
- `docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md`

## 7. 検証

- `scripts/paths.py` の `DATA` 使用前定義バグを修正（`WORDLIST_BACKUP_PHASE0A`）
- R4 JSON/CSV の内容は移動のみ（データ変更なし）
- ランタイム fetch パスは未変更
