/**
 * apps/mobile/app/(step)/3c.tsx
 *
 * `3c` IPA 記号ピッカー（Issue #224 Phase 1、`docs/features/3c.md`）。
 * MVP 簡略化（実装レポートに明記）: Web の音声学的分類パレット（`symbolChartGroups`）は
 * `packages/core` 契約外の UI 専用データのため、wordlist から実際に出現する IPA 記号を
 * 抽出して一覧化する簡易版とする。記号タップで `wordlist` を部分一致フィルタする
 * （`docs/features/3c.md` 「Live 検索: 単純 includes 全走査」と同等のロジック）。
 */
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { DOULOS_SIL_FONT_FAMILY } from "../../src/fonts/loadFonts";
import { useCoreData } from "../../src/data/CoreDataProvider";

export default function SymbolPickerScreen() {
  const router = useRouter();
  const { t, wordlist } = useCoreData();
  const [query, setQuery] = useState<string[]>([]);

  const symbols = useMemo(() => {
    const set = new Set<string>();
    for (const entry of wordlist) {
      for (const ch of entry.ipa.replace(/[/ˈˌ]/g, "")) {
        set.add(ch);
      }
    }
    return Array.from(set).sort();
  }, [wordlist]);

  const toggleSymbol = (sym: string) => {
    setQuery((prev) => (prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]));
  };

  const results = useMemo(() => {
    if (query.length === 0) return [];
    return wordlist.filter((entry) => query.every((sym) => entry.ipa.indexOf(sym) !== -1));
  }, [wordlist, query]);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>{t("vocab.back")}</Text>
      </Pressable>
      <Text style={styles.title}>{t("symbol.picker.title")}</Text>

      <ScrollView horizontal contentContainerStyle={styles.chartRow}>
        {symbols.map((sym) => {
          const selected = query.includes(sym);
          return (
            <Pressable
              key={sym}
              style={[styles.symbolKey, selected && styles.symbolKeySelected]}
              onPress={() => toggleSymbol(sym)}
            >
              <Text style={styles.symbolText}>{sym}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={results}
        keyExtractor={(item, i) => item.id ?? `${item.w}-${i}`}
        renderItem={({ item }) => (
          <View style={styles.resultRow}>
            <Text style={styles.resultWord}>{item.w}</Text>
            <Text style={styles.resultIpa}>{item.ipa}</Text>
          </View>
        )}
        ListEmptyComponent={
          query.length > 0 ? <Text style={styles.empty}>{t("symbol.picker.empty")}</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  back: {
    color: "#4f46e5",
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  chartRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  symbolKey: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  symbolKeySelected: {
    backgroundColor: "#4f46e5",
    borderColor: "#4f46e5",
  },
  symbolText: {
    fontFamily: DOULOS_SIL_FONT_FAMILY,
    fontSize: 16,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  resultWord: {
    fontWeight: "600",
  },
  resultIpa: {
    fontFamily: DOULOS_SIL_FONT_FAMILY,
    color: "#4f46e5",
  },
  empty: {
    color: "#6b7280",
    marginTop: 16,
  },
});
