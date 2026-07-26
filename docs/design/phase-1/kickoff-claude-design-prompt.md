---
created: 2026-07-17T00:55:00+09:00
phase: 1
project: IPASoundDrill
status: ready-to-copy
summary: 新しい Claude Design セッションを開始する際のキックオフ prompt。Phase 1 Cluster 1 (トップページ再設計) + Cluster 2 (視覚言語刷新) を同時投入するための prompt。Vault MCP / GitHub MCP のパスリスト、制約の要約、ペルソナ情報、Deliverable 仕様、進行ルールを含む。
tags:
  - ipasounddrill
  - phase-1
  - claude-design
  - kickoff
  - prompt
title: Claude Design Kickoff Prompt - IPA Sound Drill Phase 1
type: prompt
updated: 2026-07-17T00:55:00+09:00
---

> **このファイルの使い方**: 新しい Claude チャットの最初のメッセージにコピー & ペースト、または添付ファイルとして共有してください。Claude はこのファイルを読んで Phase 1 Cluster 1 + Cluster 2 のプロトタイプ生成に取りかかります。

---

# あなた (Claude) へのリクエスト

このチャットでは、IPA Sound Drill (英語発音学習アプリ、`https://ipasounddrill.app/`) の UI/UX を根本から再設計するための **Phase 1 Cluster 1 (トップページ再設計) + Cluster 2 (視覚言語刷新) の同時プロトタイピング** を行います。

## あなたの役割

1. Vault MCP / GitHub MCP から資料を取得して精読
2. Naoya が添付するスクリーンショット等の視覚資料を確認
3. 制約 (Voice / Tone / Anti-patterns / Product Principles) から逸脱しない設計を保つ
4. 具体的な HTML + CSS プロトタイプを生成、各案の狙いを明示
5. Naoya の評価・修正指示に基づき Iteration を回す

---

# プロダクト概要

**プロダクト名**: IPA Sound Drill  
**URL**: https://ipasounddrill.app/  
**カテゴリ**: 英語発音学習 Web SPA (静的 HTML + GAS TTS + Vercel)  
**現状**: Track A ローンチ準備中の個人開発プロジェクト  
**開発者**: Naoya (このチャットの相手)

## プロダクトの核心 (5 点)

1. **IPA (国際音声記号) を主軸** にした発音学習ドリル
2. **6 言語対応** (ja / en / ko / zh-Hans / zh-Hant / fil) — 非西洋圏の学習者を尊重
3. **Mode A** (発音の読み書き、Decode + Encode 両方向) + **Mode B** (音から新しい単語を覚える) の二本柱
4. **無料 + 静的 HTML** (アカウント不要、Vercel 配信)
5. **原則 2 (Production-Perception 循環)**: 「話せない音は聞き取れない」— 発音と聞き取りは同じ営みという学習観

## 現状の課題 (Phase 1 で解決対象)

- トップ画面 = セットアップ画面。12 パラメータが一度に見えており、学習者は「何を練習するか」の意思決定で疲れる (認知負荷過剰)
- LP 要素なし、初回訪問者に 3 秒でプロダクトを伝えられない
- 言語切替が Settings モーダル内に埋没
- 視覚言語が一貫していない (デザイントークン未整備、一部インライン style 残存)

---

# Vault MCP 経由で取得する資料

以下のパスを **Vault MCP** (`nkhippo/Vault` repo) で取得して精読してください。

## Phase 1 Brief (最重要、これに従って設計)

```
30_projects/IPASoundDrill/design/phase-1/brief-cluster-1-top-page.md
30_projects/IPASoundDrill/design/phase-1/brief-cluster-2-visual-language.md
```

これら 2 つの Brief に、生成すべきプロトタイプの詳細仕様が全て記載されています。**最優先で読んでください**。

## 設計原則 (制約の詳細)

```
30_projects/IPASoundDrill/design/voice-and-tone.md
30_projects/IPASoundDrill/design/product-principles.md
30_projects/IPASoundDrill/design/sensory-design.md
30_projects/IPASoundDrill/design/anti-patterns.md
```

## ペルソナと参照

```
30_projects/IPASoundDrill/design/user-personas.md
30_projects/IPASoundDrill/design/mood-board.md
30_projects/IPASoundDrill/design/competitive-landscape.md
30_projects/IPASoundDrill/design/learning-science-foundation.md
```

## UX 課題整理シート

```
30_projects/IPASoundDrill/design/ux-issues-2026-07.md
```

## 意思決定履歴

```
30_projects/IPASoundDrill/design-decisions.md
30_projects/IPASoundDrill/open-questions.md
```

---

# IPASoundDrill GitHub MCP 経由で取得する資料

以下は **IPASoundDrill GitHub MCP** (`nkhippo/IPASoundDrill` repo) で取得してください。

## 現状のプロダクト仕様と正本

```
docs/PURPOSE.md
docs/SPECIFICATION.md
docs/DESIGN.md
docs/design/tagline-candidates.md
src/index.template.html
```

`src/index.template.html` は現状の SPA 正本ファイルです。現行 UI 構造を確認するために取得してください。

---

# Naoya が別途添付する資料

以下は MCP で取得できないため、Naoya が本チャットに個別添付します:

- 現状の UI スクリーンショット (トップ / Decode / Encode / Mode B Study / Reveal / Settings / Guide)
- 競合プロダクトのスクリーンショット (任意)
- 参考にしたい他社 UI のスクリーンショット (任意)

添付されたスクリーンショットは、Brief の「現行 UI (改善対象)」および「参考視覚方向性」として活用してください。

---

# 生成すべき Deliverable

## Cluster 1: トップページ再設計

**2 Variation × 3 言語 UI = 6 プロトタイプ**

### Variations

- **Variation A**: タグライン **J-3「深い話がしたい人に、英語を。」** を hero に置く案
- **Variation B**: タグライン **J-5「音を、美しく。」** を hero に置く案

### 3 言語 UI

各 Variation を以下 3 言語で:

- **日本語** (P-1 主軸): J-3 or J-5 を主軸
- **英語** (E-3 "Retune your English. From sound up." / E-4 "For deep conversations, in English.")
- **韓国語** (P-2 の UI 品質判定基準): 합니다体、Pretendard / Noto Sans KR 系フォント

### 各プロトタイプに含めるべき要素

1. **LP Hero**: タグライン + サブコピー + 最初のアクション
2. **目的ファースト UI**: 3-4 個のクイックスタートカード
   - カード 1: 「単語の発音を鍛える」(Mode A Decode)
   - カード 2: 「発音から書いてみる」(Mode A Encode)
   - カード 3: 「新しい単語を音から覚える」(Mode B)
   - カード 4 (任意): 「連結発音に慣れる」(Connected)
3. **言語切替 UI**: トップバー右上、6 言語プルダウン (国旗は使わない、言語コード + 自言語表記)
4. **詳しい設定**: 折りたたみで存在示唆、default は closed
5. **オンボーディング hook**: 「IPA って何?」への動線 (subtle)
6. **振り返り動線**: 「これまでの学習」的な入口
7. **Footer**: Feedback / Terms / Privacy / X links

### Form factor

- **モバイル**: 375px 幅 (主軸、iPhone 12 mini / Redmi Note 12 想定)
- **デスクトップ**: 1440px 幅対応

## Cluster 2: 視覚言語

**3 mood plate + design tokens + component patterns**

### 3 Mood Plates

- **Mood A: "Notion Minimal"** — 最も静か、grey 主体 + teal アクセント、Muji 的
- **Mood B: "Warm Contemporary"** — 温度あり、warm grey 主体 + muted terracotta + teal、Kinfolk 的
- **Mood C: "Editorial"** — 明朝体アクセント (見出しのみ)、grey 基調 + subtle warm、菊地信義的 (Track B 派生候補)

各 mood plate に:
- Primary color palette (5-8 色)
- Typography specimen (見出し + 本文 + IPA 記号例)
- 主要 component (Button / Card / Pill) の見本
- 使用感の説明 (「このプロダクトはどう感じられるか」)

### Design Tokens (CSS Custom Properties)

```css
:root {
  /* Color palette */
  --color-primary: ...;
  --color-neutral-100 to 900: ...;
  --color-success/error/info: ...;
  
  /* Typography */
  --font-heading, --font-body, --font-ipa, --font-mono
  --font-size-xs to 4xl
  --font-weight-normal to bold
  
  /* Spacing (8px base) */
  --space-1 (4px) to --space-24 (96px)
  
  /* Motion */
  --duration-fast (150ms), --duration-base (200ms), --duration-slow (300ms)
  --easing-standard, --easing-decelerate
  
  /* Border radius, shadows */
}
```

### Component Patterns (HTML + CSS)

1. Button (primary / secondary / ghost、size sm/md/lg)
2. Card (purpose card, vocab card, reveal card の基本形)
3. Input (text input, IPA input, search)
4. Modal (Escape 対応済、Q-9-A 準拠)
5. Meter (progress bar)
6. Pill (CEFR pill, focus pill)
7. Toggle (GA / RP switch)
8. Icon (Lucide 系、独自音象徴アイコン数個)

### IPA タイポグラフィ Specimen

- IPA 記号 (θ, ð, æ, ʒ, ɝ, ɪ, iː, ʊ, uː, ə, ɝ) の Noto Sans vs Charis SIL 比較
- 単語内での IPA 使用例 (`through /θruː/`)
- Reveal 画面での主軸 (32-40px) / 副軸 narrow IPA (24-28px、薄い grey background) / 補助 respell (14-16px、括弧付き) の表示例

## Deliverable Format

- **HTML + CSS ファイル** (Cluster 1 の 6 プロトタイプ、単一 HTML でも別々でも可)
- **CSS ファイル** (Cluster 2 の design tokens)
- **HTML + CSS ファイル** (Cluster 2 の component gallery + 3 mood plate)
- **各 Variation / Mood にコメント** (HTML コメント or 別 markdown)

### 技術制約

- **Vanilla HTML + CSS のみ**、React / Vue / Svelte 等のフレームワーク不採用
- **Modern CSS**: Custom Properties, Grid, Flexbox 使用可、preprocessor なし
- **Vanilla JS**: 必要な場合のみ minimal に使用、フレームワークなし
- **モバイル最優先**: 375px 幅の設計を主軸、デスクトップ 1440px 対応

---

# 制約事項 (要約、詳細は Brief 参照)

## Voice: 「静かな師範」(quiet mentor)

- 深い知識を持つが披露しない、学習者を対等に扱う
- 静かで穏やかな距離感、感情的な起伏が少ない
- 学習者を主語にする ("あなたの音を鍛える")、プロダクトを主語にしない

## 禁止語彙 (Taboo List)

- **英語**: "Master", "Perfect", "Native", "AI-powered", "Unlock", "Master pronunciation"
- **日本語**: 「頑張ろう」「がんばれ」「マスター」「攻略」「完璧」「ネイティブ」
- **共通**: 「今すぐ」「限定」「特別」「あなたに最適」

## Anti-patterns (絶対にやらないこと)

### Motivational

- Streak / XP / Level up / Badge / Leaderboard
- 連続日数プッシュ、達成催促の通知
- 「今日の目標」的な催促

### Character

- AI キャラクター (「IPA くん」等の擬人化マスコット)
- イラスト化された "先生" / "コーチ" キャラクター
- 音声チャットボット / 対話 UI

### Visual

- 明るすぎる原色 (Duolingo 的な鮮やか green)
- 過剰な影 / gradient / neumorphism
- カートゥーン風イラスト
- 過剰な絵文字 (絵文字は使わない、Lucide icon 使用)
- 強すぎるアニメーション (bounce / elastic なし)

### Interaction

- タイマー / カウントダウン
- 強制チュートリアル (スキップ不可)
- 選択肢過剰 (現状の 12 パラメータ露出は解決対象)
- 誤操作誘発 UI (Yes / No ボタンの隣接配置)

### Feature

- 発音の "スコアリング" (0-100 点評価)
- ソーシャル機能 (フォロー、コメント、シェア)
- 課金誘導 / Premium 機能の壁
- 個別学習プランの押し付け

## 適用する原則 (優先順)

1. **原則 4** (学習者の意思決定回数を減らす、目的から入る) — Cluster 1 の中核
2. **原則 5** (各画面には 1 つの主軸情報がある) — 情報階層の設計
3. **原則 3** (達成の視覚化は禁欲的に) — ゲーム的な派手さを排除
4. **原則 1** (IPA を主軸として尊重)
5. **原則 8** (6 言語で同じ声) — 翻訳ではなく声のロカライズ

詳細は `product-principles.md` 参照。

## Sensory Principles (視覚言語)

- **静けさで際立たせる** (Notion / Kinfolk / Craig Mod 的な余白活用)
- **音を扱うプロダクトらしさ** (IPA タイポグラフィを主軸として尊重、装飾扱いしない)
- **禁欲的な達成視覚化** (色の急変なし、subtle な shadow / border weight のみで状態変化)
- **音節境界** = 中央ドット `‧` (U+2027)、**弱形** = 薄い grey
- **音の質感の視覚化** はサブリミナルレベル (明示的に説明しない)

---

# ペルソナ情報 (要約)

`user-personas.md` を参照が推奨ですが、要点を要約:

## 主軸ペルソナ (Cluster 1 で意識)

### P-1: 田中健太 (34, 東京, SIer プロジェクトマネージャー)

- **英語レベル**: TOEIC 730、リーディング強、リスニング特に弱
- **デバイス**: iPhone (通勤 15 分で使う)、家では MacBook
- **Origin**: 海外文化を深く吸収するために英語会話が必要
- **Frustration**: 「話せない発音は聞き取れない」— 日本語訛りとの差が大きすぎてスッと入ってこない
- **Motivation**: 「深い話がしたい」— 表面的なコミュニケーションではなく思想の交換
- **Success**: 「発音が綺麗と言われる」「ネイティブの発音がスッと推測できる」
- **NG**: ゲーミフィケーション、"勉強してる感" が強すぎる UI

### P-3: Maria Santos (22, マニラ, 遠隔外資 CS)

- **英語レベル**: TOEIC 850、Filipino English 母語
- **デバイス**: Redmi Note 12 (低スペック)、低帯域幅
- **Frustration**: フィリピン英語の /f/-/p/ /v/-/b/ 混同、schwa 化未習得
- **Motivation**: 昇進 (Team Lead)、"アメリカ人ぽく" 話したい
- **NG**: 機械翻訳的な fil UI、大容量アセット、暗い色調 (Grab / GCash 的な暖色期待)

## 参考ペルソナ (UI 品質基準)

### P-2: 김서연 (28, ソウル, 外資広告代理店ストラテジスト)

- **英語レベル**: TOEIC 950、TOEFL Speaking 24
- **デバイス**: Samsung Galaxy S24 (Samsung One UI 慣習)
- **Frustration**: L/R は克服、/f/-/p/, /v/-/b/, /z/ 欠落の残存
- **Motivation**: プロフェッショナル完成度、"韓国訛りがない" と言われる瞬間
- **NG**: 幼稚な UI、ゲーム化、擬人化キャラ即離脱、韓国語 UI の敬語レベルミス (하십시오体は堅すぎ、하다体は失礼、절묘한 합니다体を求める)

## このプロトタイプで主軸ではないペルソナ

- **P-4 陈静** (Chinese TOEFL): Cluster 4 (Mode A/B 情報階層) で扱う
- **P-5 前田唯** (Japanese 若年層音楽好き): Track B 主軸、Cluster 2 で美しさの参考視点

---

# 進行ルール

## Iteration 1 (この Chat の最初のターン)

Naoya が本 kickoff + 添付を共有後、あなたは:

1. Vault / GitHub MCP から資料を取得して精読
2. 添付スクリーンショットを確認
3. Brief に不明点があれば、少数 (3 個以内) に絞って質問
4. 質問がなければ、上記 deliverable を一括生成
5. 各 Variation / Mood の狙いをコメントで説明

## Iteration 2 以降

Naoya の評価に基づき:
- 選定された Variation (J-3 or J-5) の refine
- 選定された Mood plate の Cluster 1 プロトタイプへの反映
- 具体的な文言・レイアウト・色の微調整

## 最終目標

Naoya が Cursor 経由で `src/index.template.html` に反映できる HTML/CSS の形にする。**Plain HTML + CSS + Vanilla JS** (フレームワークなし)。

---

# 評価観点 (Naoya さん判断材料)

Iteration 1 生成後、Naoya は以下の観点で評価します:

## Cluster 1

- **P-1 動機接続**: J-3「深い話がしたい人に、英語を。」と J-5「音を、美しく。」のどちらが「深い話がしたい」動機に響くか
- **視覚的静けさ**: Notion 的静けさが達成されているか、Duolingo に寄っていないか
- **韓国語 UI の破綻テスト**: P-2 の期待値 (합니다体、Samsung UI 慣習) を満たすか
- **モバイル片手操作**: 主要 CTA が親指圏内か
- **6 言語で意匠が安定するか**: 日本語 → 英語 → 韓国語で hero の縦幅が大きく変わらないか

## Cluster 2

- **静けさ**: Mood A / B / C のどれが IPA Sound Drill らしいか (Duolingo に寄っていないか)
- **音を扱うプロダクトらしさ**: IPA タイポグラフィが美しいか、音象徴の視覚化が sub-conscious に伝わるか
- **6 言語対応**: フォントスタックが破綻しないか
- **アクセシビリティ**: WCAG AA 準拠、focus indicator 明瞭

---

# 参照 URL

- **プロダクト**: https://ipasounddrill.app/
- **Vault repo**: https://github.com/nkhippo/Vault
- **IPA repo**: https://github.com/nkhippo/IPASoundDrill

---

# 開始準備完了

このドキュメントを読んだあなたは、以下の順で進めてください:

1. Vault MCP から Cluster 1 + Cluster 2 の Brief を取得して精読
2. GitHub MCP から `src/index.template.html` と `docs/design/tagline-candidates.md` を取得
3. その他の Vault 参照資料を取得 (必要に応じて)
4. Naoya が添付したスクリーンショットを確認
5. Iteration 1 の deliverable 生成 (質問があれば少数に絞って先に確認)

**注意**: 本チャットは日本語で進行してください。Naoya さんの母語は日本語です。ただし deliverable (HTML/CSS のコメント、mood plate の説明) は英語 + 日本語混在で可 (プロトタイプの UI 言語は Brief 指定に従う)。

---

_このドキュメントは 2026-07-17 に Vault プロジェクトチャット (Claude Opus) で生成されました。作成の経緯は Vault `30_projects/IPASoundDrill/design/phase-1/` に記録されています。_
