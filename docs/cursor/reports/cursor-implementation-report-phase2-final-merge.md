---
id: pj-2026-07-02-fa7d
aliases:
- pj-2026-07-02-fa7d
title: Cursor Implementation Report — Phase 2 Final Merge
created: '2026-07-02'
---

# Cursor Implementation Report — Phase 2 Final Merge

- Date: 2026-07-02
- Branch: `main`
- Scope: Finalize remaining 52 VntV words (narrow IPA confirmation + respelling merge)

## 1) VntV judgment summary

Naoya's TTS listening review (all 52 words):

- **nasal:** `kept` (n retained)
- **consonant:** `plain` (no flap)

Implications:

| Category | Count | Action |
|---|---|---|
| No narrow IPA needed | 49 | `ipa_actual_ga` remains absent/null |
| Existing narrow IPA kept | 3 | `granddaughter`, `independence`, `underwater` |
| Pilot incorrect narrow removed | 3 | `winter`, `twenty`, `ninety` |

## 2) Task A: narrow IPA (Task A-1 / A-2)

### A-1 verification (before fix)

```
granddaughter /ˈɡrænˌdɔɾɚ/   ✓
independence /ˌɪndɪˈpɛndn̩s/  ✓
underwater /ˈʌndɚˌwɔɾɚ/      ✓
winter /ˈwɪɾɚ/                ✗ (pilot leftover)
twenty /ˈtwɛɾi/               ✗ (pilot leftover)
ninety /ˈnaɪɾi/              ✗ (pilot leftover)
```

### A-2 correction

Added `scripts/merge_phase2a_final.py` and executed:

```bash
python3 scripts/merge_phase2a_final.py
```

Result:

```text
processed 52 final candidates
cleared ipa_actual_ga: 3
corrected ipa_actual_ga: 0
confirmed with value: 3
```

Post-fix verification:

```text
granddaughter /ˈɡrænˌdɔɾɚ/
independence /ˌɪndɪˈpɛndn̩s/
underwater /ˈʌndɚˌwɔɾɚ/
winter None
candy None
under None
twenty None
ninety None
```

## 3) Task B: respelling final 52 words

Extended `scripts/merge_respelling.py` with `--draft` / `--no-clear-pending` flags.

Executed:

```bash
python3 scripts/merge_respelling.py --draft phase2b_respell_final_52.json --no-clear-pending
```

Result:

```text
merged 52 / 52 entries from phase2b_respell_final_52.json
respell_ga を持つ語の総数: 3059
winter: WIN-ter / WIN-tuh
granddaughter: GRAN-daw-der / GRAN-daw-tuh
```

## 4) Task C: display logic (code-path check)

No `index.html` changes.

Expected behavior:

| Word | GA Reveal |
|---|---|
| `winter` | phonemic `/ˈwɪntɚ/` only; respelling `WIN-ter`; no dictionary line |
| `granddaughter` | narrow `/ˈɡrænˌdɔɾɚ/`; respelling `GRAN-daw-der`; dictionary `/ˈɡrænˌdɔtɚ/` |

## 5) Task D: verification

```bash
python3 tools/validate_i18n.py
python3 tools/gen_audit_docs.py
git diff index.html | rg "encodeCheck|function encodeCheck"
```

- `validate_i18n.py`: ERROR なし（WARN 1件: 既知 fil 同値2キー）
- `gen_audit_docs.py`: OK
- `encodeCheck` diff: none

Phonemic field integrity (`ipa`, `rp_ipa` values vs HEAD): **0 changes**

## 6) Documentation & archive

Updated:

- `docs/PURPOSE.md` — dependency table + v3.1 change history
- `docs/DESIGN.md` — Phase 2 final section + status row
- `docs/SPECIFICATION.md` — change history

Archived (completed internal tool):

- `tools/archive/review-vntv.html`
- `tools/archive/phase2a_review_needed.json`
- `tools/archive/README.md`

## 7) DoD check

- [x] `granddaughter` / `independence` / `underwater` have correct narrow IPA
- [x] 49 VntV words (incl. `winter`) have no `ipa_actual_ga`
- [x] 52-word respelling merged
- [x] `respell_ga` total = **3,059**
- [x] `validate_i18n.py` / `gen_audit_docs.py` pass without ERROR
- [x] `encodeCheck` diff zero
- [x] Docs updated; review tool archived

## 8) Phase 2 complete

**IPA Sound Drill narrow IPA + respelling coverage: 3,059/3,059 words.**

- `ipa_actual_ga`: 192 words (only where narrow differs from phonemic)
- `respell_ga` / `respell_rp`: 3,059/3,059 words
