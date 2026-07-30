/**
 * apps/mobile/app/(step)/3b.tsx
 *
 * `3b` 語彙ブラウザ（Issue #224 Phase 1、`docs/features/3b.md`）。
 * MVP 簡略化（実装レポートに明記）: Web の仮想化リスト・A–Z ジャンプ・IPA 複合検索
 * （`.vocab-ipa-filter`）は本 Issue の非対象範囲「新学習機能」ではなく既存機能だが、
 * 4-step 判定ロジック（Issue #224 本文「最重要」）と 8 Phase の実装ボリュームを踏まえ、
 * MVP では `FlatList` によるシンプルな一覧表示（CEFR バッジ + GA/RP IPA + gloss）のみを
 * 実装する。仮想化 windowing・IPA フィルタ UI の完全再現は follow-up。
 */
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { WordlistEntry } from "@ipasounddrill/core";

import { DOULOS_SIL_FONT_FAMILY } from "../../src/fonts/loadFonts";
import { useCoreData } from "../../src/data/CoreDataProvider";

export default function VocabScreen() {
  const router = useRouter();
  const { t, wordlist } = useCoreData();

  const renderItem = ({ item }: { item: WordlistEntry }) => (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.word}>{item.w}</Text>
        {!!item.cefr && (
          <View style={styles.cefrBadge}>
            <Text style={styles.cefrBadgeText}>{item.cefr}</Text>
          </View>
        )}
      </View>
      <Text style={styles.ipa}>
        GA {item.ipa}
        {item.rp_ipa ? `  RP ${item.rp_ipa}` : ""}
      </Text>
      {!!(item.gloss?.en ?? item.def) && (
        <Text style={styles.gloss}>{item.gloss?.en ?? item.def}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>{t("vocab.back")}</Text>
      </Pressable>
      <Text style={styles.title}>{t("vocab.title")}</Text>
      <Text style={styles.count}>{wordlist.length}</Text>
      <FlatList
        data={wordlist}
        keyExtractor={(item, i) => item.id ?? `${item.w}-${i}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 8,
  },
  back: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  count: {
    color: "#6b7280",
  },
  listContent: {
    gap: 8,
    paddingBottom: 40,
  },
  row: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  word: {
    fontSize: 16,
    fontWeight: "700",
  },
  cefrBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  cefrBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
  },
  ipa: {
    fontFamily: DOULOS_SIL_FONT_FAMILY,
    fontSize: 15,
    color: "#4f46e5",
  },
  gloss: {
    fontSize: 13,
    color: "#6b7280",
  },
});
