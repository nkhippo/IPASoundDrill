---
id: pj-2026-07-02-c002
aliases:
- pj-2026-07-02-c002
title: Phoneme Allophone i18n Review (Phase 1)
created: '2026-07-02'
---

# Phoneme Allophone i18n Review (Phase 1)

Naoya review request for new allophone symbols added in `i18n/phonemes/*.json`.

## Scope

- Added symbols: `ɾ`, `ʔ`, `n̩`, `l̩`
- Languages to review: zh / ko / fil
- `t` is `0` and `allophone: true` for all 4 symbols.

## Current Drafts

### Filipino (for review)

- `ɾ`
  - lab: `flap / tap`
  - mouth: `Mabilis na isang pitik ng dulo ng dila sa may gilagid`
  - trap: `Sa GA, ang /t/ at /d/ sa pagitan ng patinig ay madalas na ganitong allophone`
- `ʔ`
  - lab: `glottal stop`
  - mouth: `Maikling paghinto na ginagawa sa pagsara ng vocal folds`
  - trap: `Sa GA, ang /t/ bago ang syllabic /n̩/ ay madalas na ganito ang tunog`
- `n̩`
  - lab: `syllabic n`
  - mouth: `Ang /n/ mismo ang nagiging nucleus ng pantig kahit walang patinig`
  - trap: `Karaniwan sa mahihinang pantig sa hulihan ng salita`
- `l̩`
  - lab: `syllabic l`
  - mouth: `Ang /l/ mismo ang nagiging nucleus ng pantig kahit walang patinig`
  - trap: `Karaniwan sa mahihinang pantig sa hulihan ng salita`

### Chinese (for review)

- `ɾ`: 闪音 / 轻拍音
- `ʔ`: 声门塞音
- `n̩`: 音节化 n
- `l̩`: 音节化 l

### Korean (for review)

- `ɾ`: 플랩 / 탭
- `ʔ`: 성문 파열음
- `n̩`: 음절핵 n
- `l̩`: 음절핵 l

## Notes

- English and Japanese wording follows the instruction sheet closely.
- If any terminology preference exists (especially for fil educational tone), update these entries before Phase 2 rollout.
