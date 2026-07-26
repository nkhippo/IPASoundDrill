---
aliases:
  - pj-2026-07-19-dtok
  - design-tokens-phase-1
created: 2026-07-19T00:00:00+09:00
id: pj-2026-07-19-dtok
project: IPASoundDrill
status: published
summary: Phase 1 UI/UX (Variation B「音を、美しく。」/ Mood B / Warm Contemporary) の視覚言語トークンの source of truth。Claude Design 出力 (`Kickoff_design_prompt2.zip` 内 `IPA Sound Drill - Phase 1.dc.html` § デザインガイドライン + ドリル section) から抽出。カラー 11 変数、タイポ 3 系統、spacing / radius / shadow、基本コンポーネント 5 種の CSS 定義を集約。Phase 1-A で `src/index.template.html` の `<style>` に追加、Phase 1-B 以降で参照。既存 `--signal` 等は legacy prefix (`--legacy-*`) に退避し、既存規則の見た目は据え置き (解釈 i レガシー退避方式)。
tags:
  - ipasounddrill
  - phase-1
  - design-tokens
  - visual-language
  - mood-b
  - source-of-truth
title: Phase 1 - 視覚言語 Design Tokens (Mood B / Warm Contemporary)
type: knowledge
updated: 2026-07-19T13:45:59+09:00
---

## Source of Truth

- **一次資料**: Claude Design 出力 `IPA Sound Drill - Phase 1.dc.html` (Kickoff_design_prompt2.zip、Naoya が Chat 添付) の § TURN 5「Phase 1 デザインガイドライン」frame
- **抽出日**: 2026-07-19
- **抽出者**: Claude (vault-manager 経由)
- **確定 variant**: Variation B「音を、美しく。」 / Mood B (Warm Contemporary) / 明朝見出し

## 変更管理ポリシー

- 本ファイルが Phase 1 の視覚言語の source of truth
- Cursor 実装での CSS 変更は本ファイルに準拠。逆方向 (実装先行) は禁止
- Naoya の判断で token 値を変更する場合、本ファイルを先行更新 → 影響を受ける Phase の Issue 起票時に反映
- Claude Design で追加 iteration が発生した場合、本ファイルを新版として更新 (旧値は履歴セクションに残す)

---

## 1. カラートークン (11 変数)

| 変数 | Hex | 役割 | 主な用途 |
|---|---|---|---|
| `--paper` | `#F3EDE6` | Base background | body / canvas、暖かい紙色 |
| `--panel` | `#FDFBF7` | Panel / card background | Card、Modal、Secondary button bg |
| `--ink` | `#2A2420` | Primary text | 見出し、本文、主軸テキスト |
| `--muted` | `#7C7269` | Secondary text | 弱テキスト、副情報 |
| `--faint` | `#AC9F94` | Caption / meta text | キャプション、meta ラベル、value 表示 |
| `--hair` | `#E7DCCF` | Border | Card border、divider、hair line |
| `--signal` | `#0C7C7E` | Primary accent (teal) | Primary button、link、選択状態、強勢マーカー |
| `--signal-soft` | `#E1EFEE` | Signal background (soft) | 選択カード bg、Pill 選択 bg |
| `--accent` | `#B0604A` | Secondary accent (terracotta) | Accent link、副アクセント、不正解表示の主色 |
| `--accent-soft` | `#F1E3DC` | Accent background (soft) | 不正解カード bg、accent 系 pill/chip 背景 |
| `--stress` | `#D9911B` | Stress underline (amber) | 要注意音の下線 |

### 参考 (token 外の派生値)

- **Link hover**: `#0A6B6D` (signal の暗色。CSS で `color-mix()` を使わず literal で定義)
- **Card fine divider**: `#F0EAE1` (hair より薄い水平線、card 内での section 区切り。用途限定のため token 化見送り)
- **Card shadow rgba base**: `rgba(0,0,0,.10)` (shadow-card の rgba 部分)
- **Toggle active shadow**: `0 1px 2px rgba(0,0,0,.06)` (GA/RP toggle の active tab のみ)

---

## 2. タイポグラフィ

### Font family

| 用途 | Font family | 備考 |
|---|---|---|
| 見出し (heading) | `'Noto Serif JP', 'Noto Serif KR', serif` | 明朝、Phase 1 の主軸見出しは明朝で統一 |
| 本文 (body) | `'Noto Sans JP', 'Noto Sans KR', system-ui, sans-serif` | body 全体の font-family fallback |
| IPA 記号 | `'Charis SIL', 'Doulos SIL', serif` | 既存 `fonts/DoulosSIL-Regular.woff2` あり、Google Fonts で Charis SIL 追加 |
| コード / モノスペース | `monospace` | 変数名表示等の限定用途 |

### Google Fonts import (実装参考)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Charis+SIL:wght@400;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+JP:wght@500;700&display=swap" rel="stylesheet">
```

### Font size (実装した具体値)

| 用途 | size | line-height | weight | letter-spacing |
|---|---|---|---|---|
| Hero heading (h1) | 32-38px | 1.2 | 700 | .02em |
| Section heading (h2) | 22px | 1.3 | 700 | .04em |
| Card heading | 16px | 1.4 | 700 | — |
| Body | 13.5px | 1.5-1.6 | 400 | — |
| Body strong | 13.5px | 1.5-1.6 | 600 | — |
| Caption | 11.5px | 1.5 | 400 | — |
| Meta label (uppercase) | 11px | — | 700 | .14em, uppercase |
| Chip (small pill) | 12-13px | — | 600-700 | — |
| Button label | 14px | — | 600-700 | — |
| IPA (Reveal 主軸) | 30-40px | 1.2 | 400 | — |
| IPA (本文中) | 14-18px | inherit | 400 | — |

### IPA 記号の特殊指定 (CSS class `.ipa`)

```css
.ipa {
  font-family: 'Charis SIL', 'Doulos SIL', serif;
  overflow-wrap: anywhere;
  word-break: normal;
}
```

### IPA 内の色分け

| 要素 | 色 | 記号例 |
|---|---|---|
| 強勢マーカー | `--signal` (#0C7C7E) | `ˈ` |
| 音節境界 | `--muted` (#7C7269) | `‧` (U+2027) |
| 要注意音の下線 | `--stress` (#D9911B) | æ の下線 |
| 通常 IPA | `--ink` (#2A2420) | dʒækət |

---

## 3. Spacing / Radius / Shadow

### Spacing scale (`--space-*`)

5 段階の spacing scale:

| 変数 | 値 | 主な用途 |
|---|---|---|
| `--space-1` | `4px` | 最小 gap (tight) |
| `--space-2` | `8px` | 基本 gap (chip 間、icon-text 間) |
| `--space-3` | `14px` | Card 内 padding、section header 下 |
| `--space-4` | `20px` | Card 間 gap、section 内 padding |
| `--space-5` | `26px` | Section 間 gap、card 外 padding |

備考: 4/8/14/20/26 のリズム。Claude Design ガイドラインで `--space` として集約表示されていたが、実装は個別変数で定義。

### Border radius

| 変数 | 値 | 用途 |
|---|---|---|
| `--radius-card` | `14px` | Card、Modal、目的カード |
| `--radius-pill` | `999px` | Pill、Progress meter、Chip |
| `--radius-button` | `12px` | Button (primary/secondary) |
| `--radius-toggle` | `9px` | Toggle container |
| `--radius-toggle-active` | `6px` | Toggle active tab |

備考: `--radius-button` (12px)、`--radius-toggle` (9px)、`--radius-toggle-active` (6px) は Claude Design 表に載っていないが、コンポーネント CSS 中の値から逆算。

### Shadow

| 変数 | 値 | 用途 |
|---|---|---|
| `--shadow-card` | `0 14px 44px rgba(0,0,0,.10)` | Elevated card (mood plate 等) |
| `--shadow-toggle-active` | `0 1px 2px rgba(0,0,0,.06)` | Toggle active tab |

---

## 4. 基本コンポーネント (Mood B 確定 CSS)

### 4.1 Button (3 種)

#### Primary

```css
.btn-primary {
  background: var(--signal);
  color: #fff;
  border: none;
  border-radius: var(--radius-button); /* 12px */
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
}
```

#### Secondary

```css
.btn-secondary {
  background: var(--panel);
  color: var(--ink);
  border: 1px solid var(--hair);
  border-radius: var(--radius-button); /* 12px */
  padding: 11px 22px; /* border 1px 分内側 */
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
```

#### Accent link (terracotta)

```css
.btn-accent-link {
  background: transparent;
  color: var(--accent);
  border: none;
  padding: 8px 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
```

備考: 「primary/secondary/accent/link の 4 種」と work-plan.md にあったが、Claude Design 出力は「primary / secondary / accent link」の 3 種。link と accent link を統合したものと解釈。純粋な text link は `<a>` のデフォルト (color signal, hover #0A6B6D) を採用。

### 4.2 目的カード (選択 / 非選択)

#### 選択

```css
.purpose-card--selected {
  border: 1px solid var(--signal);
  background: var(--signal-soft);
  border-radius: var(--radius-card); /* 14px */
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink);
}
```

#### 非選択

```css
.purpose-card {
  border: 1px solid var(--hair);
  background: var(--panel);
  border-radius: var(--radius-card); /* 14px */
  padding: 12px 14px;
  font-size: 13px;
  color: var(--muted);
}
```

### 4.3 Pill (CEFR / IPA)

#### CEFR Pill (選択状態)

```css
.pill-cefr--selected {
  border: 1px solid var(--signal);
  background: var(--signal-soft);
  color: var(--signal);
  border-radius: var(--radius-pill); /* 999px */
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
}
```

#### IPA Pill (neutral)

```css
.pill-ipa {
  border: 1px solid var(--hair);
  background: var(--panel);
  color: var(--ink);
  border-radius: var(--radius-pill); /* 999px */
  padding: 6px 14px;
  font-size: 14px;
  font-family: 'Charis SIL', 'Doulos SIL', serif;
}
```

### 4.4 Toggle (GA/RP)

コンテナ + 2 tab (active + inactive)。

```css
.toggle-ga-rp {
  display: inline-flex;
  border: 1px solid var(--hair);
  background: var(--paper);
  border-radius: var(--radius-toggle); /* 9px */
  padding: 3px;
}

.toggle-ga-rp__tab--active {
  background: var(--panel);
  color: var(--signal);
  border-radius: var(--radius-toggle-active); /* 6px */
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: var(--shadow-toggle-active); /* 0 1px 2px rgba(0,0,0,.06) */
}

.toggle-ga-rp__tab--inactive {
  color: var(--muted);
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
}
```

### 4.5 Progress meter

```css
.progress-meter {
  height: 6px;
  background: var(--hair);
  border-radius: var(--radius-pill); /* 999px */
  overflow: hidden;
}

.progress-meter__fill {
  height: 100%;
  background: var(--signal);
  /* width は inline style で dynamic (例: width: 62%) */
}

.progress-meter__label {
  font-size: 11px;
  color: var(--muted);
  margin-top: 6px;
}
```

---

## 5. `:root` 変数群 (Phase 1-A で追加)

```css
:root {
  /* Colors (11) */
  --paper: #F3EDE6;
  --panel: #FDFBF7;
  --ink: #2A2420;
  --muted: #7C7269;
  --faint: #AC9F94;
  --hair: #E7DCCF;
  --signal: #0C7C7E;
  --signal-soft: #E1EFEE;
  --accent: #B0604A;
  --accent-soft: #F1E3DC;
  --stress: #D9911B;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 14px;
  --space-4: 20px;
  --space-5: 26px;

  /* Radius */
  --radius-card: 14px;
  --radius-pill: 999px;
  --radius-button: 12px;
  --radius-toggle: 9px;
  --radius-toggle-active: 6px;

  /* Shadow */
  --shadow-card: 0 14px 44px rgba(0, 0, 0, .10);
  --shadow-toggle-active: 0 1px 2px rgba(0, 0, 0, .06);
}
```

備考: **Phase 1-A では上記 `:root` 変数群の追加のみ**。既存の `--signal: #0C7C7E` 等が現行 `<style>` 内にある場合、`--legacy-*` prefix にリネームして退避 (解釈 i レガシー退避方式)。既存 CSS 規則は `var(--legacy-*)` を参照するよう Cursor が更新 → Phase 1-A の見た目は据え置き。Phase 1-B 以降で新 UI 実装時に `--legacy-*` 参照を新 token に戻し、legacy 削除。

---

## 6. Track A / Track B のスコープ

### Phase 1-A で採用 (Track A、実装)

- カラー 11 変数
- Spacing 5 段階、Radius 5 種、Shadow 2 種
- 基本コンポーネント 5 種の CSS class 定義 (Button 3、目的カード 2 状態、Pill 2 種、Toggle、Progress meter)
- タイポグラフィ Google Fonts import と font-family 定義

### Phase 1-B 以降で採用 (Track A、UI 実装フェーズ)

- 各画面の実際の DOM 構造への適用 (`4a`/`2a-2d`/`3a-3h`/`Pt`/`Pd`)
- Legacy 参照の新 token への置換 (Phase 1-B 起票時に「レガシー退避解消」タスクを含める)
- 音節境界 `‧` (U+2027) の適用 (`2a-2d` 実装時)
- 強勢マーカー ˈ の signal 色化 (`2a-2d` 実装時)
- 要注意音の stress 下線 (`2a-2d`/`3d` 実装時)
- 不正解 UI での `--accent-soft` 適用 (`2a-2d` 答え合わせ画面、`3d` 学習履歴の未達成表示等)

### Track B スコープ (React 化以降)

- 詳細な motion tokens (duration/easing)
- 状態色 (success/error/info) の追加
- Dark mode
- Design tokens の JSON export (Storybook 等での参照)

---

## 7. 参照

- Claude Design 出力 (source): `Kickoff_design_prompt2.zip` (Chat 添付、Naoya 提供 2026-07-19)
- Work plan: `30_projects/IPASoundDrill/design/phase-1/work-plan-uiux-implementation.md`
- Cluster 2 brief (投入時): `30_projects/IPASoundDrill/design/phase-1/brief-cluster-2-visual-language.md`
- Mood board: `30_projects/IPASoundDrill/design/mood-board.md`
- Sensory design: `30_projects/IPASoundDrill/design/sensory-design.md`
- Design decisions (関連): `30_projects/IPASoundDrill/design-decisions.md` § 2026-07-18 (1) Q-20 δ 案

## 履歴

- 2026-07-19: 初版 (Claude Design 出力から抽出、Mood B 確定仕様)
- 2026-07-19 (2): `--accent-soft: #F1E3DC` を追加、11 変数化 (Claude Design frame line 149 のドリル section で定義済、不正解カード bg 用途、Phase 1-B 以降クリーンに)
