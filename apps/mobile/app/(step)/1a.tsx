/**
 * apps/mobile/app/(step)/1a.tsx
 *
 * `1a` トップページ（Issue #224 Phase 1、`docs/features/1a.md`）。
 * エントリーポイント。目的 4 カードで即開始できる。目的カードタップ →
 * `3a` 学習プロフィールへ遷移（`docs/features/_common.md` セッションフロー）。
 * Hero リンクから `3h`（このアプリについて）へ導線。
 */
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useCoreData } from "../../src/data/CoreDataProvider";
import type { DrillId } from "../../src/session/types";

const PURPOSE_CARDS: DrillId[] = ["2a", "2b", "2c", "2d"];

export default function TopScreen() {
  const router = useRouter();
  const { t, status } = useCoreData();

  const selectPurpose = (drillId: DrillId) => {
    router.push({ pathname: "/(step)/3a", params: { drillId } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.brand}>{t("brand.name")}</Text>
      <Text style={styles.tagline}>{t("top.tagline")}</Text>

      <View style={styles.heroLinks}>
        <Pressable onPress={() => router.push("/(step)/3h")}>
          <Text style={styles.heroLink}>{t("about.title")}</Text>
        </Pressable>
      </View>

      {status === "loading" && <Text style={styles.loading}>{t("loading")}</Text>}

      <View style={styles.cards}>
        {PURPOSE_CARDS.map((drillId) => (
          <Pressable
            key={drillId}
            style={styles.card}
            onPress={() => selectPurpose(drillId)}
            accessibilityRole="button"
          >
            <Text style={styles.cardTitle}>{t(`drill.title.${drillId}`)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footerLinks}>
        <Pressable onPress={() => router.push("/(step)/3b")}>
          <Text style={styles.footerLink}>{t("vocab.title")}</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(step)/3d")}>
          <Text style={styles.footerLink}>{t("progress.title")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 20,
    backgroundColor: "#fafaf9",
    flexGrow: 1,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  tagline: {
    fontSize: 16,
    color: "#57534e",
  },
  heroLinks: {
    flexDirection: "row",
    gap: 16,
  },
  heroLink: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  loading: {
    color: "#6b7280",
  },
  cards: {
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  footerLink: {
    color: "#4f46e5",
    fontWeight: "600",
  },
});
