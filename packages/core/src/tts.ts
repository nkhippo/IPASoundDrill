/**
 * packages/core/src/tts.ts
 *
 * 統一 TTS URL リゾルバ（Issue #222 Phase 2）。Web/Mobile いずれも同じ `TTSSource` 契約で
 * mp3 の URL/URI を取得できるようにする。`loaders.ts` の `DataLoader` と同じ設計方針
 * （Web は fetch、Mobile は事前バンドル、両対応が hybrid）を踏襲する。
 *
 * - `createBundleTTS`: Mobile 用。app assets に同梱済みの mp3（Issue #222 Phase 1 の
 *   `tools/tts/gen_tts_batch.py` で生成された人気単語）を参照する。
 * - `createFetchTTS`: Web / Mobile fallback 用。既存の GAS TTS プロキシ（`GAS_TTS_URL`）を
 *   実行時に叩く（現行 Web の挙動と同じ契約）。
 * - `createHybridTTS`: Mobile MVP 用。bundle に同梱されていればそれを使い、無ければ
 *   fetch 経由で取得してキャッシュに保存する（Issue #222 本文の「hybrid delivery」）。
 */

import type { Accent } from "./types.js";

/** Web/Mobile 共通の TTS URL 取得契約。 */
export interface TTSSource {
  /** 指定した単語・アクセントの mp3 URL（Web: HTTP URL / Mobile: ローカル URI）を返す。 */
  getMp3Url(word: string, accent: Accent): Promise<string>;
}

/**
 * Mobile 用: app assets に事前バンドルされた mp3 の URI lookup。
 * 呼び出し側（Mobile app）が `require('./assets/audio/ga/word.mp3')` 等で解決した
 * URI をこのインターフェイス経由で提供する（Expo の asset 解決の詳細は #EPIC-06/07 側で実装）。
 */
export interface BundleAssets {
  /** 同梱 mp3 があれば URI を返す。無ければ `undefined`。 */
  getUri(word: string, accent: Accent): string | undefined;
}

/** Mobile 用 loader: bundle 同梱の mp3 のみを参照する（フォールバックなし）。 */
export function createBundleTTS(bundle: BundleAssets): TTSSource {
  return {
    async getMp3Url(word, accent) {
      const uri = bundle.getUri(word, accent);
      if (!uri) {
        throw new Error(`createBundleTTS: no bundled asset for "${word}" (${accent})`);
      }
      return uri;
    },
  };
}

/**
 * Web / Mobile fallback 用: 既存の GAS TTS プロキシ（`tools/tts/gas/Code.gs`）を
 * `?word=...&accent=...` で叩く URL を組み立てる（現行 Web の `GAS_TTS_URL` 直叩きと同じ契約、
 * `docs/data-contract.md` §1 ランタイム契約 TTS パス参照）。
 */
export function createFetchTTS(gasUrl: string): TTSSource {
  const normalized = gasUrl.endsWith("/") ? gasUrl.slice(0, -1) : gasUrl;
  return {
    async getMp3Url(word, accent) {
      const query = new URLSearchParams({ word, accent }).toString();
      return `${normalized}?${query}`;
    },
  };
}

/**
 * `createHybridTTS` の端末キャッシュ抽象化。Mobile では FileSystem/AsyncStorage 実装を
 * 呼び出し側が注入する想定（#EPIC-06/07）。既定（未指定時）は in-memory 実装を使う。
 */
export interface TTSCache {
  get(word: string, accent: Accent): Promise<string | undefined>;
  set(word: string, accent: Accent, uri: string): Promise<void>;
}

/** テスト・簡易利用向けの in-memory `TTSCache` 実装。 */
export function createInMemoryTTSCache(): TTSCache {
  const store = new Map<string, string>();
  const key = (word: string, accent: Accent) => `${accent}:${word}`;
  return {
    async get(word, accent) {
      return store.get(key(word, accent));
    },
    async set(word, accent, uri) {
      store.set(key(word, accent), uri);
    },
  };
}

/**
 * Mobile MVP 用 hybrid loader（Issue #222 本文「hybrid delivery」）:
 * 1. bundle 同梱があればそれを返す（人気単語 1,000 語、Phase 1 生成物）
 * 2. 無ければ端末キャッシュを確認し、あればそれを返す
 * 3. どちらにも無ければ GAS 経由で URL を組み立て、キャッシュに保存してから返す
 *    （初回使用時オンデマンド fetch → 端末キャッシュ、の実装契約）
 */
export function createHybridTTS(
  bundle: BundleAssets,
  gasUrl: string,
  cache: TTSCache = createInMemoryTTSCache(),
): TTSSource {
  const fetchTTS = createFetchTTS(gasUrl);
  return {
    async getMp3Url(word, accent) {
      const bundled = bundle.getUri(word, accent);
      if (bundled) {
        return bundled;
      }
      const cached = await cache.get(word, accent);
      if (cached) {
        return cached;
      }
      const uri = await fetchTTS.getMp3Url(word, accent);
      await cache.set(word, accent, uri);
      return uri;
    },
  };
}
