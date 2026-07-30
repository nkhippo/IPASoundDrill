/**
 * apps/mobile/src/data/CoreDataProvider.tsx
 *
 * ランタイム契約 4 JSON（wordlist / connected_speech / weak_forms / guide）+ 現在言語の
 * i18n JSON を一度だけ読み込み、React Context 経由で全画面へ配布する（Issue #224 Phase 4/7）。
 * データソースは `createMobileBundleLoader()`（Issue #223 Phase 3、bundle 同梱 JSON）。
 * 言語切替は `useSettingsStore` の `language`（MMKV 永続化）を購読し、変化時に i18n を再読込する。
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  ConnectedSpeechData,
  GuideData,
  I18n,
  Wordlist,
  WeakFormsData,
} from "@ipasounddrill/core";

import { createMobileBundleLoader } from "../loaders/bundleLoader";
import { loadI18nBundle, resolveDeviceLanguage, resolveI18nKey } from "../i18n";
import { useSettingsStore } from "../store/settings";

const loader = createMobileBundleLoader();

export interface CoreData {
  wordlist: Wordlist;
  connectedSpeech: ConnectedSpeechData;
  weakForms: WeakFormsData;
  guide: GuideData;
  i18n: I18n | null;
  /** ドット区切りキー（例: `drill.title.2a`）を翻訳文字列に解決する。無ければキー自体を返す。 */
  t: (key: string) => string;
  status: "loading" | "ready" | "error";
  error: string | null;
}

const CoreDataContext = createContext<CoreData | null>(null);

export function CoreDataProvider({ children }: { children: ReactNode }) {
  const [wordlist, setWordlist] = useState<Wordlist>([]);
  const [connectedSpeech, setConnectedSpeech] = useState<ConnectedSpeechData>([]);
  const [weakForms, setWeakForms] = useState<WeakFormsData>([]);
  const [guide, setGuide] = useState<GuideData>({});
  const [i18n, setI18n] = useState<I18n | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const hasDetectedDeviceLanguage = useSettingsStore((state) => state.hasDetectedDeviceLanguage);
  const markDeviceLanguageDetected = useSettingsStore(
    (state) => state.markDeviceLanguageDetected
  );

  // 初回起動時のみ端末言語を検出して設定に反映する（以後はユーザー選択を尊重する）。
  useEffect(() => {
    if (!hasDetectedDeviceLanguage) {
      setLanguage(resolveDeviceLanguage());
      markDeviceLanguageDetected();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loader.loadWordlist(),
      loader.loadConnectedSpeech(),
      loader.loadWeakForms(),
      loader.loadGuide(),
      loadI18nBundle(language),
    ])
      .then(([wl, cs, wf, gd, i18nData]) => {
        if (cancelled) return;
        setWordlist(wl);
        setConnectedSpeech(cs);
        setWeakForms(wf);
        setGuide(gd);
        setI18n(i18nData);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const t = useMemo(() => {
    return (key: string) => resolveI18nKey(i18n, key) ?? key;
  }, [i18n]);

  const value = useMemo<CoreData>(
    () => ({ wordlist, connectedSpeech, weakForms, guide, i18n, t, status, error }),
    [wordlist, connectedSpeech, weakForms, guide, i18n, t, status, error]
  );

  return <CoreDataContext.Provider value={value}>{children}</CoreDataContext.Provider>;
}

export function useCoreData(): CoreData {
  const ctx = useContext(CoreDataContext);
  if (!ctx) {
    throw new Error("useCoreData must be used within a CoreDataProvider");
  }
  return ctx;
}
