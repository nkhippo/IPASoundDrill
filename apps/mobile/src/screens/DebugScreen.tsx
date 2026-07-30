/**
 * apps/mobile/src/screens/DebugScreen.tsx
 *
 * `packages/core` consume の動作確認用デバッグ画面（Issue #223 Phase 3/6）。
 * - `createMobileBundleLoader()` で wordlist を読み込み、先頭 1 語を表示。
 * - `createMobileBundleTTS()` で同じ単語の mp3 URL/URI を解決し、`expo-audio` で再生する
 *   （bundle 同梱が無ければ GAS TTS フォールバック、Phase 3 参照）。
 * - MMKV + Zustand の settings store（Phase 4）の永続化動作もあわせて確認する。
 */
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer } from "expo-audio";
import type { WordlistEntry } from "@ipasounddrill/core";

import { createMobileBundleLoader } from "../loaders/bundleLoader";
import { createMobileBundleTTS } from "../loaders/bundleTTS";
import { useSettingsStore } from "../store/settings";

const loader = createMobileBundleLoader();
const ttsSource = createMobileBundleTTS();

export function DebugScreen() {
  const [word, setWord] = useState<WordlistEntry | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const accent = useSettingsStore((state) => state.accent);
  const setAccent = useSettingsStore((state) => state.setAccent);

  const player = useAudioPlayer();

  useEffect(() => {
    let cancelled = false;
    loader
      .loadWordlist()
      .then((wordlist) => {
        if (cancelled) return;
        setWord(wordlist[0] ?? null);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : String(err));
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const playSample = useCallback(async () => {
    if (!word) return;
    try {
      const uri = await ttsSource.getMp3Url(word.w, accent);
      player.replace({ uri });
      player.play();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }, [word, accent, player]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IPA Sound Drill — Debug</Text>

      {status === "loading" && <ActivityIndicator />}
      {status === "error" && <Text style={styles.error}>Error: {errorMessage}</Text>}

      {word && (
        <View style={styles.card}>
          <Text style={styles.word}>{word.w}</Text>
          <Text style={styles.ipa}>{word.ipa}</Text>
          <Pressable style={styles.button} onPress={playSample}>
            <Text style={styles.buttonText}>Play ({accent.toUpperCase()})</Text>
          </Pressable>
          <Pressable
            style={styles.buttonSecondary}
            onPress={() => setAccent(accent === "ga" ? "rp" : "ga")}
          >
            <Text style={styles.buttonTextSecondary}>Switch accent</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  card: {
    alignItems: "center",
    gap: 12,
  },
  word: {
    fontSize: 32,
    fontWeight: "700",
  },
  ipa: {
    fontSize: 20,
    color: "#4f46e5",
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#111",
    fontWeight: "600",
  },
  error: {
    color: "#dc2626",
  },
});
