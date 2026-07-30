/**
 * apps/mobile/app/_layout.tsx
 *
 * Root layout（Issue #223 Phase 2）。GestureHandlerRootView でアプリ全体を wrap し、
 * Expo Router の Stack を root navigator として使う。
 * 4-step 逐次遷移の具体的な画面構成は #EPIC-07 で実装する（本 Issue はデグレ確認用の
 * DebugScreen のみ）。
 */
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
