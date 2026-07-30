import { describe, expect, it } from "vitest";
import {
  checkEncode,
  lcsMark,
  nucleusIndex,
  phonemesOf,
  stressSyllable,
  stripStress,
  syllableCount,
  tokenize,
} from "./encode.js";

describe("tokenize", () => {
  it("splits GA IPA into tokens, preferring multi-char phonemes", () => {
    expect(tokenize("/ˈkʌlər/", "ga")).toEqual(["ˈ", "k", "ʌ", "l", "ə", "r"]);
    expect(tokenize("/tʃu/", "ga")).toEqual(["tʃ", "u"]);
    expect(tokenize("/deɪ/", "ga")).toEqual(["d", "eɪ"]);
  });

  it("splits RP IPA using RP multi-char set (long vowels)", () => {
    expect(tokenize("/kʌlə/", "rp")).toEqual(["k", "ʌ", "l", "ə"]);
    expect(tokenize("/biː/", "rp")).toEqual(["b", "iː"]);
  });
});

describe("stripStress", () => {
  it("removes primary/secondary stress markers only", () => {
    expect(stripStress(["ˈ", "k", "æ", "t"])).toEqual(["k", "æ", "t"]);
    expect(stripStress(["ˌ", "ˈ", "b"])).toEqual(["b"]);
  });
});

describe("nucleusIndex", () => {
  it("finds first vowel after primary stress, else first vowel overall", () => {
    const tk = tokenize("/əˈbaʊt/", "ga");
    expect(nucleusIndex(tk, "ga")).toBe(tk.indexOf("aʊ"));
  });

  it("returns -1 when no vowel present", () => {
    expect(nucleusIndex(["p", "t"], "ga")).toBe(-1);
  });
});

describe("syllableCount / stressSyllable", () => {
  it("counts vowel-bearing syllables", () => {
    expect(syllableCount("/əˈbaʊt/", "ga")).toBe(2);
    expect(syllableCount("/kæt/", "ga")).toBe(1);
  });

  it("locates the stressed syllable (1-indexed)", () => {
    expect(stressSyllable("/əˈbaʊt/", "ga")).toBe(2);
    expect(stressSyllable("/kæt/", "ga")).toBe(1);
  });
});

describe("phonemesOf", () => {
  it("filters to known phonemes excluding stress marks", () => {
    const isKnown = (t: string) => ["k", "æ", "t"].includes(t);
    expect(phonemesOf("/ˈkæt/", "ga", isKnown)).toEqual(["k", "æ", "t"]);
  });
});

describe("lcsMark", () => {
  it("returns matched target indices via LCS", () => {
    const matched = lcsMark(["k", "æ", "t"], ["k", "æ", "t"]);
    expect(matched).toEqual(new Set([0, 1, 2]));
  });

  it("handles partial / out-of-order user input", () => {
    const matched = lcsMark(["k", "æ", "t"], ["æ", "t"]);
    expect(matched).toEqual(new Set([1, 2]));
  });
});

describe("checkEncode", () => {
  it("returns ok only on full stress-inclusive token match", () => {
    expect(checkEncode("/ˈkʌlər/", ["ˈ", "k", "ʌ", "l", "ə", "r"], "ga")).toBe("ok");
  });

  it("returns bad when stress differs even if segments match", () => {
    expect(checkEncode("/ˈkʌlər/", ["k", "ʌ", "l", "ə", "r"], "ga")).toBe("bad");
  });

  it("returns bad on segment mismatch", () => {
    expect(checkEncode("/ˈkʌlər/", ["ˈ", "k", "ʌ", "l", "ə"], "ga")).toBe("bad");
  });
});
