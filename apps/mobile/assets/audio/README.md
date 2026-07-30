# apps/mobile/assets/audio/

Bundled TTS mp3 files for the mobile app's "bundle-first, GAS-fallback" hybrid
TTS strategy (`packages/core/src/tts.ts` `createHybridTTS`, see Issue #EPIC-05
/ #222).

- `ga/` — General American accent mp3s.
- `rp/` — Received Pronunciation accent mp3s.

## Status (Issue #223)

This Issue (#223, Expo project scaffold) only creates the empty directory
structure. Populating these directories with the actual batch-generated mp3s
from `tools/tts/gen_tts_batch.py` (#EPIC-05) and wiring the resulting file
list into `apps/mobile/src/loaders/bundleTTS.ts`'s `AUDIO_MODULES` manifest is
tracked as a follow-up (out of scope for #223).

Until then, `createMobileBundleTTS()` in `bundleTTS.ts` finds no bundled
asset for any word and falls back to the GAS TTS proxy
(`docs/data-contract.md` §1 runtime contract TTS paths) — this is expected
behavior, not a bug.

Generated mp3 files are gitignored (`apps/mobile/.gitignore`:
`assets/audio/**/*.mp3`); only this README and the directory structure are
tracked in git.
