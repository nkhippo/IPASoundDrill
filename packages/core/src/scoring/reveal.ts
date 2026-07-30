/**
 * packages/core/src/scoring/reveal.ts
 *
 * Reveal 画面の Encode フィードバック色分けロジック（`docs/features/reveal.md`:
 * 「Encode（`2b`）時は音素ごと OK/NG 色分け（LCS。判定自体は 2 値）」）。
 * `apps/web/src/index.template.html` の `reveal()` (旧 L5540) 内、
 * `tgt`/`tgtSeg`/`usrSeg`/`matched`/`segIdxOf`/`okTokens`/`marker` を計算する箇所
 * （旧 L5578-5584）のみを純粋関数として抽出（DOM 更新本体は非対象）。
 *
 * Reveal 自体の判定則（ok/bad）は出題元 ID（`2a`/`2b`/`2d`）を参照する
 * （`docs/features/reveal.md`）。本ファイルはその 2 値結果を前提にした
 * Encode 専用の表示用トークン色分けのみを扱う。
 */

import type { Accent } from "../types.js";
import { lcsMark, stripStress, tokenize } from "./encode.js";

export type TokenMark = "tok-ok" | "tok-bad" | null;

/**
 * 正解 IPA とユーザーが組み立てたトークン列から、正解 IPA の各トークン index に対する
 * OK/NG マーカーを返す。強勢記号（`ˈ`/`ˌ`）には null（無色）を返す。
 */
export function buildEncodeTokenMarks(
  targetIpa: string,
  userTokens: string[],
  accent: Accent
): TokenMark[] {
  const tgt = tokenize(targetIpa, accent);
  const tgtSeg = stripStress(tgt);
  const usrSeg = stripStress(userTokens);
  const matched = lcsMark(tgtSeg, usrSeg);

  const segIdxOf: number[] = [];
  tgt.forEach((tok, k) => {
    if (tok !== "ˈ" && tok !== "ˌ") segIdxOf.push(k);
  });
  const okTokens = new Set<number>();
  matched.forEach((si) => okTokens.add(segIdxOf[si]));

  return tgt.map((tok, k) => {
    if (tok === "ˈ" || tok === "ˌ") return null;
    return okTokens.has(k) ? "tok-ok" : "tok-bad";
  });
}

