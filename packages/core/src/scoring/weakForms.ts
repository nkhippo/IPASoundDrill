/**
 * packages/core/src/scoring/weakForms.ts
 *
 * Weak forms（`2d` の弱形側）判定・補助ロジック。
 * `apps/web/src/index.template.html` の `isWeakItem()` (旧 L2798) /
 * `activeStrongIpa()` (旧 L2799) をロジック不変で移植。
 *
 * `docs/features/2d.md` 「採点則・定数」: 綴り（正規化後）完全一致（`scoring/decode.ts` の
 * `checkSpelling` を流用、near 廃止は `2a` と同様）。
 */

import type { Accent, WeakFormEntry } from "../types.js";
import { checkSpelling, type ScoreResult } from "./decode.js";

/** `src === "weak_form"` を持つアイテムを weak form として判定する。 */
export function isWeakItem(
  c: { src?: string | null } | null | undefined
): c is WeakFormEntry {
  return !!(c && c.src === "weak_form");
}

/**
 * 強形 IPA（アクセント固定）を解決する。
 * 元実装: `ACCENT==="rp" ? (c.rp_ipa_strong||c.ipa_strong||c.ipa) : (c.ipa_strong||c.ipa)`。
 */
export function activeStrongIpa(
  c:
    | {
        ipa?: string | null;
        ipa_strong?: string | null;
        rp_ipa_strong?: string | null;
      }
    | null
    | undefined,
  accent: Accent
): string {
  if (!c) return "";
  return accent === "rp"
    ? c.rp_ipa_strong || c.ipa_strong || c.ipa || ""
    : c.ipa_strong || c.ipa || "";
}

/** weak forms の Decode 判定（綴り正規化後の完全一致）。 */
export function checkWeakForm(text: string, word: string): ScoreResult {
  return checkSpelling(text, word);
}
