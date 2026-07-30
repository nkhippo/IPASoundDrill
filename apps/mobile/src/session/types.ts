/**
 * apps/mobile/src/session/types.ts
 *
 * 4-step ドリルセッション（Issue #224）の共通型。`DrillId` は
 * `docs/features/{2a,2b,2c,2d}.md` の ID に対応する。
 */
import type { ConnectedSpeechEntry, WeakFormEntry, WordlistEntry } from "@ipasounddrill/core";

export type DrillId = "2a" | "2b" | "2c" | "2d";

export type SessionItem =
  | { kind: "word"; entry: WordlistEntry }
  | { kind: "connected"; entry: ConnectedSpeechEntry }
  | { kind: "weak"; entry: WeakFormEntry };

/** セッション内アイテムの一意キー（`docs/features/_common.md` の `sessionItemKey` 相当）。 */
export function sessionItemKey(item: SessionItem): string {
  if (item.kind === "word") return item.entry.id ?? item.entry.w;
  return item.entry.id;
}

/** アイテムの表示語（Decode の正解語 / Encode の入力単語 / Connected の carrier 句）。 */
export function sessionItemWord(item: SessionItem): string {
  return item.entry.w;
}

/** アイテムの CEFR（`docs/features/_common.md` 卒業判定の母集団フィルタに使用）。 */
export function sessionItemCefr(item: SessionItem): string | null | undefined {
  return item.entry.cefr;
}
