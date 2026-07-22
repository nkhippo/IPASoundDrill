---
id: pj-2026-07-22-c122
aliases:
- pj-2026-07-22-c122
title: 'Phase 1-E PR-3: About expansion and docs closing (#122) — implementation report'
created: '2026-07-22'
---

# Phase 1-E PR-3: About expansion and docs closing (#122) — implementation report

## Related Issue / PR

- Issue: #122
- PR: #123 (draft)
- Agent: codex
- Complexity: L2
- Change Pattern: C1, C5

## Phase 0 inventory

- Runtime source of truth: `src/index.template.html`.
- Existing `#aboutBlock` was an always-on `aside.about-block[data-frame="3h"]` below `#siteFooter`, containing only `#aboutTitle` and `#aboutPlaceholder`.
- Existing i18n application was explicit inside `applyI18n()`: `about.title` used `.textContent`, and `about.placeholder` used `.textContent`.
- The template had no generic `data-i18n-html` walker. Existing trusted localized HTML is applied through explicit `.innerHTML = t(...)` assignments, so the new `about.*_html` leaves use the same explicit route.
- `about.placeholder` was referenced only by `#aboutPlaceholder` in the About DOM and its `applyI18n()` assignment. The key and its six existing values remain in the schema unchanged, while the expanded DOM no longer consumes it.
- Existing `about.title` and `about.placeholder` values were preserved in all six languages.

## Implementation

### Scope A: About expansion

- Expanded the existing `#aboutBlock` internally; no new route or modal was added.
- Added lead copy, IPA rationale, five feature items, and a feedback link.
- Added nine new `about.*` leaves to all six locales:
  - `about.lead`
  - `about.why_ipa_html`
  - `about.features.title`
  - `about.features.item_1_html` through `item_5_html`
  - `about.contact_html`
- All locales now have an identical 246-leaf schema.
- Added Mood B-only styling and `var(--font-ipa)` for inline IPA code.
- Updated SPECIFICATION, DESIGN, REPOSITORY-STRUCTURE, screen-data-mapping, and LAUNCH-CHECKLIST.

### Scope B: approved existing-value exception

Issue comment 5041128786 explicitly approved a narrow blacklist exception for pre-existing untranslated values. Only the listed keys were changed:

- ko: `drill.title.*`, `mark.aria.*`, `progress.meter_label`, `progress.meter_aria` (10 effective value changes; `top.tagline` was already translated).
- zh-Hans: `top.tagline`, `drill.title.*`, `mark.aria.*`, `progress.meter_aria` (10 effective changes; `progress.meter_label` already matched the approved completed value).
- zh-Hant: same key groups and effective-change count as zh-Hans.
- fil: `top.tagline`, `drill.title.*`, `mark.aria.*`, `progress.meter_label`, `progress.meter_aria` (11 effective changes).
- ja / en: no existing value changes.
- No other existing i18n value changed.

## Review follow-up

- Corrected the `about` object to the repository's two-space top-level / four-space child indentation in all six JSON files.
- Added Scope B translations verbatim from the approved Issue comment.
- Added this implementation report.
- Updated the specification and launch checklist to record the narrow exception.

## Validation

### JSON and i18n structure

- All six UI JSON files parse successfully.
- UI schema: 246 / 246 leaves in every locale.
- Phoneme schema: 47 symbols in all six locales with the required field sets.
- About additions: exactly nine leaves in every locale.
- JSON indentation audit: `about` is aligned with sibling top-level keys in all six files.
- Template i18n reference audit: all About references resolve in every locale.
- Inline runtime JavaScript syntax parse: passed.

### `tools/validate_i18n.py`

The repository validator cannot currently complete as written because it still targets the removed root `index.html`; this is the same pre-existing limitation recorded in the Issue #120 implementation report. Running its A/B/D/E logic equivalently against the source of truth `src/index.template.html` produced:

- [A] six UI schemas equal at 246 leaves: pass
- [B] six phoneme schemas equal at 47 symbols: pass
- [E] placeholder marker scan: pass
- [D] direct About references: pass

The validator's current broad regex also reports pre-existing false positives such as `format("woff2")` and dynamic-prefix references. No validator source change was included because that is independent tooling scope.

### Six-language script MD5

The runtime inline script was extracted with the same LF-normalized method before and after the PR. The build uses one shared template for all six generated locales, so each locale has the same runtime script bytes.

| State | en | ja | ko | zh-Hans | zh-Hant | fil |
|---|---|---|---|---|---|---|
| before | `a5ceb4b0909886b5f2c76bf0716cfb1c` | same | same | same | same | same |
| after | `6fd370b7c650bb155b0a7578b37d98ff` | same | same | same | same | same |

The before/after values differ because Scope A adds About bindings; equality across the six languages is maintained at each state.

### Blacklist audit

- Existing runtime data, fonts, and historical-report baseline: **137 / 137 files unchanged**.
- Changed-path comparison against `main` contains no runtime data, font, shared CSS foundation, or existing historical-report modification.
- Explicit approved exceptions:
  1. the Scope B values listed above in ko / zh-Hans / zh-Hant / fil;
  2. this newly added Issue #122 report.
- Existing report files remain unchanged.
- Established shared class names, `setExclusivePage()`, `leaveExclusiveRoute()`, study-entry functions, and language-switcher structure/behavior are unchanged.

## Complexity Retrospective

### Prior classification vs actual work

- Prior Complexity Level: L2
- Result: appropriate.
- Rationale: the runtime edit stayed localized to the existing About block, but completion required synchronized six-language schema/content, an approved existing-value repair, and Category A documentation alignment. No framework, route architecture, or runtime data contract changed.

### Change Pattern review

- Prior patterns: C1, C5
- Result: appropriate.
- C1 covers documentation and behavior-invariant closing work.
- C5 covers the intentional `about.*` schema extension.
- Scope B repairs values within the existing schema and does not require another pattern.
- Additional pattern proposal: none.

### Contract impact checklist

- [x] Runtime word / connected-speech / weak-form data unchanged
- [ ] i18n schema unchanged (nine `about.*` leaves intentionally added)
- [x] URL and route structure unchanged
- [x] Build system unchanged
- [ ] Category A documentation unchanged (five documents intentionally synchronized)
- [x] Existing file-path dependencies unchanged

### Overall result

- [x] L2 and C1/C5 remain valid
- [x] Phase 1-E PR-3 completion criteria are covered by Scope A + Scope B + docs
- [x] No level escalation or additional pattern is proposed
