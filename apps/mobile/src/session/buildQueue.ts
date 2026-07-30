/**
 * apps/mobile/src/session/buildQueue.ts
 *
 * ドリル種別 + CEFR 選択からセッションキュー（プール全件、重複なし）を組み立てる。
 *
 * MVP の簡略化（Issue #224 実装レポートに明記）: Web の適応出題（`docs/features/_common.md`
 * 「適応出題（プール全件・重複なし）」= localStorage 履歴 + マーキング重みに基づく軽量 SRS
 * ）は、Issue #224 非対象範囲「新学習機能（録音・発音判定・SRS 等）」に該当するため実装しない。
 * 本 Issue は「プール全件・重複なし」を Fisher-Yates シャッフルで満たし、判定ロジック自体
 * （`packages/core/src/scoring/*`）の Web との完全同等性を優先する。
 */
import type { ConnectedSpeechData, WeakFormsData, Wordlist } from "@ipasounddrill/core";

import type { DrillId, SessionItem } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function cefrMatches(cefr: string | null | undefined, selected: ReadonlySet<string>): boolean {
  return !!cefr && selected.has(cefr);
}

export interface BuildQueueInput {
  drillId: DrillId;
  wordlist: Wordlist;
  connectedSpeech: ConnectedSpeechData;
  weakForms: WeakFormsData;
  cefrLevels: string[];
}

/**
 * ドリル種別に応じた母集団を組み立てる。
 * `2a`/`2b`/`2c`: wordlist（`letter`/`contraction` src の除外は `2c` Study のみ、`docs/features/2c.md`）。
 * `2d`: connected_speech + weak_forms（CEFR はタグ表示のみだが、MVP では出題プール自体は
 * CEFR フィルタを適用しない — `docs/features/2d.md` 「CEFR は word-level タグ表示のみ。
 * UI フィルタは Type / Level の 2 軸のみ」と一致させるため、2d は cefrLevels を無視する）。
 */
export function buildSessionQueue(input: BuildQueueInput): SessionItem[] {
  const { drillId, wordlist, connectedSpeech, weakForms, cefrLevels } = input;
  const selected = new Set(cefrLevels);

  if (drillId === "2d") {
    const connectedItems: SessionItem[] = connectedSpeech.map((entry) => ({
      kind: "connected",
      entry,
    }));
    const weakItems: SessionItem[] = weakForms.map((entry) => ({ kind: "weak", entry }));
    return shuffle([...connectedItems, ...weakItems]);
  }

  let pool = wordlist;
  if (drillId === "2c") {
    // `docs/features/2c.md`: プール除外 letter / contraction。
    pool = pool.filter((entry) => entry.pattern !== "letter" && entry.pattern !== "contraction");
  }
  const filtered = pool.filter((entry) => cefrMatches(entry.cefr, selected));
  const items: SessionItem[] = filtered.map((entry) => ({ kind: "word", entry }));
  return shuffle(items);
}
