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

  it("applies custom weights correctly", () => {
    const points = [
      {
        score: 10, // pain
        monetizationScore: 2,
        urgency: 2,
        marketMaturity: 2,
        sentiment: "neutral",
      },
    ];

    // High weight on pain (w1)
    const highPain = toOpportunityScore(points, {
      w1: 0.9,
      w2: 0.05,
      w3: 0.02,
      w4: 0.03,
    });

    // High weight on monetization (w2)
    const highMonetization = toOpportunityScore(points, {
      w1: 0.05,
      w2: 0.9,
      w3: 0.02,
      w4: 0.03,
    });

    // Since score (10) is much higher than monetization (2), highPain should be significantly larger
    expect(highPain).toBeGreaterThan(highMonetization);
  });
});
