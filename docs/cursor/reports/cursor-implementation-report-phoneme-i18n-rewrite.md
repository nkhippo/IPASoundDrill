---
id: pj-2026-07-06-cc89
aliases:
- pj-2026-07-06-cc89
title: Cursor Implementation Report — Phoneme Guide i18n Rewrite (ja / ko / zh)
created: '2026-07-06'
---
# Cursor Implementation Report — Phoneme Guide i18n Rewrite (ja / ko / zh)

- Date: 2026-07-06
- Branch: `main`
- Scope: Full replacement of `i18n/phonemes/{ja,ko,zh}.json` (47 symbols × 3 languages)

## 1) Problem addressed

Legacy ja/ko/zh phoneme guides were machine-translated in ways that broke meaning:

- Example words translated (`sit` → 「座る」)
- IPA letters misread as words (`i` → 「私」)
- Learner-facing labels became nonsensical (e.g. `ɪ` lab was 「短い私（座る）」)

Unified style (matching existing `fil.json`):

1. Example words stay in English
2. IPA shown as `/../` or preserved Latin notation
3. `lab`: sound description + (English cue word)
4. `ex`: `"word /IPA/"` format
5. `mouth` / `trap`: natural learner-language explanations

## 2) Files replaced

| File | Action |
|---|---|
| `i18n/phonemes/ja.json` | Replaced with `ph_ja_new.json` |
| `i18n/phonemes/ko.json` | Replaced with `ph_ko_new.json` |
| `i18n/phonemes/zh.json` | Replaced with `ph_zh_new.json` |
| `i18n/phonemes/en.json` | Unchanged |
| `i18n/phonemes/fil.json` | Unchanged |
| `index.html` | Unchanged |

## 3) Structure validation (Task A-2)

```bash
python3 -c "..."  # key/field/t/allophone parity vs en.json
```

Output:

```text
ja: OK (47 entries, structure matches en.json)
ko: OK (47 entries, structure matches en.json)
zh: OK (47 entries, structure matches en.json)
```

## 4) Sample `ɪ` entries (post-rewrite)

| Lang | `lab` | `ex` |
|---|---|---|
| ja | 短い「イ」の音（sit） | sit /sɪt/ |
| ko | 짧은 「이」 소리 (sit) | sit /sɪt/ |
| zh | 短「伊」（sit） | sit /sɪt/ |
| fil (unchanged) | maikling i (sit) | sit /sɪt/ |

## 5) Verification (Task C)

```bash
python3 tools/validate_i18n.py
python3 tools/gen_audit_docs.py
```

- ERROR: none
- WARN: fil.json same-as-en keys (known, pre-existing pattern)

`encodeCheck` / `index.html`: no changes

## 6) Documentation & archive

- `docs/SPECIFICATION.md` — change history entry added
- `docs/cursor-phoneme-i18n-rewrite.md` — instruction copy added
- `docs/pending-review/phonemes-allophone-i18n.md` → `docs/archive/` (superseded by this rewrite)

## 7) DoD check

- [x] ja / ko / zh fully replaced (47 entries each)
- [x] Field structure + `t` / `allophone` flags match `en.json`
- [x] `en.json` / `fil.json` untouched
- [x] `validate_i18n.py` passes without new ERROR
- [x] Pending allophone review doc archived
- [ ] Browser spot-check (Naoya): ja/ko/zh `ɪ` info box + fil regression

## 8) Manual check for Naoya

1. Set UI to 日本語 → tap `ɪ` in Reveal → expect 「短い「イ」の音（sit）」 / `sit /sɪt/`
2. Set UI to 中文 → expect 「短「伊」（sit）」
3. Set UI to 한국어 → expect 「짧은 「이」 소리 (sit)」
4. Set UI to Filipino → expect unchanged 「maikling i (sit)」
