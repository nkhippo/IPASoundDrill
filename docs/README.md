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

## サブフォルダ

| フォルダ | 役割 | README |
|----------|------|--------|
| [`cursor/`](cursor/) | Cursor / Claude の指示書・実装レポート・設計ブリーフ | [`cursor/README.md`](cursor/README.md) |
| [`reference/`](reference/) | 監査・運用ガイド・意思決定メモ（人間＋AI 参照） | [`reference/README.md`](reference/README.md) |
| [`testing/`](testing/) | 手動テストチェックリスト | — |
| [`archive/`](archive/) | 旧ドキュメント退避 | — |

## 現行スナップショット（2026-07-10）

- 語彙 **5,397**（B2=899、Phase 2 M2 完了）
- Phase R（RP パイプライン品質修正）完了 — `cursor/reports/cursor-implementation-report-phase-r.md`
- GitHub Pages: https://nkhippo.github.io/English-Pronunciation-Trainer/

## 人間向け概要

ルートの [`README.md`](../README.md)（デモ URL・ローカル起動）も参照。
