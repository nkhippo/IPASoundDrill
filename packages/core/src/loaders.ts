/**
 * packages/core/src/loaders.ts
 *
 * 環境非依存のデータ loader インターフェイス。Web（`fetch`）/ Mobile（Expo asset bundle）
 * のいずれからも同じ契約で 4 JSON + i18n を取得できるようにする（Issue #213 Phase 2）。
 */

import type {
  ConnectedSpeechData,
  GuideData,
  I18n,
  Wordlist,
  WeakFormsData,
} from "./types.js";

export interface DataLoader {
  loadWordlist(): Promise<Wordlist>;
  loadConnectedSpeech(): Promise<ConnectedSpeechData>;
  loadWeakForms(): Promise<WeakFormsData>;
  loadGuide(): Promise<GuideData>;
  loadI18n(lang: string): Promise<I18n>;
}

/** Web 用: `baseUrl` からの相対パスで `fetch` する loader。 */
export function createFetchLoader(baseUrl: string): DataLoader {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  async function fetchJson<T>(relativePath: string): Promise<T> {
    const url = new URL(relativePath, normalizedBase).toString();
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`createFetchLoader: failed to fetch ${url} (status ${res.status})`);
    }
    return (await res.json()) as T;
  }

  return {
    loadWordlist: () => fetchJson<Wordlist>("wordlist_GA_a1a2_plus_phonics.json"),
    loadConnectedSpeech: () => fetchJson<ConnectedSpeechData>("data/connected_speech.json"),
    loadWeakForms: () => fetchJson<WeakFormsData>("data/weak_forms.json"),
    loadGuide: () => fetchJson<GuideData>("data/guide.json"),
    loadI18n: (lang: string) => fetchJson<I18n>(`i18n/${lang}.json`),
  };
}

/**
 * Mobile 用: Expo `require('./assets/...')` 等で事前バンドルされたデータを
 * そのまま返す loader。呼び出し側が `bundle` に静的 import 済みの JSON を渡す。
 */
export interface BundleLoaderSource {
  wordlist: Wordlist;
  connectedSpeech: ConnectedSpeechData;
  weakForms: WeakFormsData;
  guide: GuideData;
  i18n: Record<string, I18n>;
}

export function createBundleLoader(bundle: BundleLoaderSource): DataLoader {
  return {
    loadWordlist: async () => bundle.wordlist,
    loadConnectedSpeech: async () => bundle.connectedSpeech,
    loadWeakForms: async () => bundle.weakForms,
    loadGuide: async () => bundle.guide,
    loadI18n: async (lang: string) => {
      const i18n = bundle.i18n[lang];
      if (!i18n) {
        throw new Error(`createBundleLoader: no i18n bundled for lang "${lang}"`);
      }
      return i18n;
    },
  };
}
