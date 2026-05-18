import { describe, expect, it } from "vitest";
import { calculateMiningCost, MINING_PRESETS, MiningDepth } from "@/lib/mining-presets";

describe("calculateMiningCost", () => {
  it("returns the correct cost for basic depth", () => {
    expect(calculateMiningCost("basic")).toBe(MINING_PRESETS["basic"].estimatedCredits);
    // Explicitly check the value as well to ensure it matches expectations
    expect(calculateMiningCost("basic")).toBe(0.5);
  });

  it("returns the correct cost for deep depth", () => {
    expect(calculateMiningCost("deep")).toBe(MINING_PRESETS["deep"].estimatedCredits);
    expect(calculateMiningCost("deep")).toBe(2.0);
  });

  it("returns the correct cost for advanced depth", () => {
    expect(calculateMiningCost("advanced")).toBe(MINING_PRESETS["advanced"].estimatedCredits);
    expect(calculateMiningCost("advanced")).toBe(5);
  });

  it("returns 1 as fallback for unknown depth", () => {
    // @ts-expect-error Testing invalid input
    expect(calculateMiningCost("unknown" as MiningDepth)).toBe(1);
  });

  it("returns 1 as fallback for undefined depth", () => {
    // @ts-expect-error Testing invalid input
    expect(calculateMiningCost(undefined as unknown as MiningDepth)).toBe(1);
  });

  it("returns 1 as fallback for null depth", () => {
    // @ts-expect-error Testing invalid input
    expect(calculateMiningCost(null as unknown as MiningDepth)).toBe(1);
  });
});
