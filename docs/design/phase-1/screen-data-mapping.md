---
id: pj-2026-07-18-screen-data-mapping
aliases:
- screen-data-mapping
title: Phase 1 Screen/Data Mapping
created: '2026-07-18'
---

# Phase 1 Screen/Data Mapping

> Issue #78 / Phase 1-0-b Recon output. This document maps the current
> `src/index.template.html` UI and runtime data to the Phase 1 frame model.
> It is a Category A reference for Phase 1-B through 1-H implementation.

## 0. Recon summary

| Area | Result |
|---|---|
| Setup/profile parameters | 12 state parameters identified: 11 user-facing/visible settings plus 1 legacy persisted Mode B band |
| localStorage | 12 active or legacy key families confirmed |
| Word CEFR coverage | 5,397 / 5,397 tagged (A1=1,187 / A2=1,195 / B1=2,116 / B2=899) |
| Connected / weak CEFR coverage | Connected 201 / 201, weak forms 36 / 36 tagged |
| GA/RP IPA coverage | `ipa` and `rp_ipa` are 100% for wordlist and connected/weak data |
| TTS coverage, repo-verifiable | Word GA/RP and weak GA/RP are generated on demand by GAS; GA word batch warm has a 5,397-word scheduler; RP word batch warm and RP connected phrase TTS are not implemented |
| IPA partial-match filter latency | Filter-only prototype p95: 1.70-2.57ms on this VM for 5,397 words x up to 3 symbols |
| Runtime files changed by this Issue | None. `src/index.template.html` and runtime JSON are read-only for this Recon |

`docs/DESIGN.md` is the source of truth for frame count: Phase 1 has 13
concept frames. The Issue text also says "14 frame" in one place, but its
own later instruction says "13 concept"; this mapping follows
`docs/DESIGN.md` §0.1.

## 1. 12 parameter complete list

### 1.1 Confirmed parameter set

The current setup surface is `#setup` plus the current Settings modal for
language/accent. The two "Customize filters" buttons are disclosure controls,
not persisted session parameters, so they are excluded. `ept_vocab_band` is
included because it is still a persisted Phase 1 cleanup target even though
the active Mode B band UI has been removed from the visible setup.

| # | Parameter | Current UI label / i18n key | Current DOM / state | Current LS key | Phase 1 disposition | Q-20-delta handling | Rationale |
|---:|---|---|---|---|---|---|---|
| 1 | Learning mode | `mode.label`, `mode.a`, `modeb.title` | `#modeField`, `#modeOpts`, `S.appMode` | `app_mode` | Retire | Hide | Absorbed by the four purpose cards (`2a`-`2d`) |
| 2 | Practice tab | `tab.label`, `tab.words`, `tab.connected` | `#tabField`, `#tabOpts`, `S.tab` | none | Retire | Hide | Words vs connected becomes purpose card selection (`2a`/`2b`/`2c` vs `2d`) |
| 3 | Direction | `dir.label`, `dir.decode_*`, `dir.encode_*` | `#dirField`, `#dirOpts`, `S.dir` | none | Retire | Hide | Decode/Encode is purpose selection (`2a` vs `2b`) |
| 4 | CEFR levels | `lvl.label`, `lvl.a1`-`lvl.b2` | `#cefrField`, `#cefrPills`, `S.cefrLevels` | none | Move to profile (`3a`) | Show every session | Phase 1 uses word-level CEFR across all word purposes |
| 5 | Phoneme focus | `focus.label`, `focus.*` | `#focusField`, `#focusPills`, `S.focus` | none | Move to profile (`3a`) and optional drill inline chip | Collapsed by default after preset | Still useful for `2a`/`2b` scoping; "weak spots" depends on SRS history |
| 6 | Spelling type | `reg.label`, `reg.*` | `#regField`, `#regOpts`, `S.reg` | none | Move to profile (`3a`) and optional drill inline chip | Collapsed by default | Secondary filter for word Decode/Encode |
| 7 | Spelling group | `grp.label`, `grp.*` | `#grpField`, `#grpPills`, `S.grp` | none | Move to profile (`3a`) and optional drill inline chip | Collapsed; show only when spelling type is Regular | Conditional child of spelling type |
| 8 | Connected level | `cs.level.label`, `cs.level.*` | `#csLevelPills`, `S.csLevel` | none | Move to profile (`3a`) for `2d`; keep as inline chip in `2d` | Show for `2d` only | Connected Speech keeps level/type axes |
| 9 | Connected type | `cs.label`, `cs.*`, `tab.weak` | `#csTypeField`, `#csPills`, `S.csFilter` | none | Move to profile (`3a`) for `2d`; keep as inline chip in `2d` | Show for `2d` only | Type chooses linking/assimilation/elision/weak |
| 10 | Accent | `accent.label`, `accent.ga`, `accent.rp` | `#settingsAccentLabel`, `#accentOpts`, `ACCENT` | `app_accent` | Move to profile (`3a`) | Show every session | Phase 1 requires session-fixed GA/RP |
| 11 | UI language | `settings_lang`, `lang_opts.*` | `#settingsLangLabel`, `#langOpts`, `LANG` | `app_lang` plus `app_lang` cookie | Move to language settings (`3f`) | Not part of each drill session | Product language is not a learning profile parameter |
| 12 | Mode B band | `modeb.band.*`, `modeb.pool` | No visible setup UI; `MODEB_BANDS`, `getVocabBand()` | `ept_vocab_band` | Retire | Hide | Band progression was removed in Phase 1-0-a; residual code/key cleanup is Phase 1-A+ |

### 1.2 Setup DOM controls checked

| DOM | Options |
|---|---|
| `#modeOpts` | `a`, `b` |
| `#tabOpts` | `words`, `connected` |
| `#cefrPills` | A1, A2, B1 (B2 exists in i18n/data but current setup has no B2 pill) |
| `#dirOpts` | `decode`, `encode` |
| `#focusPills` | `all`, `traps`, `weak`, `letters`, `contractions`, `irregular`, `casual` |
| `#regOpts` | `all`, `regular`, `irregular` |
| `#grpPills` | `all`, `short`, `long`, `team`, `r` |
| `#csLevelPills` | `all`, `1`, `2`, `3` |
| `#csPills` | `all`, `linking`, `assimilation`, `elision`, `weak` |
| `#langOpts` | en, ja, zh-Hant, zh-Hans, ko, fil |
| `#accentOpts` | ga, rp |

### 1.3 Phase 1 profile serialization recommendation

`prev_settings_v1` should store only the Phase 1 profile and per-purpose
filter defaults, not the retired routing controls.

```json
{
  "version": 1,
  "accent": "ga",
  "cefrLevels": ["A1", "A2"],
  "purposeDefaults": {
    "2a": { "focus": "all", "reg": "all", "grp": "all" },
    "2b": { "focus": "all", "reg": "all", "grp": "all" },
    "2c": { "focus": "all" },
    "2d": { "csLevel": "all", "csFilter": "all" }
  },
  "updatedAt": 0
}
```

## 2. localStorage schema: current state and Phase 1 plan

### 2.1 Current key families

| Key family | Current use | Phase 1 handling |
|---|---|---|
| `app_lang` | UI language; also mirrored to cookie for middleware/path behavior | Keep for `3f` |
| `app_accent` | GA/RP accent | Keep initially; profile (`3a`) becomes the only UI writer |
| `app_mode` | Old Mode A/B routing | Retire after purpose-card implementation |
| `ept_hist_v1` | Word SRS: `{ "<word>": { box, seen, ok, ng, ts } }` | Keep; Phase 1 can continue using it for adaptive order |
| `ept_sym_v1` | Encode weak-symbol history: `{ "<symbol>": { att, err } }` | Keep |
| `ept_vocab_v1` | Study vocabulary SRS | Keep for `2c` |
| `ept_vocab_band` | Old Mode B band | Retire |
| `ept_checks_v1` | Manual progress checks by old mode `{ d, e, l }` | Migrate to `mark:{drill_id}:{word_id}` |
| `ipa_tts_v2:{accent}:{slug}` | TTS audio cache for words, phrases, weak forms | Keep; storage pressure remains browser-dependent |
| `ipa_tts_v2:{legacy_slug}` | Legacy GA read/migration path | Keep read-only migration support until cleanup Issue |
| `ipa_tts_v1:*` | Mentioned in docs as old legacy format | Read/migrate only where still supported by GAS/client history |
| `va-disable` | Vercel Analytics opt-out via query param | Keep |

### 2.2 Phase 1 new keys

#### `mark:{drill_id}:{word_id}`

| Field | Value |
|---|---|
| `drill_id` enum | `2a`, `2b`, `2c`, `2d` |
| `word_id` | Prefer stable `id` for connected/weak; use `w` for wordlist until numeric IDs exist |
| Value | Integer `0` through `3` |
| Ownership | User manual marking only; never auto-increment from ok/bad |

Key examples:

```text
mark:2a:about = 2
mark:2b:about = 1
mark:2c:about = 3
mark:2d:cs_001 = 1
```

#### `prev_settings_v1`

Use the JSON shape in §1.3. It should intentionally omit `app_mode`, `tab`,
`dir`, and `ept_vocab_band`, because these are replaced by purpose-card flow.

#### `onboarding_completed_v1`

Boolean-like value. Recommendation: store string `"1"` for completed/skipped,
and treat missing as not completed.

### 2.3 Migration strategy from `ept_checks_v1`

Current `ept_checks_v1` values use old mode letters:

| Old mode | Current meaning | New mark target |
|---|---|---|
| `d` | Decode / IPA to word | `mark:2a:{word_id}` |
| `e` | Encode / word to IPA | `mark:2b:{word_id}` |
| `l` | Listen / Mode B Study | `mark:2c:{word_id}` |

Recommended migration:

1. Run lazy migration once on app startup before progress UI renders.
2. For each `ept_checks_v1[wordKey]`, copy `d/e/l` values into the matching
   `mark:*` keys, clamped to `0..3`.
3. Do not overwrite an existing `mark:*` key if the user has already marked it.
4. Set a small sentinel such as `mark_migration_v1 = "1"` after success.
5. Keep `ept_checks_v1` read-only for one release cycle, then remove old UI
   reads in the cleanup Issue.
6. `2d` has no old equivalent. Initialize by absence (`0`), not by writing
   explicit zero keys.

## 3. CEFR word-level coverage (Q-17)

### 3.1 Wordlist

| Metric | Count |
|---|---:|
| Total words | 5,397 |
| CEFR tagged | 5,397 |
| CEFR missing | 0 |
| A1 | 1,187 |
| A2 | 1,195 |
| B1 | 2,116 |
| B2 | 899 |

Source distribution:

| `src` | Count |
|---|---:|
| `cefr` | 3,689 |
| `both` | 838 |
| `phonics` | 652 |
| `irregular_verb` | 75 |
| `contraction` | 48 |
| `phoneme_fill` | 40 |
| `letter` | 26 |
| `casual` | 15 |
| `irregular_plural` | 14 |

Mode B eligible pool under current code is 5,323 words. The 74 excluded words
are `letter` (26) and `contraction` (48), matching the current
`MODEB_EXCLUDED_SRC` rule.

### 3.2 Connected speech and weak forms

| File | Total | CEFR tagged | Missing | Distribution |
|---|---:|---:|---:|---|
| `data/connected_speech.json` | 201 | 201 | 0 | A1=63 / A2=106 / B1=19 / B2=13 |
| `data/weak_forms.json` | 36 | 36 | 0 | A2=26 / B1=10 |

Connected level/type distribution:

| Dimension | Distribution |
|---|---|
| `level` | L1=61 / L2=67 / L3=73 |
| `cs_type` | linking=73 / assimilation=59 / elision=69 |
| weak `level` | L1=10 / L2=14 / L3=12 |

### 3.3 Untagged-word policy recommendation

Because Recon found zero missing CEFR tags in wordlist, connected speech, and
weak forms, Phase 1 does not need a fallback policy for untagged production
data. Still, implementation should keep the existing unknown-badge behavior
as a defensive display path for future data imports.

| Option | Evaluation |
|---|---|
| A: Exclude missing CEFR from pool | Not needed now; would silently hide future imports |
| B: Assign default A1 | Not recommended; creates false difficulty metadata |
| C: Treat missing as all-level | Not needed now; can pollute beginner pools |
| Recommended | Keep unknown display badge; fail data QA if missing CEFR appears in runtime data |

## 4. GA/RP IPA and audio coverage (Q-18)

### 4.1 Wordlist IPA fields

| Field | Present | Missing | Notes |
|---|---:|---:|---|
| `ipa` | 5,397 | 0 | GA phonemic, scoring source for GA |
| `rp_ipa` | 5,397 | 0 | RP phonemic, scoring source for RP |
| `ipa_actual_ga` | 529 | 4,868 | Narrow/allophonic display only where audible GA difference exists |
| `ipa_actual_rp` | 0 | 5,397 | No RP narrow layer yet |
| `respell_ga` | 5,322 | 75 | Data retained; UI hidden |
| `respell_rp` | 5,322 | 75 | Data retained; UI hidden |
| `ga_rp_same` | 5,397 | 0 | same=2,674 / different=2,723 |
| `ga_rp_same_reason` | 5,397 | 0 | Deterministic reason code |

Top `ga_rp_same_reason` values:

| Reason | Count |
|---|---:|
| `identical` | 1,527 |
| `rhoticity` | 691 |
| `structural_other` | 615 |
| `length_marking_only` | 558 |
| `ga_allophony` | 529 |
| `dress_notation_only` | 457 |
| `goat_vowel` | 288 |
| `lot_vowel` | 258 |
| `square_near_cure` | 105 |
| `weak_vowel` | 102 |

### 4.2 Connected/weak IPA fields

| Dataset | `ipa` | `rp_ipa` | `ga_rp_same` |
|---|---:|---:|---|
| Connected speech (201) | 201 / 201 | 201 / 201 | same=94 / different=107 |
| Weak forms (36) | 36 / 36 | 36 / 36 | same=30 / different=6 |

Weak forms also have `rp_ipa_strong` 36 / 36. The JSON field is
`ipa_strong` after client normalization, while raw data uses `strong_ipa` in
the current specification history; implementations should verify the raw key
before editing.

### 4.3 TTS coverage: repository-verifiable state

The repository cannot prove how many Google Drive MP3 files currently exist,
because Drive is outside the repo. The following coverage is verifiable from
`gas/README.md`, `gas/BatchWarm.gs`, `src/index.template.html`, and
`docs/reference/remaining-ops-checklist.md`.

| Audio target | On-demand GAS route | Batch/prewarm status | Phase 1 handling |
|---|---|---|---|
| Word GA | `?word=...&accent=ga` / `?urls=1&accent=ga` | GA scheduler covers 5,397 words via `BatchWords.gs` / `batchWarmGA` | Supported |
| Word RP | `?word=...&accent=rp` / `?urls=1&accent=rp` | No RP batch scheduler; generated on demand | Supported but may be cold-start slower |
| Connected phrase GA | `?phrase=...&accent=ga` | Runtime prefetch; no 5,397-style phrase batch table | Supported |
| Connected phrase RP | Not implemented as production behavior; docs keep GA fixed | None | Track B candidate |
| Weak form GA/RP | `?weak=/IPA/&ww=word&accent=ga|rp` | Runtime prefetch | Supported on demand |

Operational caveat: `?urls=1` and public Drive sharing require the manual GAS
deployment/migration steps in `docs/reference/remaining-ops-checklist.md`.

### 4.4 Recommended handling

- Track A / Phase 1 should operate within the implemented GA/RP word and weak
  TTS routes.
- Do not block `3a` accent selection on RP batch warm; the route is supported
  on demand.
- Keep `2d` connected phrase TTS GA-only, matching `docs/DESIGN.md` and
  `docs/SPECIFICATION.md`.
- Track B candidate: RP connected phrase TTS and RP batch warm scheduler if
  RP usage or user feedback justifies it.

## 5. IPA partial-match search latency (Q-19)

### 5.1 Current vocab search

Current `#vocabPage` search is word-spelling only:

```js
const filtered = q ? sorted.filter(c => c.w.toLowerCase().includes(q)) : sorted;
```

There is no current IPA-symbol partial-match search. `#vocabFilters` exists
but is hidden, and the current visible navigation is word search plus A-Z
jump.

### 5.2 Prototype measurement

Prototype filter:

- Dataset: all 5,397 wordlist rows.
- Search fields: `ipa`, `rp_ipa`, `ipa_actual_ga`, `ipa_actual_rp`.
- Query form: one to three IPA symbols, all symbols must be included.
- Runs: 120 loops per query; first 20 discarded as warmup.
- Environment: Python prototype on the Cursor Cloud VM. This measures the
  filter core, not DOM rendering. As a conservative mobile estimate, multiply
  p95 by 4-6x; all measured values remain well under 100ms.

| Query | Matches | Mean ms | p95 ms |
|---|---:|---:|---:|
| `theta` symbol (`θ`) | 118 | 1.64 | 1.73 |
| `schwa` (`ə`) | 2,918 | 1.75 | 1.84 |
| `r-colored` (`ɝ`) | 226 | 1.71 | 2.57 |
| `tʃ` | 186 | 1.68 | 1.83 |
| `eɪ` | 619 | 1.71 | 1.84 |
| `ɑː` | 233 | 1.67 | 1.83 |
| `ɪə` | 170 | 1.71 | 1.85 |
| `ə` + `r` | 1,037 | 1.80 | 1.84 |
| `ə` + `r` + `t` | 432 | 1.82 | 1.86 |
| `æ` + `ŋ` | 52 | 1.66 | 1.70 |
| `aɪ` + `t` | 172 | 1.70 | 1.73 |
| `oʊ` + `n` | 114 | 1.69 | 1.75 |

### 5.3 Recommendation for Phase 1-E (`3c`)

Filtering itself does not require a precomputed inverse index at 5,397 words.
The risk is DOM rendering when thousands of rows match (for example `ə`).

Recommended implementation:

1. Pre-normalize searchable IPA strings once after wordlist load.
2. Filter synchronously on input; debounce only if rendering feels jumpy.
3. Render first 50-100 matches immediately and provide a "show more" or lazy
   chunk for broad symbols.
4. Do not add Web Worker or generated JSON index in Phase 1 unless real browser
   testing shows >100ms input-to-first-results latency.

## 6. Phase 1 frame dynamic items x data sources

| Frame | Dynamic item | Data source | Phase 1 change |
|---|---|---|---|
| `1a` | Tagline | i18n future key or static DOM copy; current source is `docs/PURPOSE.md` tagline | New UI copy in Phase 1-B |
| `1a` | Purpose card labels | i18n future keys for `2a`-`2d`; current labels live in docs only | New |
| `1a` | Language/guide controls | Existing `LANG`, `app_lang`, guide modal | Reposition |
| `1a` | Footer links / about entry | `#siteFooter`, legal/Tally/X links, future `3h` DOM | Expand for crawler-readable `3h` |
| `3a` | Accent | `ACCENT`, `app_accent`, `#accentOpts` | Move from Settings to profile; session-fixed |
| `3a` | CEFR levels | `S.cefrLevels`, wordlist `cefr` | Move from setup to profile; add B2 in UI |
| `3a` | Word filters | `S.focus`, `S.reg`, `S.grp` | Move to profile defaults; optional inline chips |
| `3a` | Connected filters | `S.csLevel`, `S.csFilter` | Move to profile defaults for `2d`; keep level/type only |
| `3a` | Previous settings | New `prev_settings_v1` | New |
| `2a` | Question IPA | `activeNarrowIpa(c)` from `ipa_actual_ga` / `rp_ipa` / `ipa` | Profile-fixed accent |
| `2a` | TTS | GAS `?word=...&accent=ga|rp`, `speakOptsForItem` | Accent fixed by `3a` |
| `2a` | Correct spelling | wordlist `w` | No change |
| `2a` | Gloss/reveal detail | `gloss.{lang}`, `def`, `autoNote`, phoneme JSON | No change; Phase 1 visual hierarchy changes |
| `2a` | Step number / total | `S.idx`, `S.poolTotal` | No change |
| `2a` | CEFR tag | wordlist `cefr`, `setCardCefr` | Display remains; source fully covered |
| `2a` | Marking | Current `ept_checks_v1.d`; future `mark:2a:{word_id}` | Migrate |
| `2b` | Prompt word | wordlist `w` | No change |
| `2b` | IPA keyboard | `keyGroups()` keyed by `ACCENT` | Accent fixed by `3a` |
| `2b` | Correct IPA | `activeIpa(c)` | Profile-fixed accent |
| `2b` | TTS | GAS word route | No change |
| `2b` | Marking | Current `ept_checks_v1.e`; future `mark:2b:{word_id}` | Migrate |
| `2c` | Sound-first prompt | GAS word route, `renderModeBStudy` | Rename/reframe from Mode B Study |
| `2c` | IPA reveal | `activeNarrowIpa(c)` and `renderAltAccentLine` | Profile-fixed accent |
| `2c` | Word/gloss reveal | wordlist `w`, `gloss.{lang}`, `def` | No change |
| `2c` | Pool | `modeBPool()`: CEFR plus excludes `letter`/`contraction` | Remove band dependency in later cleanup |
| `2c` | Marking | Current `ept_checks_v1.l`; future `mark:2c:{word_id}` | Migrate |
| `2d` | Connected/weak IPA | `CONNECTED` + `WEAK`, `activeNarrowIpa(c)` | Connected phrase TTS remains GA |
| `2d` | Phrase/word answer | `w`, carrier templates | No change |
| `2d` | Level/type filters | `level`, `cs_type`, weak marker | Keep only level/type |
| `2d` | CEFR tag | `cefr` on connected/weak data | Display only; no CEFR filter |
| `2d` | Marking | No old direct equivalent; future `mark:2d:{id}` | New |
| `3b` | Vocabulary rows | `PRESET`, `CONNECTED`, `renderVocabWords`, `renderVocabPhrases` | Reframe as support screen |
| `3b` | Search | Current word `includes`; future IPA filter from `3c` | Add IPA search/filter in Phase 1-E |
| `3b` | IPA rows | `ipa`, `rp_ipa`, `ga_rp_same` | No data change |
| `3b` | Progress/marking | Current `ept_checks_v1`; future `mark:*` | Migrate display |
| `3c` | IPA symbol list | Current keyboard groups, phoneme JSON, wordlist IPA fields | New support concept |
| `3c` | IPA search results | Pre-normalized wordlist IPA strings | New |
| `3d` | Learning status | `ept_hist_v1`, `ept_sym_v1`, `ept_vocab_v1`, future `mark:*` | New aggregation UI |
| `3e` | IPA explanation | `i18n/phonemes/{lang}.json`, guide content | Reposition from modal/info boxes |
| `3f` | UI language | `app_lang`, language cookie, `SUPPORTED_LANGS`, i18n JSON | Move from Settings modal |
| `3g` | Onboarding slides | `data/guide.json` and new static/onboarding copy | New; completion key `onboarding_completed_v1` |
| `3h` | About this app | Static DOM copy, legal/feedback links, docs/PURPOSE distilled text | New crawler-readable support page/section |

## 7. DOCUMENT-MAP update proposal

Add `docs/design/phase-1/screen-data-mapping.md` to Category A because later
Phase 1 implementation PRs must keep the screen/data contract in sync.

Recommended Category A row:

| File | Update trigger | Owner |
|---|---|---|
| `docs/design/phase-1/screen-data-mapping.md` | Phase 1 screen/data mapping changes: profile parameters, localStorage keys, runtime data fields, frame data sources | The Cursor implementation PR that changes the mapped screen/data behavior |

Update triggers:

- Phase 1-B: purpose cards or top dynamic data changes.
- Phase 1-C: profile, localStorage migration, or `prev_settings_v1` changes.
- Phase 1-D: drill data source, marking, CEFR tag, or queue behavior changes.
- Phase 1-E: vocab list / IPA picker / search behavior changes.
- Phase 1-F: onboarding key/content changes.
- Phase 1-G/H: language/device variants that add new dynamic data sources.

## 8. Reproducibility notes

Primary commands used:

```bash
md5sum src/index.template.html wordlist_GA_a1a2_plus_phonics.json data/connected_speech.json data/weak_forms.json data/guide.json docs/PURPOSE.md docs/SPECIFICATION.md docs/DESIGN.md docs/LAUNCH-CHECKLIST.md docs/DOCUMENT-MAP.md docs/REPOSITORY-STRUCTURE.md > /tmp/issue-78/before-targets.md5
python3 - <<'PY'
# JSON counts for wordlist / connected / weak and IPA filter latency prototype.
# See implementation report for the full command output summary.
PY
```

Final PR verification must confirm that `src/index.template.html`,
`wordlist_GA_a1a2_plus_phonics.json`, `data/connected_speech.json`,
`data/weak_forms.json`, and `data/guide.json` md5 values are unchanged from
the Phase 0 snapshot.
