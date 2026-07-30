/**
 * packages/core/src/scoring/decode.ts
 *
 * Decode（`2a` IPA→綴り、`2d` connected speech / weak forms の綴り入力）判定ロジック。
 * `apps/web/src/index.template.html` の `norm()` (旧 L5284) / `spellCheck()` (旧 L5285) を
 * ロジック不変で移植（`docs/features/2a.md` / `2d.md` 「採点則・定数」: 綴り正規化後の完全一致のみ ok）。
 *
 * 純粋関数（副作用なし、DOM 非依存）。Web/Mobile 両方から同一関数を呼ぶ。
 */

export type ScoreResult = "ok" | "bad";

/** 綴りの正規化: 小文字化 + a-z 以外を除去（空白・句読点・アポストロフィ等をすべて除去）。 */
export function normalizeSpelling(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Decode 判定: 入力テキストと正解語（または連結句・弱形の綴り）を正規化して完全一致か判定する。
 * 近似正解（旧 Levenshtein ≤ 1 near）は設計・実装とも削除済み（`docs/features/2a.md`）。
 */
export function checkSpelling(text: string, target: string): ScoreResult {
  return normalizeSpelling(text) === normalizeSpelling(target) ? "ok" : "bad";
}
