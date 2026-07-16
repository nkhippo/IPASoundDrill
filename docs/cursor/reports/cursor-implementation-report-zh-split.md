---
id: pj-2026-07-07-89e5
aliases:
- pj-2026-07-07-89e5
title: Cursor Implementation Report — Chinese UI Split (zh-Hant / zh-Hans)
created: '2026-07-07'
---
# Cursor Implementation Report — Chinese UI Split (zh-Hant / zh-Hans)

- Date: 2026-07-07
- Branch: `main`
- Scope: Split single `zh` UI into Traditional (`zh-Hant`) and Simplified (`zh-Hans`)

## 1) Files changed

### Added
- `i18n/zh-Hant.json` (162 keys, Taiwanese Traditional UI)
- `i18n/zh-Hans.json` (162 keys, Simplified UI — body from legacy `zh.json`)
- `i18n/phonemes/zh-Hant.json` (47 symbols, Taiwanese Traditional)
- `i18n/phonemes/zh-Hans.json` (47 symbols, from legacy phonemes/zh.json)
- `docs/cursor-instructions-zh-split.md`

### Deleted
- `i18n/zh.json`
- `i18n/phonemes/zh.json`

### Modified
- `index.html` — language picker, LANG migration, `loadLocale`, `wordGloss`, `vocabDisplayGloss`, phrase gloss
- `i18n/{en,ja,ko,fil}.json` — `lang_opts` only
- `tools/validate_i18n.py` — `lang_opts` allowlist
- `tools/gen_audit_docs.py` — LANGS list + audit table columns
- `docs/DESIGN.md`, `docs/SPECIFICATION.md`, `docs/i18n-audit.md`

### Unchanged (by design)
- `data/guide.json` — already had `zh-Hant` / `zh-Hans`
- Wordlist `gloss.zh` — shared fallback for both Chinese variants

## 2) index.html changes

### 2-1 Language picker
```html
<!-- before: data-lang="zh" 中文 -->
<button ... data-lang="zh-Hant">繁體</button>
<button ... data-lang="zh-Hans">简体</button>
```

### 2-2 LANG migration (legacy `zh` → `zh-Hans`)
```js
if (LANG === "zh") {
  LANG = "zh-Hans";
  localStorage.setItem("app_lang", "zh-Hans");
}
```

### 2-3 wordGloss fallback
```js
if (LANG === "zh-Hant" || LANG === "zh-Hans") {
  return c.gloss[LANG] || c.gloss.zh || c.gloss.en || c.w;
}
```

Also routed `vocabDisplayGloss()` and connected-phrase gloss through `wordGloss()`.

### 2-4 loadLocale
```js
document.documentElement.lang = lang;  // removed zh→zh-Hans special case
```

## 3) lang_opts diff (all 4 non-Chinese UI files)

```json
"zh-Hant": "繁體",
"zh-Hans": "简体"
```
(replaces single `"zh": "中文"`)

## 4) Validation

```bash
python3 tools/validate_i18n.py
python3 tools/gen_audit_docs.py
```

```text
[A] UI 言語: ['en', 'fil', 'ja', 'ko', 'zh-Hans', 'zh-Hant']  キー数(en)=162
[B] 音素言語: ['en', 'fil', 'ja', 'ko', 'zh-Hans', 'zh-Hant']  記号数(en)=47
ERROR: none
```

## 5) Manual test checklist (Naoya)

| # | Scenario | Expected | Result |
|---|---|---|---|
| 1 | Fresh start (no localStorage) | English UI; picker shows 繁體 + 简体 separately | Pending |
| 2 | `app_lang=zh-Hant` | 台灣繁體 UI（單字、詞庫、設定） | Pending |
| 3 | `app_lang=zh-Hans` | 简体 UI（单词、词库、设置） | Pending |
| 4 | `app_lang=zh` (legacy) | Auto-migrates to 简体; storage becomes `zh-Hans` | Pending |
| 5 | zh-Hant + open guide | 繁體 guide tab selected | Pending |

### 3-3 Gloss fallback
Both zh variants show `gloss.zh` content (same text until future data split).

### 3-4 Keyboard labels (zh-Hant)
- 母音 / r色母音 / 雙母音 / 子音 (not 元音/辅音)

## 6) Known remaining work

- `gloss.zh` → `gloss["zh-Hant"]` / `gloss["zh-Hans"]` data split (future task)
- `cs_rule` Chinese variants (future; currently falls back to `en`)
- Native review of zh-Hant/zh-Hans copy quality (optional)

## 7) DoD

- [x] zh-Hant / zh-Hans UI + phoneme files added
- [x] Legacy zh.json files removed
- [x] lang_opts updated in en/ja/ko/fil
- [x] index.html picker + migration + gloss fallback
- [x] validate_i18n.py passes
- [ ] Browser manual tests (Naoya)
