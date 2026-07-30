/**
 * apps/mobile/app/(step)/2b.tsx
 *
 * `2b` 発音から書いてみる（Encode）（Issue #224 Phase 1/4、`docs/features/2b.md`）。
 * 単語を提示 → 学習者が IPA キーボードでタップ組み立て → Check で判定。
 * 判定は `packages/core/src/scoring/encode.ts` の `tokenize`/`checkEncode`
 * （Web と完全同一の純粋関数）を直接呼ぶ。
 */
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { encode } from "@ipasounddrill/core";
import type { WordlistEntry } from "@ipasounddrill/core";

import { WordCard } from "../../src/components/WordCard";
import { SwipeableCard } from "../../src/components/SwipeableCard";
import { AnswerButton, type CheckResult } from "../../src/components/AnswerButton";
import { PlaybackButton } from "../../src/components/PlaybackButton";
import { DOULOS_SIL_FONT_FAMILY } from "../../src/fonts/loadFonts";
import { useCoreData } from "../../src/data/CoreDataProvider";
import { useSessionStore, currentSessionItem, isSessionComplete } from "../../src/store/session";

export default function EncodeScreen() {
  const router = useRouter();
  const { t } = useCoreData();
  const session = useSessionStore();
  const [built, setBuilt] = useState<string[]>([]);

  const item = currentSessionItem(session);
  const complete = isSessionComplete(session);

  useEffect(() => {
    setBuilt([]);
  }, [session.index]);

  useEffect(() => {
    if (complete) {
      router.replace("/(step)/1a");
    }
  }, [complete, router]);

  const entry = item && item.kind === "word" ? (item.entry as WordlistEntry) : null;
  const targetIpa = entry ? (session.accent === "rp" ? entry.rp_ipa || entry.ipa : entry.ipa) : "";

  // キーボードは正解 IPA のトークン（強勢記号 `ˈ`/`ˌ` 含む）をシャッフルして提示する
  // （MVP 簡略化: Web の固定フルキーボードではなく正解トークンのみ。判定は
  // `tgt.join("") === userTokens.join("")` の完全一致のため、強勢記号もタップ対象に
  // 含めないと正しい判定ができない — 位置を勝手に補完しない）。
  const keyboardTokens = useMemo(() => {
    if (!targetIpa) return [];
    const tokens = encode.tokenize(targetIpa, session.accent);
    const shuffled = tokens.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [targetIpa, session.accent, session.index]);

  if (!item || item.kind !== "word" || !entry) {
    return (
      <View style={styles.container}>
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  const check = (): CheckResult => encode.checkEncode(targetIpa, built, session.accent);

  const handleResult = (result: CheckResult) => {
    session.setLastResult({
      drillId: "2b",
      item,
      ok: result === "ok",
      userAnswer: built.join(""),
      userTokens: built,
    });
    router.push("/(step)/reveal");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SwipeableCard
        onSwipeNext={session.index + 1 < session.queue.length ? session.advance : undefined}
        onSwipePrev={session.index > 0 ? session.goBack : undefined}
      >
        <WordCard
          accent={session.accent}
          qno={session.index + 1}
          total={session.queue.length}
          cefr={entry.cefr}
          primaryText={entry.w}
        >
          <PlaybackButton word={entry.w} accent={session.accent} />
        </WordCard>
      </SwipeableCard>

      <View style={styles.buildRow}>
        <Text style={styles.buildText}>{built.join("") || t("build_ph")}</Text>
        <Pressable onPress={() => setBuilt([])}>
          <Text style={styles.clear}>{t("clear")}</Text>
        </Pressable>
      </View>

      <View style={styles.keyboard}>
        {keyboardTokens.map((tk, i) => (
          <Pressable
            key={`${tk}-${i}`}
            style={styles.key}
            onPress={() => setBuilt((prev) => [...prev, tk])}
          >
            <Text style={styles.keyText}>{tk}</Text>
          </Pressable>
        ))}
      </View>

      <AnswerButton label={t("check")} onCheck={check} onResult={handleResult} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  buildRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  buildText: {
    fontFamily: DOULOS_SIL_FONT_FAMILY,
    fontSize: 20,
    color: "#111827",
  },
  clear: {
    color: "#dc2626",
    fontWeight: "600",
  },
  keyboard: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  key: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  keyText: {
    fontFamily: DOULOS_SIL_FONT_FAMILY,
    fontSize: 18,
  },
});
