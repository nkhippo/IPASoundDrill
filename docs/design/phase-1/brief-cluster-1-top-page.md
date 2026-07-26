---
cluster: 1
created: 2026-07-17T00:30:00+09:00
phase: 1
project: IPASoundDrill
status: ready-for-claude-design
summary: Phase 1 Cluster 1 の Claude Design へのブリーフ。トップページ再設計 (LP + 目的ファースト UI + 言語切替 + オンボーディング)。主軸 P-1 (日本 SIer PM、モバイル通勤学習)、準軸 P-3 (フィリピン CS、低帯域幅)、参考 P-2 (韓国 UI 品質判定)。2 Variation (J-3 vs J-5) × 3 言語 (ja/en/ko) = 6 プロトタイプを生成設定。
tags:
  - ipasounddrill
  - phase-1
  - cluster-1
  - top-page
  - purpose-first-ui
  - claude-design
title: Phase 1 Cluster 1 Brief - Top Page Redesign
type: design-brief
updated: 2026-07-17T00:30:00+09:00
---

## この Brief の位置づけ

- **Phase**: Phase 1 (Claude Design プロトタイプ探索)
- **Cluster**: 1 (トップページ再設計、目的ファースト UI)
- **対応 UX 課題**: N-2 (トップ目的不明瞭)、N-3 (目的ファースト UI)、C-1 (設定パラメータ多階層)、C-3 (多言語 SEO / 言語切替)、C-4 (タグライン確定)、C-7 (オンボーディング欠如)
- **依存 Cluster**: なし (Cluster 1 は最初に起草)
- **後続 Cluster への影響**: Cluster 2 (視覚言語) の方向性を規定、Cluster 3 (Reveal) の初期設計と接続

## 参照資料

- Vault `30_projects/IPASoundDrill/design/user-personas.md` (P-1〜P-5、特に P-1/P-2/P-3)
- Vault `30_projects/IPASoundDrill/design/product-principles.md` (8 原則、優先順位付き)
- Vault `30_projects/IPASoundDrill/design/voice-and-tone.md` (静かな師範、Tone Spectrum §初回訪問)
- Vault `30_projects/IPASoundDrill/design/sensory-design.md` (静けさ、IPA タイポグラフィ)
- Vault `30_projects/IPASoundDrill/design/anti-patterns.md` (Category A/B/C 特に注意)
- Vault `30_projects/IPASoundDrill/design/competitive-landscape.md` (Duolingo / ELSA との差別化)
- Vault `30_projects/IPASoundDrill/design/mood-board.md` § 1 静けさ、§ 3 タイポグラフィ、§ 5 6 言語圏
- IPA repo `docs/PURPOSE.md` § Personas & Learning Journey (公開版)
- IPA repo `docs/design/tagline-candidates.md` (J-3 / J-5 主軸候補)
- IPA repo `docs/SPECIFICATION.md` §4.0 全画面共通・§4.1 セットアップ (現状構造)

---

## 1. What we're designing

IPA Sound Drill の **トップ画面 (エントリー画面)** を根本から再設計する。

**現状の問題**: トップ = セットアップ画面。12 のパラメータ (Mode 選択、CEFR、focus、spelling、Connected filters 等) が一度に見えており、学習者は「何を練習するか」の意思決定で疲れて、「音を鍛える」本題に到達しにくい。加えて、LP 要素 (プロダクトの説明、タグライン、初回訪問者への案内) が皆無。

**目指す姿**: 学習者が **目的から入る** UI。「今日は何を鍛えたい?」を主軸にして、内部の Mode / CEFR / focus 設定は目的カード選択で自動決定。上級者向けの「詳しい設定」は折りたたむ。トップは同時に LP 要素も担い、初回訪問者に 3 秒でプロダクトの本質を伝える。

**含めるべき要素**:

1. **LP Hero**: プロダクトの本質を 3 秒で伝えるヘッダー (タグライン + サブコピー + 最初のアクション)
2. **目的ファースト UI**: 学習目的別のクイックスタートカード 3-4 個 (「聞き取りを鍛える」「新しい単語を音から覚える」「連結発音に慣れる」等)
3. **詳しい設定 (deep entry)**: 上級者向けの現状 12 パラメータへのアクセス。デフォルトは折りたたみ
4. **言語切替 UI**: トップバー右上に常時表示 (6 言語、現状は Settings モーダル内に埋没)
5. **オンボーディング hook**: 初回訪問者向けの「IPA って何?」的な短いガイドへの動線
6. **振り返り動線** (Q-11-C 反映): 過去の学習履歴・進捗の入口 (Reflect dock 廃止に伴う機能移設)

---

## 2. Who it's for

### 主軸ペルソナ

- **P-1: 田中健太 (34, 東京, SIer プロジェクトマネージャー、TOEIC 730)**
  - 動機: 「海外文化を深く吸収するために英語会話が必要」「深い話がしたい」
  - 苦悩: 「話せない発音は聞き取れない」— 日本語訛りが染み込んで、ネイティブとの差でスッと言葉が入ってこない
  - 成功: 「発音が綺麗だね」「聞き取りやすい」と言われる瞬間
  - デバイス: iPhone (通勤 15 分で使う)、家では MacBook

### 準軸ペルソナ

- **P-3: Maria Santos (22, マニラ, 外資 CS、TOEIC 850)**
  - フィリピン英語の /f/-/p/ /v/-/b/ 問題、schwa 化の未習得
  - デバイス: Redmi Note 12 (低スペック)、低帯域幅
  - 動機: 昇進、"アメリカ人ぽく" 話したい

### 参考ペルソナ (UI 品質基準)

- **P-2: 김서연 (28, ソウル, 外資広告代理店、TOEIC 950)**
  - 韓国語 UI 品質が最も厳しい判定者 (합니다体、Samsung UI 慣習)
  - 幼稚な UI・ゲーム化は即離脱
  - "Your English is very clear" と言われるプロフェッショナル完成度志向

### このプロトタイプで主軸ではないペルソナ

- **P-4 陈静** (Chinese TOEFL): TOEFL 対策訴求は Cluster 4 (Mode A/B 情報階層) で扱う
- **P-5 前田唯** (Japanese 若年層): Track B 主軸、Cluster 2 (視覚言語) で美しさの参考視点

---

## 3. What success looks like

### 感情面 (各ペルソナの主観)

- **P-1**: 「これは自分向けだ」と 3 秒で感じる。派手さがなく、大人の学習ツールとして真剣に見える
- **P-3**: 「私の英語も対象なのか」— フィリピン英語や非西洋圏の学習者を想定した UI と感じる
- **P-2**: 「翻訳された英語 UI ではなく、韓国語ネイティブとして設計された UI」と感じる

### 具体的 UI 挙動

- 目的カードのタップから **2-3 タップで最初の学習セッション** に到達
- 言語切替は **1 タップで完了** (現状の Settings 経由からの解放)
- LP 要素と学習エントリの境目が **視覚的に明確** (両者が混在せず、しかしシームレスに繋がる)
- **モバイル片手操作** で全機能にアクセス可能

### 定量目標 (Phase 3 分析で測定)

- 初回訪問から最初の学習セッション開始までの時間: **60 秒以内** (現状は不明、ベースライン測定を並行)
- 目的カード経由の学習開始率: **60% 以上** (詳しい設定経由は上級者フォールバック)
- 言語切替 UI の発見率: **90% 以上** (現状の Settings 埋没から解放)
- 初回訪問者の 5 分以内離脱率削減 (現状比 30% 削減を目標)

---

## 4. What we're NOT doing

以下は Anti-patterns Catalog に基づき、**明示的に排除**:

### Category A (Motivational)

- **A-1**: 連続日数 / Streak プッシュ (「7 日連続!」表示なし)
- **A-2**: XP / Level up バッジ (トップに数値化された成長表示なし)
- **A-3**: 連続正解時のファンファーレ (Cluster 3 でも同様)
- **A-5**: プッシュ通知の実装なし (Track A)

### Category B (Character)

- **B-1**: AI キャラクター / マスコット (「IPA くん」等の擬人化不可)
- **B-2**: イラスト化された "先生" / "コーチ" キャラクター (LP に人物イラストは可、ただし art quality で professional な写真 or 抽象イラスト)

### Category C (Visual)

- **C-1**: 明るすぎる原色 (Duolingo 的な鮮やか green は不採用、現行 teal `#0C7C7E` の系統は許容)
- **C-2**: neumorphism / 過剰な影
- **C-3**: カートゥーン風イラスト (子供扱い)
- **C-4**: 過剰な絵文字 (絵文字は使わない、必要なら Lucide 系アイコンフォント)

### Category D (Interaction)

- **D-3**: 選択肢過剰 (現状の 12 パラメータ露出は本 Cluster が解決する対象、プロトタイプでこれを繰り返さない)

### Category E (Language)

- 禁止語彙: "Master", "Perfect", "Native", "AI-powered", "Unlock", "Master pronunciation" (Voice & Tone Taboo List 参照)

### このブリーフ固有の NG

- **LP と Setup の分離が視覚的に強すぎる**: 「LP は営業的、Setup は事務的」的な断絶を作らない。両者はシームレスに繋がる
- **「Advanced settings」的な露骨な表現**: 「詳しい設定」は自然な表現、「Advanced」「Expert mode」等の階層化は避ける
- **「登録」「サインアップ」的な誘導**: Track A はアカウント不要、そもそも登録動線を作らない

---

## 5. Voice & tone constraints

**Voice**: 静かな師範 (quiet mentor) — voice-and-tone.md 参照

**このブリーフの Tone**: 初回訪問シーン = **温度 7/10 (やや温かい)**

- 学習者を歓迎する温かさは持つが、"うれしそう" ではない
- 「あなた向けだ」を伝えるが、押し付けがましくない

### 使う言葉 (推奨)

- 「音を鍛える」「音から始める」「発音を練り直す」「深い話がしたい人に」
- 「はじめる」「試してみる」(コマンド)
- 「6 言語対応」「無料」(客観的事実の記述)

### 避ける言葉

- **禁止**: "Master", "Perfect", "Native", "AI", "Unlock", "頑張ろう", "がんばれ", "マスター"
- **避ける**: 「今すぐ」「すぐに」(焦らせる)、「限定」「特別」(煽り)、「あなたに最適」(押し付け)

### タグライン (このブリーフで主要テスト対象)

- **主軸**: J-3「深い話がしたい人に、英語を。」— P-1 動機と直接接続
- **副軸**: J-5「音を、美しく。」— P-1 の "発音が綺麗" 成功体験接続
- **英語版**: E-4 "For deep conversations, in English." (J-3 対応)
- **英語版副**: E-3 "Retune your English. From sound up." (J-4 対応)

Claude Design には **主軸 + 副軸の 2 案** を hero に置いた 2 バリエーションを作成させ、視覚的印象を比較する。

### 6 言語での翻訳可能性

- J-3 は 6 言語すべてで translation quality が保てる (ko/zh/fil で "深い話" 相当の表現が存在)
- J-5「音を、美しく」は美的評価軸を持つ言語 (ja、ko) で強い、fil/zh でやや弱まる可能性

---

## 6. Sensory principles

sensory-design.md § 5 中核質問 に基づく:

### 静けさ (Category 1 mood-board.md)

- **Notion 的トーン**: 灰色系ベース + 温度のあるアクセント色 (現行 teal `#0C7C7E` 系統維持)
- **余白**: 情報間の余白を大胆に取る (「静けさで際立たせる」)
- **Kinfolk 的グリッド**: 目的カード配置は grid、しかし symmetric 過ぎず有機的

### IPA タイポグラフィ (Category 3)

- **フォント**: 見出し = Noto Sans (現行)、IPA 記号露出時は Charis SIL 検討 (Reveal 用と統一)
- **Weight**: 通常 400、強調 500 まで。Bold 700 は避ける
- **色**: IPA と一般テキストで色を分けない (IPA は "特殊な記号" ではなく "音の表記")

### 目的カードの視覚設計

- **形状**: 角丸長方形 (現行 UI 慣習と接続)、円形や強い曲線は avoid
- **選択状態**: hover / focus / active で subtle な elevation (shadow) or border weight 変化。**色の急変は禁止**
- **アイコン**: 各カードに 1 つ、Lucide 系の minimal line icon (音の波形、耳、口 等の抽象化)。カートゥーン・写真は禁止

### 言語切替 UI

- **配置**: トップバー右上に固定 (`#settingsBtn` の位置を参考)
- **表現**: 現在の言語コード (`JA` / `EN` / `KO` 等) + 小さな ▾。国旗は不採用 (国旗は言語ではないため、fi 話者はフィリピン国旗と英語 UI の混同を嫌う)
- **プルダウン**: 6 言語一覧、各言語は自言語表記 (`日本語` / `English` / `한국어` / `简体中文` / `繁體中文` / `Filipino`)

### 音再生ボタン (LP のプレビュー音声などがある場合)

- **通常時**: 静か、目立たせない
- **tap 時**: 微妙な pulse (音の質感を暗示)、ファンファーレ的演出は禁止

---

## 7. Product principles that apply

### このプロトタイプで最重要 (Identity 核 + UX 中核)

- **原則 4 (学習者の意思決定回数を減らす。目的から入る)**: このブリーフの中核原則。目的カードで大半の設定を自動決定
- **原則 5 (各画面には 1 つの主軸情報がある)**: トップの主軸は「目的選択」、LP 要素と詳しい設定は補助配置
- **原則 3 (達成の視覚化は禁欲的に)**: LP hero も達成を煽らない、"cleaner English" は "master English" より正当

### 適用される (Identity 核)

- **原則 1 (IPA を主軸として尊重)**: LP でも IPA が主軸プロダクトであることを伝える (「IPA (発音記号) で学ぶ」を隠さない)
- **原則 2 (Production-Perception 循環)**: LP のサブコピーで「話す→聞く」の循環を暗示可能 (直接 "モーター理論" と書かない)

### 適用される (運用)

- **原則 8 (6 言語で同じ声)**: すべてのコピーが 6 言語で voice-and-tone 準拠

### このブリーフでは適用しない

- **原則 6 (音の視覚化)**: Cluster 3 (Reveal) で扱う
- **原則 7 (学習履歴は所有物)**: Vocab / SRS 履歴の詳細 UI は別 Cluster 想定 (振り返り動線のみ含む)

---

## 8. Technical constraints

### Track A の技術制約

- **静的 HTML**: `src/index.template.html` (single template) → Vercel Build で 6 言語 HTML 生成
- **Vanilla JS のみ**: React / Vue / Svelte 等のフレームワーク不採用
- **CSS**: モダン CSS (Grid, Flexbox, Custom Properties 使用可)、Preprocessor なし
- **音声**: GAS 経由 TTS (LP 上での音声プレビューは慎重に、モバイル自動再生ブロック考慮)
- **アセット**: 現状の `--signal: #0C7C7E` 系統色を含む Custom Properties を維持

### モバイル最優先

- **主軸幅**: 375px (iPhone 12 mini, Redmi Note 12 等)
- **デスクトップ対応**: 1440px 幅まで対応、しかしモバイル UI の設計優先
- **片手操作**: 主要な CTA はモバイルで親指圏内に配置

### 6 言語対応

- **言語切替**: URL 構造は `/{lang}/index.html` (現行)
- **フォント**: Noto Sans 系で全言語カバー、Noto Sans JP / KR / SC / TC / Filipino Sans
- **RTL 対応**: 現状の 6 言語には RTL なし (アラビア語は Track B)、しかしフレームワーク的に将来対応可能な設計

### アクセシビリティ

- **キーボード操作**: すべての CTA が Tab でアクセス可能、Escape でモーダル閉じる (Q-9-A 実装済)
- **ARIA**: 目的カードは `role="button"` / `aria-label` 付与
- **コントラスト**: WCAG AA 準拠 (色使い、特にモバイルの明るい環境下)

### パフォーマンス

- **初期ロード**: モバイル 3G で 3 秒以内 (P-3 の低帯域幅対応)
- **アセット**: 画像は WebP、フォントは subset (使う文字のみ)、SVG icons のみ (raster icon 不採用)
- **音声**: 初回訪問時に音声を preload しない (帯域幅節約)

---

## 9. References

### 視覚方向性 (mood-board.md から)

- **Category 1 (静けさ)**: Notion, Kinfolk magazine, Craig Mod Special Projects
- **Category 3 (タイポグラフィ)**: Charis SIL (IPA 対応)、Noto Sans 系
- **Category 4 (反面教師)**: Duolingo (過度なゲーム化、明るい色)、Rosetta Stone (硬派すぎ)
- **Category 5 (6 言語圏 UI)**: Naver / Kakao (韓国)、WeChat (中国簡体)、GCash / Grab (フィリピン)、Notion 日本語版

### 競合との差別化 (competitive-landscape.md から)

- **vs Duolingo**: LP に「無料」を強調しない (Duolingo の Free/Premium 誘導と対比)、ゲーム的要素なし
- **vs ELSA Speak**: LP に "AI-powered" を絶対に使わない、キャラクターなし
- **vs Rosetta Stone**: 硬派すぎず、大人の学習者を "受験生" に固定化しない
- **vs Cambridge Dictionary**: IPA を主軸にしつつ、"辞書" ではなく "学習ツール" として設計

### 現状 UI (改善対象)

- 現行 IPA Sound Drill (`https://ipasounddrill.app`) のトップ画面: 12 パラメータの Setup 直入り
- スクリーンショット: (Naoya さんが Claude Design セッションで共有推奨)

### タグライン候補 (tagline-candidates.md から)

主要 hero テスト:
- 主軸: **J-3「深い話がしたい人に、英語を。」** + 英語版 **E-4 "For deep conversations, in English."**
- 副軸: **J-5「音を、美しく。」** + 英語版 **E-3 "Retune your English. From sound up."**

---

## 10. Explicit deliverable

### Form factor

- **モバイル**: 375px 幅 (iPhone 12 mini, Redmi Note 12 想定)
- **デスクトップ**: 1440px 幅
- **中間**: 768px (iPad) は主要ではないが、モバイル ↔ デスクトップの transition point として設計

### プロトタイプ数

**2 バリエーション × 3 言語 UI = 合計 6 プロトタイプ**

- **Variation A**: タグライン J-3「深い話がしたい人に、英語を。」を hero に置く案
- **Variation B**: タグライン J-5「音を、美しく。」を hero に置く案

各 Variation は以下 3 言語 UI で生成:

- 日本語 (P-1 主軸)
- 英語 (国際的な基準、P-3 のフィリピン英語ユーザ想定)
- 韓国語 (P-2 の UI 品質判定、6 言語対応の破綻テスト)

### 各プロトタイプに含めるべき要素

1. **LP Hero**: タグライン + サブコピー + 最初のアクション (「はじめる」or「試してみる」)
2. **目的ファースト カード** 3-4 個:
   - カード 1: 「単語の発音を鍛える」(Mode A Decode 相当)
   - カード 2: 「発音から書いてみる」(Mode A Encode 相当)
   - カード 3: 「新しい単語を音から覚える」(Mode B 相当)
   - カード 4 (任意): 「連結発音に慣れる」(Connected 相当)
3. **言語切替 UI**: トップバー右上、6 言語プルダウン
4. **詳しい設定**: 折りたたみで存在示唆、default は closed
5. **オンボーディング hook**: 「IPA って何?」への動線 (subtle、押し付けない)
6. **振り返り動線**: 「これまでの学習」的な入口 (Q-11-C の Reflect dock 廃止に伴う機能移設)
7. **Footer**: Feedback / Terms / Privacy / X links (SPEC §4.0.1、`#siteFooter` 準拠)

### Deliverable Format

- **HTML + CSS** (静的、React コンポーネントではなく plain HTML): Claude Design のアウトプットは HTML/CSS で受け取り、Naoya さんが `src/index.template.html` に手動 or Cursor Issue で反映
- **Design tokens**: CSS Custom Properties で色・フォント・spacing を定義 (Cluster 2 で正式に token 化)
- **各 Variation にコメント**: 「この案の狙い」を HTML コメントで残す

### 検証観点 (プロトタイプ生成後、Naoya さん判断)

- **P-1 動機接続**: どちらのタグラインが「深い話がしたい」動機に響くか
- **視覚的静けさ**: Notion 的静けさが達成されているか、Duolingo 的な明るさに寄っていないか
- **韓国語 UI の破綻テスト**: P-2 の期待値 (합니다体、Samsung UI 慣習) を満たすか
- **モバイル片手操作**: 主要 CTA が親指圏内か
- **6 言語で意匠が安定するか**: 特に日本語 → 英語 → 韓国語で hero の縦幅が大きく変わらないか

---

## Claude Design セッションでの投げ方 (Naoya さんへの運用メモ)

このブリーフを Claude Design に投げる際:

1. **プリアンブル**: 「IPA Sound Drill の Phase 1 Cluster 1 (トップページ再設計) のプロトタイプを作ってほしい」
2. **Brief 全文貼り付け**: 本ドキュメントの §1-§10 を貼り付け
3. **参照ドキュメント共有**: voice-and-tone.md, user-personas.md, product-principles.md を必要に応じて共有 (Vault は private のため、Naoya さんが要点を抽出 or 直接コピペ)
4. **現行 UI スクリーンショット共有**: `https://ipasounddrill.app` の setup 画面
5. **生成された HTML/CSS を回収**: Naoya さん判断でプロトタイプの評価、次のイテレーション or Cluster 2 起草に進む

## Iteration の想定

**Iteration 1** (このブリーフ): 2 Variation × 3 言語 = 6 プロトタイプ生成
- Naoya さん評価: どちらのタグラインが響くか、視覚的静けさは達成されているか
- 結果次第で:
  - **Iteration 2**: 選定した Variation の refine (色パレット微調整、目的カードの文言精緻化)
  - **Iteration 3**: 実装に向けた HTML/CSS の最終形

**目標**: Iteration 2-3 で Cluster 1 の実装可能な HTML/CSS が確定、Cursor Issue として起票して Track A に反映

---

## 履歴

- 2026-07-17: 初版 (Phase 1 起動、Claude 主導起草)
