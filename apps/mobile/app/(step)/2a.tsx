/**
 * apps/mobile/app/(step)/2a.tsx
 *
 * `2a` 音の発音を確かめる（Decode）（Issue #224 Phase 1/4、`docs/features/2a.md`）。
 * IPA を提示 → 学習者が綴りを入力 → Check で判定。
 * 判定は `packages/core/src/scoring/decode.ts` の `checkSpelling`（Web と完全同一の
 * 純粋関数）を直接呼ぶ（inline JS 再実装禁止、Issue #224 本文「最重要」）。
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { decode } from "@ipasounddrill/core";
import type { WordlistEntry } from "@ipasounddrill/core";

import { WordCard } from "../../src/components/WordCard";
import { SwipeableCard } from "../../src/components/SwipeableCard";
import { AnswerButton, type CheckResult } from "../../src/components/AnswerButton";
import { PlaybackButton } from "../../src/components/PlaybackButton";
import { useCoreData } from "../../src/data/CoreDataProvider";
import { useSessionStore, currentSessionItem, isSessionComplete } from "../../src/store/session";
import { sessionItemKey } from "../../src/session/types";

export default function DecodeScreen() {
  const router = useRouter();
  const { t } = useCoreData();
  const session = useSessionStore();
  const [input, setInput] = useState("");

  const item = currentSessionItem(session);
  const complete = isSessionComplete(session);

  useEffect(() => {
    setInput("");
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

  const check = (): CheckResult => decode.checkSpelling(input, entry.w);

  const handleResult = (result: CheckResult) => {
    session.setLastResult({ drillId: "2a", item, ok: result === "ok", userAnswer: input });
    router.push("/(step)/reveal");
  };

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
        >
          <PlaybackButton word={entry.w} accent={session.accent} />
        </WordCard>
      </SwipeableCard>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder={t("input_ph")}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <AnswerButton label={t("check")} onCheck={check} onResult={handleResult} />
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
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
