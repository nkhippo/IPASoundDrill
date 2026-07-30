import { describe, expect, it } from "vitest";
import {
  capCarrierBefore,
  checkConnectedSpeech,
  csRuleText,
  csTypeLabel,
  isConnectedItem,
  pickCarrier,
} from "./connectedSpeech.js";

describe("isConnectedItem", () => {
  it("is true only when cs_type is truthy", () => {
    expect(isConnectedItem({ cs_type: "linking" })).toBe(true);
    expect(isConnectedItem({ cs_type: "" })).toBe(false);
    expect(isConnectedItem({})).toBe(false);
    expect(isConnectedItem(null)).toBe(false);
  });
});

describe("csTypeLabel", () => {
  it("resolves via translate() with cs.<type> key, falling back to type", () => {
    const translate = (key: string) => (key === "cs.linking" ? "Linking" : undefined);
    expect(csTypeLabel("linking", translate)).toBe("Linking");
    expect(csTypeLabel("unknown_type", translate)).toBe("unknown_type");
  });

  it("returns empty string for falsy or 'all' type", () => {
    const translate = () => undefined;
    expect(csTypeLabel(null, translate)).toBe("");
    expect(csTypeLabel("all", translate)).toBe("");
  });
});

describe("csRuleText", () => {
  it("resolves lang-specific rule, falling back to en", () => {
    const c = { cs_rule: { en: "English rule", ja: "日本語ルール" } };
    expect(csRuleText(c, "ja")).toBe("日本語ルール");
    expect(csRuleText(c, "ko")).toBe("English rule");
  });

  it("returns empty string when cs_rule absent", () => {
    expect(csRuleText({}, "en")).toBe("");
    expect(csRuleText(null, "en")).toBe("");
  });
});

describe("pickCarrier", () => {
  it("deterministically picks by injected random()", () => {
    const c = { carriers: ["a", "b", "c"] };
    expect(pickCarrier(c, () => 0)).toBe("a");
    expect(pickCarrier(c, () => 0.999)).toBe("c");
  });

  it("returns null when no carriers", () => {
    expect(pickCarrier({ carriers: [] })).toBeNull();
    expect(pickCarrier({})).toBeNull();
  });
});

describe("capCarrierBefore", () => {
  it("capitalizes first character", () => {
    expect(capCarrierBefore("she bought ")).toBe("She bought ");
    expect(capCarrierBefore("")).toBe("");
  });
});

describe("checkConnectedSpeech", () => {
  it("delegates to normalized exact-match spelling check", () => {
    expect(checkConnectedSpeech("an apple", "An Apple")).toBe("ok");
    expect(checkConnectedSpeech("an aple", "An Apple")).toBe("bad");
  });
});
