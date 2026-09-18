import { describe, it, expect } from "vitest";
import {
  PREMINED_NICHES,
  getPreminedNiche,
  getAllPreminedNiches,
  getPreminedNichesByCategory,
  getPreminedNichesByDifficulty,
  searchPreminedNiches,
  getTopOpportunityNiches,
  getRelatedNiches,
  getPreminedNicheStats,
} from "@/lib/premined-niches";

describe("Pre-Mined Niches Intelligence Library", () => {
  it("contains at least 20 comprehensive niches", () => {
    expect(PREMINED_NICHES.length).toBeGreaterThanOrEqual(20);
  });

  it("every niche has valid slug, scores, subreddits, and pain points", () => {
    const slugs = new Set<string>();

    for (const niche of PREMINED_NICHES) {
      // Slug uniqueness
      expect(slugs.has(niche.slug)).toBe(false);
      slugs.add(niche.slug);

      // Score ranges
      expect(niche.opportunityScore).toBeGreaterThanOrEqual(0);
      expect(niche.opportunityScore).toBeLessThanOrEqual(100);
      expect(niche.urgencyScore).toBeGreaterThanOrEqual(0);
      expect(niche.urgencyScore).toBeLessThanOrEqual(100);
      expect(niche.monetizationScore).toBeGreaterThanOrEqual(0);
      expect(niche.monetizationScore).toBeLessThanOrEqual(100);

      // Non-empty fields
      expect(niche.title.length).toBeGreaterThan(0);
      expect(niche.tagline.length).toBeGreaterThan(0);
      expect(niche.marketOverview.length).toBeGreaterThan(0);
      expect(niche.solutionBlueprint.length).toBeGreaterThan(0);
      expect(niche.subreddits.length).toBeGreaterThan(0);
      expect(niche.topPainPoints.length).toBeGreaterThan(0);

      // Pain points validation
      for (const pt of niche.topPainPoints) {
        expect(pt.title.length).toBeGreaterThan(0);
        expect(pt.body.length).toBeGreaterThan(0);
        expect(pt.sampleQuote.length).toBeGreaterThan(0);
        expect(pt.painIntensity).toBeGreaterThanOrEqual(1);
        expect(pt.painIntensity).toBeLessThanOrEqual(10);
        expect(pt.urgency).toBeGreaterThanOrEqual(1);
        expect(pt.urgency).toBeLessThanOrEqual(10);
        expect(pt.monetizationScore).toBeGreaterThanOrEqual(1);
        expect(pt.monetizationScore).toBeLessThanOrEqual(10);
        expect(pt.sourceSubreddit.length).toBeGreaterThan(0);
      }
    }
  });

  it("getPreminedNiche finds niche by valid slug and returns undefined for unknown", () => {
    const shopify = getPreminedNiche("shopify-stores");
    expect(shopify).toBeDefined();
    expect(shopify?.slug).toBe("shopify-stores");

    const unknown = getPreminedNiche("non-existent-niche");
    expect(unknown).toBeUndefined();
  });

  it("getAllPreminedNiches returns the full list", () => {
    const all = getAllPreminedNiches();
    expect(all).toHaveLength(PREMINED_NICHES.length);
  });

  it("filters niches by category correctly", () => {
    const ecommerce = getPreminedNichesByCategory("E-Commerce");
    expect(ecommerce.length).toBeGreaterThanOrEqual(2);
    expect(ecommerce.every((n) => n.category === "E-Commerce")).toBe(true);

    const devtools = getPreminedNichesByCategory("DevTools & Tech");
    expect(devtools.length).toBeGreaterThanOrEqual(2);
    expect(devtools.every((n) => n.category === "DevTools & Tech")).toBe(true);
  });

  it("filters niches by difficulty correctly", () => {
    const weekend = getPreminedNichesByDifficulty("weekend_project");
    expect(weekend.length).toBeGreaterThan(0);
    expect(weekend.every((n) => n.recommendedDifficulty === "weekend_project")).toBe(true);

    const startup = getPreminedNichesByDifficulty("startup_mvp");
    expect(startup.length).toBeGreaterThan(0);
    expect(startup.every((n) => n.recommendedDifficulty === "startup_mvp")).toBe(true);
  });

  it("searches niches by keyword across title, subreddits, keywords, and pain points", () => {
    const shopifyResults = searchPreminedNiches("shopify");
    expect(shopifyResults.length).toBeGreaterThanOrEqual(1);
    expect(shopifyResults.some((n) => n.slug === "shopify-stores")).toBe(true);

    const dentalResults = searchPreminedNiches("dentistry");
    expect(dentalResults.length).toBeGreaterThanOrEqual(1);
    expect(dentalResults.some((n) => n.slug === "medical-practices")).toBe(true);

    const emptyQuery = searchPreminedNiches("");
    expect(emptyQuery).toHaveLength(PREMINED_NICHES.length);
  });

  it("getTopOpportunityNiches returns sorted top items", () => {
    const top3 = getTopOpportunityNiches(3);
    expect(top3).toHaveLength(3);
    expect(top3[0].opportunityScore).toBeGreaterThanOrEqual(top3[1].opportunityScore);
    expect(top3[1].opportunityScore).toBeGreaterThanOrEqual(top3[2].opportunityScore);
  });

  it("getRelatedNiches returns relevant suggestions and excludes self", () => {
    const related = getRelatedNiches("shopify-stores", 2);
    expect(related).toHaveLength(2);
    expect(related.some((r) => r.slug === "shopify-stores")).toBe(false);
  });

  it("getPreminedNicheStats calculates aggregate totals and averages", () => {
    const stats = getPreminedNicheStats();
    expect(stats.totalNiches).toBe(PREMINED_NICHES.length);
    expect(stats.totalPainPoints).toBeGreaterThanOrEqual(stats.totalNiches);
    expect(stats.averageOpportunityScore).toBeGreaterThan(80);
    expect(stats.averageUrgencyScore).toBeGreaterThan(75);
    expect(Object.keys(stats.categories).length).toBeGreaterThanOrEqual(5);
  });
});
