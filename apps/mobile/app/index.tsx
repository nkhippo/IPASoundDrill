/**
 * apps/mobile/app/index.tsx
 *
 * Root screen（Issue #223 Phase 2）。暫定的に DebugScreen をそのまま表示し、
 * `packages/core` consume（Phase 3）と MMKV/Zustand（Phase 4）の動作確認先とする。
 * 4-step の実画面遷移は #EPIC-07 で置き換える。
 */
import { DebugScreen } from "../src/screens/DebugScreen";

export default function IndexScreen() {
  return <DebugScreen />;
}
