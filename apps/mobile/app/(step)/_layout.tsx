/**
 * apps/mobile/app/(step)/_layout.tsx
 *
 * 4-step 逐次遷移の group layout（Issue #224 Phase 1）。Expo Router group `(step)` に
 * することで、将来 tab bar 化やカスタム navigation へ切り替え可能な構造にする
 * （Issue #224 本文「1. 決定事項」）。ヘッダーは非表示（各画面内で独自ヘッダー行を描画）。
 */
import { Stack } from "expo-router";

export default function StepLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
