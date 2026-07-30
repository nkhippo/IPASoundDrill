/**
 * apps/mobile/app/(step)/3a.tsx
 *
 * `3a` 学習プロフィール（Issue #224 Phase 1、`docs/features/3a.md`）。
 * 目的カード選択後、毎セッション必ず通過。Accent カード 2 枚（GA/RP）+ CEFR 複数選択
 * （A1–B2 + All）を表示し、「はじめる」でセッションキューを組み立てて対象ドリルへ遷移する。
 *
 * MVP 簡略化: Web の「詳しい設定」相当（focus/reg/grp、csLevel/csType の折りたたみ
 * フィルタ）は Issue #224 非対象範囲外の詳細フィルタとして省略し、Accent + CEFR のみを
 * 実装する（採点ロジック自体には影響しない設定項目のため）。
 */
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { Accent, Cefr } from "@ipasounddrill/core";

import { useCoreData } from "../../src/data/CoreDataProvider";
import { useSettingsStore } from "../../src/store/settings";
import { useSessionStore } from "../../src/store/session";
import { buildSessionQueue } from "../../src/session/buildQueue";
import type { DrillId } from "../../src/session/types";

const CEFR_OPTIONS: Cefr[] = ["A1", "A2", "B1", "B2"];
const ACCENT_OPTIONS: Accent[] = ["ga", "rp"];

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ drillId: string }>();
  const drillId = (params.drillId as DrillId) ?? "2a";

  const { t, wordlist, connectedSpeech, weakForms } = useCoreData();
  const accent = useSettingsStore((s) => s.accent);
  const setAccent = useSettingsStore((s) => s.setAccent);
  const cefrLevels = useSettingsStore((s) => s.cefrLevels);
  const setCefrLevels = useSettingsStore((s) => s.setCefrLevels);
  const startSession = useSessionStore((s) => s.startSession);

  const [selectedCefr, setSelectedCefr] = useState<Cefr[]>(cefrLevels);

  const allSelected = selectedCefr.length === CEFR_OPTIONS.length;

  const toggleCefr = (level: Cefr) => {
    setSelectedCefr((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const toggleAll = () => {
    setSelectedCefr(allSelected ? [] : [...CEFR_OPTIONS]);
  };

  const poolSize = useMemo(() => {
    if (drillId === "2d") return connectedSpeech.length + weakForms.length;
    return wordlist.filter((w) => !!w.cefr && selectedCefr.includes(w.cefr)).length;
  }, [drillId, wordlist, connectedSpeech, weakForms, selectedCefr]);

  const handleStart = () => {
    setCefrLevels(selectedCefr);
    const queue = buildSessionQueue({
      drillId,
      wordlist,
      connectedSpeech,
      weakForms,
      cefrLevels: selectedCefr,
    });
    startSession(drillId, queue, accent);
    router.push(`/(step)/${drillId}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t("setup.show_filters") || "Profile"}</Text>

      <Text style={styles.sectionLabel}>{t("accent.label")}</Text>
      <View style={styles.accentRow}>
        {ACCENT_OPTIONS.map((a) => (
          <Pressable
            key={a}
            style={[styles.accentCard, accent === a && styles.accentCardSelected]}
            onPress={() => setAccent(a)}
          >
            <Text style={styles.accentCardTitle}>{t(`accent.${a}`)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>{t("lvl.label")}</Text>
      <View style={styles.pillRow}>
        <Pressable
          style={[styles.pill, allSelected && styles.pillSelected]}
          onPress={toggleAll}
        >
          <Text style={[styles.pillText, allSelected && styles.pillTextSelected]}>All</Text>
        </Pressable>
        {CEFR_OPTIONS.map((level) => {
          const selected = selectedCefr.includes(level);
          return (
            <Pressable
              key={level}
              style={[styles.pill, selected && styles.pillSelected]}
              onPress={() => toggleCefr(level)}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                {t(`lvl.${level.toLowerCase()}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.poolInfo}>
        {t("pool.count")} {poolSize}
      </Text>

      <Pressable
        style={[styles.startButton, poolSize === 0 && styles.startButtonDisabled]}
        onPress={handleStart}
        disabled={poolSize === 0}
      >
        <Text style={styles.startButtonText}>{t("start")}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  accentRow: {
    flexDirection: "row",
    gap: 12,
  },
  accentCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  accentCardSelected: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
  },
  accentCardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  poolInfo: {
    color: "#6b7280",
  },
  startButton: {
    backgroundColor: "#0d9488",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
