/**
 * apps/mobile/app/_layout.tsx
 *
 * Root layout（Issue #223 Phase 2、Issue #224 Phase 4/6/7 でフォント読込 + CoreDataProvider
 * を配線）。GestureHandlerRootView でアプリ全体を wrap し、Expo Router の Stack を
 * root navigator として使う。フォント（DoulosSIL、Phase 6）読込完了までは
 * SplashScreen を維持する。
 */
import { useCallback, useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

import { useLoadFonts } from "../src/fonts/loadFonts";
import { CoreDataProvider } from "../src/data/CoreDataProvider";

SplashScreen.preventAutoHideAsync().catch(() => {
  // 既に hide 済み等は無視する。
});

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useLoadFonts();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontsError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontsError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <CoreDataProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </CoreDataProvider>
    </GestureHandlerRootView>
  );
}
