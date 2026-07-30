/**
 * apps/mobile/app.config.ts
 *
 * Expo app config for the IPA Sound Drill mobile app.
 * Config-only for Issue #225 (scope 変更: 実ビルドは非対象、EAS Build 用の
 * config + 仮アイコン/スプラッシュ整備のみ)。Icons/splash are placeholder SVG
 * assets (primary #4A90E2 / accent #F5A623, IPA "[aɪ]" + sound-wave motif);
 * Naoya が v1.1 で本番アイコンに差し替え予定（Issue #225 comment 参照）。
 * `runtimeVersion` は EAS Update ポリシーとして `appVersion` を採用（Naoya が
 * `eas build` を初回実行する際に `eas init` で `extra.eas.projectId` の設定が
 * 別途必要。詳細は tools/mobile/README.md）。
 */
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "IPA Sound Drill",
  slug: "ipa-sound-drill",
  scheme: "ipasounddrill",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icons/icon.svg",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["assets/**/*"],
  runtimeVersion: {
    policy: "appVersion",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "app.ipasounddrill.mobile",
  },
  android: {
    package: "app.ipasounddrill.mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/icons/adaptive-icon.svg",
      backgroundColor: "#4A90E2",
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
        image: "./assets/splash/splash.svg",
        resizeMode: "contain",
        backgroundColor: "#FFFFFF",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;
