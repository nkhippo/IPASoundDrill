/**
 * apps/mobile/app/(step)/3h.tsx
 *
 * `3h` このアプリについて（Issue #224 Phase 1、`docs/features/3h.md`）。
 * リード、「なぜ IPA を学ぶか」、特徴 5 項目、フィードバック導線で構成する。
 * Web はモーダル（`#aboutModal`）だが、Mobile は Expo Router の独立画面として実装する
 * （4-step group `(step)` 内の 1 画面、`docs/features/3h.md` の内容自体は不変）。
 * `*_html` キーは Web では HTML として適用されるが、Mobile では簡易的にプレーン
 * テキストとして表示する（RN には `dangerouslySetInnerHTML` が無いため。リッチテキスト
 * 表示の完全再現は follow-up、本文の意味内容は変わらない）。
 */
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";

import { useCoreData } from "../../src/data/CoreDataProvider";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export default function AboutScreen() {
  const router = useRouter();
  const { t } = useCoreData();

  const features = [1, 2, 3, 4, 5].map((n) => stripHtml(t(`about.features.item_${n}_html`)));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>×</Text>
      </Pressable>
      <Text style={styles.title}>{t("about.title")}</Text>
      <Text style={styles.lead}>{t("about.lead")}</Text>
      <Text style={styles.body}>{stripHtml(t("about.why_ipa_html"))}</Text>

      <Text style={styles.featuresTitle}>{t("about.features.title")}</Text>
      {features.map((f, i) => (
        <Text key={i} style={styles.featureItem}>
          • {f}
        </Text>
      ))}

      <Text style={styles.contact}>{stripHtml(t("about.contact_html"))}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  back: {
    fontSize: 20,
    color: "#6b7280",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  lead: {
    fontSize: 16,
    color: "#374151",
  },
  body: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: "#374151",
  },
  contact: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 16,
  },
});
