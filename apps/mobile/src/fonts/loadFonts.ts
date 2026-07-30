/**
 * apps/mobile/src/fonts/loadFonts.ts
 *
 * `expo-font` で DoulosSIL-Regular（IPA 表示用フォント）を読み込む（Issue #224 Phase 6）。
 * ソースは `packages/core/fonts/DoulosSIL-Regular.woff2`（WOFF2）。RN の native text
 * renderer は WOFF2 を読み込めないため、`apps/mobile/scripts/copy-core-assets.js`
 * （Issue #224 Phase 6 で更新）が build 時に `wawoff2` で TTF へ変換し
 * `apps/mobile/assets/fonts/DoulosSIL-Regular.ttf` として配置したものを
 * `useFonts` で読み込む（Web の `--font-ipa` トークンに相当、`docs/design/phase-1/visual-tokens.md`）。
 *
 * 全 IPA 表示（WordCard 等）は `fontFamily: DOULOS_SIL_FONT_FAMILY` を指定して使用する。
 */
import { useFonts } from "expo-font";

/** WordCard 等で IPA テキストに指定するフォントファミリー名。 */
export const DOULOS_SIL_FONT_FAMILY = "DoulosSIL-Regular";

/**
 * DoulosSIL フォントを読み込む。`[loaded, error]` を返す
 * （App 初期化時にこのフックの結果を見てスプラッシュを維持する）。
 */
export function useLoadFonts(): [boolean, Error | null] {
  const [loaded, error] = useFonts({
    [DOULOS_SIL_FONT_FAMILY]: require("../../assets/fonts/DoulosSIL-Regular.ttf"),
  });
  return [loaded, error ?? null];
}
