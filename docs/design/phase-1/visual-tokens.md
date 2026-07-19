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
| **Source of truth（判断過程含む）** | Vault `30_projects/IPASoundDrill/design/phase-1/design-tokens.md`（commit `63c4bf21`） |
| **実装用 snapshot（本ファイル）** | `docs/design/phase-1/visual-tokens.md` |
| **概要のみ（値なし）** | `docs/DESIGN.md` § 視覚言語トークン |

**乖離時は Vault を正とする。** 本ファイルは次の実装 Issue で Vault から書き戻す。

> **本環境メモ（Issue #81）:** Cursor 作業マシンから Vault ファイルに到達できなかったため、本 snapshot の §1–§3 / §5 は Issue #81 §5（= Vault §5 相当）から構築。§4 は Issue 本文で言及されたクラス名 + Mood B 値から再構成した参照スタブ。Vault 入手後に差分があれば本ファイルを Vault 全コピーで置換すること。

**関連:** Issue #81（Phase 1-A）、CSS 運用は `docs/CSS-CONVENTIONS.md`。

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

## §4 基本コンポーネント（5 種・参照スタブ）

> Phase 1-A では **クラス定義を `index.template.html` に入れない**。Phase 1-B 以降で本節を参照して定義する。
> 以下は実装コピペ用の出発点（Vault 未到達のため暫定）。

### 1. `.purpose-card`

```css
.purpose-card{
  background:var(--panel);
  border:1px solid var(--hair);
  border-radius:var(--radius-card);
  box-shadow:var(--shadow-card);
  padding:var(--space-4);
  color:var(--ink);
}
```

### 2. `.btn-primary`

```css
.btn-primary{
  background:var(--signal);
  color:var(--panel);
  border:none;
  border-radius:var(--radius-button);
  padding:var(--space-2) var(--space-4);
  font-weight:700;
  cursor:pointer;
}
.btn-primary:focus-visible{outline:2px solid var(--signal);outline-offset:2px}
```

### 3. `.pill`

```css
.pill{
  border:1px solid var(--hair);
  background:var(--panel);
  border-radius:var(--radius-pill);
  padding:var(--space-2) var(--space-3);
  color:var(--ink);
  font-weight:600;
  cursor:pointer;
}
.pill[aria-pressed="true"]{
  border-color:var(--signal);
  background:var(--signal-soft);
  color:var(--signal);
}
```

### 4. `.toggle`

```css
.toggle{
  border:1px solid var(--hair);
  background:var(--paper);
  border-radius:var(--radius-toggle);
  padding:var(--space-1);
  display:inline-flex;
  gap:var(--space-1);
}
.toggle [aria-pressed="true"]{
  background:var(--panel);
  border-radius:var(--radius-toggle-active);
  box-shadow:var(--shadow-toggle-active);
  color:var(--signal);
}
```

### 5. `.feedback-bad`（accent-soft 面）

```css
.feedback-bad{
  background:var(--accent-soft);
  border:1px solid var(--accent);
  border-radius:var(--radius-card);
  color:var(--ink);
  padding:var(--space-3);
}
```

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
}
```

**共存:** 既存 UI は `--legacy-*`（旧値）を参照。新 UI（Phase 1-B+）のみ上記トークンを参照する。詳細は `docs/CSS-CONVENTIONS.md` §2。

---

## §6 Track A / B スコープ

| Track | 方針 |
|-------|------|
| **Track A（現行）** | 単一ファイル `src/index.template.html` の `:root` にトークン定義。preprocessor 不採用。`--legacy-*` は Phase 1-H 完了まで残す |
| **Track B** | React / CSS Modules 等への移行時に本 snapshot をトークンファイルへ移植。`color-mix()` 等の新 API は Track B 以降 |
