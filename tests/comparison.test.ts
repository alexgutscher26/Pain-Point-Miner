import { describe, expect, it } from "vitest";
import {
  computeMetricDelta,
  compareReports,
  ComparisonReport,
} from "@/lib/comparison";

describe("comparison engine", () => {
  describe("computeMetricDelta", () => {
    it("computes correct positive percentage and favor when B is higher and higher is better", () => {
      const delta = computeMetricDelta(50, 75, true);
      expect(delta.diff).toBe(25);
      expect(delta.percentChange).toBe(50);
      expect(delta.favors).toBe("B");
    });

    it("computes correct negative percentage and favor when B is lower and higher is better", () => {
      const delta = computeMetricDelta(100, 80, true);
      expect(delta.diff).toBe(-20);
      expect(delta.percentChange).toBe(-20);
      expect(delta.favors).toBe("A");
    });

    it("favors lower value when isHigherBetter is false (e.g. Market Maturity)", () => {
      const delta = computeMetricDelta(8.0, 3.0, false);
      expect(delta.diff).toBe(-5.0);
      expect(delta.favors).toBe("B"); // lower maturity = less saturated = better
    });
  });

  describe("compareReports", () => {
    it("performs comprehensive side-by-side benchmark between two distinct reports", () => {
      const reportA: ComparisonReport = {
        id: "rep-crm",
        keyword: "CRM for Freelancers",
        subreddits: ["freelance", "smallbusiness"],
        createdAt: new Date("2026-01-01"),
        painPoints: [
          {
            id: "pp-a1",
            title: "Hubspot is way too expensive for solo consultants",
            score: 9,
            urgency: 9,
            monetizationScore: 9,
            marketMaturity: 8,
            sentiment: "desperate",
            subreddit: "freelance",
            budget: [{ amount: 50, period: "monthly" }],
          },
          {
            id: "pp-a2",
            title: "Manual invoice tracking takes 5 hours weekly",
            score: 7,
            urgency: 7,
            monetizationScore: 6,
            marketMaturity: 7,
            sentiment: "frustrated",
            subreddit: "smallbusiness",
          },
        ],
      };

      const reportB: ComparisonReport = {
        id: "rep-devtools",
        keyword: "Stripe Webhook Inspector",
        subreddits: ["webdev", "node"],
        createdAt: new Date("2026-01-05"),
        painPoints: [
          {
            id: "pp-b1",
            title: "Silent webhook drops in production losing revenue",
            score: 10,
            urgency: 10,
            monetizationScore: 10,
            marketMaturity: 2, // Low maturity -> Blue Ocean!
            sentiment: "desperate",
            subreddit: "webdev",
            budget: [{ amount: 100, period: "monthly" }],
          },
          {
            id: "pp-b2",
            title: "Localhost tunneling drops randomly",
            score: 8,
            urgency: 8,
            monetizationScore: 8,
            marketMaturity: 3, // Low maturity -> Blue Ocean!
            sentiment: "frustrated",
            subreddit: "node",
          },
        ],
      };

      const result = compareReports(reportA, reportB);

      // Verify report headers
      expect(result.reportA.keyword).toBe("CRM for Freelancers");
      expect(result.reportB.keyword).toBe("Stripe Webhook Inspector");

      // Verify quadrant breakdowns
      expect(result.reportA.quadrantBreakdown.battleground).toBe(2);
      expect(result.reportB.quadrantBreakdown.blueOcean).toBe(2);

      // Verify Deltas
      expect(result.deltas.opportunityScore.favors).toBe("B");
      expect(result.deltas.blueOceanCount.valueB).toBe(2);
      expect(result.deltas.blueOceanCount.valueA).toBe(0);

      // Verify Head-to-Head
      expect(result.topPainPointsHeadToHead).toHaveLength(3);
      expect(result.topPainPointsHeadToHead[0].painPointA?.title).toBe(
        "Hubspot is way too expensive for solo consultants",
      );
      expect(result.topPainPointsHeadToHead[0].painPointB?.title).toBe(
        "Silent webhook drops in production losing revenue",
      );

      // Verify Verdict
      expect(result.summaryVerdict.overallWinner).toBe("B");
      expect(result.summaryVerdict.winnerKeyword).toBe(
        "Stripe Webhook Inspector",
      );
    });
  });
});
