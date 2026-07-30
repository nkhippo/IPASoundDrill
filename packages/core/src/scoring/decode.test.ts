import { describe, expect, it } from "vitest";
import { checkSpelling, normalizeSpelling } from "./decode.js";

describe("normalizeSpelling", () => {
  it("lowercases and strips non a-z characters", () => {
    expect(normalizeSpelling("Colour")).toBe("colour");
    expect(normalizeSpelling("an apple")).toBe("anapple");
    expect(normalizeSpelling("Don't")).toBe("dont");
  });
});

describe("checkSpelling", () => {
  it("returns ok on normalized exact match", () => {
    expect(checkSpelling("Colour", "colour")).toBe("ok");
    expect(checkSpelling("an apple", "An Apple")).toBe("ok");
    expect(checkSpelling("dont", "Don't")).toBe("ok");
  });

  it("returns bad on any mismatch (no near-match tolerance)", () => {
    expect(checkSpelling("color", "colour")).toBe("bad");
    expect(checkSpelling("", "colour")).toBe("bad");
    expect(checkSpelling("colourr", "colour")).toBe("bad");
  });
});
