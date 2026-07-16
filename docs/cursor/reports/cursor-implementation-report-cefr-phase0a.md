---
id: pj-2026-07-07-5a2a
aliases:
- pj-2026-07-07-5a2a
title: Cursor Implementation Report — CEFR Phase 0-a
created: '2026-07-07'
---
# Cursor Implementation Report — CEFR Phase 0-a

- Date: 2026-07-07
- Branch: `main`
- Scope: Null `cefr` on 652 mislabeled phonics words (data-only; no `index.html` changes)

## 1) git status (files touched)

| Action | Path |
|---|---|
| Added | `scripts/apply_phonics_cefr_null.py` |
| Added | `docs/wordlist-cefr-audit.md` |
| Added | `docs/cursor-instructions-cefr-phase0a.md` |
| Modified | `wordlist_GA_a1a2_plus_phonics.json` (652 entries) |
| Modified | `.gitignore` (`*.pre-phase0a.json`) |
| Modified | `docs/PURPOSE.md`, `docs/SPECIFICATION.md` |
| Not committed | `wordlist_GA_a1a2_plus_phonics.pre-phase0a.json` (local backup) |

`index.html` / `i18n/*.json`: **unchanged** (per scope)

## 2) Script execution output

```
Changed: 652 entries (expected 652) — OK

=== CEFR distribution ===
cefr         before    after
A1             1187     1187
A2             1195     1195
B1              347       25
B2              330        0
None              0      652

Backup written to: wordlist_GA_a1a2_plus_phonics.pre-phase0a.json
Updated file: wordlist_GA_a1a2_plus_phonics.json
```

Note: wordlist path is repo root (`wordlist_GA_a1a2_plus_phonics.json`), not `data/` — consistent with existing codebase.

## 3) Verification results

### 3-1 Pre-check
```
phonics B1/B2 対象数: 652
OK
```

### 3-2 Post-check
```
CEFR 分布: {'A1': 1187, 'A2': 1195, None: 652, 'B1': 25}
全アサーション PASS
```

### 3-3 Sample (cefr null, other fields intact)
```
grant -> {'ipa': '/ɡrænt/', 'cefr': None, 'src': 'phonics', 'pattern': 'a → /æ/', 'group': 'short'}
bomb -> {'ipa': '/bɑm/', 'cefr': None, 'src': 'phonics', ...}
tent, spice, shame — OK
```

### 3-4 Runtime behavior (code review; browser test pending Naoya)

| Area | Expected impact |
|---|---|
| Mode A | No change (`cefr` not used in pool filtering) |
| Mode B A1/A2 bands | Unchanged (1,187 / 1,195 words) |
| Mode B B1 band | Shrinks to 25 words (`phoneme_fill` only) |
| Mode B B2 band | **0 words** — users who unlocked B2 may hit empty pool |

## 4) Audit report

See [docs/wordlist-cefr-audit.md](wordlist-cefr-audit.md)

## 5) DoD

- [x] `scripts/apply_phonics_cefr_null.py` created
- [x] 652 entries nulled (`B1` 322 + `B2` 330 phonics)
- [x] Post-distribution matches expected counts
- [x] `docs/wordlist-cefr-audit.md` created
- [x] `docs/PURPOSE.md` dependency table + v3.3 changelog
- [x] `docs/SPECIFICATION.md` cefr field notes + history
- [x] `.gitignore` for backup files
- [x] `index.html` untouched
- [ ] Mode B B2 empty-band browser test (Naoya)

## 6) Remaining / handoff to Phase 0-b

- `filteredPool()` CEFR filter wiring
- `lvl.*` UI + default A1
- Mode B empty B2 band UX (hide / “準備中”)
- `set.phonics_t` phonics axis UI
