import { describe, expect, it } from "vitest";
import {
  getMarketBadge,
  toOpportunityScore,
  toValidationScore,
} from "@/lib/dashboard-metrics";

describe("dashboard metrics", () => {
  it("returns 0 score for empty pain points", () => {
    expect(toOpportunityScore([])).toBe(0);
  });

  it("returns bounded score between 0 and 100", () => {
    const score = toOpportunityScore([
      {
        score: 10,
        urgency: 10,
        monetizationScore: 10,
        marketMaturity: 10,
        sentiment: "angry",
      },
    ]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("maps market badge thresholds correctly", () => {
    expect(getMarketBadge(88)).toBe("High Potential");
    expect(getMarketBadge(62)).toBe("Solid Opportunity");
    expect(getMarketBadge(40)).toBe("Early Signal");
  });

  it("increases validation score with stronger signals", () => {
    const weak = toValidationScore({
      upvoteSignal: 1,
      commentCount: 1,
      mentionCount: 1,
    });
    const strong = toValidationScore({
      upvoteSignal: 40,
      commentCount: 20,
      mentionCount: 10,
    });

    expect(strong).toBeGreaterThan(weak);
    expect(strong).toBeLessThanOrEqual(100);
  });
});
