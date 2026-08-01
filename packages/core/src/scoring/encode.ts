/**
 * packages/core/src/scoring/encode.ts
 *
 * Encode（`2b` 単語→IPA タップ組み立て）判定ロジック + 共通トークナイズユーティリティ。
 * `apps/web/src/index.template.html` の `tokenize()` (旧 L3476) / `stripStress()` (旧 L5359) /
 * `lcsMark()` (旧 L5360) / `encodeCheck()` (旧 L5368) の判定本体、および tokenize に依存する
 * `nucleusIndex` / `phonemesOf` / `syllableCount` / `stressSyllable` (旧 L3482-3485) を
 * ロジック不変で移植。
 *
 * 元実装は module-level 変数 `ACCENT` を `multiList()`/`vowelSet()` 経由で参照していたが、
 * ここでは環境非依存の純粋関数にするため `accent` を明示引数化する
 * （Recon `docs/cursor/recon/pre-issue-recon-20260730-scoring-map.md` §5、ロジック改良ではなくグローバル依存の除去）。
 *
 * `docs/features/2b.md` 「採点則・定数」: IPA（強勢含む）完全一致のみ ok。
 * 旧「強勢以外一致 = near」判定は削除済み。
 */

import type { Accent } from "../types.js";

export type ScoreResult = "ok" | "bad";

export const MULTI_GA: readonly string[] = [
  "tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ", "n̩", "l̩", "m̩",
];

export const MULTI_RP: readonly string[] = [
  "tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə",
  "iː", "uː", "ɑː", "ɔː", "ɜː", "n̩", "l̩", "m̩",
];

export const VOWELS_GA: ReadonlySet<string> = new Set([
  "i", "ɪ", "ɛ", "æ", "ə", "ʌ", "ɑ", "ʊ", "u", "ɝ", "ɚ",
  "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ",
]);

export const VOWELS_RP: ReadonlySet<string> = new Set([
  "iː", "ɪ", "e", "æ", "ə", "ʌ", "ɑː", "ɒ", "ɔː", "ʊ", "uː", "ɜː",
  "eɪ", "aɪ", "ɔɪ", "əʊ", "aʊ", "ɪə", "eə", "ʊə",
]);

export function multiList(accent: Accent): readonly string[] {
  return accent === "rp" ? MULTI_RP : MULTI_GA;
}

export function vowelSet(accent: Accent): ReadonlySet<string> {
  return accent === "rp" ? VOWELS_RP : VOWELS_GA;
}

/** IPA 文字列（`/.../` を含んでもよい）をトークン列に分割する（多音字を先に貪欲マッチ）。 */
export function tokenize(raw: string, accent: Accent): string[] {
  const MULTI = multiList(accent);
  const s = raw.replace(/\//g, "");
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    let m: string | null = null;
    for (const x of MULTI) {
      if (s.startsWith(x, i)) {
        m = x;
        break;
      }
    }
    if (m) {
      out.push(m);
      i += m.length;
    } else {
      out.push(s[i]);
      i++;
    }
  }
  return out;
}

/** 強勢記号（`ˈ`/`ˌ`）を除いたトークン列。 */
export function stripStress(tk: string[]): string[] {
  return tk.filter((t) => t !== "ˈ" && t !== "ˌ");
}

/** 主強勢後（無ければ先頭から）最初の母音のトークン index。 */
export function nucleusIndex(tk: string[], accent: Accent): number {
  const VOWELS = vowelSet(accent);
  const si = tk.indexOf("ˈ");
  const from = si >= 0 ? si + 1 : 0;
  for (let k = from; k < tk.length; k++) {
    if (VOWELS.has(tk[k])) return k;
  }
  for (let k = 0; k < tk.length; k++) {
    if (VOWELS.has(tk[k])) return k;
  }
  return -1;
}

/**
 * IPA から音素トークンのみを抽出する。
 * 元実装は `PH`（音素解説辞書）に存在するトークンのみを対象にするが、`PH` は
 * `apps/web/src/index.template.html` 内のUI専用データ（`docs/data-contract.md` 契約外）
 * のため、`isKnownPhoneme` を呼び出し側から注入する。
 */
export function phonemesOf(
  ipa: string,
  accent: Accent,
  isKnownPhoneme: (token: string) => boolean
): string[] {
  return tokenize(ipa, accent).filter(
    (t) => isKnownPhoneme(t) && t !== "ˈ" && t !== "ˌ"
  );
}

/** 音節数（母音トークン数、最低 1）。 */
export function syllableCount(ipa: string, accent: Accent): number {
  const VOWELS = vowelSet(accent);
  return tokenize(ipa, accent).filter((t) => VOWELS.has(t)).length || 1;
}

/** 第一強勢が置かれた音節番号（1-indexed、既定 1）。 */
export function stressSyllable(ipa: string, accent: Accent): number {
  const VOWELS = vowelSet(accent);
  const tk = tokenize(ipa, accent);
  for (let k = 0; k < tk.length; k++) {
    if (tk[k] === "ˈ") {
      let c = 0;
      for (let j = 0; j < k; j++) {
        if (VOWELS.has(tk[j])) c++;
      }
      return c + 1;
    }
  }
  return 1;
}

/**
 * LCS（最長共通部分列）に基づき、target トークン列のうち user トークン列と
 * マッチした index の集合を返す（Reveal のフィードバック色分け用、判定自体は使わない）。
 */
export function lcsMark(target: string[], user: string[]): Set<number> {
  const T = target;
  const U = user;
  const m = T.length;
  const n = U.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = T[i - 1] === U[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const matched = new Set<number>();
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (T[i - 1] === U[j - 1]) {
      matched.add(i - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return matched;
}

/**
 * Encode 判定: 正解 IPA（強勢含む）をトークン化した列と、ユーザーが組み立てたトークン列が
 * 完全一致するかで ok/bad を判定する（強勢を含めた完全一致のみ ok）。
 */
export function checkEncode(targetIpa: string, userTokens: string[], accent: Accent): ScoreResult {
  const tgt = tokenize(targetIpa, accent);
  return tgt.join("") === userTokens.join("") ? "ok" : "bad";
}
