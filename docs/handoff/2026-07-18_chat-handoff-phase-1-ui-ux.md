---
aliases:
  - pj-2026-07-18-hoff
created: 2026-07-18 23:00:00+09:00
id: pj-2026-07-18-hoff
project: IPASoundDrill
source_chat_log_id: chat-2026-07-18-phase-1-ui-ux
status: published
summary: "2026-07-18 Chat の引き継ぎ pack。Phase 1-0-a (Issue #75 / PR #77) merge 済み、Phase 1-0-b (Issue #78) 起票済み Cursor 進行待ち、Phase 1-A 以降未着手。Phase 1 UI/UX の 10 の確定判断 + frame ID 再採番規則 + 8 Phase 実装順序 + 確立された運用パターン (Cursor Recon / 先行 Docs 改訂) を集約。新 Chat ではまず Cursor の Issue #78 Recon 結果を待ち、Rv 後に Phase 1-A 起票へ進む。"
tags:
  - ipasounddrill
  - handoff
  - phase-1
  - chat-handoff
title: Phase 1 UI/UX 実装 - Chat 引き継ぎ pack (2026-07-18)
type: handoff
updated: 2026-07-18 23:00:00+09:00
---

## Summary

2026-07-18 の Chat セッション「IPA Sound Drill Phase 1 UI/UX 実装作業整理」の引き継ぎ pack。Phase 1-0-a (Issue #75 / PR #77) merge 済み、Phase 1-0-b (Issue #78) 起票済み Cursor 進行待ち、Phase 1-A 以降未着手。次 Chat の冒頭で本ファイルを読めば作業を継続できる。

## テーマ

**IPA Sound Drill Phase 1 UI/UX 実装 — Phase 1-0-b 進行中 → 1-A 以降へ**

Phase 1 UI/UX (Claude Design で Naoya さんが確定した目的 4 カード構成 + Mood B + Variation B) を Cursor 実装に回す作業パイプライン。

## 参照すべきファイル (次 Chat の冒頭で Vault MCP で取得)

**正典系 (Skill v1.10 ケース 1 で自動取得)**:
- `00_meta/project_instructions_vault.md` v1.4
- `00_meta/operations/dev_project_common.md` v1.1
- `00_meta/naoya_profile.md` v1.0
- `30_projects/IPASoundDrill/project_instructions.md` v1.1

**プロジェクト状態**:
- `30_projects/IPASoundDrill/handoff/current-state.md` (最新は 2026-07-18 22:45 エントリ = Phase 1-0-a 完了)
- `30_projects/IPASoundDrill/design-decisions.md` (Q-1〜Q-11 + Q-2 / Q-12〜Q-15 / Q-20 / Q-21 確定分)
- `30_projects/IPASoundDrill/open-questions.md` v3.0 (Q-16〜Q-19 open、Phase 1-0-b で解決予定)

**Phase 1 作業資産**:
- `30_projects/IPASoundDrill/design/phase-1/work-plan-uiux-implementation.md` (9 Phase → 8 Phase 縮小、Phase 1-0 追加)
- `30_projects/IPASoundDrill/design/phase-1/brief-cluster-1-top-page.md`
- `30_projects/IPASoundDrill/design/phase-1/brief-cluster-2-visual-language.md`
- `30_projects/IPASoundDrill/design/phase-1/kickoff-claude-design-prompt.md`

**GitHub 側 (Category B、`IPASoundDrill GitHub` MCP で取得)**:
- `CLAUDE.md`, `docs/REPOSITORY-STRUCTURE.md`, `docs/LAUNCH-CHECKLIST.md`, `docs/DOCUMENT-MAP.md`, `docs/CHANGE-CLASSIFICATION.md`, `docs/DEV-GUARDRAILS.md`, `docs/OPERATIONS.md`
- `docs/PURPOSE.md` v4.0 (Phase 1-0-a merge 済み)
- `docs/SPECIFICATION.md` / `docs/DESIGN.md` (Phase 1 前提書き換え済み)

## ここまでで確定している技術方針

### Phase 1 UI/UX の設計判断 (10 項目、`docs/PURPOSE.md` v4.0 に反映済み)

1. **目的 4 カード** (Q-12 命名): `2a` 音の発音を確かめる / `2b` 発音から書いてみる / `2c` 音から単語を覚える / `2d` 連結する音に慣れる
2. **タグライン**: JA「音を、美しく。」/ EN "Retune your English. From sound up." / KO「소리를, 아름답게.」
3. **GA/RP セッション固定**: プロフィール (`3a`) で選択、学習中不変、ヘッダーバッジ
4. **CEFR 全目的横断** (Q-2-B): word-level タグ、プロフィール複数選択、Mode B Band 廃止
5. **マーキング**: ユーザー手動 (3 回卒業)、目的独立、Local Storage、`mark:{drill_id}:{word_id}` キー形
6. **完全一致判定 (near 廃止)**: Phase 1-0-a で設計・実装ともに完全削除済み
7. **プロフィール一元通過型 UX (Q-20-δ)**: 目的カード → `3a` (毎セッション必須・LS プリセット) → 「はじめる」→ ドリル
8. **オンボーディング (Q-21)**: `3g` 4 スライド、`onboarding_completed_v1` フラグ、ヘッダーガイドから任意再表示
9. **AI クローラビリティ**: JS 介在なしの DOM 常時配置 (`3h` フッター等)
10. **視覚言語トークン化**: カラー / タイポ / スペーシング / 角丸 / シャドウ (詳細値は Phase 1-A で確定)

### frame ID 再採番規則 (Phase 1-0-a で確定)

- **Frame ID = 概念のみ** (画面 = 1 concept = 1 ID)
- **言語・デバイスは variant suffix** (`-ja` / `-en` / `-ko` / `-pc` 等)
- 全 13 concept: `1a` (トップ) / `2a`-`2d` (ドリル 4) / `3a`-`3h` (支援画面 8)

### 実装順序 (8 Phase、Phase 1-I は Q-13 解消で廃止済み)

| Phase | 内容 | 状態 |
|---|---|---|
| 1-0-a | PURPOSE/SPEC/DESIGN 先行改訂 + near 実装削除 | ✅ Issue #75 / PR #77 merge 済み |
| 1-0-b | 画面 × データマッピング Recon | 🔄 Issue #78 起票済み、Cursor 進行待ち |
| 1-A | 視覚言語トークン基盤 | ⬜ 未着手 (Phase 1-0-b と独立、並行起票可) |
| 1-B | トップページ (`1a`) | ⬜ Phase 1-0-b 完了待ち |
| 1-C | 学習プロフィール (`3a`) | ⬜ Phase 1-0-b 完了待ち |
| 1-D | ドリル本体 (`2a`-`2d`、2 PR 分割) | ⬜ Phase 1-0-b 完了待ち |
| 1-E | 支援画面 (`3b`-`3f`/`3h`、4 分割) | ⬜ Phase 1-0-b 完了待ち |
| 1-F | オンボーディング (`3g`) | ⬜ |
| 1-G | 多言語 (variant `-en` 等) | ⬜ |
| 1-H | PC 版 (`-pc`) | ⬜ |

### 運用パターン (今回の Chat で確立された知見)

- **Cursor Pre-Issue Recon パターン**: 3,000 行超の実装や大規模データ調査は Cursor に委譲、Claude はトークン浪費せず判断相談に集中
- **Issue 起票 → Cursor Recon → Claude Rv → 実装 → PR → Claude 12 観点 Rv → Merge の一貫サイクル**: L3 では有効に機能
- **先行 Docs 改訂 Issue パターン**: 実装と同時に Category A を更新する通常運用ではなく、大規模 UI 変更時は先に上位仕様 (PURPOSE/SPEC/DESIGN) を確定させる例外運用 (Phase 1-0-a で実証)
- **Vault ↔ GitHub の役割分担**:
  - Vault (`design-decisions.md` / `open-questions.md`) = 判断過程と背景の記録
  - GitHub (`docs/PURPOSE.md` 等) = 最新仕様の source of truth
- **判断相談フォーマット (案 α/β/γ + Claude 推奨)** は efficient、Naoya さんが UX 用語で詳しく聞く場合は追加深掘り

## 新 Chat で詰めるべきこと

### 優先度 高

1. **Cursor による Issue #78 (Phase 1-0-b) の Recon 結果 Rv**
   - Cursor が Phase 0-6 を進めた成果物 `docs/design/phase-1/screen-data-mapping.md` の内容確認
   - 12 パラメータ完全リスト、LS スキーマ、CEFR/GA-RP カバレッジ、IPA latency、14 frame マッピングの妥当性
   - Q-16〜Q-19 の確定判断
   - PR 作成後 Claude Rv (L2 は任意だが Naoya さん判断で推奨)
2. **Phase 1-0-b 完了後の Vault 更新**
   - `open-questions.md` から Q-16〜Q-19 を消化し `design-decisions.md` へ移送
   - `handoff/current-state.md` 更新

### 優先度 中

3. **Phase 1-A (視覚言語トークン基盤) Issue 起草**
   - Phase 1-0-b と独立、並行で起票可能
   - Naoya さん判断で「Phase 1-0-b と並行」or「Phase 1-0-b 完了後」を決める
4. **発信素材化検討 (note 記事)**
   - Phase 1-0-a パターン (先行 Docs 改訂 + 実装削除拡大) は「AI エージェント時代の開発運用」として発信価値高
   - Cursor Pre-Issue Recon パターンも合わせて記事化候補

### 優先度 低

5. **Phase 1-B 以降の Issue 起草順序の再確認**
   - Phase 1-A → 1-B → 1-C → 1-D (2 PR) → 1-E (4 PR) → 1-F → 1-G → 1-H の順を維持するか、依存関係を再点検

## MCP で取得できない情報

- **実機動作の状態**: Naoya さんが iOS Safari / Chrome 等で確認した Phase 1-0-a 実装の動作 (near 削除の実機 UX)
- **Claude Design の Iteration 詳細**: 元 Claude Design セッションでの判断過程 (Naoya さんが持ち帰った Kickoff_design_prompt.zip の内部議論)
- **Naoya さんの時間的制約**: 本セッション中は非常に集中して進行できたが、今後の Chat 頻度・タイミングは Naoya さん都合
- **Cursor 実装の進捗タイミング**: Issue #78 の完了予定時刻は未定

## 参照 URL

- Issue #75 (Phase 1-0-a、closed): https://github.com/nkhippo/IPASoundDrill/issues/75
- PR #77 (Phase 1-0-a、merged): https://github.com/nkhippo/IPASoundDrill/pull/77
- Issue #78 (Phase 1-0-b、open): https://github.com/nkhippo/IPASoundDrill/issues/78
- Claude Rv Comment (Phase 0 Recon 応答): https://github.com/nkhippo/IPASoundDrill/issues/75#issuecomment-5011334600
- Claude Rv レポート (PR #77 12 観点合格): https://github.com/nkhippo/IPASoundDrill/issues/75#issuecomment-5011477554

## 本 Chat セッションの完全成果 (2026-07-18)

| # | 種別 | 場所 / URL | commit / id |
|---|---|---|---|
| 1 | Vault | `design/phase-1/work-plan-uiux-implementation.md` | `9fdfd110` |
| 2 | Vault | `open-questions.md` v2.1 (Q-12〜Q-21 追加) | `60d35359` |
| 3 | Vault | `handoff/current-state.md` (早朝エントリ) | `b321ea42` |
| 4 | Vault | `design-decisions.md` (Q-2 / Q-12〜15 / Q-20 / Q-21 確定) | `4e0d181d` |
| 5 | Vault | `open-questions.md` v3.0 (7 件消化) | `df9249b7` |
| 6 | Vault | `handoff/current-state.md` (21:00 頃エントリ) | `e852f1c4` |
| 7 | GitHub | Issue #75 起票 | — |
| 8 | GitHub | Rv Comment (Cursor Recon 応答) | `5011334600` |
| 9 | GitHub | PR #77 merged | — |
| 10 | GitHub | Rv レポート (12 観点合格) | `5011477554` |
| 11 | GitHub | Issue #78 起票 | — |
| 12 | Vault | 本ファイル (chat 引き継ぎ pack) | (このコミット) |
