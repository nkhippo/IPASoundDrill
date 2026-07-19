---
id: pj-2026-07-19-vtokens
aliases:
- visual-tokens
title: Phase 1 — 視覚言語トークン（実装用 snapshot）
created: '2026-07-19'
updated: '2026-07-19'
---

# Phase 1 — 視覚言語トークン（実装用 snapshot）

## Source of Truth Notice

| 役割 | パス |
|------|------|
| **Source of truth（判断過程含む）** | Vault `30_projects/IPASoundDrill/design/phase-1/design-tokens.md`（commit `680d83ec` / §4 書き戻し基準） |
| **実装用 snapshot（本ファイル）** | `docs/design/phase-1/visual-tokens.md` |
| **概要のみ（値なし）** | `docs/DESIGN.md` § 視覚言語トークン |

**乖離時は Vault を正とする。** 本ファイルは次の実装 Issue で Vault から書き戻す。

> **更新（Issue #83）:** §4 を Vault `design-tokens.md` commit `680d83ec` の内容で書き戻し（Issue comment `5014860270`）。§1–§3 / §5 は Phase 1-A snapshot を維持。SoT は引き続き Vault。

**関連:** Issue #81（Phase 1-A）、Issue #83（Phase 1-C §4 書き戻し）、CSS 運用は `docs/CSS-CONVENTIONS.md`。

---

## §1 カラー（11）

| Token | Value | 用途（要約） |
|-------|-------|-------------|
| `--paper` | `#F3EDE6` | ページ背景 |
| `--panel` | `#FDFBF7` | カード / パネル面 |
| `--ink` | `#2A2420` | 本文 |
| `--muted` | `#7C7269` | 二次テキスト |
| `--faint` | `#AC9F94` | 三次テキスト / ラベル |
| `--hair` | `#E7DCCF` | ボーダー |
| `--signal` | `#0C7C7E` | 主アクション / フォーカス |
| `--signal-soft` | `#E1EFEE` | signal の淡色面 |
| `--accent` | `#B0604A` | アクセント（誤答・注意の暖色系） |
| `--accent-soft` | `#F1E3DC` | accent の淡色面（不正解カード bg 等） |
| `--stress` | `#D9911B` | 強勢 / 要注意マーカー |

---

## §2 タイポグラフィ（3 系統）+ Google Fonts

| 系統 | 用途 | 推奨 stack（Phase 1-B+） |
|------|------|-------------------------|
| **IPA** | 発音記号表示 | `"Charis SIL", "Doulos SIL", "Gentium Plus", serif`（Track A は既存 `--legacy-ipa` / self-host Doulos も併用） |
| **UI sans** | 本文・UI | `"Noto Sans JP", "Noto Sans KR", system-ui, sans-serif` |
| **Display serif** | 見出し・目的カード | `"Noto Serif JP", "Charis SIL", serif` |

Google Fonts import（`src/index.template.html` `<head>`、Phase 1-A で追加済み）:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Charis+SIL:wght@400;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Serif+JP:wght@500;700&display=swap" rel="stylesheet">
```

既存の self-host `@font-face`（Doulos SIL woff2）は維持する。

---

## §3 Spacing / Radius / Shadow

### Spacing（5）

| Token | Value |
|-------|-------|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `14px` |
| `--space-4` | `20px` |
| `--space-5` | `26px` |

### Radius（5）

| Token | Value |
|-------|-------|
| `--radius-card` | `14px` |
| `--radius-pill` | `999px` |
| `--radius-button` | `12px` |
| `--radius-toggle` | `9px` |
| `--radius-toggle-active` | `6px` |

### Shadow（2）

| Token | Value |
|-------|-------|
| `--shadow-card` | `0 14px 44px rgba(0, 0, 0, .10)` |
| `--shadow-toggle-active` | `0 1px 2px rgba(0, 0, 0, .06)` |

---

## §4 基本コンポーネント (Mood B 確定 CSS)

> Vault SoT §4 全文（Issue #83 comment `5014860270` / commit `680d83ec`）。
> **実装:** Phase 1-C は Button / 目的カード / Pill / Toggle を `src/index.template.html` に定義。**Progress meter と §4.6 IPA タイポは Phase 1-D**（本 snapshot には完全性のため含める）。

### 4.1 Button

| Variant | 主要スタイル |
|---|---|
| **primary** | `background: var(--signal); color: #fff; border: none; border-radius: var(--radius-button); padding: 12px 24px; font-size: 14px; font-weight: 700;` |
| **secondary** | `background: var(--panel); color: var(--ink); border: 1px solid var(--hair); border-radius: var(--radius-button); padding: 11px 22px; font-size: 14px; font-weight: 600;` |
| **accent-link** | `background: transparent; color: var(--accent); border: none; padding: 8px 10px; font-size: 14px; font-weight: 600;` |

備考: 「primary/secondary/accent/link の 4 種」と Cluster 2 brief にあったが、Claude Design 出力は「primary / secondary / accent link」の 3 種。純粋な text link は `<a>` のデフォルト (color signal, hover #0A6B6D) を採用。

### 4.2 目的カード

| 状態 | 主要スタイル |
|---|---|
| **選択** | `border: 1px solid var(--signal); background: var(--signal-soft); border-radius: var(--radius-card); padding: 12px 14px; font-size: 13px; font-weight: 600; color: var(--ink);` |
| **非選択** | `border: 1px solid var(--hair); background: var(--panel); border-radius: var(--radius-card); padding: 12px 14px; font-size: 13px; color: var(--muted);` |

補足: ガイドライン frame では簡略スタイルだが、実装 UI では `padding: 15px` / `font-size: 14.5px` / `gap: 14px` の詳細レイアウトあり。実装時は UI section を優先参照。

### 4.3 Pill (CEFR タグ等)

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

### 4.4 Toggle (GA / RP)

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

備考: Phase 1-C の scope からは **Progress meter は除外**（実装 CSS は Phase 1-D）。snapshot 完全性のため本節に含める。

### 4.6 音象徴の視覚化 (IPA タイポ)

- 強勢マーカー `ˈ`: `color: var(--signal);`
- 音節境界: 中央ドット `‧` (U+2027)、`color: var(--muted);`
- 要注意音 (target): `border-bottom: 3px solid var(--stress); border-radius: 1px; padding-bottom: 1px;`
- IPA スパン: `class="ipa"` + `font-family: 'Charis SIL', serif;`

備考: Phase 1-C の scope 外 (Phase 1-D 実装時に反映)。参考として掲載。

---

## §5 `:root` 変数群（実装コピペ用）

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

  /* Spacing (5) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 14px;
  --space-4: 20px;
  --space-5: 26px;

  /* Radius (5) */
  --radius-card: 14px;
  --radius-pill: 999px;
  --radius-button: 12px;
  --radius-toggle: 9px;
  --radius-toggle-active: 6px;

  /* Shadow (2) */
  --shadow-card: 0 14px 44px rgba(0, 0, 0, .10);
  --shadow-toggle-active: 0 1px 2px rgba(0, 0, 0, .06);

  /* Font family (Phase 1-B) */
  --font-ui: "Noto Sans JP", "Noto Sans KR", system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-serif: "Noto Serif JP", "Charis SIL", serif;
  --font-ipa: "Charis SIL", "Doulos SIL", "Gentium Plus", serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
```

**共存:** 既存 UI は `--legacy-*`（旧値）を参照。新 UI（Phase 1-B+）のみ上記トークンを参照する。詳細は `docs/CSS-CONVENTIONS.md` §2。

---

## §5b Font family トークン（Phase 1-B）

| Token | 用途 | 主参照 |
|-------|------|--------|
| `--font-ui` | UI 本文・ボタン・目的カード | `.btn-*` / `.purpose-card` / about |
| `--font-serif` | タグライン・about 見出し | `.top-tagline` / `.about-block h2` |
| `--font-ipa` | IPA 表示（新 UI） | `body.top-home .brand .mark` 等 |
| `--font-mono` | ラベル・言語チップ | `.header-lang .langopt` / purpose-id |

巻き取り方針: **top page（`body.top-home`）+ 新規 Mood B コンポーネントのみ**。`3a` / ドリル等の `var(--legacy-ui|ipa|mono)` は据え置き（pixel-perfect）。

---

## §5c `1a` トップ実装 snapshot（Phase 1-B）

| 領域 | DOM | 備考 |
|------|-----|------|
| Hero | `#topTagline` | `top.tagline`、サブコピーなし |
| 目的カード | `#purposeGrid` / `.purpose-card` | `drill.title.2a`–`2d` → `3a` |
| ヘッダー言語 | `#headerLang` `#langOpts` | settings から移設 |
| ガイド | `#guideBtn` | 現行 guide 暫定（→ Phase 1-F `3g`） |
| `3h` | `#aboutBlock` | DOM 常時、`about.placeholder` |

---

## §6 Track A / B スコープ

| Track | 方針 |
|-------|------|
| **Track A（現行）** | 単一ファイル `src/index.template.html` の `:root` にトークン定義。preprocessor 不採用。`--legacy-*` は Phase 1-H 完了まで残す |
| **Track B** | React / CSS Modules 等への移行時に本 snapshot をトークンファイルへ移植。`color-mix()` 等の新 API は Track B 以降 |
