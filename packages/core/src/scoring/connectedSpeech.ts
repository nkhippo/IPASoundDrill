/**
 * packages/core/src/scoring/connectedSpeech.ts
 *
 * Connected speech（`2d` の連結句側）判定・補助ロジック。
 * `apps/web/src/index.template.html` の `isConnectedItem()` (旧 L2797) /
 * `csTypeLabel()` (旧 L2804) / `csRuleText()` (旧 L2810) / `pickCarrier()` (旧 L5199) /
 * `capCarrierBefore()` (旧 L5203) をロジック不変で移植。
 *
 * `docs/features/2d.md` 「採点則・定数」: 綴り（正規化後）完全一致（`scoring/decode.ts` の
 * `checkSpelling` を流用、near 廃止は `2a` と同様）。
 */

import type { ConnectedSpeechEntry } from "../types.js";
import { checkSpelling, type ScoreResult } from "./decode.js";

/** `cs_type` を持つアイテムを connected speech として判定する。 */
export function isConnectedItem(
  c: { cs_type?: string | null } | null | undefined
): c is ConnectedSpeechEntry {
  return !!(c && c.cs_type);
}

/**
 * connected speech の type ラベルを解決する。元実装は module-level i18n 関数 `t()` を
 * 直接参照していたため、呼び出し側から `translate` を注入する。
 */
export function csTypeLabel(
  type: string | null | undefined,
  translate: (key: string) => string | undefined
): string {
  if (!type || type === "all") return "";
  const key = "cs." + type;
  return translate(key) || type;
}

/** `cs_rule` から現在の言語のルール文を解決する（無ければ `en` にフォールバック）。 */
export function csRuleText(
  c: { cs_rule?: Record<string, string> } | null | undefined,
  lang: string
): string {
  if (!c || !c.cs_rule) return "";
  return c.cs_rule[lang] || c.cs_rule.en || "";
}

/** carrier 文をランダムに 1 件選ぶ（`carriers` が空/未設定なら null）。 */
export function pickCarrier(
  c: { carriers?: string[] } | null | undefined,
  random: () => number = Math.random
): string | null {
  if (!c || !c.carriers || !c.carriers.length) return null;
  return c.carriers[Math.floor(random() * c.carriers.length)];
}

/** carrier 文の `{P}` 直前部分の先頭を大文字化する。 */
export function capCarrierBefore(before: string): string {
  if (!before) return "";
  return before.charAt(0).toUpperCase() + before.slice(1);
}

/** connected speech の Decode 判定（綴り正規化後の完全一致）。 */
export function checkConnectedSpeech(text: string, phrase: string): ScoreResult {
  return checkSpelling(text, phrase);
}
