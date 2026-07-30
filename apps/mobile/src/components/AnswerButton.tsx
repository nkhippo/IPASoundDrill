/**
 * apps/mobile/src/components/AnswerButton.tsx
 *
 * tap で判定 + haptic（Issue #224 Phase 2/3/4）。`onCheck` が
 * `packages/core/src/scoring/*` の判定関数呼び出し結果（`"ok" | "bad"`）を返す想定。
 * 正解: `useHaptic().success()`、不正解: `useHaptic().warning()`。
 */
import { Pressable, StyleSheet, Text } from "react-native";

import { useHaptic } from "../hooks/useHaptic";

export type CheckResult = "ok" | "bad";

export interface AnswerButtonProps {
  label: string;
  onCheck: () => CheckResult;
  onResult: (result: CheckResult) => void;
  disabled?: boolean;
}

export function AnswerButton({ label, onCheck, onResult, disabled }: AnswerButtonProps) {
  const haptic = useHaptic();

  const handlePress = () => {
    const result = onCheck();
    if (result === "ok") {
      haptic.success();
    } else {
      haptic.warning();
    }
    onResult(result);
  };

  return (
    <Pressable
      accessibilityRole="button"
      style={[styles.button, disabled && styles.disabled]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0d9488",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
