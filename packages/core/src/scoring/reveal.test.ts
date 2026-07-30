import { describe, expect, it } from "vitest";
import { buildEncodeTokenMarks } from "./reveal.js";

describe("buildEncodeTokenMarks", () => {
  it("marks every non-stress token ok on full match", () => {
    const marks = buildEncodeTokenMarks("/ˈkæt/", ["ˈ", "k", "æ", "t"], "ga");
    expect(marks).toEqual([null, "tok-ok", "tok-ok", "tok-ok"]);
  });

  it("marks stress tokens as null and mismatched segments as tok-bad", () => {
    const marks = buildEncodeTokenMarks("/ˈkæt/", ["ˈ", "k", "b"], "ga");
    // target tokens: ˈ, k, æ, t
    expect(marks[0]).toBeNull(); // stress
    expect(marks[1]).toBe("tok-ok"); // "k" present in user tokens
    expect(marks[2]).toBe("tok-bad"); // "æ" not present in user tokens
    expect(marks[3]).toBe("tok-bad"); // "t" not present in user tokens
  });
});
