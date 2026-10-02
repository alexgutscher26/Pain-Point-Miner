import { describe, expect, it } from "vitest";
import {
  getTopOpportunities,
  calculateActivityHeatmap,
  calculateClusterGrowth,
  calculateSingleOpportunityScore,
  calculateMarketRadarPoints,
} from "@/lib/dashboard-analytics";

describe("dashboard-analytics", () => {
  describe("calculateSingleOpportunityScore", () => {
    it("computes a valid bounded opportunity score between 0 and 100", () => {
      const score = calculateSingleOpportunityScore({
        score: 8,
        urgency: 9,
        monetizationScore: 8,
        marketMaturity: 5,
        sentiment: "frustrated",
        upvoteSignal: 60,
        commentCount: 20,
        mentionCount: 5,
      });

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBeGreaterThan(60);
    });
  });

  describe("getTopOpportunities", () => {
    it("ranks pain points descending by opportunity score", () => {
      const points = [
        {
          id: "p1",
          title: "Low friction tool",
          body: "Minor inconvenience",
          score: 3,
          urgency: 2,
          monetizationScore: 2,
          marketMaturity: 1,
          sentiment: "neutral",
          subreddit: "mildlyinfuriating",
          reportId: "r1",
          reportKeyword: "low friction",
          createdAt: new Date(),
        },
        {
          id: "p2",
          title: "Critical billing outage destroying revenue",
          body: "Losing thousands every hour",
          score: 10,
          urgency: 10,
          monetizationScore: 9,
          marketMaturity: 7,
          sentiment: "desperate",
          subreddit: "SaaS",
          reportId: "r2",
          reportKeyword: "billing bug",
          createdAt: new Date(),
          budget: [{ amount: 500, period: "monthly" }],
        },
      ];

      const top = getTopOpportunities(points, undefined, 5);

      expect(top).toHaveLength(2);
      expect(top[0].id).toBe("p2");
      expect(top[0].opportunityScore).toBeGreaterThan(top[1].opportunityScore);
      expect(top[0].budgetSignalsCount).toBe(1);
    });
  });

  describe("calculateActivityHeatmap", () => {
    it("builds a 91-day timeline with activity levels and streak tracking", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const activities = [
        { createdAt: today, type: "painPoint" as const },
        { createdAt: today, type: "scan" as const },
        { createdAt: yesterday, type: "painPoint" as const },
      ];

      const heatmap = calculateActivityHeatmap(activities, 91);

      expect(heatmap.days).toHaveLength(91);
      expect(heatmap.totalActivity).toBe(3);
      expect(heatmap.totalPainPoints).toBe(2);
      expect(heatmap.currentStreak).toBeGreaterThanOrEqual(2);
      expect(heatmap.longestStreak).toBeGreaterThanOrEqual(2);
    });
  });

  describe("calculateClusterGrowth", () => {
    it("computes 30-day timeline with density and growth rates", () => {
      const today = new Date();
      const clusters = [
        {
          id: "c1",
          canonicalTitle: "Stripe Webhook Failures",
          sourceCount: 12,
          createdAt: today,
        },
        {
          id: "c2",
          canonicalTitle: "Cold Email Deliverability",
          sourceCount: 4,
          createdAt: today,
        },
      ];

      const painPoints = [
        { id: "pp1", clusterId: "c1", createdAt: today },
        { id: "pp2", clusterId: "c1", createdAt: today },
        { id: "pp3", clusterId: "c2", createdAt: today },
      ];

      const growth = calculateClusterGrowth(clusters, painPoints, 30);

      expect(growth.timeline).toHaveLength(30);
      expect(growth.totalClusters).toBe(2);
      expect(growth.totalPainPoints).toBe(3);
      expect(growth.avgDensity).toBe(1.5);
      expect(growth.topClusterTitle).toBe("Stripe Webhook Failures");
    });
  });

  describe("calculateMarketRadarPoints", () => {
    it("maps pain points to correct 2D radar quadrants based on pain intensity and market maturity", () => {
      const painPoints = [
        {
          id: "p-blue-ocean",
          title: "Desperate need for simple tool, no competitors",
          score: 9,
          urgency: 9,
          monetizationScore: 8,
          marketMaturity: 3, // < 5.0 -> Blue Ocean
          sentiment: "desperate",
          subreddit: "startups",
          reportId: "r1",
          reportKeyword: "niche tool",
        },
        {
          id: "p-battleground",
          title: "High pain in crowded CRM space",
          score: 9,
          urgency: 8,
          monetizationScore: 9,
          marketMaturity: 8, // >= 5.0 -> Battleground
          sentiment: "frustrated",
          subreddit: "sales",
          reportId: "r2",
          reportKeyword: "crm",
        },
        {
          id: "p-uncharted",
          title: "Mild annoyance in novel hobby",
          score: 3,
          urgency: 2,
          monetizationScore: 2,
          marketMaturity: 2, // < 5.0 -> Uncharted Niche
          sentiment: "neutral",
          subreddit: "hobbies",
          reportId: "r3",
          reportKeyword: "hobby",
        },
        {
          id: "p-commodity",
          title: "Minor request in saturated project management tool",
          score: 3,
          urgency: 3,
          monetizationScore: 4,
          marketMaturity: 9, // >= 5.0 -> Commodity Zone
          sentiment: "neutral",
          subreddit: "productivity",
          reportId: "r4",
          reportKeyword: "pm tool",
        },
      ];

      const points = calculateMarketRadarPoints(painPoints);

      expect(points).toHaveLength(4);

      const blueOcean = points.find((p) => p.id === "p-blue-ocean");
      expect(blueOcean).toBeDefined();
      expect(blueOcean?.quadrant).toBe("blue-ocean");
      expect(blueOcean?.painIntensity).toBeGreaterThanOrEqual(5.0);
      expect(blueOcean?.marketMaturity).toBeLessThan(5.0);
      expect(blueOcean?.opportunityScore).toBeGreaterThan(0);

      const battleground = points.find((p) => p.id === "p-battleground");
      expect(battleground?.quadrant).toBe("battleground");
      expect(battleground?.painIntensity).toBeGreaterThanOrEqual(5.0);
      expect(battleground?.marketMaturity).toBeGreaterThanOrEqual(5.0);

      const uncharted = points.find((p) => p.id === "p-uncharted");
      expect(uncharted?.quadrant).toBe("uncharted");
      expect(uncharted?.painIntensity).toBeLessThan(5.0);
      expect(uncharted?.marketMaturity).toBeLessThan(5.0);

      const commodity = points.find((p) => p.id === "p-commodity");
      expect(commodity?.quadrant).toBe("commodity");
      expect(commodity?.painIntensity).toBeLessThan(5.0);
      expect(commodity?.marketMaturity).toBeGreaterThanOrEqual(5.0);
    });
  });
});
