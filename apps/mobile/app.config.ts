/**
 * apps/mobile/app.config.ts
 *
 * Expo app config for the IPA Sound Drill mobile app (Issue #223 Phase 1).
 * Icons/splash are placeholder assets for this scaffold-only Issue; final
 * brand assets are tracked as a follow-up (out of scope for #223).
 */
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "IPA Sound Drill",
  slug: "ipa-sound-drill",
  scheme: "ipasounddrill",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icons/icon.png",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["assets/**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.ipasounddrill.mobile",
  },
  android: {
    package: "app.ipasounddrill.mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/icons/adaptive-icon.png",
      backgroundColor: "#4f46e5",
    },
  },
  web: {
    favicon: "./assets/icons/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-localization",
    [
      "expo-splash-screen",
      {
        image: "./assets/icons/splash-icon.png",
        resizeMode: "contain",
        backgroundColor: "#4f46e5",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
