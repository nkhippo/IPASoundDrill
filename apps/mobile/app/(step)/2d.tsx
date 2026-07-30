/**
 * apps/mobile/app/(step)/2d.tsx
 *
 * `2d` 連結する音に慣れる（Connected Speech / Weak Forms）
 * （Issue #224 Phase 1/4、`docs/features/2d.md`）。
 * 連結句（linking/assimilation/elision）+ 弱形の Decode（綴り入力）。判定は
 * `packages/core/src/scoring/connectedSpeech.ts`（`checkConnectedSpeech`）/
 * `weakForms.ts`（`checkWeakForm`）— いずれも `decode.ts` の `checkSpelling` を流用。
 */
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { connectedSpeech, weakForms } from "@ipasounddrill/core";

import { WordCard } from "../../src/components/WordCard";
import { SwipeableCard } from "../../src/components/SwipeableCard";
import { AnswerButton, type CheckResult } from "../../src/components/AnswerButton";
import { PlaybackButton } from "../../src/components/PlaybackButton";
import { useCoreData } from "../../src/data/CoreDataProvider";
import { useSessionStore, currentSessionItem, isSessionComplete } from "../../src/store/session";

export default function ConnectedSpeechScreen() {
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

  if (!item || (item.kind !== "connected" && item.kind !== "weak")) {
    return (
      <View style={styles.container}>
        <Text>{t("loading")}</Text>
      </View>
    );
  }

  const entry = item.entry;
  const ipa = session.accent === "rp" ? entry.rp_ipa || entry.ipa : entry.ipa;
  const carrier =
    item.kind === "connected" ? connectedSpeech.pickCarrier(entry) : null;

  const check = (): CheckResult =>
    item.kind === "connected"
      ? connectedSpeech.checkConnectedSpeech(input, entry.w)
      : weakForms.checkWeakForm(input, entry.w);

  const handleResult = (result: CheckResult) => {
    session.setLastResult({ drillId: "2d", item, ok: result === "ok", userAnswer: input });
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
          secondaryText={carrier ?? undefined}
        >
          <PlaybackButton word={entry.w} accent={session.accent} />
        </WordCard>
      </SwipeableCard>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder={t("input_phrase")}
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
