import { describe, expect, it } from "vitest";
import { activeStrongIpa, checkWeakForm, isWeakItem } from "./weakForms.js";

describe("isWeakItem", () => {
  it("is true only when src === 'weak_form'", () => {
    expect(isWeakItem({ src: "weak_form" })).toBe(true);
    expect(isWeakItem({ src: "cefr" })).toBe(false);
    expect(isWeakItem({})).toBe(false);
    expect(isWeakItem(null)).toBe(false);
  });
});

describe("activeStrongIpa", () => {
  const c = { ipa: "/ə/", ipa_strong: "/eɪ/", rp_ipa_strong: "/eɪ/" };

  it("prefers rp_ipa_strong for rp accent", () => {
    expect(activeStrongIpa(c, "rp")).toBe("/eɪ/");
  });

  it("prefers ipa_strong for ga accent", () => {
    expect(activeStrongIpa(c, "ga")).toBe("/eɪ/");
  });

  it("falls back to ipa when *_strong absent", () => {
    expect(activeStrongIpa({ ipa: "/ə/" }, "ga")).toBe("/ə/");
    expect(activeStrongIpa({ ipa: "/ə/" }, "rp")).toBe("/ə/");
  });

  it("returns empty string for null/undefined item", () => {
    expect(activeStrongIpa(null, "ga")).toBe("");
  });
});

describe("checkWeakForm", () => {
  it("delegates to normalized exact-match spelling check", () => {
    expect(checkWeakForm("a", "a")).toBe("ok");
    expect(checkWeakForm("an", "a")).toBe("bad");
  });
});
