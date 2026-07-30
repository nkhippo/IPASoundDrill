/**
 * apps/mobile/src/store/progress.ts
 *
 * 学習履歴 store の骨格（Issue #223 Phase 4）。schema のみを定義し、MMKV 永続化の
 * 配線までを行う。4-step 判定結果の実データ書き込み・読み出しロジックは #EPIC-07 で実装する。
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";
import type { Accent } from "@ipasounddrill/core";

const storage = new MMKV({ id: "ipasounddrill.progress" });

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

/** 1 単語 1 回のドリル結果（#EPIC-07 で実データを書き込む想定の schema）。 */
export interface DrillAttempt {
  wordId: string;
  accent: Accent;
  step: "decode" | "encode" | "step3" | "reveal" | "connectedSpeech" | "weakForms";
  correct: boolean;
  attemptedAt: number;
}

export interface ProgressState {
  attempts: DrillAttempt[];
  recordAttempt: (attempt: DrillAttempt) => void;
  clearAttempts: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      attempts: [],
      recordAttempt: (attempt) =>
        set((state) => ({ attempts: [...state.attempts, attempt] })),
      clearAttempts: () => set({ attempts: [] }),
    }),
    {
      name: "ipasounddrill.progress",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
