/**
 * apps/mobile/app/(step)/3d.tsx
 *
 * `3d` 学習状況（Issue #224 Phase 1/4、`docs/features/3d.md`）。
 * ドリル別（`2a`/`2b`/`2c`/`2d`）の卒業率カードを表示する。卒業判定・母集団の絞り込みは
 * `packages/core/src/scoring/step3.ts` の `progressPoolForDrill` / `computeDrillProgress`
 * （Web と完全同一の純粋関数）を直接呼ぶ。`marks` は Mobile 側の簡略化マーキング
 * （`docs/agent-reports/` 実装レポート参照、`apps/mobile/src/store/progress.ts` 参照）。
 */
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { step3 } from "@ipasounddrill/core";
import type { Cefr } from "@ipasounddrill/core";

import { useCoreData } from "../../src/data/CoreDataProvider";
import { useProgressStore } from "../../src/store/progress";
import { useSettingsStore } from "../../src/store/settings";
import type { DrillId } from "../../src/session/types";

const CEFR_OPTIONS: Cefr[] = ["A1", "A2", "B1", "B2"];
const DRILLS: DrillId[] = ["2a", "2b", "2c", "2d"];

export default function LearningStatusScreen() {
  const router = useRouter();
  const { t, wordlist, connectedSpeech, weakForms } = useCoreData();
  const marks = useProgressStore((s) => s.marks);
  const cefrLevelsFromSettings = useSettingsStore((s) => s.cefrLevels);
  const [selectedCefr, setSelectedCefr] = useState<Cefr[]>(cefrLevelsFromSettings);

  const cefrSet = useMemo(() => new Set<string>(selectedCefr), [selectedCefr]);

  const toggleCefr = (level: Cefr) => {
    setSelectedCefr((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const results = useMemo(() => {
    const pools = { PRESET: wordlist, CONNECTED: connectedSpeech, WEAK: weakForms };
    return DRILLS.map((drillId) => {
      const pool = step3.progressPoolForDrill(drillId, pools, cefrSet);
      const progress = step3.computeDrillProgress(
        drillId,
        pool,
        marks,
        3,
        (item) => item.id ?? item.w
      );
      return { drillId, progress };
    });
  }, [wordlist, connectedSpeech, weakForms, cefrSet, marks]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>{t("progress.back")}</Text>
      </Pressable>
      <Text style={styles.title}>{t("progress.title")}</Text>

      <View style={styles.pillRow}>
        {CEFR_OPTIONS.map((level) => {
          const selected = selectedCefr.includes(level);
          return (
            <Pressable
              key={level}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => toggleCefr(level)}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{level}</Text>
            </Pressable>
          );
        })}
      </View>

      {results.map(({ drillId, progress }) => (
        <View key={drillId} style={styles.card}>
          <Text style={styles.cardTitle}>{t(`drill.title.${drillId}`)}</Text>
          <Text style={styles.cardPct}>{progress.pct}%</Text>
          <Text style={styles.cardSubtitle}>
            {progress.graduated} / {progress.total}
          </Text>
          <View style={styles.slots}>
            {progress.counts.map((count, mark) => (
              <Text key={mark} style={styles.slotText}>
                {mark}: {count}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  back: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pillSelected: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  pillText: {
    color: "#374151",
    fontWeight: "600",
  },
  pillTextSelected: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardPct: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0d9488",
  },
  cardSubtitle: {
    color: "#6b7280",
  },
  slots: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  slotText: {
    fontSize: 12,
    color: "#6b7280",
  },
});
