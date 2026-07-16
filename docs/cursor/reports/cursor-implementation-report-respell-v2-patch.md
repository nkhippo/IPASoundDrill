---
id: pj-2026-07-02-846a
aliases:
- pj-2026-07-02-846a
title: Cursor Implementation Report — Respelling v2 Quality Patch
created: '2026-07-02'
---
# Cursor Implementation Report — Respelling v2 Quality Patch

- Date: 2026-07-02
- Branch: `main`
- Scope: Apply Claude quality-sample fix for syllabic+n/l + coda consonant respelling (18 words)

## 1) Background

`docs/final-status-report.md` identified a cosmetic readability issue in 17–18 words where syllabic consonant nuclei with additional coda consonants produced all-consonant blobs (e.g. `important` → `im-POR-tnt`).

Fix: when a syllabic nucleus (`n̩`/`l̩`) has a non-empty coda, spell with `uh` + consonant letter (`uhnt`, `uhns`, etc.).

## 2) Files added/updated

| File | Action |
|---|---|
| `scripts/generate_respelling.py` | Added (v2 logic with syllabic+coda fix) |
| `phase2b_respell_draft_v2.json` | Added (full 3,059-word respelling draft) |
| `docs/final-status-report.md` | Added (project status reference) |
| `wordlist_GA_a1a2_plus_phonics.json` | Patched `respell_ga` on 18 words |

## 3) Merge execution

```bash
python3 scripts/merge_respelling.py --draft phase2b_respell_draft_v2.json --no-clear-pending
```

Result:

```text
merged 3059 / 3059 entries from phase2b_respell_draft_v2.json
respell_ga count: 3059
```

## 4) Changed words (respell_ga only)

18 words updated; `respell_rp` unchanged (0 diffs vs HEAD):

| Word | Before | After |
|---|---|---|
| `important` | `im-POR-tnt` | `im-POR-tuhnt` |
| `couldn't` | `KUU-dnt` | `KUU-duhnt` |
| `didn't` | `DI-dnt` | `DI-duhnt` |
| `hadn't` | `HA-dnt` | `HA-duhnt` |
| `shouldn't` | `SHUU-dnt` | `SHUU-duhnt` |
| `wouldn't` | `WUU-dnt` | `WUU-duhnt` |
| `student` | `STOO-dnt` | `STOO-duhnt` |
| `sentence` | `SEHN-tns` | `SEHN-tuhns` |
| `accident` | `AK-suh-dnt` | `AK-suh-duhnt` |
| `assistant` | `uh-SIS-tnt` | `uh-SIS-tuhnt` |
| `confident` | `KAHN-fuh-dnt` | `KAHN-fuh-duhnt` |
| `evidence` | `EH-vuh-dns` | `EH-vuh-duhns` |
| `frightened` | `FRY-tnd` | `FRY-tuhnd` |
| `importance` | `im-POR-tns` | `im-POR-tuhns` |
| `importantly` | `im-POR-tnt-lee` | `im-POR-tuhnt-lee` |
| `independence` | `in-di-PEHN-dns` | `in-di-PEHN-duhns` |
| `instant` | `INS-tnt` | `INS-tuhnt` |
| `unimportant` | `uh-nim-POR-tnt` | `uh-nim-POR-tuhnt` |

Unchanged samples verified:

- `party`: `PAR-dee` / `PAH-tee`
- `bottle`: `BAH-dl` / `BO-tuhl` (word-final syllabic pattern unchanged)
- `winter`: `WIN-ter` / `WIN-tuh`

## 5) Non-touch verification

Compared against `HEAD`:

- `ipa`, `rp_ipa`, `ipa_actual_ga`, `ipa_actual_rp`, `respell_rp`: **0 changes**
- `encodeCheck` diff: none
- `validate_i18n.py`: ERROR なし

## 6) Documentation

- `docs/DESIGN.md` — v2 patch note under Phase 2f
- `docs/SPECIFICATION.md` — change history entry
- `docs/PURPOSE.md` — v3.1.1 change history entry

## 7) DoD

- [x] `generate_respelling.py` v2 added to `scripts/`
- [x] 18-word `respell_ga` patch applied
- [x] `respell_ga` total remains 3,059
- [x] Phonemic/narrow fields untouched
- [x] Validation scripts pass
- [x] Implementation report created

## 8) Remaining (from final-status-report.md)

- Manual browser/GitHub Pages spot-check (Naoya)
- `docs/pending-review/phonemes-allophone-i18n.md` review (Naoya)
- Connected speech / weak forms narrow+respelling extension (out of scope, future theme)
