/**
 * apps/mobile/src/store/settings.ts
 *
 * ユーザ設定（accent 選択・言語・音量）の Zustand store。MMKV に永続化し、
 * アプリ再起動後も設定が復元されることを確認する（Issue #223 Phase 4 完了定義）。
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";
import type { Accent } from "@ipasounddrill/core";

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

export interface SettingsState {
  accent: Accent;
  language: SupportedLanguage;
  volume: number;
  setAccent: (accent: Accent) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setVolume: (volume: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      accent: "ga",
      language: "en",
      volume: 1,
      setAccent: (accent) => set({ accent }),
      setLanguage: (language) => set({ language }),
      setVolume: (volume) => set({ volume }),
    }),
    {
      name: "ipasounddrill.settings",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
