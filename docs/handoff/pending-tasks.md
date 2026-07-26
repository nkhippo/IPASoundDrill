---
created: 2026-07-17T05:20:00+09:00
keywords:
  - ipasounddrill
  - pending-tasks
  - handoff
  - phase-1
project: IPASoundDrill
status: living
summary: Phase 1 中盤 (2026-07-17 セッション終了時点) の残タスクを Naoya さん確認事項 (5 項目) + 【高】(4 項目) + 【中】(5 項目) + 【低】(3 項目) に優先度別整理。次セッションで最初に見るべき引き継ぎファイル。
tags:
  - ipasounddrill
  - pending-tasks
  - handoff
  - phase-1
title: IPA Sound Drill - Pending Tasks
type: handoff
updated: 2026-07-17T05:20:00+09:00
---

## このファイルの位置づけ

- **性質**: Phase 1 中盤 (2026-07-17 セッション終了時点) の残タスクを優先度別に整理した引き継ぎファイル
- **参照タイミング**: 新しい chat で IPA Sound Drill 相談を開始する時、`handoff/current-state.md` と併せて確認
- **更新運用**: タスク完了時にチェックマーク or 削除、新規タスク追加時は該当優先度に追記
- **依存**: `handoff/current-state.md` (プロジェクト全体の現在地)、`design-decisions.md`、`design/phase-1/brief-cluster-*.md`

## Naoya さんへの確認事項 (次セッション冒頭で解消推奨)

Phase 1 の続き (Cluster 3/4 Brief 起草、Cluster 1/2 実装) を進めるために、以下 5 項目を確認したい:

### C-1: タグライン最終確定

- 「目的から、はじめる。」は以下のどれか?
  - (a) J-3「深い話がしたい人に、英語を。」を Iteration で refine した結果
  - (b) J-5「音を、美しく。」を refine した結果
  - (c) 独自の第 6 候補として浮上
- 決定次第で `docs/design/tagline-candidates.md` を更新 (J-6 として追加 or J-3 を精緻化として上書き)

### C-2: 選定 mood plate

- Iteration で確定した mood plate は以下のどれか?
  - (a) Mood A "Notion Minimal"
  - (b) Mood B "Warm Contemporary"
  - (c) Mood C "Editorial"
  - (d) 独自の refine (どの mood plate をベースに何を変えたか)
- Cluster 3/4 Brief の視覚方向性はこの決定に依存

### C-3: Cluster 1 + 2 の HTML/CSS 取得状況

- Claude Design から実装可能な形の HTML/CSS を取得済みか
- 追加 Iteration が必要な要素はあるか
- design tokens (CSS Custom Properties) は最終形か

### C-4: Cluster 1 + 2 の実装反映方針

- Cursor Issue 起票 → `src/index.template.html` に反映のフロー確定
- Issue の粒度: (a) Cluster 1 + 2 を 1 Issue で一括 / (b) Cluster 1 と 2 で別 Issue / (c) さらに細分化
- 実装優先度: (a) Cluster 3/4 の設計より先 / (b) Cluster 3/4 と並行 / (c) Cluster 3/4 の設計後

### C-5: AI クローラビリティ原則の追加是非

- Iteration 中に Naoya さんが発した「JS を介さず常に DOM 上にあるため、AI クローラや思想を知りたいユーザーが確実に辿れます」を Product Principles に **原則 9 として追加** するか
- 追加するなら位置は「運用原則」の階層 (原則 7, 8 と同列)、優先順位は原則 8 の次
- または既存の原則に統合するか (原則 5 "1 画面 1 主軸" 拡張 or 原則 1 "IPA 主軸尊重" の副次原則として)

---

## 【高】 優先タスク (Phase 1 継続に必須)

### H-1: Cluster 3 Brief 起草 (Reveal 画面、C-10 対応)

- **対応 UX 課題**: C-10 (Reveal 情報密度過剰リスク)、C-9 (GA/RP 切替埋没)
- **主軸ペルソナ**: P-1 (Reveal 主軸情報理解)、P-3 (低帯域幅での情報階層)
- **視覚言語**: Cluster 2 選定 mood plate を反映
- **Deliverable 想定**: 3-5 プロトタイプ (respell 表示位置、narrow IPA の視覚階層、GA/RP 切替 UI 位置)
- **前提**: Naoya さん確認事項 C-2 (選定 mood plate) の解決
- **推定 Brief サイズ**: 10-12 KB
- **依存**: なし (Cluster 1/2 の実装完了を待たずに並行可)

### H-2: Cluster 4 Brief 起草 (Mode A/B 情報階層、Q-2 決定)

- **対応 UX 課題**: C-2 (Mode A/B 意味階層)、C-8 (CEFR 露出深度)、**Q-2 (Mode B の Band UI 復活 vs CEFR 流用)**
- **主軸ペルソナ**: P-2 (認知負荷対策)、P-4 (TOEFL 対応の情報密度)
- **Deliverable**: **Q-2 の 2 プロトタイプ (A 案 Band UI 復活 / B 案 CEFR 流用) を並行生成**
- **前提**: Naoya さん確認事項 C-2 の解決
- **推定 Brief サイズ**: 10-12 KB
- **決定タイミング**: Cluster 4 Iteration 1 で Q-2 A/B の比較 → Naoya さん判断 → `open-questions.md` から `design-decisions.md` に Q-2 判断を移送

### H-3: Cluster 1 + 2 の実装反映 (Cursor Issue 起票)

- **Claude Design 決定 UI を実装に落とし込む**
- **前提**: Naoya さん確認事項 C-3 (HTML/CSS 取得状況)、C-4 (実装粒度) の解決
- **Issue 想定 (仮案)**:
  - **Issue A (impl+data)**: `feat: Phase 1 Cluster 1 実装 - 目的ファースト UI + 6 言語切替 + オンボーディング (4 スライド) + About モーダル + フッター動線` (L2〜L3、C2+C4、パターン B)
  - **Issue B (design system)**: `feat: Phase 1 Cluster 2 実装 - デザイントークン + component patterns` (L2、C4、パターン A+B の複合)
  - **1 Issue に統合の場合**: `feat: Phase 1 Cluster 1 + 2 実装 - トップページ再設計 + 視覚言語刷新 (Claude Design 決定 UI 反映)` (L3、C4、パターン B)
- **想定作業内容**:
  - `src/index.template.html` の全面リファクタリング
  - CSS Custom Properties (design tokens) の追加
  - i18n JSON の追加・修正 (オンボーディング / About モーダル文言、6 言語分)
  - `docs/SPECIFICATION.md` / `docs/DESIGN.md` の Phase 1 反映 (§4.0 shell 再設計、§4.1 setup → 目的ファースト UI、§4.x About モーダル新規)
  - Cursor 実装レポート

### H-4: Naoya さんへの確認事項 C-1 〜 C-5 の解決

- 上記 5 項目 (C-1 〜 C-5) の判断を次セッション冒頭で確認
- 判断結果を `design-decisions.md` に移送、`current-state.md` を更新

---

## 【中】 優先タスク (品質向上・Phase 1 完成度向上)

### M-1: Cluster 1 決定 UI の Vault 記録

- **内容**:
  - Claude Design の Iteration 経緯を Vault の `design/phase-1/` に記録
  - スクリーンショット主要 3-5 枚を添付 (Vault MCP は画像非対応の可能性、Naoya さん Obsidian で直接添付)
  - 最終決定 UI の要点をテキストで記述 (タグライン、mood plate、情報アーキテクチャ)
- **想定ファイル**: `design/phase-1/iteration-log-cluster-1-2.md`
- **依存**: Naoya さん確認事項 C-1, C-2, C-3

### M-2: AI クローラビリティ原則の追加検討

- **内容**: Naoya さん確認事項 C-5 が肯定なら、`product-principles.md` に原則 9 として追加
- **候補文言**:
  > **原則 9: AI クローラビリティを設計に組み込む**
  > 重要な導線・思想説明は JS 介在なしで DOM 上に常時存在させる。SEO 戦略 (subdirectory + prerendering) と一体で設計する。
- **反例**: JS 動的挿入の重要 CTA、モーダル内のみの Terms/Privacy 表示、SPA route dependency ある About セクション
- **依存**: Naoya さん確認事項 C-5

### M-3: mood-board.md への Naoya さん実感情報追加

- **状態**: mood-board.md 骨格は完成、6 カテゴリの参照候補は Claude 側で叩き提示済み
- **未完了**: 各カテゴリの「Naoya さん追加候補」空白を埋める
- **Phase 1 完了前に完成させると Cluster 3/4 の視覚判断が精確になる**
- **想定作業時間**: 30-60 分 (Naoya さんの実感情報を書き出す)

### M-4: `design-decisions.md` への Phase 1 判断追記

- Cluster 1/2 で確定した判断を Phase 1 判断として追記
  - タグライン「目的から、はじめる。」採用
  - 選定 mood plate
  - AI クローラビリティ原則 (追加なら)
- 依存: Naoya さん確認事項 C-1, C-2, C-5

### M-5: `open-questions.md` の Q-2 準備

- Q-2 (Mode B Band UI vs CEFR 流用) は Phase 1 の Cluster 4 で決定予定
- Cluster 4 Brief 起草時に Q-2 の 2 プロトタイプ生成戦略を明記
- Cluster 4 Iteration 完了時に判断を `design-decisions.md` へ移送

---

## 【低】 優先タスク (副産物、後回し可)

### L-1: 派生 Issue 5 本の起票

Phase 0 完結 Rv で浮上した派生 Issue 候補:

1. **`chore: CLAUDE.md タグライン仮案削除` (PR #67 由来)**
   - Complexity: L1, Change Pattern: C1
   - タグライン仮案は tagline-candidates.md に一本化された、CLAUDE.md の重複を削除
   - **注意**: Phase 1 決定タグライン「目的から、はじめる。」を tagline-candidates.md に反映してから実施

2. **`chore: validate_i18n.py を template 正本パスに対応` (PR #68 由来)**
   - Complexity: L1, Change Pattern: C2
   - 現状 root `index.html` を参照するため FileNotFound、`src/index.template.html` に修正

3. **`feat: audio_tap_hint を 6 言語に追加` (PR #68 由来)**
   - Complexity: L1, Change Pattern: C3 (data / i18n 追加)
   - i18n missing 1 の解消、原則 8 (6 言語で同じ声) の完成度向上

4. **`data: 弱形 36 件 cs_rule を ko / zh-Hans / zh-Hant に翻訳追加` (PR #70 由来)**
   - Complexity: L1, Change Pattern: C3
   - Q-7-A (Connected phrase 201 句) 完了に加えて、弱形 36 件も 6 言語化して完全対応

5. **`chore: PR 前検証で merge conflict marker 検索を運用化` (PR #74 由来)**
   - Complexity: L1, Change Pattern: C2
   - `docs/DEV-GUARDRAILS.md` に運用注記追加、または pre-commit hook / GitHub Actions
   - 手段の選定は Naoya さん判断

**優先度**: すべて L1 で影響範囲小、Phase 1 完了後 or Phase 1 と並行で処理可

### L-2: Track B ロードマップ整備

- 現状は `design-decisions.md` § Q-3-B, Q-6-B に散在
- Track A ローンチ準備完了後、Track B の初期タスクリストを別ファイル化 (`design/track-b-roadmap.md`)
- 主な項目: C1 拡張 (1,015 語 gap)、RP TTS 連結、Mode B Band UI 復活 (Q-2 判断次第)、React 化、BE 移管、Sentry、Playwright、7 言語追加 (es/pt-BR/vi/id/th/hi/ar)

### L-3: Phase 1 完了時のマイルストーン record

- Cluster 3/4 完了 + 実装反映完了時に、`_history/` に Phase 1 完結記録を作成
- Phase 2 (Track A/B 判定) への移行準備

---

## 完了時のフロー

タスク完了時:

1. このファイル (`pending-tasks.md`) の該当項目を更新 (完了マーク or 削除)
2. `handoff/current-state.md` の「次に着手するタスク」を更新
3. 大きなマイルストーン (Cluster 完了、Phase 完了) は `current-state.md` の最新エントリを prepend
4. Session log は個別に `logs/YYYY/MM/` に記録

## Naoya さんへの参照案内

新しい chat で IPA Sound Drill 相談を開始する時、以下の順で読むと状態把握が最速:

1. `handoff/current-state.md` (プロジェクト全体、最新エントリ = 2026-07-17)
2. `handoff/pending-tasks.md` (このファイル、優先度別残タスク)
3. `logs/2026/07/2026-07-17-phase-1-cluster-1-2-briefs-claude-design.md` (このセッションの詳細)
4. 必要に応じて `design-decisions.md` / `open-questions.md` / `design/phase-1/*.md`

## 履歴

- 2026-07-17: 初版 (セッション終了時、Phase 1 Cluster 1/2 到達を反映)
