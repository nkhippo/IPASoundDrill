/**
 * apps/mobile/app/(step)/2c.tsx
 *
 * `2c` 音から単語を覚える（Study）（Issue #224 Phase 1、`docs/features/2c.md`）。
 * ループ: TTS 自動再生 → IPA のみ提示 → 「意味を確認する」→ 単語＋gloss（2 段階 reveal）。
 * 採点なし（`docs/features/2c.md` 「採点則・定数: Study は採点なし」）。
 * reveal 画面には遷移せず、本画面内で 2 段階を完結する。
 */
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { WordlistEntry } from "@ipasounddrill/core";

import { WordCard } from "../../src/components/WordCard";
import { SwipeableCard } from "../../src/components/SwipeableCard";
import { PlaybackButton } from "../../src/components/PlaybackButton";
import { useCoreData } from "../../src/data/CoreDataProvider";
import { useSessionStore, currentSessionItem, isSessionComplete } from "../../src/store/session";

export default function StudyScreen() {
  const router = useRouter();
  const { t } = useCoreData();
  const session = useSessionStore();
  const [revealed, setRevealed] = useState(false);

  const item = currentSessionItem(session);
  const complete = isSessionComplete(session);

  useEffect(() => {
    setRevealed(false);
  }, [session.index]);

  useEffect(() => {
    if (complete) {
      router.replace("/(step)/1a");
    }
  }, [complete, router]);

  if (!item || item.kind !== "word") {
    return (
      <View style={styles.container}>
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  const entry: WordlistEntry = item.entry;
  const ipa = session.accent === "rp" ? entry.rp_ipa || entry.ipa : entry.ipa;
  const gloss = entry.gloss?.en ?? entry.def ?? "";

  return (
    <View style={styles.container}>
      <SwipeableCard
        onSwipeNext={session.index + 1 < session.queue.length ? session.advance : undefined}
        onSwipePrev={session.index > 0 ? session.goBack : undefined}
      >
        <WordCard
          accent={session.accent}
          qno={session.index + 1}
          total={session.queue.length}
          cefr={entry.cefr}
          primaryText={ipa}
          primaryIsIpa
          secondaryText={revealed ? `${entry.w} — ${gloss}` : undefined}
        >
          <PlaybackButton word={entry.w} accent={session.accent} />
        </WordCard>
      </SwipeableCard>

      {!revealed ? (
        <Pressable style={styles.revealButton} onPress={() => setRevealed(true)}>
          <Text style={styles.revealButtonText}>{t("see_answer")}</Text>
        </Pressable>
      ) : (
        <Pressable
          style={styles.nextButton}
          onPress={() => (session.index + 1 < session.queue.length ? session.advance() : null)}
        >
          <Text style={styles.nextButtonText}>{t("next")}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
    justifyContent: "center",
  },
  revealButton: {
    backgroundColor: "#0d9488",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  revealButtonText: {
    color: "#fff",
    fontWeight: "700",
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
