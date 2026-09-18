import { describe, it, expect } from "vitest";
import {
  MINING_PRESETS,
  MINING_DEPTH_KEYS,
  getMiningPreset,
  getAllMiningPresets,
  calculateMiningCost,
  isMiningDepth,
  normalizeMiningDepth,
  type MiningDepth,
} from "@/lib/mining-presets";

describe("Mining Presets Configuration", () => {
  it("should define all 4 standard depth tiers", () => {
    expect(MINING_DEPTH_KEYS).toEqual(["basic", "deep", "advanced", "ultra"]);
    expect(Object.keys(MINING_PRESETS)).toHaveLength(4);
  });

  it("should have correct monotonically increasing parameters across tiers", () => {
    const tiers: MiningDepth[] = ["basic", "deep", "advanced", "ultra"];
    for (let i = 0; i < tiers.length - 1; i++) {
      const current = MINING_PRESETS[tiers[i]];
      const next = MINING_PRESETS[tiers[i + 1]];

      expect(next.postsPerSub).toBeGreaterThanOrEqual(current.postsPerSub);
      expect(next.maxDepth).toBeGreaterThanOrEqual(current.maxDepth);
      expect(next.maxComments).toBeGreaterThanOrEqual(current.maxComments);
      expect(next.estimatedCredits).toBeGreaterThan(current.estimatedCredits);
      expect(next.analyzeLimit).toBeGreaterThanOrEqual(current.analyzeLimit);
    }
  });

  it("should provide rich metadata including features and target audience", () => {
    for (const key of MINING_DEPTH_KEYS) {
      const preset = MINING_PRESETS[key];
      expect(preset.name).toBeTruthy();
      expect(preset.label).toBeTruthy();
      expect(preset.tagline).toBeTruthy();
      expect(preset.targetAudience).toBeTruthy();
      expect(preset.features.length).toBeGreaterThan(0);
      expect(preset.recommendedSorts.length).toBeGreaterThan(0);
      expect(preset.aiModelTier).toBeTruthy();
    }
  });

  it("should calculate correct mining credits", () => {
    expect(calculateMiningCost("basic")).toBe(0.5);
    expect(calculateMiningCost("deep")).toBe(2.0);
    expect(calculateMiningCost("advanced")).toBe(5.0);
    expect(calculateMiningCost("ultra")).toBe(10.0);
  });

  it("should get preset by depth with fallback", () => {
    expect(getMiningPreset("deep").id).toBe("deep");
    expect(getMiningPreset("non-existent" as any).id).toBe("basic");
  });

  it("should return all presets list", () => {
    const list = getAllMiningPresets();
    expect(list).toHaveLength(4);
    expect(list.map((p) => p.id)).toEqual(["basic", "deep", "advanced", "ultra"]);
  });

  it("should validate and normalize mining depth values", () => {
    expect(isMiningDepth("basic")).toBe(true);
    expect(isMiningDepth("ultra")).toBe(true);
    expect(isMiningDepth("invalid")).toBe(false);
    expect(isMiningDepth(null)).toBe(false);

    expect(normalizeMiningDepth("advanced")).toBe("advanced");
    expect(normalizeMiningDepth("unknown")).toBe("basic");
    expect(normalizeMiningDepth(undefined, "deep")).toBe("deep");
  });
});
