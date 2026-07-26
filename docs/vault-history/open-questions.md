---
created: 2026-07-16 02:00:00+09:00
project: IPASoundDrill
status: living
summary: UI/UX 拜本見直しで Naoya の判断が必要な事項を集約。判断確定した項目は `design-decisions.md` に移送する運用。v3.1 で Phase 1-0-b Recon (PR
tags:
  - ipasounddrill
  - open-questions
  - phase-1
title: IPA Sound Drill - Open Questions
type: knowledge
updated: 2026-07-18T23:13:48+09:00
version: "3.1"
id: pj-2026-07-16-f484
aliases:
  - pj-2026-07-16-f484
---

## Summary

IPA Sound Drill UI/UX 抜本見直しにおける **判断待ち事項** の集約先。Claude が単独で判断できない意思決定を待ち行列化する。

判断が確定した項目は Vault `30_projects/IPASoundDrill/design-decisions.md` に移送し、本ファイルから削除する。

**現在の状態 (2026-07-18 v3.1)**: Phase 1-0-b Recon (Issue #78 / PR #80) の結果を Naoya + Claude で確認完了。Q-16〜Q-19 の 4 件を全消化し `design-decisions.md § 2026-07-18 (2)` に移送済み。加えて Naoya 裁定「パラメータ数を **11 に統一**」(Q-20-δ 補足) も同セクションに追記済み。**active な open は 0 件**。Phase 1-A (視覚言語トークン基盤) 以降で新規論点が出たら Q-22 以降として本ファイルに追記する。

## Active な open questions

なし (2026-07-18 v3.1 時点)。

## 判断が確定した項目 (履歴)

以下は判断確定し、`design-decisions.md` へ移送した項目:

### 2026-07-15 確定分 (Phase 0 UX 論点、Q-1〜Q-11 のうち 10 件)

| ID | 概要 | 決定 | 移送先セクション |
|---|---|---|---|
| Q-1 | CEFR B2 到達性 | Q-1-A (Setup ピルに B2 追加) | `design-decisions.md` § 2026-07-15 |
| Q-3 | C1 拡張のスコープ | Q-3-B (Track B) | 同上 |
| Q-4 | Respell 表示方針 | Q-4-B (Reveal のみ) | 同上 |
| Q-5 | Connected の CEFR フィルタ | Q-5-B (level のみ、SPEC 明記) | 同上 |
| Q-6 | RP TTS 連結 | Q-6-B (Track B) | 同上 |
| Q-7 | cs_rule の ko/zh 対応 | Q-7-A (3 言語追加) | 同上 |
| Q-8 | 死コード削除の方針 | Q-8-C (個別判断、Q-11 と整合) | 同上 |
| Q-9 | モーダル Escape キー | Q-9-A (3 モーダル対応) | 同上 |
| Q-10 | Undocumented UI の SPEC 記載 | Q-10-B (暫定追記) | 同上 |
| Q-11 | 目的ファースト UI と Reflect dock | Q-11-C (Reflect dock 削除) | 同上 |

### 2026-07-18 確定分 (1): Phase 1 UI/UX 実装前 UX 論点、7 件

| ID | 概要 | 決定 | 移送先セクション |
|---|---|---|---|
| Q-2 | Mode B の情報階層 | Q-2-B (CEFR 統一、Band 削除) | `design-decisions.md` § 2026-07-18 |
| Q-12 | top カード #1 の名称ゆれ | α (top カード名に全統一「音の発音を確かめる」等) | 同上 |
| Q-13 | 絞り込みボトムシート `3b` | 誤記のため resolve、インライン扱いに | 同上 |
| Q-14 | EN/KO ドリル画面 | α (i18n キー追加のみ、実機確認で対処) | 同上 |
| Q-15 | PC 版の残 3 ドリル | α (Pd の 2 ペイン構造を全ドリル共通) | 同上 |
| Q-20 | 「詳しい設定」12 パラメータ振り分け | δ (Naoya 案: プロフィール一元通過型 + LS プリセット) | 同上 |
| Q-21 | オンボーディング発火判定 | α (LS `onboarding_completed_v1` フラグ) | 同上 |

### 2026-07-18 確定分 (2): Phase 1-0-b Recon 結果反映、4 件 + 補足 1 件

Issue #78 / PR #80 (`docs/design/phase-1/screen-data-mapping.md` §1–§7) の Recon 結果を Naoya + Claude で確認、以下を確定:

| ID | 概要 | 決定 | 移送先セクション |
|---|---|---|---|
| Q-16 | マーキング 4 目的独立管理 の LS schema | α (物理: `ept_marks_v1` 単一オブジェクト / 論理: `mark:{drill_id}:{word_id}`、`ept_checks_v1` から lazy migration) | `design-decisions.md` § 2026-07-18 (2) |
| Q-17 | CEFR word-level 付与状況 | Recon で未タグ **0** 判明 → 実装時の除外/割当ロジック不要、CI で欠落 fail のみ推奨 | 同上 |
| Q-18 | GA/RP 個別 IPA と音声 | 単語 `ipa`/`rp_ipa` 100%、`ipa_actual_rp` 0 / RP BatchWarm 未実装 / 連結 RP は Track B (Q-6-B と整合) | 同上 |
| Q-19 | IPA 部分一致検索 latency | 実測 mean 0.15ms / max 1.62ms (目標 100ms を 2 桁クリア) → 単純全走査で確定、index/Worker 不要 | 同上 |
| Q-20 補足 | 「詳しい設定」パラメータ数の表記 | 案 α (**11 に統一**、PURPOSE/DESIGN の「12」表記は Phase 1-C 起票 Issue で書き替え) | 同上 |

## 運用

- 新規論点が出たら Q-22 以降として本ファイルに追記
- 判断確定したら `design-decisions.md` へ移送し、本ファイルから消化
- 実測ベースの論点 (現行 Q-19 のような性能課題) は Phase 実装中の対応でも可

## 次のアクション

1. 【次】Phase 1-A (視覚言語トークン基盤) Issue 起草 — Phase 1-0-b と独立、単独起票可
2. 【次または並行】Phase 1-C (学習プロフィール) Issue 起草 — 本 Recon の §1 (11 パラメータ) + §2 (LS スキーマ) が判断材料
3. 【1-C 起票時に含める】PURPOSE/DESIGN の「12 パラメータ」表記を「Setup 11 項目 (Accent 含む) + Onboarding」等へ書き替え (Q-20 補足の裁定)
