/**
 * apps/mobile/src/store/settings.ts
 *
 * ユーザ設定（accent 選択・言語・音量・CEFR プリセット）の Zustand store。MMKV に永続化し、
 * アプリ再起動後も設定が復元されることを確認する（Issue #223 Phase 4 完了定義）。
 *
 * `cefrLevels`（Issue #224 Phase 4/7 追加）: `3a`（学習プロフィール）の CEFR 複数選択、
 * Web の `prev_settings_v1.cefrLevels` に相当（`docs/features/3a.md`）。
 * `hasDetectedDeviceLanguage`（Issue #224 Phase 7 追加）: 初回起動時のみ端末言語を検出して
 * `language` に反映するためのワンショットフラグ（`CoreDataProvider` から参照）。
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";
import type { Accent, Cefr } from "@ipasounddrill/core";

const storage = new MMKV({ id: "ipasounddrill.settings" });

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

export type SupportedLanguage = "en" | "ja" | "ko" | "fil" | "zh-Hans" | "zh-Hant";

/** `docs/features/3a.md` 既定値: 不在・空値時は A1+A2。 */
export const DEFAULT_CEFR_LEVELS: Cefr[] = ["A1", "A2"];

export interface SettingsState {
  accent: Accent;
  language: SupportedLanguage;
  volume: number;
  cefrLevels: Cefr[];
  hasDetectedDeviceLanguage: boolean;
  setAccent: (accent: Accent) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setVolume: (volume: number) => void;
  setCefrLevels: (levels: Cefr[]) => void;
  markDeviceLanguageDetected: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      accent: "ga",
      language: "en",
      volume: 1,
      cefrLevels: DEFAULT_CEFR_LEVELS,
      hasDetectedDeviceLanguage: false,
      setAccent: (accent) => set({ accent }),
      setLanguage: (language) => set({ language }),
      setVolume: (volume) => set({ volume }),
      setCefrLevels: (levels) => set({ cefrLevels: levels }),
      markDeviceLanguageDetected: () => set({ hasDetectedDeviceLanguage: true }),
    }),
    {
      name: "ipasounddrill.settings",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
