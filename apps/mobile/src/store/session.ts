/**
 * apps/mobile/src/store/session.ts
 *
 * 4-step ドリルの実行時セッション状態（Issue #224 Phase 1/4）。MMKV には永続化しない
 * （アプリ再起動でセッションは失われる想定、Web の SPA セッション相当）。
 * 各ドリル画面（`app/(step)/2a.tsx` 等）がキューと現在位置を読み書きし、
 * `reveal.tsx` が直近の判定結果を読む。
 */
import { create } from "zustand";
import type { Accent } from "@ipasounddrill/core";

import type { DrillId, SessionItem } from "../session/types";

export interface LastResult {
  drillId: DrillId;
  item: SessionItem;
  ok: boolean;
  userAnswer: string;
  /** Encode（`2b`）のみ: ユーザーが組み立てた IPA トークン列（reveal の色分け用）。 */
  userTokens?: string[];
}

export interface SessionState {
  drillId: DrillId | null;
  accent: Accent;
  queue: SessionItem[];
  index: number;
  lastResult: LastResult | null;
  startSession: (drillId: DrillId, queue: SessionItem[], accent: Accent) => void;
  advance: () => void;
  goBack: () => void;
  setLastResult: (result: LastResult) => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  drillId: null,
  accent: "ga",
  queue: [],
  index: 0,
  lastResult: null,
  startSession: (drillId, queue, accent) => set({ drillId, queue, index: 0, accent, lastResult: null }),
  advance: () => {
    const { index, queue } = get();
    set({ index: Math.min(index + 1, queue.length) });
  },
  goBack: () => {
    const { index } = get();
    set({ index: Math.max(index - 1, 0) });
  },
  setLastResult: (result) => set({ lastResult: result }),
  endSession: () => set({ drillId: null, queue: [], index: 0, lastResult: null }),
}));

/** 現在のキュー内アイテム（未取得/終端なら `null`）。 */
export function currentSessionItem(state: SessionState): SessionItem | null {
  return state.queue[state.index] ?? null;
}

/** プール全問消化かどうか（`docs/features/_common.md` 「終了: プール全問消化で自動サマリー」）。 */
export function isSessionComplete(state: SessionState): boolean {
  return state.queue.length > 0 && state.index >= state.queue.length;
}
