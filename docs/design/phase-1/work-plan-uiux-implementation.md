---
aliases:
  - pj-2026-07-18-9a10
created: 2026-07-18 20:30:00+09:00
id: pj-2026-07-18-9a10
project: IPASoundDrill
status: frozen
summary: "[FROZEN 2026-07-19] Phase 1 UI/UX 実装 Design → Cursor 引き渡しの初期作業整理。9 フェーズ実装順序案と Cursor 委譲前 10 論点 (Q-12〜Q-21) を提案。現実の進捗と乖離が進むため凍結。最新の実装状況・意思決定・open questions は current-state.md / design-decisions.md / open-questions.md を参照。Phase 1-A 起票以降の状態把握には使用しない。当初計画の歴史的記録としてのみ保存。"
tags:
  - ipasounddrill
  - phase-1
  - design
  - work-plan
  - cursor-handoff
title: Phase 1 UI/UX 実装 - 作業整理 (Design → Cursor)
type: knowledge
updated: 2026-07-19T14:09:05+09:00
---

## Summary

Claude Design で確定した Phase 1 UI/UX (Variation B「音を、美しく。」+ Mood B / Warm Contemporary) を Cursor 実装へ回すための作業整理。design ファイル (`IPA Sound Drill - Phase 1.dc.html`) の frame 全 14 件を漏れなく列挙した上で、9 フェーズの実装順序と、Cursor 委譲前に Claude / Claude Design と持ち帰り相談すべき 10 論点を定義する。

Claude Design から Naoya さんが持ち帰ったフォールバック zip 2 本 (中身は同一) を起点にした整理。

## 1. Design ファイル内 frame の完全リスト

Claude Design 出力 (`IPA Sound Drill - Phase 1.dc.html`) から抽出した 14 frame + 基盤資料 2 種。

### トップページ (モバイル 375px、確定)

| ID | 内容 |
|---|---|
| 4a | JA モバイル top「音を、美しく。」 (Mood B 配色 × 明朝見出し) |
| 4c | EN モバイル top "Retune your English. From sound up." |
| 4d | KO モバイル top「소리를, 아름답게.」 |

### 通しフロー & マーキング (ドリル本体・4 種)

| ID | 内容 |
|---|---|
| 7a | 音から単語を書く (音 + IPA 記号 → スペル入力 → 答え合わせ) |
| 7b | 発音から書いてみる (綴り → IPA をキーボードで組み立て → 正解/不正解) |
| 7c | 音から単語を覚える (聞き取り + IPA ヒント → 答え・意味、選択肢スキップ) |
| 7d | 連結する音に慣れる (文中フレーズを聞く → 入力 → 答え合わせ) |

共通仕様: 強勢母音 amber 下線、アクセント (GA/RP) はヘッダー固定、CEFR レベルタグは各カード STEP 行の右上、完全一致判定、マーキング (3 回で卒業・目的ごと独立)。

### 支援画面 (7 種)

| ID | 内容 |
|---|---|
| 8z | 学習プロフィール (アクセント + CEFR レベル、目的カード→ドリルの間、初回のみ / 後から変更可) |
| 8a | 語彙リスト (内蔵辞書、IPA 部分一致最大 3 + A–Z 接頭辞スクロール、GA/RP 個別発音) |
| 8a→ | IPA 記号ピッカー (最大 3 選択、GA/RP 切替) |
| 8b | 学習状況 (CEFR レベル別) |
| 8c | IPA って何？ (思想モーダル) |
| 8d | 言語設定 (表示言語のみ) |
| 8e | ガイド = 初回オンボーディング 4 スライド |
| 8f | このアプリについて (思想モーダル、多言語、スクロール) |

### PC / デスクトップ (2 種)

| ID | 内容 |
|---|---|
| Pt | トップページ 1440px (JA、目的カード 4 列グリッド) |
| Pd | ドリル 1024px 2 ペイン (「音から単語を書く」を代表として提示) |

### 基盤資料

- **Phase 1 デザインガイドライン**: カラートークン (10 変数) / タイポ (Noto Serif JP/KR + Noto Sans + Charis SIL) / スペーシング / 角丸 / シャドウ / 基本コンポーネント (Button 4 種、目的カード、Pill/Toggle、Progress meter)
- **設計判断まとめ**: マーキング / 判定・アクセント / レベル・構造 / 各ドリル要点

### この一覧に含まれない (別途対応が必要なもの)

- **絞り込みボトムシート `3b`**: デザインガイドラインで言及されるが frame としては未提供 → Phase 1-I で Claude Design 追加 iteration が必要
- **EN/KO のドリル画面 (`7a`-`7d` 相当)**: 「JA と同一構造」注記のみで frame なし → i18n キー追加で足りるか要確認 (Q-14 参照)
- **PC 版の残 3 ドリル**: `Pd` は「音から単語を書く」1 種のみ → 展開方針を要確認 (Q-15 参照)

## 2. 実装順序案 (9 フェーズ)

土台 → 導線骨格 → 中身 → 周辺 → 展開 の順。各フェーズ = 1 Cursor Issue = 1 PR を想定。開発運用型共通ルールの改修分類ブロックに従い、L1/L2/L3、Change Pattern、堅固化パターン A/B/C を Issue ごとに判定する。

### Phase 1-A: 視覚言語トークン基盤 【最優先】

他全 PR の前提。トークンだけで PR して、後続 PR は「既存トークンを参照するだけ」で済ませる。

- カラートークン (`--paper`, `--panel`, `--ink`, `--muted`, `--faint`, `--hair`, `--signal`, `--signal-soft`, `--accent`, `--stress`)
- タイポ (Noto Serif JP/KR 見出し + Noto Sans 本文 + Charis SIL IPA)
- スペーシング (4 / 8 / 14 / 20 / 26px)、角丸 (`--radius-card` 14px、`--radius-pill` 999px)、シャドウ (`--shadow-card`)
- 基本コンポーネント: Button primary/secondary/accent/link、目的カード (選択/非選択)、Pill、Toggle (GA/RP)、Progress meter
- **アウトプット**: `index.template.html` の `<style>` 更新のみ。既存画面の見た目は変わるが構造は据え置き

### Phase 1-B: トップページ (導線の中核)

- `4a` JA モバイル top に差し替え
- 「詳しい設定」を top から撤去、目的 4 カードで 1 タップ即開始
- フッター 3 リンク (学習状況 / IPA って何？ / このアプリについて)
- ヘッダー: 言語切替 + ガイドアイコンのみ

### Phase 1-C: 学習プロフィール (top → ドリル間の必須ゲート)

- `8z` を新設。初回のみ強制、以降はプロフィール画面から変更可
- **データ設計変更**: アクセント (GA/RP) と CEFR レベル (複数選択) の永続化スキーマ (Q-16 参照)

### Phase 1-D: ドリル本体 (4 種、2 PR 分割推奨)

- **D-1**: `7a` (音から単語を書く) + `7b` (発音から書いてみる) — 入力系ペア
- **D-2**: `7c` (音から単語を覚える) + `7d` (連結する音に慣れる) — 音声系ペア
- 共通: 強勢母音の amber 下線、CEFR タグ右上、完全一致判定、マーキング (3 回で卒業・目的ごと独立)

### Phase 1-E: 支援画面 (並列化可)

- **E-1**: `8a` 語彙リスト + `8a→` IPA ピッカー
- **E-2**: `8b` 学習状況 (CEFR レベル別)
- **E-3**: `8c` IPA って何？ + `8f` このアプリについて (モーダル 2 種)
- **E-4**: `8d` 言語設定

### Phase 1-F: オンボーディング

- `8e` 4 スライドガイド、初回訪問時のみ発火 (発火判定は Q-21 参照)

### Phase 1-G: 多言語

- `4c` EN top / `4d` KO top (残 4 言語 zh-Hans / zh-Hant / fil も同時)
- ドリル画面の i18n キー追加 (JA が Phase 1-D で確定後)

### Phase 1-H: PC 版

- `Pt` 1440px top (4 列グリッド)
- `Pd` 1024px 2 ペインドリル (全 4 種展開、Q-15 の方針決定後)

### Phase 1-I: セッション内絞り込み (`3b`、frame 未提供)

- Claude Design で追加 iteration → 仕様確定 → 実装

## 3. Cursor 委譲前の Claude 確認ゲート (10 論点)

Naoya さん要望に基づき、各 Issue 起票の前に以下 10 論点を Claude 側で通す運用。詳細は `open-questions.md` の Q-12〜Q-21 として管理し、判断確定したものから `design-decisions.md` へ移送する。

### UX 解釈が複数ありうる (Claude / Claude Design と要相談) — 4 件

| ID | 論点 | 影響 Phase |
|---|---|---|
| Q-12 | top カード #1 の名称ゆれ: top page「音の発音を確かめる」vs ドリル本体 `7a`「音から単語を書く」→ 同一機能の別名か、別画面か | 1-B, 1-D |
| Q-13 | 絞り込みボトムシート `3b` の仕様: ガイドラインで言及されるが frame 未提供、Claude Design 追加 iteration の要否 | 1-I |
| Q-14 | EN/KO ドリル画面: 「JA と同一構造」注記のみで frame なし → i18n キー追加だけで足りるか、視覚的検証が要るか | 1-G |
| Q-15 | PC 版ドリル: `Pd`「音から単語を書く」1 種のみ提示 → 残 3 ドリルの PC レイアウトは JA モバイルから機械展開でよいか | 1-H |

### 現状データ / 現行仕様との整合 (実装可否 or 判断が難しい) — 6 件

| ID | 論点 | 影響 Phase |
|---|---|---|
| Q-16 | マーキング 4 目的独立: 現行 Local Storage schema は 1 単語 = 1 状態の前提 → マイグレーション設計 | 1-C, 1-D |
| Q-17 | CEFR レベル (A1/A2/B1...) が単語ごと: 語彙 CSV/JSON にレベルタグが全語に付与されているか | 1-C, 1-D |
| Q-18 | GA/RP で IPA が異なる語: 現行辞書データが GA/RP 個別 IPA を保持しているか、音声ファイルは分離済みか | 1-E (8a) |
| Q-19 | 語彙リスト IPA 部分一致検索 (最大 3 記号): クライアント側全語走査で許容 latency に収まるか | 1-E (8a) |
| Q-20 | 「詳しい設定」top 撤去: 現行 12 パラメータのうち、どれをプロフィール (8z) へ・どれをセッション内絞り込み (3b) へ・どれを廃止するかの割り振り | 1-B, 1-C, 1-I |
| Q-21 | オンボーディング 4 スライドの発火判定: 初回訪問の永続化キー、スキップ時の再表示条件 | 1-F |

### 運用ルール

- 各 Phase 着手前に **その Phase に関連する Q を確定させる**
- 確定した項目は本ファイルから消化 (`design-decisions.md` へ移送)
- Q の未確定を握ったまま Cursor に投げない (silent failure 防止)
- Claude Design の追加 iteration が必要な項目 (現状: Q-13 相当) は、Cursor Issue 化ではなく Claude Design セッションを先行させる

## 4. 次のアクション

1. 【本セッション】Phase 1-A (視覚言語トークン基盤) の Cursor Issue 案を起草 → Naoya さん承認 → `IPASoundDrill GitHub` MCP で `create_issue`
2. 【Phase 1-A 実装中】Q-12・Q-20 を解決 (Phase 1-B に必要)
3. 【Phase 1-A merge 後】Phase 1-B の Issue 案を起草
4. 【並行】Q-13 の Claude Design 追加 iteration を Naoya さん判断で発動

## 参照

- Design 出力: Naoya さんが Claude Design から持ち帰った `Kickoff_design_prompt.zip` (Chat 内添付、Claude 側で解析済み)
- 前 Chat log: `30_projects/IPASoundDrill/logs/2026/07/2026-07-17-phase-1-cluster-1-2-briefs-claude-design.md`
- Cluster brief: `30_projects/IPASoundDrill/design/phase-1/brief-cluster-1-top-page.md`, `brief-cluster-2-visual-language.md`
- Kickoff prompt: `30_projects/IPASoundDrill/design/phase-1/kickoff-claude-design-prompt.md`
- 意思決定履歴: `30_projects/IPASoundDrill/design-decisions.md`
- 未解決論点: `30_projects/IPASoundDrill/open-questions.md` (Q-2 + Q-12〜Q-21)
- 現状 handoff: `30_projects/IPASoundDrill/handoff/current-state.md`
 