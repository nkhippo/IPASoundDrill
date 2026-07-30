/**
 * apps/mobile/app/(step)/reveal.tsx
 *
 * `reveal` 解答画面（Issue #224 Phase 1/4、`docs/features/reveal.md`）。
 * OK/bad の 2 値バッジ、正解 IPA（GA/RP）、gloss、自分の解答、TTS を表示する。
 * Encode（`2b`）時は `packages/core/src/scoring/reveal.ts` の `buildEncodeTokenMarks`
 * （LCS 色分け、判定自体は 2 値のまま）を使う。
 *
 * 判定結果を `useProgressStore().recordAttempt` に 1 回だけ記録し（`docs/features/_common.md`
 * のマーキング相当、Issue #224 Phase 4）、Next で次の出題へ進む。
 */
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { encode, reveal as revealScoring } from "@ipasounddrill/core";
import type { WordlistEntry } from "@ipasounddrill/core";

import { PlaybackButton } from "../../src/components/PlaybackButton";
import { DOULOS_SIL_FONT_FAMILY } from "../../src/fonts/loadFonts";
import { useCoreData } from "../../src/data/CoreDataProvider";
import { useSessionStore } from "../../src/store/session";
import { useProgressStore } from "../../src/store/progress";
import { sessionItemKey } from "../../src/session/types";

export default function RevealScreen() {
  const router = useRouter();
  const { t } = useCoreData();
  const lastResult = useSessionStore((s) => s.lastResult);
  const accent = useSessionStore((s) => s.accent);
  const advance = useSessionStore((s) => s.advance);
  const drillId = useSessionStore((s) => s.drillId);
  const recordAttempt = useProgressStore((s) => s.recordAttempt);
  const recordedForRef = useRef<typeof lastResult>(null);

  useEffect(() => {
    if (!lastResult || recordedForRef.current === lastResult) return;
    recordedForRef.current = lastResult;
    recordAttempt({
      drillId: lastResult.drillId,
      itemKey: sessionItemKey(lastResult.item),
      accent,
      correct: lastResult.ok,
      attemptedAt: Date.now(),
    });
  }, [lastResult, accent, recordAttempt]);

  if (!lastResult) {
    router.replace("/(step)/1a");
    return null;
  }

  const { item, ok, userAnswer, userTokens } = lastResult;
  const entry = item.entry;
  const ga = entry.ipa;
  const rp = entry.rp_ipa || entry.ipa;
  const targetIpa = accent === "rp" ? rp : ga;
  const gloss =
    item.kind === "word" ? (entry as WordlistEntry).gloss?.en ?? (entry as WordlistEntry).def : undefined;

  const tokenMarks =
    lastResult.drillId === "2b" && userTokens
      ? revealScoring.buildEncodeTokenMarks(targetIpa, userTokens, accent)
      : null;
  const targetTokensForMarks = tokenMarks ? encode.tokenize(targetIpa, accent) : null;

  const handleNext = () => {
    advance();
    if (drillId) {
      router.replace(`/(step)/${drillId}`);
    } else {
      router.replace("/(step)/1a");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.badge, ok ? styles.badgeOk : styles.badgeBad]}>
        <Text style={styles.badgeText}>{ok ? t("reveal.correct") : t("reveal.incorrect")}</Text>
      </View>

      <Text style={styles.tryLabel}>{t("you")}</Text>
      <Text style={styles.tryText}>{userAnswer || "—"}</Text>

      <Text style={styles.word}>{entry.w}</Text>
      {!!gloss && <Text style={styles.gloss}>{gloss}</Text>}

      {tokenMarks && (
        <View style={styles.tokenRow}>
          {tokenMarks.map((mark, i) => (
            <Text
              key={i}
              style={[
                styles.tokenText,
                mark === "tok-ok" && styles.tokenOk,
                mark === "tok-bad" && styles.tokenBad,
              ]}
            >
              {targetTokensForMarks?.[i] ?? ""}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.pronCard}>
        <View style={styles.pronRow}>
          <Text style={styles.pronLabel}>GA</Text>
          <Text style={styles.pronIpa}>{ga}</Text>
          <PlaybackButton word={entry.w} accent="ga" />
        </View>
        <View style={styles.pronRow}>
          <Text style={styles.pronLabel}>RP</Text>
          <Text style={styles.pronIpa}>{rp}</Text>
          <PlaybackButton word={entry.w} accent="rp" />
        </View>
      </View>

      <Pressable style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>{t("next")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  badgeOk: {
    backgroundColor: "#dcfce7",
  },
  badgeBad: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontWeight: "700",
  },
  tryLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  tryText: {
    fontSize: 16,
    color: "#111827",
  },
  word: {
    fontSize: 24,
    fontWeight: "700",
  },
  gloss: {
    fontSize: 15,
    color: "#6b7280",
  },
  tokenRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  tokenText: {
    fontFamily: DOULOS_SIL_FONT_FAMILY,
    fontSize: 20,
  },
  tokenOk: {
    color: "#16a34a",
  },
  tokenBad: {
    color: "#dc2626",
  },
  pronCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  pronRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pronLabel: {
    fontWeight: "700",
    width: 30,
  },
  pronIpa: {
    fontFamily: DOULOS_SIL_FONT_FAMILY,
    fontSize: 18,
    flex: 1,
  },
  nextButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
