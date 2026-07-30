/**
 * apps/mobile/src/loaders/bundleLoader.ts
 *
 * `@ipasounddrill/core` の `createBundleLoader` を Mobile 向けに実体化する（Issue #223 Phase 3）。
 * ランタイム契約 4 JSON + i18n（6 言語）は build 時に `scripts/copy-core-assets.js`
 * （Phase 5）で `packages/core/{data,i18n}` からコピーされた
 * `apps/mobile/assets/{data,i18n}/*.json` を Metro の静的 `require`/`import` で読み込む
 * （動的パスは Metro のバンドル解決上不可なため、既知の 4 JSON + 6 言語を静的 import する）。
 */
import { createBundleLoader, type BundleLoaderSource, type DataLoader } from "@ipasounddrill/core";

// eslint-disable-next-line @typescript-eslint/no-var-requires
import wordlist from "../../assets/data/wordlist.json";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import connectedSpeech from "../../assets/data/connected_speech.json";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import weakForms from "../../assets/data/weak_forms.json";
// eslint-disable-next-line @typescript-eslint/no-var-requires
import guide from "../../assets/data/guide.json";

import en from "../../assets/i18n/en.json";
import ja from "../../assets/i18n/ja.json";
import ko from "../../assets/i18n/ko.json";
import fil from "../../assets/i18n/fil.json";
import zhHans from "../../assets/i18n/zh-Hans.json";
import zhHant from "../../assets/i18n/zh-Hant.json";

const bundle: BundleLoaderSource = {
  wordlist: wordlist as unknown as BundleLoaderSource["wordlist"],
  connectedSpeech: connectedSpeech as unknown as BundleLoaderSource["connectedSpeech"],
  weakForms: weakForms as unknown as BundleLoaderSource["weakForms"],
  guide: guide as unknown as BundleLoaderSource["guide"],
  i18n: {
    en: en as unknown as BundleLoaderSource["i18n"][string],
    ja: ja as unknown as BundleLoaderSource["i18n"][string],
    ko: ko as unknown as BundleLoaderSource["i18n"][string],
    fil: fil as unknown as BundleLoaderSource["i18n"][string],
    "zh-Hans": zhHans as unknown as BundleLoaderSource["i18n"][string],
    "zh-Hant": zhHant as unknown as BundleLoaderSource["i18n"][string],
  },
};

/** Mobile 用 `DataLoader`（bundle 同梱の JSON をそのまま返す）。 */
export function createMobileBundleLoader(): DataLoader {
  return createBundleLoader(bundle);
}
