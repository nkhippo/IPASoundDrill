/**
 * apps/mobile/src/components/SwipeableCard.tsx
 *
 * `react-native-gesture-handler` による左右スワイプで前/次の単語へ切り替える wrapper
 * （Issue #224 Phase 2/3）。スワイプ完了で `useHaptic().selection()` を発火する。
 *
 * `react-native-reanimated` は依存に含まれていないため（ホワイトリスト外の追加になる）、
 * `Gesture.Pan().runOnJS(true)` で通常の JS コールバックとして扱い、アニメーションは
 * React Native 標準の `Animated` API（`useNativeDriver: true`）で行う。
 */
import { useRef } from "react";
import { Animated } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { ReactNode } from "react";

import { useHaptic } from "../hooks/useHaptic";

const SWIPE_THRESHOLD = 80;
const SWIPE_OUT_DISTANCE = 500;

export interface SwipeableCardProps {
  children: ReactNode;
  /** 左スワイプ（次へ）。`undefined` ならスワイプで反応しない（末尾等）。 */
  onSwipeNext?: () => void;
  /** 右スワイプ（前へ）。`undefined` なら反応しない（先頭等）。 */
  onSwipePrev?: () => void;
}

export function SwipeableCard({ children, onSwipeNext, onSwipePrev }: SwipeableCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const haptic = useHaptic();

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((event) => {
      translateX.setValue(event.translationX);
    })
    .onEnd((event) => {
      if (event.translationX <= -SWIPE_THRESHOLD && onSwipeNext) {
        haptic.selection();
        Animated.timing(translateX, {
          toValue: -SWIPE_OUT_DISTANCE,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          translateX.setValue(0);
          onSwipeNext();
        });
        return;
      }
      if (event.translationX >= SWIPE_THRESHOLD && onSwipePrev) {
        haptic.selection();
        Animated.timing(translateX, {
          toValue: SWIPE_OUT_DISTANCE,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          translateX.setValue(0);
          onSwipePrev();
        });
        return;
      }
      resetPosition();
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={{ transform: [{ translateX }] }}>{children}</Animated.View>
    </GestureDetector>
  );
}
