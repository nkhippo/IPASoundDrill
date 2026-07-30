/**
 * apps/mobile/app/index.tsx
 *
 * Root screen（Issue #223 Phase 2、Issue #224 Phase 1 で 4-step 骨格へ置き換え）。
 * ホーム → `(step)/1a`（トップページ、目的 4 カード）へ即 redirect する
 * （`docs/features/1a.md` 「エントリーポイント」）。旧 DebugScreen は `app/debug.tsx`
 * （internal-only、`packages/core` consume 動作確認用）に残す。
 */
import { Redirect } from "expo-router";

export default function IndexScreen() {
  return <Redirect href="/(step)/1a" />;
}
