/**
 * apps/mobile/src/i18n/index.ts
 *
 * `packages/core/i18n/{lang}.json` を bundle 経由で読込 + 端末言語検出（Issue #224 Phase 7）。
 * `expo-localization` で端末言語を検出し、`apps/mobile/assets/i18n/{lang}.json`
 * （`copy-core-assets.js` でコピー済み、`src/loaders/bundleLoader.ts` の
 * `createMobileBundleLoader().loadI18n(lang)` 経由）から該当ロケールを読み込む。
 * サポート外言語・読込失敗時は英語にフォールバックする
 * （`docs/data-contract.md` §5 i18n スキーマの 6 言語: en/ja/ko/fil/zh-Hans/zh-Hant）。
 */
import * as Localization from "expo-localization";
import type { I18n } from "@ipasounddrill/core";

import { createMobileBundleLoader } from "../loaders/bundleLoader";
import type { SupportedLanguage } from "../store/settings";

const loader = createMobileBundleLoader();

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "en",
  "ja",
  "ko",
  "fil",
  "zh-Hans",
  "zh-Hant",
];

/** 端末ロケール（例: `zh-Hant-TW`, `ja-JP`）をサポート 6 言語のいずれかに解決する。フォールバックは `en`。 */
export function resolveDeviceLanguage(): SupportedLanguage {
  const locales = Localization.getLocales();
  for (const locale of locales) {
    const tag = locale.languageTag; // e.g. "zh-Hant-TW"
    const langCode = locale.languageCode; // e.g. "zh"
    if (tag?.startsWith("zh-Hant")) return "zh-Hant";
    if (tag?.startsWith("zh-Hans")) return "zh-Hans";
    if (langCode === "zh") {
      // region-based heuristic: TW/HK/MO -> Hant, else Hans
      const region = locale.regionCode ?? "";
      return ["TW", "HK", "MO"].includes(region) ? "zh-Hant" : "zh-Hans";
    }
    if (langCode && (SUPPORTED_LANGUAGES as string[]).includes(langCode)) {
      return langCode as SupportedLanguage;
    }
  }
  return "en";
}

/** 指定言語（未サポート/読込失敗時は `en`）の i18n JSON を bundle から読み込む。 */
export async function loadI18nBundle(lang: SupportedLanguage): Promise<I18n> {
  try {
    return await loader.loadI18n(lang);
  } catch {
    if (lang === "en") throw new Error("loadI18nBundle: failed to load fallback 'en'");
    return loader.loadI18n("en");
  }
}

/** ドット区切りキー（例: `drill.title.2a`）でネストした i18n オブジェクトから値を解決する。 */
export function resolveI18nKey(i18n: I18n | null, key: string): string | undefined {
  if (!i18n) return undefined;
  const parts = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = i18n;
  for (const part of parts) {
    if (node == null || typeof node !== "object") return undefined;
    node = node[part];
  }
  return typeof node === "string" ? node : undefined;
}
