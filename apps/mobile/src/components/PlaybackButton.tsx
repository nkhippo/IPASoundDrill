/**
 * apps/mobile/src/components/PlaybackButton.tsx
 *
 * TTS 再生ボタン（Issue #224 Phase 2/5）。`createHybridTTS`（#EPIC-05, Issue #222）を
 * `apps/mobile/src/loaders/bundleTTS.ts` 経由で使用する: bundle 同梱 mp3 があれば即再生、
 * 無ければ GAS TTS プロキシへ fetch（Wi-Fi 前提）。
 *
 * ネット無 + bundle 無の場合: 「オフラインでは再生できません」トースト表示
 * （Issue #224 Phase 5「完了定義」）。オフライン判定は `expo-network` の
 * `getNetworkStateAsync().isInternetReachable` で行う（bundle 同梱が無い場合のみ確認、
 * bundle 同梱があれば常にオフラインでも再生可能）。
 */
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer } from "expo-audio";
import * as Network from "expo-network";
import type { Accent } from "@ipasounddrill/core";

import { createMobileBundleTTS, hasBundledAudio } from "../loaders/bundleTTS";
import { useCoreData } from "../data/CoreDataProvider";
import { useSettingsStore } from "../store/settings";

const ttsSource = createMobileBundleTTS();

/**
 * `packages/core/i18n/*.json` にはオフライン再生失敗メッセージのキーが存在しない
 * （Web は常時オンライン fetch 前提のため未定義。core は Read-only consume のため
 * 新規キー追加はしない）。Mobile 固有の文言としてここで直接管理する。
 */
const OFFLINE_MESSAGE: Record<string, string> = {
  en: "Cannot play audio offline.",
  ja: "オフラインでは再生できません。",
  ko: "오프라인에서는 재생할 수 없습니다.",
  fil: "Hindi maaaring i-play ang audio offline.",
  "zh-Hans": "离线状态下无法播放。",
  "zh-Hant": "離線狀態下無法播放。",
};

export interface PlaybackButtonProps {
  word: string;
  accent: Accent;
}

export function PlaybackButton({ word, accent }: PlaybackButtonProps) {
  const player = useAudioPlayer();
  const { t } = useCoreData();
  const language = useSettingsStore((s) => s.language);
  const [state, setState] = useState<"idle" | "loading" | "offline">("idle");

  const play = useCallback(async () => {
    if (!hasBundledAudio(word, accent)) {
      const network = await Network.getNetworkStateAsync();
      if (!network.isInternetReachable) {
        setState("offline");
        return;
      }
    }
    setState("loading");
    try {
      const uri = await ttsSource.getMp3Url(word, accent);
      player.replace({ uri });
      player.play();
      setState("idle");
    } catch {
      setState("offline");
    }
  }, [word, accent, player]);

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("listen")}
        style={styles.button}
        onPress={play}
      >
        {state === "loading" ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.icon}>🔊</Text>
        )}
      </Pressable>
      {state === "offline" && (
        <Text style={styles.toast}>{OFFLINE_MESSAGE[language] ?? OFFLINE_MESSAGE.en}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: 4,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
  },
  toast: {
    fontSize: 11,
    color: "#dc2626",
    maxWidth: 140,
    textAlign: "center",
  },
});
