/**
 * apps/mobile/src/hooks/useHaptic.ts
 *
 * `expo-haptics` の Selection/Success/Warning wrapper（Issue #224 Phase 3）。
 * 正解: `Haptics.NotificationFeedbackType.Success`
 * 不正解: `Haptics.NotificationFeedbackType.Warning`
 * スワイプ完了: `Haptics.selectionAsync()`
 *
 * Simulator では haptics が実際には発火しない場合がある（`docs/features/*.md` に
 * ハプティクス仕様の記載は無いため、本 Issue の決定事項「正解/不正解で haptic」に基づく
 * mobile 固有の実装）。実機での動作確認は Naoya に依頼する（Issue #224 本文「Simulator 動作確認」）。
 */
import * as Haptics from "expo-haptics";

export interface UseHapticResult {
  /** 正解時（Success notification）。 */
  success: () => void;
  /** 不正解時（Warning notification）。 */
  warning: () => void;
  /** スワイプ完了時（selection feedback）。 */
  selection: () => void;
}

export function useHaptic(): UseHapticResult {
  return {
    success: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
        // Simulator や haptics 非対応端末では無視する。
      });
    },
    warning: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {
        // Simulator や haptics 非対応端末では無視する。
      });
    },
    selection: () => {
      Haptics.selectionAsync().catch(() => {
        // Simulator や haptics 非対応端末では無視する。
      });
    },
  };
}
