/**
 * apps/mobile/src/loaders/bundleTTS.ts
 *
 * `@ipasounddrill/core` の `createHybridTTS`/`BundleAssets` を Mobile 向けに実体化する
 * （Issue #223 Phase 3）。
 *
 * `AUDIO_MODULES` は `apps/mobile/assets/audio/{ga,rp}/*.mp3`（tools/tts の
 * `gen_tts_batch.py` で生成、#EPIC-05）を Metro の静的 `require()` で解決した一覧。
 * 本 Issue（#223）の Phase 5 では `assets/audio/` は空 dir + README のみのため
 * `AUDIO_MODULES` は空 — bundle に無い単語は `createHybridTTS` が GAS TTS フォールバック
 * （既存 Web と同じ `GAS_TTS_URL`）で URL を組み立てて再生する。
 * 実際の mp3 バンドルは #EPIC-05 の出力を `copy-core-assets.js` に配線後、この一覧を拡張する。
 */
import { Asset } from "expo-asset";
import {
  createHybridTTS,
  createInMemoryTTSCache,
  type Accent,
  type BundleAssets,
  type TTSSource,
} from "@ipasounddrill/core";

// 既存 Web (`apps/web/src/index.template.html`) と同一の GAS TTS プロキシ URL。
// `docs/data-contract.md` §1 ランタイム契約 TTS パス参照。
const GAS_TTS_URL =
  "https://script.google.com/macros/s/AKfycbz-O44-1Nyi3rrEsBMYfwGeBK_DTGAH-ItOsamiHz8iFe4Kz2pnnowNatlb6LeZS8mE/exec";

/** #EPIC-05 の batch mp3 生成物が同梱されたら `{ ga: { word: require(...) } }` の形で拡張する。 */
const AUDIO_MODULES: Record<Accent, Record<string, number>> = {
  ga: {},
  rp: {},
};

const resolvedUriCache = new Map<string, string>();

function createMobileBundleAssets(): BundleAssets {
  return {
    getUri(word: string, accent: Accent) {
      const moduleId = AUDIO_MODULES[accent]?.[word];
      if (moduleId === undefined) {
        return undefined;
      }
      const cacheKey = `${accent}:${word}`;
      const cached = resolvedUriCache.get(cacheKey);
      if (cached) {
        return cached;
      }
      const uri = Asset.fromModule(moduleId).uri;
      resolvedUriCache.set(cacheKey, uri);
      return uri;
    },
  };
}

/**
 * Mobile 用 `TTSSource`。bundle 同梱 mp3（現状空）→ 端末キャッシュ → GAS フォールバックの
 * 優先順位で URI/URL を返す（`packages/core/src/tts.ts` の hybrid 契約に準拠）。
 */
export function createMobileBundleTTS(): TTSSource {
  return createHybridTTS(createMobileBundleAssets(), GAS_TTS_URL, createInMemoryTTSCache());
}

/**
 * 指定単語・アクセントの mp3 が bundle 同梱済みかどうか（Issue #224 Phase 5）。
 * `PlaybackButton` がオフライン再生可否（bundle 同梱があればオフラインでも再生できる）を
 * 判定するために使う。`AUDIO_MODULES` が空の間は常に `false`（GAS フォールバック必須）。
 */
export function hasBundledAudio(word: string, accent: Accent): boolean {
  return AUDIO_MODULES[accent]?.[word] !== undefined;
}
