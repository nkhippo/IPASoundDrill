import { describe, expect, it } from "vitest";
import { computeDrillProgress, itemCefrLabel, progressPoolForDrill } from "./step3.js";

describe("itemCefrLabel", () => {
  it("returns the cefr value when it matches ^[ABC][12]$", () => {
    expect(itemCefrLabel({ cefr: "A1" })).toBe("A1");
    expect(itemCefrLabel({ cefr: "B2" })).toBe("B2");
  });

  it("returns empty string for invalid/missing cefr", () => {
    expect(itemCefrLabel({ cefr: "X1" })).toBe("");
    expect(itemCefrLabel({})).toBe("");
    expect(itemCefrLabel(null)).toBe("");
  });
});

describe("progressPoolForDrill", () => {
  const pools = {
    PRESET: [{ cefr: "A1" }, { cefr: "B1" }, { cefr: "A2" }],
    CONNECTED: [{ cefr: "A1" }],
    WEAK: [{ cefr: "A2" }],
  };

  it("uses PRESET for non-2d drills, filtered by selected cefr", () => {
    const result = progressPoolForDrill("2a", pools, new Set(["A1", "A2"]));
    expect(result).toEqual([{ cefr: "A1" }, { cefr: "A2" }]);
  });

  it("uses CONNECTED + WEAK for 2d", () => {
    const result = progressPoolForDrill("2d", pools, new Set(["A1", "A2"]));
    expect(result).toEqual([{ cefr: "A1" }, { cefr: "A2" }]);
  });

  it("excludes items whose cefr is not selected", () => {
    const result = progressPoolForDrill("2a", pools, new Set(["B1"]));
    expect(result).toEqual([{ cefr: "B1" }]);
  });
});

describe("computeDrillProgress", () => {
  const sessionItemKey = (item: { id: string }) => item.id;

  it("counts marks per slot and computes graduated pct", () => {
    const pool = [{ id: "w1" }, { id: "w2" }, { id: "w3" }, { id: "w4" }];
    const marks = {
      "2a:w1": 3,
      "2a:w2": 3,
      "2a:w3": 1,
      // w4 has no mark → counted as 0
    };
    const result = computeDrillProgress("2a", pool, marks, 3, sessionItemKey);
    expect(result).toEqual({
      drillId: "2a",
      counts: [1, 1, 0, 2],
      total: 4,
      graduated: 2,
      pct: 50,
    });
  });

  it("clamps out-of-range mark values into [0, checkMax]", () => {
    const pool = [{ id: "w1" }];
    const marks = { "2a:w1": 99 };
    const result = computeDrillProgress("2a", pool, marks, 3, sessionItemKey);
    expect(result.counts).toEqual([0, 0, 0, 1]);
  });

  it("returns pct 0 for empty pool (no division by zero)", () => {
    const result = computeDrillProgress("2a", [], {}, 3, sessionItemKey);
    expect(result.pct).toBe(0);
    expect(result.total).toBe(0);
  });
});
