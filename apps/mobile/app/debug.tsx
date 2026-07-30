/**
 * apps/mobile/app/debug.tsx
 *
 * Issue #223 の DebugScreen を internal-only ルートとして保持する（Issue #224 Phase 1、
 * `packages/core` consume + MMKV/Zustand の動作確認用、4-step の実画面には含まれない）。
 */
import { DebugScreen } from "../src/screens/DebugScreen";

export default function DebugRoute() {
  return <DebugScreen />;
}
