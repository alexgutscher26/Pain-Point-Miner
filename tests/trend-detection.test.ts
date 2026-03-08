import { describe, expect, it } from "vitest";
import {
  buildLatestTrendInsights,
  detectTrend,
  formatTrendChangePercent,
} from "@/lib/trend-detection";

describe("trend detection", () => {
  it("detects up/down/flat/new directions", () => {
    expect(detectTrend(8, 4).direction).toBe("up");
    expect(detectTrend(3, 7).direction).toBe("down");
    expect(detectTrend(10, 10).direction).toBe("flat");
    expect(detectTrend(5, null).direction).toBe("new");
  });

  it("builds latest insight per key from snapshots", () => {
    const insights = buildLatestTrendInsights([
      { key: "saas", value: 4, createdAt: "2026-03-01T00:00:00.000Z" },
      { key: "saas", value: 8, createdAt: "2026-03-05T00:00:00.000Z" },
      { key: "pricing", value: 2, createdAt: "2026-03-04T00:00:00.000Z" },
    ]);

    const saas = insights.find((entry) => entry.key === "saas");
    expect(saas).toBeDefined();
    expect(saas?.direction).toBe("up");
    expect(saas?.current).toBe(8);
    expect(saas?.previous).toBe(4);
  });

  it("formats signed percent values", () => {
    expect(formatTrendChangePercent(22.4)).toBe("+22%");
    expect(formatTrendChangePercent(-10.1)).toBe("-10%");
    expect(formatTrendChangePercent(0)).toBe("0%");
  });
});
