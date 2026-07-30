/**
 * apps/mobile/src/store/progress.ts
 *
 * 学習履歴 store（Issue #223 Phase 4 で schema のみ定義、本 Issue #224 Phase 4 で
 * 実データの読み書きロジックを実装）。
 *
 * `marks` は `packages/core/src/scoring/step3.ts` の `computeDrillProgress` が期待する
 * `{drillId}:{itemKey}` 形式のマーキングオブジェクト（Web の `ept_marks_v1` に相当、
 * `docs/data-contract.md` §4）。値は 0–3（3 = 卒業）。
 *
 * mark 更新則（MVP 簡略化、Issue #224 実装レポートに明記）: Web 側の正確な増減アルゴリズムは
 * `packages/core` に判定ロジックとして抽出されておらず（`computeDrillProgress` は marks を
 * 消費するだけで生成しない）、UI 操作起点の手動マーキングも Web 独自仕様のため、本 Issue の
 * 非対象範囲「新学習機能（… SRS 等）」に配慮し、Mobile では素朴な自動マーキング
 * （正解 → +1 を 3 で clamp、不正解 → 0 にリセット）を実装する。
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";
import type { Accent } from "@ipasounddrill/core";

import type { DrillId } from "../session/types";

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

export const MARK_MAX = 3;

/** 1 単語 1 回のドリル結果。 */
export interface DrillAttempt {
  drillId: DrillId;
  itemKey: string;
  accent: Accent;
  correct: boolean;
  attemptedAt: number;
}

export interface ProgressState {
  attempts: DrillAttempt[];
  /** `{drillId}:{itemKey}` -> 0..3（`computeDrillProgress` の `marks` 引数と同一形式）。 */
  marks: Record<string, number>;
  recordAttempt: (attempt: DrillAttempt) => void;
  clearAttempts: () => void;
}

function markKey(drillId: DrillId, itemKey: string): string {
  return `${drillId}:${itemKey}`;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      attempts: [],
      marks: {},
      recordAttempt: (attempt) =>
        set((state) => {
          const key = markKey(attempt.drillId, attempt.itemKey);
          const prevMark = state.marks[key] ?? 0;
          const nextMark = attempt.correct ? Math.min(MARK_MAX, prevMark + 1) : 0;
          return {
            attempts: [...state.attempts, attempt],
            marks: { ...state.marks, [key]: nextMark },
          };
        }),
      clearAttempts: () => set({ attempts: [], marks: {} }),
    }),
    {
      name: "ipasounddrill.progress",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
