---
cluster: 2
created: 2026-07-17T00:45:00+09:00
phase: 1
project: IPASoundDrill
status: ready-for-claude-design
summary: Phase 1 Cluster 2 の Claude Design へのブリーフ。視覚言語刷新 (デザイントークン + component patterns + mood plates 3 案)。判定基準ペルソナ P-2 (韓国 UI 品質) と P-5 (若年層美意識)。sensory-design.md の 5 中核質問に対する採用ルールを確定。Cluster 1 と同時投入推奨。
tags:
  - ipasounddrill
  - phase-1
  - cluster-2
  - visual-language
  - design-tokens
  - sensory-design
  - claude-design
title: Phase 1 Cluster 2 Brief - Visual Language Refresh
type: design-brief
updated: 2026-07-17T00:45:00+09:00
---

## この Brief の位置づけ

- **Phase**: Phase 1 (Claude Design プロトタイプ探索)
- **Cluster**: 2 (視覚言語刷新、デザイントークン + component style)
- **対応 UX 課題**: N-1 (プロトタイプ焼き回し問題)、および Cluster 1/3/4 の視覚基盤
- **依存 Cluster**: Cluster 1 (トップページ) と並行推奨、視覚言語の方向性を共有
- **後続 Cluster への影響**: Cluster 3 (Reveal / 学習中体験)、Cluster 4 (Mode A/B) の視覚設計の前提

## 参照資料

- Vault `30_projects/IPASoundDrill/design/sensory-design.md` (5 中核質問、視覚方向性)
- Vault `30_projects/IPASoundDrill/design/mood-board.md` (6 カテゴリ全参照)
- Vault `30_projects/IPASoundDrill/design/anti-patterns.md` (Category C Visual 特に集中)
- Vault `30_projects/IPASoundDrill/design/product-principles.md` (原則 3, 5, 6, 8)
- Vault `30_projects/IPASoundDrill/design/voice-and-tone.md` (Vocabulary Preferences)
- Vault `30_projects/IPASoundDrill/design/competitive-landscape.md` (視覚差別化)

---

## 1. What we're designing

IPA Sound Drill の **視覚言語の総合デザインシステム** を再構築する。

**現状の問題**: 現行 UI は 1 チャットで Claude が出力したプロトタイプがベース。CSS 変数 (`--signal: #0C7C7E` 等) は定義済みだが、以下が課題:

- **一貫性不足**: 一部インライン style が残存 (Mode B heads 等、Recon で判明)
- **デザイントークン未整備**: 色・spacing・typography・motion の体系的な token 化なし
- **音を扱うプロダクトらしさが弱い**: sensory-design.md の「音象徴の視覚化」が未実装
- **6 言語圏の期待値差への配慮不足**: 韓国 UI・中国 UI・フィリピン UI の慣習が反映されていない
- **タイポグラフィの詰めが弱い**: IPA 記号のタイポグラフィックな扱いが装飾的

**目指す姿**: プロダクトの声 (静かな師範) を視覚化する **総合デザインシステム**。デザイントークンから component pattern まで、Naoya さんが将来の実装・拡張で参照できる正本を構築。**Cluster 1 のトップページと同時投入することで、視覚言語の一貫性を最初から確保**。

**含めるべき要素**:

1. **カラーパレット**: プロダクトの基本色 + 状態色 (success / error / info) + アクセシビリティ準拠
2. **タイポグラフィ**: 見出し / 本文 / IPA 記号の 3 系統、6 言語対応フォントスタック
3. **Spacing system**: 8px base grid (or 4px)、余白の意図的な使い方
4. **Motion principles**: fade / slide / scale の使い分け、reduced-motion 対応
5. **アイコンシステム**: Lucide 系 minimal line icons、独自音象徴アイコン
6. **Component patterns**: Button / Card / Input / Modal / Meter / Pill / Toggle の基本形
7. **音象徴の視覚化**: 音節境界、強勢、沈黙の表現 (sensory-design.md § 問い 1-5 参照)

---

## 2. Who it's for

視覚言語は全ペルソナに影響しますが、判定基準として以下を重視:

### 判定基準ペルソナ

- **P-2: 김서연 (28, ソウル, プロフェッショナル、TOEIC 950)**
  - 幼稚な UI、ゲーム化 UI、擬人化キャラは即離脱
  - Samsung One UI 慣習 (情報密度高め、機能性)
  - 韓国 UI 品質 (Pretendard 系フォント、합니다体トーン)
  - **視覚言語が破綻していないかの最も厳しい判定者**

- **P-5: 前田唯 (16, 京都, 洋楽好き、Track B 主軸候補)**
  - Instagram / TikTok 世代の "美しさ"
  - Craig Mod / Kinfolk 的な有機的線
  - 明朝体アクセント許容 (Instagram 世代は明朝体復権)
  - **視覚的美意識の判定者**

### 参考ペルソナ

- **P-1**: Notion 的静けさ + 情報量 (成熟した大人向け)
- **P-3**: 明るめの暖色系 (フィリピン UI、GCash / Grab 系)、低帯域幅
- **P-4**: 中国 UI (WeChat / Xiaohongshu 系、シンプル + 情報密度)

---

## 3. What success looks like

### 感情面

- **P-2 (韓国語 UI 品質)**: 「これは翻訳された UI ではなく、韓国語ネイティブとして設計されている」
- **P-5 (Instagram 世代)**: 「美しい、Instagram に貼りたい」
- **P-1 (静けさ愛好)**: 「Notion のような品位を感じる」
- **P-3 (明るさ期待)**: 「暗くない、圧迫感がない」
- **P-4 (機能性重視)**: 「情報が整理されている、迷わない」

### 技術面

- **デザイントークンで色・spacing・font の 90% が制御可能** (残り 10% は例外ケース許容)
- **6 言語 UI が破綻しない**: 特に日本語 → 韓国語 → 中国語で見出しの縦幅が大きく変わらない
- **モバイル → デスクトップの遷移が滑らか**: breakpoint 変更で情報階層が破綻しない
- **アクセシビリティ**: WCAG AA 準拠 (コントラスト、focus indicator、reduced-motion)

### 質的目標

- **Duolingo / ELSA / Rosetta Stone のいずれとも視覚的に混同されない** (「これは何アプリ?」で "IPA Sound Drill" として認識可能)
- **音を扱うプロダクトらしい**: 波形・IPA 記号・音節境界の視覚化が sub-conscious レベルで存在

---

## 4. What we're NOT doing

### Category C (Visual) 全項目 (Anti-patterns Catalog)

- **C-1**: 明るすぎる原色 / ネオンカラー (Duolingo 的な鮮やか green は不採用)
- **C-2**: 過剰な影 / グラデーション / neumorphism (Flat design 基調、必要な場所のみ subtle shadow)
- **C-3**: カートゥーン風イラスト (子供扱い)
- **C-4**: 過剰な絵文字 (絵文字は使わない、必要なら Lucide icon)
- **C-5**: 過剰なアニメーション (急かす motion、intense transition)

### Category B (Character) の視覚関連

- **B-2**: イラスト化された "先生" / "コーチ" キャラ (LP に人物イラストは art quality のみ、キャラクター化なし)

### このブリーフ固有の NG

- **明るすぎる color palette**: HSL の明度 60% 以上を強い色相と組み合わせない (Notion 的な落ち着き基調)
- **強い drop shadow**: elevation は subtle (0-2px shadow only)
- **強い gradient**: 色相を大きく変える gradient なし、明度のみの gradient は許容
- **強すぎる motion**: bezier curve は ease-out 系、bounce / elastic なし
- **色を過剰に使う**: プロダクト全体で primary + secondary + 状態色 3-4 + 中立色 3-4 = 計 10 色以内
- **国旗の使用**: 言語切替で国旗 (🇯🇵🇰🇷🇨🇳) は使わない (国旗 ≠ 言語、fil ユーザは特に敏感)
- **明朝体の全面使用**: Track A では sans-serif 基調、明朝体はアクセント (Track B の P-5 向け派生で検討)

---

## 5. Voice & tone constraints (視覚版)

**Voice**: 静かな師範 → 視覚言語では **「知的で、静かで、精確」**

### 色使いのトーン

- **静か**: 彩度は低め (HSL saturation 30-60% がメイン、80%+ は例外的アクセント)
- **精確**: 中間色 (grey, taupe, muted teal) が基調、原色は最小限
- **知的**: Notion / Kinfolk / 菊地信義的な洗練

### Motion のトーン

- **静か**: fade 150-200ms が基本、slide は避ける (急かす印象)
- **精確**: linear or ease-out (bounce / elastic は禁止)
- **意味のある motion のみ**: 装飾的 animation は不採用

### タイポグラフィのトーン

- **静か**: font weight は 400-500 中心、bold 700 は少数の見出しのみ
- **精確**: kerning は tight ではなく comfortable、tracking は 0 or -0.01em
- **知的**: フォントは Sans-serif 系 (Noto Sans、Pretendard、Inter 等) の Modern を基調

---

## 6. Sensory principles

sensory-design.md の 5 中核質問に対する採用ルール:

### 問い 1: 音を線で表現する時

- **主軸**: 波形の抽象化 (Notion 的静けさ + 音の実体性)
- **副軸**: 書道の運筆 (narrow IPA 背景など、Reveal 画面用)
- **避ける**: 音楽記譜法 (五線譜)、生の技術的スペクトログラム

### 問い 2: 強勢の視覚化

- **第一次強勢**: 太字 + 周囲の余白 (静けさで際立たせる)
- **第二次強勢**: ドット (dot leader、`‧` U+2027) を音節境界に
- **避ける**: 色を強勢マーカーに使う (色は情報種別の識別に使う)

### 問い 3: IPA タイポグラフィ

- **本文中**: Noto Sans (通常 400)
- **Reveal 主軸**: **Charis SIL** (SIL 学術フォント、IPA extended 対応) を検討
- **色**: 一般テキストと同じ色 (IPA を "特殊記号" 扱いしない)
- **サイズ**: 主軸 IPA 32-40px、本文中 16-18px

### 問い 4: 沈黙 (silence) の表現

- **音節境界**: 中央ドット `‧` (Unicode U+2027)
- **段落間**: 大きな余白 (16-24px)
- **connected speech の融合**: 音節境界を **表示しない** (連結を視覚的に表現)
- **無音 (silent letter)**: 打消線 or 括弧 `(k)night` 的表記
- **弱形 (weak form)**: 通常より **薄い grey** で表示

### 問い 5: 音の質感の視覚化

- **サブリミナル的な色相変化**: Reveal 画面の背景に、音素の質感に応じた極めて薄い色相変化 (明示的に説明しない)
- **音再生ボタンのアニメーション**: 通常時は静か、tap 時のみ subtle pulse
- **注意**: これらはサブリミナル、学習者に説明しない

---

## 7. Product principles that apply

### このプロトタイプで最重要

- **原則 3 (達成の視覚化は禁欲的に)**: 色使い・motion・icon すべてで禁欲的トーンを維持
- **原則 5 (各画面には 1 つの主軸情報がある)**: 視覚階層で主軸を明示、補助は余白で分離
- **原則 6 (音は視覚化して同時提示する)**: 音を扱うプロダクトの視覚言語を確立

### 適用される

- **原則 1 (IPA を主軸として尊重)**: タイポグラフィで IPA を装飾的ではなく主軸的に扱う
- **原則 8 (6 言語で同じ声)**: フォントスタック、色パレット、spacing がすべての言語で機能

### このブリーフでは適用しない

- **原則 4 (意思決定回数を減らす)**: Cluster 1 の主軸原則、視覚言語の直接対象ではない
- **原則 2 (Production-Perception 循環)**: 学習ループ設計の原則、視覚言語には間接的
- **原則 7 (学習履歴は所有物)**: SRS 画面の設計原則、視覚言語には間接的

---

## 8. Technical constraints

### Track A の技術制約

- **CSS Custom Properties**: 全 token を `:root` の CSS 変数として定義
- **No preprocessor**: Sass / Less / Stylus 不採用、Modern CSS のみ
- **Vanilla JS**: フレームワーク不採用、component は HTML + CSS class ベース
- **`src/index.template.html`**: 単一 HTML template、Vercel Build で 6 言語 HTML 生成

### モバイル最優先

- **主軸幅**: 375px モバイル、1440px デスクトップ
- **breakpoints**: `768px`, `1024px`, `1440px` (mobile-first)

### 6 言語フォント対応

- **フォントスタック**: Noto Sans を基盤に、各言語で最適化 (Noto Sans JP / KR / SC / TC / Filipino)
- **代替候補**: Pretendard (韓国)、思源黑体 (中国)、SF Pro (英語) を Naoya さん判断で
- **IPA 記号**: Charis SIL または Doulos SIL (現状 `fonts/DoulosSIL-Regular.woff2` あり)

### アクセシビリティ

- **コントラスト**: WCAG AA (Text 4.5:1, Large text 3:1)、AAA は Aspiration
- **Focus indicator**: keyboard 操作時に明確な focus outline
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` で animation を最小化

### パフォーマンス

- **フォント subset**: 使う文字のみ subset (日本語 / 韓国語 / 中国語で特に重要)
- **SVG icons**: Lucide 系を SVG sprite or inline、raster icon 不採用
- **CSS**: 最終ビルドで minify、Critical CSS inline

---

## 9. References

### 視覚方向性 (mood-board.md 全カテゴリ)

**Category 1 (静けさ)**: Notion, Kinfolk, Craig Mod, Muji  
**Category 2 (音象徴)**: 坂本龍一 async, ECM Records, John Cage Notations, 東京 TDC 年鑑  
**Category 3 (タイポグラフィ)**: Charis SIL, Noto Sans, 菊地信義, Muriel Cooper, 杉浦康平  
**Category 4 (反面教師)**: Duolingo, Rosetta Stone, Anki, ELSA Speak  
**Category 5 (6 言語圏 UI)**: Naver / Kakao, WeChat, Xiaohongshu, GCash / Grab, Notion 日本語版  
**Category 6 (音楽・音声)**: Reactable, Stephan Sagmeister, Blue Note

### 競合との差別化 (competitive-landscape.md から)

- Duolingo は明るい green (#58cc02) を primary、IPA Sound Drill は muted teal `#0C7C7E` 系統維持で明確に差別化
- ELSA は AI キャラクター中心、IPA Sound Drill はキャラクターなし、タイポグラフィ主体
- Rosetta Stone は硬派すぎ、IPA Sound Drill は静けさ + 温度のあるアクセント

### 現状の CSS 変数 (現行 `src/index.template.html`)

- `--signal: #0C7C7E` (teal、primary accent)
- 他の変数: Naoya さん確認 or Cluster 2 で全変数マップ作成

---

## 10. Explicit deliverable

### Form factor

- **モバイル**: 375px 主軸
- **デスクトップ**: 1440px 対応
- **中間**: 768px, 1024px でも破綻なし

### Deliverable 内訳

#### 10-1. Design tokens (CSS Custom Properties)

以下 5 カテゴリのトークンを CSS で定義:

```css
:root {
  /* Color palette */
  --color-primary: /* 現行 teal 系統維持 */;
  --color-primary-hover: ;
  --color-secondary: ;
  --color-neutral-100 to 900: /* grey scale */;
  --color-success: ;
  --color-error: ;
  --color-info: ;
  
  /* Typography */
  --font-heading: 'Noto Sans', 'Pretendard', sans-serif;
  --font-body: 'Noto Sans', sans-serif;
  --font-ipa: 'Charis SIL', 'Doulos SIL', 'Noto Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace; /* IPA でない code 用 */
  
  --font-size-xs to 4xl: ;
  --line-height-tight to loose: ;
  --font-weight-normal / medium / semibold / bold: ;
  
  /* Spacing (8px base) */
  --space-1: 4px; --space-2: 8px; /* ... */ --space-24: 96px;
  
  /* Motion */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --easing-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --easing-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
  
  /* Border radius */
  --radius-sm to xl: ;
  
  /* Shadows (subtle) */
  --shadow-sm to xl: ;
}
```

#### 10-2. Component patterns (HTML + CSS)

以下の基本 component を HTML + CSS で:

1. **Button** (primary / secondary / ghost、size sm/md/lg)
2. **Card** (purpose card, vocab card, reveal card の基本形)
3. **Input** (text input, IPA input, search)
4. **Modal** (Escape 対応済、Q-9-A 準拠)
5. **Meter** (progress bar、SRS カードの `#dNo` 系)
6. **Pill** (CEFR pill, focus pill)
7. **Toggle** (GA / RP switch)
8. **Icon** (Lucide 系、独自音象徴アイコン数個)

#### 10-3. Mood plates

**3 mood plate variant** を提示、Naoya さん判断で 1 つ選定:

- **Mood A: "Notion Minimal"** — 最も静か、grey 主体 + teal アクセント、Muji 的
- **Mood B: "Warm Contemporary"** — 温度あり、warm grey 主体 + muted terracotta + teal、Kinfolk 的
- **Mood C: "Editorial"** — 明朝体アクセント (見出しのみ)、grey 基調 + subtle warm、菊地信義的 (Track B の P-5 向け派生)

各 mood plate に:
- Primary color palette (5-8 色)
- Typography specimen (見出し + 本文 + IPA 記号例)
- 主要 component (Button / Card / Pill) の見本
- 使用感の説明 (「このプロダクトはどう感じられるか」)

#### 10-4. IPA タイポグラフィ specimen

- IPA 記号 (θ, ð, æ, ʒ, ɝ 等) の表示比較 (Noto Sans vs Charis SIL vs Doulos SIL)
- 単語内での IPA 使用例 (`through /θruː/`)
- Reveal 画面での主軸 IPA 表示例 (32-40px)
- narrow IPA 表示例 (24-28px、薄い grey background)
- respell 表示例 (14-16px、括弧付き)

### Deliverable Format

- **CSS ファイル** (design tokens、component styles)
- **HTML ファイル** (component gallery、mood plates)
- **各 mood plate の使用感 comment** (HTML comment or 別 MD)

### 検証観点 (プロトタイプ生成後、Naoya さん判断)

- **静けさ**: Notion / Kinfolk 的な落ち着きが達成されているか (Duolingo に寄っていないか)
- **音を扱うプロダクトらしさ**: IPA タイポグラフィが美しいか、音象徴の視覚化が sub-conscious に伝わるか
- **6 言語対応**: フォントスタックが日本語 / 韓国語 / 中国語 / フィリピン語で破綻しないか
- **アクセシビリティ**: コントラスト WCAG AA 準拠、focus indicator 明瞭
- **モバイル/デスクトップ両対応**: breakpoint 変更で情報階層が保たれるか

### Cluster 1 (トップページ) との統合

Cluster 2 の deliverable は、**Cluster 1 の 6 プロトタイプに適用される視覚言語** の基盤。理想的には:

1. Cluster 1 + Cluster 2 Brief を Claude Design に **同時投入**
2. 選定された Cluster 2 mood plate が、Cluster 1 プロトタイプの視覚言語として反映される
3. Iteration 2 で mood plate 選定 → Cluster 1 プロトタイプが選定 mood で再生成される流れ

---

## Iteration の想定

**Iteration 1** (このブリーフ): 3 mood plate + design tokens + component patterns 生成
- Naoya さん評価: どの mood が IPA Sound Drill らしいか、韓国語 / 中国語で破綻しないか
- 結果次第で:
  - **Iteration 2**: 選定 mood の refine、Cluster 1 プロトタイプへの適用
  - **Iteration 3**: 実装可能な CSS ファイル + component library の最終形

**目標**: Iteration 2-3 で `src/index.template.html` に反映可能な CSS + component patterns が確定、Cursor Issue として起票して Track A に反映。

---

## Claude Design セッションでの投げ方 (Naoya さんへの運用メモ)

**推奨**: Cluster 1 と Cluster 2 を **同時投入**。理由:

- Cluster 1 のトップページ設計に、Cluster 2 の視覚言語が適用される必要がある
- Claude Design が Cluster 1 + Cluster 2 を一体で考えると、両者の整合が最初から取れる
- Iteration 1 の結果を見て、Cluster 1 の tagline 選定 (J-3 vs J-5) と Cluster 2 の mood plate 選定を並行判断可能

**セッション構成**:

1. **Preamble**: 「Phase 1 の Cluster 1 と Cluster 2 のブリーフです。Cluster 1 (トップページ) が Cluster 2 (視覚言語) に依存するため、同時にプロトタイプを作ってください」
2. **Cluster 1 Brief 貼り付け** (前のブリーフ)
3. **Cluster 2 Brief 貼り付け** (このブリーフ)
4. **参照ドキュメント共有**: sensory-design.md, product-principles.md, mood-board.md の要点
5. **現行 UI スクリーンショット共有**
6. **Deliverable**: Cluster 1 の 6 プロトタイプ + Cluster 2 の 3 mood plate + design tokens

---

## 履歴

- 2026-07-17: 初版 (Phase 1 Cluster 2、Claude 主導起草、Cluster 1 と同時投入推奨)
