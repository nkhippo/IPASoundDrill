# Reference documents — index for AI consultation

> **Purpose:** Quick map of stable reference material in `docs/reference/`.  
> **Last updated:** 2026-07-09

Use this folder when sharing context with Claude (or other assistants) **in addition to** the consultation brief you are working on.

---

## Start here (canonical specs)

| File | Role |
|------|------|
| [`../PURPOSE.md`](../PURPOSE.md) | Why the app exists; Mode A/B; dependency status |
| [`../DESIGN.md`](../DESIGN.md) | Implementation design; session flow; TTS; GA/RP |
| [`../SPECIFICATION.md`](../SPECIFICATION.md) | Screens, data fields, scoring, constraints |
| [`../REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) | Folder map; runtime paths; pipeline commands |

---

## Active consultation topics (2026-07-09)

| Topic | Brief | Related reference |
|-------|-------|-------------------|
| **GA↔RP “same pronunciation” flag** | [`../cursor/briefs/cursor-ga-rp-same-flag-consultation.md`](../cursor/briefs/cursor-ga-rp-same-flag-consultation.md) | `report-alt-accent-display.md`, `scripts/gen_rp_ipa.py`, `scripts/ga_to_rp.py` |
| Alt-accent UI (implemented) | [`../cursor/briefs/cursor-alt-accent-display-brief.md`](../cursor/briefs/cursor-alt-accent-display-brief.md) | `report-alt-accent-display.md` |
| CEFR on connected / weak | `cefr-connected-weak-proposal-report.md` | `consultation-cefr-connected-weak.md` |
| RP neighbors (deferred) | `rp-neighbors-priority-decision.md` | `neighbors_report.md` |
| RP TTS | `rp-tts-design-and-priority.md` | `gas/README.md` |

---

## Audits & generated reports

| File | Contents | Regenerate |
|------|----------|------------|
| `i18n-audit.md` | UI + phoneme i18n key matrix (6 langs) | `python3 tools/gen_audit_docs.py` |
| `gloss-flags.md` | gloss quality flags per word | same |
| `wordlist-cefr-audit.md` | CEFR assignment audit (Phase 0) | manual |
| `i18n-language-scaling.md` | Adding a new UI language | manual |

---

## Implementation / decision records

| File | Date | Notes |
|------|------|-------|
| `report-alt-accent-display.md` | 2026-07-06 | Alt-accent rollout; **display format updated 2026-07-09** (`/ipa/ (same)`) |
| `final-status-report.md` | 2026-07-02 | Phase 2 milestone snapshot |
| `combined-instructions-phase1-pilot-and-misc.md` | 2026-07-07 | Phase 1 pilot instructions bundle |

---

## Cursor task history

Ongoing task briefs and reports live under [`../cursor/`](../cursor/):

- `cursor/instructions/` — task briefs for Cursor
- `cursor/reports/` — implementation reports
- `cursor/briefs/` — design consultations & feature specs

Older reports may cite paths from before the 2026-07-09 repo reorg; trust `REPOSITORY-STRUCTURE.md` for current paths.

---

## Runtime code to attach for GA/RP “same” work

| Asset | Path |
|-------|------|
| UI logic | `index.html` — `altAccentValue()`, `formatSameAccentIpa()` |
| Production wordlist | `wordlist_GA_a1a2_plus_phonics.json` (`ipa`, `rp_ipa`) |
| RP generation (Claude API) | `scripts/gen_rp_ipa.py` |
| RP generation (rules) | `scripts/ga_to_rp.py` |
| Connected speech | `data/connected_speech.json` |
