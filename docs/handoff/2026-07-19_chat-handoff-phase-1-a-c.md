---
created: 2026-07-19T18:00:00+09:00
project: IPASoundDrill
status: published
summary: IPA Sound Drill Phase 1 UI/UX 実装 — Phase 1-A merge (視覚言語トークン基盤 + Category A CSS-CONVENTIONS.md 新設) + Phase 1-C merge (学習プロフィール `3a`、Setup 11 項目、LS 3 種、CI ガード、B2 CEFR ピル、Cursor 設計懸念点検経由の v2 改訂) 完了後の Chat 引き継ぎ pack。次セッションでは Naoya 実機検収完了確認 → Phase 1-B (top page) Issue 起票 → Phase 1-D (ドリル本体) Issue 起票の順で進行。Cursor 設計懸念点検フローの教訓 (Issue 起草時の Recon 精読必須) を含む。
tags:
  - ipasounddrill
  - handoff
  - phase-1-a
  - phase-1-c
  - chat-handoff
title: Chat handoff pack - 2026-07-19 (Phase 1-A + 1-C merge 完了)
type: handoff
updated: 2026-07-19T18:00:00+09:00
---

# 📦 Chat 引き継ぎ pack — 2026-07-19

**テーマ**: IPA Sound Drill Phase 1 UI/UX 実装 — Phase 1-A merge (視覚言語トークン基盤) + Phase 1-C merge (学習プロフィール `3a`) 完了 → Phase 1-B (top page) 起票準備

前回 Chat (2026-07-18) の続き。Phase 1-0-b Recon merge 後の作業として、Phase 1-A と Phase 1-C の Issue 起票 → Cursor 実装 → PR → Claude 12 観点 Rv → merge を 2 サイクル完了。次は Naoya 実機検収完了後の Phase 1-B (top page) 起票と、それに並行して Phase 1-D (ドリル本体) 起票の準備。

---

## 次 Chat 起動時の作業手順

### 1. Vault MCP で以下を取得 (Skill v1.10 ケース 1 自動フローで大半カバー)

**正典系 (Skill 自動取得)**:
- `00_meta/project_instructions_vault.md` v1.4 以降
- `00_meta/operations/dev_project_common.md` v1.1 以降
- `00_meta/naoya_profile.md` v1.0 以降
- `30_projects/IPASoundDrill/project_instructions.md` v1.1 以降
- `30_projects/IPASoundDrill/handoff/current-state.md` (最新エントリ 2026-07-19 17:30)
- `30_projects/IPASoundDrill/design-decisions.md` (最新エントリ § 2026-07-19 (2) Phase 1-C merge)
- `30_projects/IPASoundDrill/open-questions.md` v3.1 (active open 0 件)

**追加で読むもの (今回の Chat のコンテキスト)**:
- `30_projects/IPASoundDrill/handoff/2026-07-19_chat-handoff-phase-1-a-c.md` ← 本 pack
- `30_projects/IPASoundDrill/design/phase-1/design-tokens.md` (Mood B 視覚言語トークン SoT、commit `680d83ec`、11 変数版)
- `30_projects/IPASoundDrill/design/phase-1/screen-data-mapping.md` (Setup 11 項目 / LS スキーマの実装名正本、Issue 起票時に精読必須)
- `30_projects/IPASoundDrill/design/phase-1/work-plan-uiux-implementation.md` (frozen、参照用)

### 2. IPASoundDrill GitHub MCP で以下を取得

**Category B 7 点**:
- `CLAUDE.md`, `docs/REPOSITORY-STRUCTURE.md`, `docs/LAUNCH-CHECKLIST.md`, `docs/DOCUMENT-MAP.md`, `docs/CHANGE-CLASSIFICATION.md`, `docs/DEV-GUARDRAILS.md`, `docs/OPERATIONS.md`
- **`docs/CSS-CONVENTIONS.md`** (Phase 1-A で追加された Category A、legacy 運用ルール)

**Phase 1-A / 1-C merge 済みの資産**:
- `docs/PURPOSE.md` v4.0 (Setup 11 項目 + Onboarding、B2 対応)
- `docs/SPECIFICATION.md` (§4.1 「11 統一」書き替え済み)
- `docs/DESIGN.md` (`3a` UI 仕様追記、Setup 11 項目、B2 反映、LS スキーマ更新)
- `docs/design/phase-1/visual-tokens.md` (Vault §4 書き戻し済み、実装 snapshot)
- `docs/design/phase-1/screen-data-mapping.md` (Phase 1-0-b Recon 成果物、実装名正本)
- `src/index.template.html` (Mood B `:root` + `--legacy-*` 並存、`#purposeStub` / `.profile-3a` 実装、`prev_settings_v1` / `ept_marks_v1` / migration)
- `scripts/validate-cefr-tags.py` (Phase 1-C 新規、CI ガード)
- `.github/workflows/validate-cefr-tags.yml` (Phase 1-C 新規)
- `docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md` (実装レポート、legacy 化 17 変数の inventory)
- `docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md` (実装レポート、目的カード → 内部マッピング表 / `ept_checks_v1` schema 実態)

### 3. Naoya 実機検収の状況確認

**Phase 1-B 起票 gate**:
- Phase 1-A: 既存全画面 pixel-perfect スクショ比較で差分ゼロ (Chrome / モバイル 375px / デスクトップ 1440px)
- Phase 1-C: 目的 stub → `3a` → 「はじめる」→ 仮ドリル / B2 ピル / LS migration / CI ガード / 他画面 pixel-perfect / `3a` Mood B 整合 / レスポンシブ

Naoya に「Phase 1-A + 1-C 実機検収の状況は?」と確認。完了していれば Phase 1-B 起票へ進む。

---

## ここまでで確定している技術方針

### Phase 1 UI/UX の設計判断 (Vault `design-decisions.md` § 2026-07-15 〜 § 2026-07-19 (2) に集約)

1. **目的 4 カード** (Q-12): `2a` 音の発音を確かめる / `2b` 発音から書いてみる / `2c` 音から単語を覚える / `2d` 連結する音に慣れる
2. **タグライン**: JA「音を、美しく。」/ EN "Retune your English. From sound up." / KO「소리를, 아름답게.」
3. **GA/RP セッション固定**: プロフィール (`3a`) で選択、学習中不変 (`setAccent` の `in-play` チェックで実装済)
4. **CEFR 全目的横断 + B2 対応** (Q-2-B, Q-1-A): word-level タグ、プロフィール複数選択、A1/A2/B1/B2 の 4 ピル (Phase 1-C で B2 追加済)
5. **マーキング**: ユーザー手動 (3 回卒業)、目的独立、`ept_marks_v1 = {"2a:key":n,...}` (drill_id = `2a`/`2b`/`2c`/`2d`)
6. **完全一致判定 (near 廃止)**: Phase 1-0-a で設計・実装ともに完全削除済み
7. **プロフィール一元通過型 UX** (Q-20-δ): 目的カード → `3a` (毎セッション、`prev_settings_v1` プリセット) → 「はじめる」→ ドリル (Phase 1-C で実装済)
8. **オンボーディング** (Q-21): `3g` 4 スライド、`onboarding_completed_v1` フラグ (Phase 1-F で実装)
9. **AI クローラビリティ**: JS 介在なしの DOM 常時配置 (`3h` 等)
10. **視覚言語トークン** (Phase 1-A): Mood B / Warm Contemporary、11 color + 5 space + 5 radius + 2 shadow、Vault SoT (`design-tokens.md` commit `680d83ec`)
11. **CSS 命名・legacy 運用** (Phase 1-A): `docs/CSS-CONVENTIONS.md` (Cat A)、`--legacy-*` は Phase 1-H 完了時に最終 PR で削除、それより前の早期削除禁止
12. **LS スキーマ** (Phase 1-C):
    - `prev_settings_v1 = {v, accent, cefrLevels, focus, reg, grp, csLevel, csFilter, lastDrill, language}`
    - `ept_marks_v1 = {"2a:key":n, "2b:key":n, "2c:key":n, "2d:key":n}` (物理レイヤ、単一オブジェクト)
    - `ept_marks_migrated_v1 = "1"` (migration 完了フラグ)
    - 旧 `ept_checks_v1 = {key:{d,e,l}}` 残置、lazy migration で `d→2a`/`e→2b`/`l→2c`、`2d` は unset (0 相当)
13. **CI ガード** (Phase 1-C): `scripts/validate-cefr-tags.py` + workflow、未タグ CEFR 検出時 fail、対象 `wordlist_GA_a1a2_plus_phonics.json` (ルート) + optional data/*.json

### frame ID 再採番規則 (Phase 1-0-a で確定、`docs/DESIGN.md` §0.1)

- **Frame ID = 概念のみ** (画面 = 1 concept = 1 ID)、言語・デバイスは variant suffix (`-ja` / `-en` / `-ko` / `-pc` 等)
- 全 13 concept: `1a` (トップ) / `2a`-`2d` (ドリル 4) / `3a`-`3h` (支援画面 8)

### 実装順序 (8 Phase、Phase 1-I は Q-13 解消で廃止済み)

| Phase | 内容 | 状態 |
|---|---|---|
| **1-0-a** | PURPOSE/SPEC/DESIGN 先行改訂 + near 実装削除 | ✅ Issue #75 / PR #77 merge |
| **1-0-b** | 画面 × データマッピング Recon | ✅ Issue #78 / PR #80 merge |
| **1-A** | 視覚言語トークン基盤 + CSS-CONVENTIONS.md (Cat A 新設) | ✅ Issue #81 / PR #82 merge |
| **1-B** | トップページ (`1a`) | ⬜ Naoya 実機検収完了後起票 |
| **1-C** | 学習プロフィール (`3a`) + LS 3 種 + CI ガード + B2 ピル | ✅ Issue #83 / PR #84 merge |
| 1-D | ドリル本体 (`2a`-`2d`、2 PR 分割) | ⬜ 1-C 検収完了後起票、1-B と並行可 |
| 1-E | 支援画面 (`3b`-`3f`/`3h`、4 分割) | ⬜ 1-D 完了後 |
| 1-F | オンボーディング (`3g`) | ⬜ |
| 1-G | 多言語 (variant `-en` 等) | ⬜ |
| 1-H | PC 版 (`-pc`) + 最終 PR で `--legacy-*` 群削除 | ⬜ |

### 運用パターン (2026-07-18〜19 セッションで確立された知見)

- **Cursor Pre-Issue Recon パターン**: 3,000 行超の実装や大規模データ調査は Cursor に委譲、Claude はトークン浪費せず判断相談に集中 (Phase 1-0-b)
- **先行 Docs 改訂 Issue パターン**: 大規模 UI 変更時は先に上位仕様 (PURPOSE/SPEC/DESIGN) を確定 → 実装 Phase は「仕様に沿う」だけで判断 (Phase 1-0-a)
- **レガシー退避パターン (解釈 i)**: 既存 CSS 変数を `--legacy-*` に退避、新 token を並存追加、既存参照は `var(--legacy-*)` に更新、Phase 1-H 完了時に legacy 削除 (Phase 1-A)
- **Category A 新設パターン**: 運用ルール明文化のために新規 Category A ドキュメントを 1 Issue で追加、DOCUMENT-MAP 1 行追加のみ (Phase 1-A `docs/CSS-CONVENTIONS.md`)
- **Cursor 設計懸念点検フロー**: Cursor が Phase 0 inventory 時に Issue と実態の乖離を検出、実装未着手で「持ち帰り」判定 → Claude Rv + Naoya 裁定 → Issue v2 全面改訂 → Cursor 実装再開 (Phase 1-C)
- **Vault §4 内容の Comment 投稿パターン**: Cursor 環境から Vault 到達不能な場合、Claude が Chat 履歴から Vault 内容を復元して Comment 投稿 (Phase 1-C `visual-tokens.md` §4 書き戻し)
- **Recon 実装名精読の必須化**: Issue 起草時に Recon 成果物 (`screen-data-mapping.md` §1〜§2) の実装名レベルまで精読する必要がある。LS キー名 / フィールド名 / DOM id / ファイルパスは全て実在確認 (Phase 1-C の教訓)
- **判断相談フォーマット (案 α/β/γ + Claude 推奨)** は efficient、Naoya さんが UX 用語で深掘りを求める場合は追加解説
- **Vault ↔ GitHub の役割分担**: Vault = 判断過程 (SoT)、GitHub = 最新仕様の source of truth (実装 snapshot)、乖離時は Vault を正
- **Issue 起票 → Cursor 実装 → PR → Claude 12 観点 Rv → Merge の一貫サイクル** (L2/L3 で有効)、必要に応じて Cursor 設計懸念点検 → Issue v2 改訂の中間フローも

---

## 新 Chat で詰めるべきこと

### 優先度 高

1. **Naoya 実機検収の結果確認 (Phase 1-A + 1-C)**
   - Phase 1-A: 既存全画面 pixel-perfect、Chrome / モバイル 375px / デスクトップ 1440px
   - Phase 1-C: 目的 stub → `3a` → はじめる、B2 ピル、LS migration、CI ガード動作、他画面 pixel-perfect、`3a` Mood B 整合、レスポンシブ
   - 検収 NG の場合、修正 Issue 起票の判断

2. **Phase 1-B (top page `4a`) Issue 起票** (検収 OK 前提)
   - `#purposeStub` を本実装で置換 (目的カード 4 個の完成形)
   - タグライン「音を、美しく。」表示、tagline-candidates.md の判断
   - Hero + 目的 4 カード + オンボーディング link + フッター
   - Phase 1-A の legacy 参照を top page 範囲で新 token へ巻き取り
   - `docs/design/phase-1/design-tokens.md` §4「目的カード」の CSS を参照
   - 起票時に Recon `screen-data-mapping.md` を top page 部分について精読

3. **Phase 1-D (ドリル本体) Issue 起票の準備 (1-B と並行可)**
   - `2a`-`2d` の 4 ドリル、2 PR 分割 (`2a`/`2b` + `2c`/`2d` あるいは Words 系 + Connected 系)
   - `prev_settings_v1` / `ept_marks_v1` を前提に組める (Phase 1-C で完了)
   - Progress meter CSS 定義 (visual-tokens.md §4.5 参照)
   - 音象徴の視覚化 (音節境界 `‧` U+2027、強勢マーカー `ˈ` signal 色、要注意音 stress 下線)
   - Phase 1-A の Font family トークン化 (`--font-ui` 等) を含めるか要判断 (Rv 後続 1)
   - Cursor Comment `5015013634` の後続 4 点も含めるか要判断

### 優先度 中

4. **発信素材化検討 (note 記事)**
   - Phase 1-A レガシー退避パターン + Category A 新設パターンは「AI エージェント時代の開発運用」note 記事化候補
   - Phase 1-C Cursor 設計懸念点検フローは「Issue 起草時に Recon を精読すべし」の教訓として発信価値高
   - Cursor Pre-Issue Recon パターン (Phase 1-0-b)、先行 Docs 改訂 Issue パターン (Phase 1-0-a) と合わせて 1 シリーズ化

### 優先度 低

5. **Phase 1-E 以降の Issue 起草順序の再確認** (1-D 完了後)

---

## MCP で取得できない情報

- **実機動作の状態**: Naoya さんが iOS Safari / Chrome / iPad / モバイル 375px 等で確認した Phase 1-A + 1-C 実装の実機 UX
- **LS migration の実データ検証**: 実際の user の `ept_checks_v1` LS を持つ Naoya さんの環境での migration 動作確認
- **CI ガードの実 PR fail 動作**: Naoya さんが故意に未タグ語を追加した実 PR での fail 再現確認
- **Naoya さんの時間的制約**: 今後の Chat 頻度・タイミング
- **Cursor 実装の進捗タイミング**: Phase 1-B / 1-D の Issue 起票後の完了予定時刻

---

## 参照 URL

- Phase 1-0-a: [Issue #75](https://github.com/nkhippo/IPASoundDrill/issues/75) / [PR #77 (merged)](https://github.com/nkhippo/IPASoundDrill/pull/77)
- Phase 1-0-b: [Issue #78](https://github.com/nkhippo/IPASoundDrill/issues/78) / [PR #80 (merged)](https://github.com/nkhippo/IPASoundDrill/pull/80) / Claude Rv Comment `5011560809`
- Phase 1-A: [Issue #81](https://github.com/nkhippo/IPASoundDrill/issues/81) / [PR #82 (merged)](https://github.com/nkhippo/IPASoundDrill/pull/82) / Claude Rv Comment `5014556136`
- Phase 1-C: [Issue #83](https://github.com/nkhippo/IPASoundDrill/issues/83) / [PR #84 (merged)](https://github.com/nkhippo/IPASoundDrill/pull/84) / Claude Rv Comment `5015013634`
- Cursor 設計懸念点検 (Phase 1-C): Issue #83 Comment `5014824156` (11 件持ち帰り) / Claude Rv + Naoya 裁定通知: Comment `5014858817` / Vault §4 内容: Comment `5014860270`

---

## 本 Chat セッションの完全成果 (2026-07-18〜19)

| # | 種別 | 場所 / URL | commit / id |
|---|---|---|---|
| 1 | GitHub | PR #80 (Phase 1-0-b) 12 観点合格 Comment | `5011334600` |
| 2 | Vault | `open-questions.md` v3.0 → v3.1 (Q-16〜Q-19 消化、active 0 件) | `12b44b1d` |
| 3 | Vault | `design-decisions.md` § 2026-07-18 (2) 追加 | `6ee49fdb` |
| 4 | Vault | `handoff/current-state.md` Phase 1-0-b 完了エントリ | `e3d994f1` |
| 5 | Vault | `design/phase-1/design-tokens.md` に `--accent-soft` 追加、11 変数化 | `680d83ec` |
| 6 | Vault | `design/phase-0/` サブディレクトリへ整理 | `855cb5ce` |
| 7 | Vault | `design/phase-1/work-plan-uiux-implementation.md` → frozen | `f9f0745d` |
| 8 | GitHub | Issue #81 起票 (Phase 1-A) | Issue #81 |
| 9 | GitHub | PR #82 (Phase 1-A) 12 観点合格 + 後続 3 点 Comment | `5014556136` |
| 10 | Vault | `design-decisions.md` § 2026-07-19 (Phase 1-A merge) | `0b594665` |
| 11 | Vault | `handoff/current-state.md` Phase 1-A merge エントリ | `5cb19fc3` |
| 12 | GitHub | Issue #83 起票 (Phase 1-C) v1 | Issue #83 |
| 13 | GitHub | Issue #83 v2 全面改訂 (Cursor 指摘 11 件対応) | Issue #83 updated |
| 14 | GitHub | Issue #83 に Claude Rv + Naoya 裁定通知 Comment | `5014858817` |
| 15 | GitHub | Issue #83 に Vault §4 内容 Comment (visual-tokens 書き戻し用) | `5014860270` |
| 16 | GitHub | PR #84 (Phase 1-C) 12 観点合格 + 後続 4 点 Comment | `5015013634` |
| 17 | Vault | `design-decisions.md` § 2026-07-19 (2) (Phase 1-C merge) | `0e82fddf` |
| 18 | Vault | `handoff/current-state.md` Phase 1-C merge エントリ | `b8b98e57` |
| 19 | Vault | 本 Chat 引き継ぎ pack | (本コミット) |
