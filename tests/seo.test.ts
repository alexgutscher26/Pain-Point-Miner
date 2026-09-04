import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import {
  constructMetadata,
  constructOgImageUrl,
  siteConfig,
  siteUrl,
} from "@/lib/seo";

describe("SEO System", () => {
  it("generates a comprehensive dynamic sitemap covering all core public sections", () => {
    const map = sitemap();

    expect(Array.isArray(map)).toBe(true);
    expect(map.length).toBeGreaterThanOrEqual(35);

    const urls = map.map((entry) => entry.url);

    // Core static pages
    expect(urls).toContain(siteUrl);
    expect(urls).toContain(`${siteUrl}/blog`);
    expect(urls).toContain(`${siteUrl}/docs`);
    expect(urls).toContain(`${siteUrl}/case-studies`);
    expect(urls).toContain(`${siteUrl}/niches`);
    expect(urls).toContain(`${siteUrl}/free-tools`);
    expect(urls).toContain(`${siteUrl}/resources`);
    expect(urls).toContain(`${siteUrl}/privacy`);
    expect(urls).toContain(`${siteUrl}/terms`);

    // Features
    expect(urls).toContain(`${siteUrl}/features/pain-point-mining`);
    expect(urls).toContain(`${siteUrl}/features/idea-validation`);
    expect(urls).toContain(`${siteUrl}/features/sentiment-analysis`);

    // Niches
    expect(urls).toContain(`${siteUrl}/niches/shopify-stores`);

    // Blog
    expect(urls).toContain(`${siteUrl}/blog/how-to-validate-saas-idea-reddit`);
    expect(urls).toContain(`${siteUrl}/blog/reddit-vs-interviews-vs-surveys`);

    // Free tools & resources
    expect(urls).toContain(`${siteUrl}/free-tools/pain-point-miner`);
    expect(urls).toContain(`${siteUrl}/resources/best-subreddits-by-industry`);
  });

  it("configures robots.txt with correct allow and disallow directives", () => {
    const robotRules = robots();

    expect(robotRules.sitemap).toBe(`${siteUrl}/sitemap.xml`);
    const rules = Array.isArray(robotRules.rules)
      ? robotRules.rules[0]
      : robotRules.rules;

    expect(rules?.allow).toBe("/");
    expect(rules?.disallow).toContain("/dashboard/");
    expect(rules?.disallow).toContain("/api/");
    expect(rules?.disallow).toContain("/onboarding/");
  });

  it("constructs accurate OpenGraph URLs with query parameters", () => {
    const ogUrl = constructOgImageUrl({
      title: "Test Feature",
      description: "Test Description",
      badge: "Feature",
      category: "Intelligence",
    });

    expect(ogUrl).toContain("/api/og");
    expect(ogUrl).toContain("title=Test+Feature");
    expect(ogUrl).toContain("description=Test+Description");
    expect(ogUrl).toContain("badge=Feature");
    expect(ogUrl).toContain("category=Intelligence");
  });

  it("constructs canonical metadata and social openGraph tags", () => {
    const meta = constructMetadata({
      title: "AI Pain Point Mining",
      description: "Scan thousands of communities",
      path: "/features/pain-point-mining",
    });

    expect(meta.title).toBe("AI Pain Point Mining");
    expect(meta.description).toBe("Scan thousands of communities");
    expect(meta.alternates?.canonical).toBe(
      `${siteUrl}/features/pain-point-mining`,
    );
    expect(meta.openGraph?.title).toBe(
      `AI Pain Point Mining | ${siteConfig.name}`,
    );
    expect(meta.openGraph?.url).toBe(`${siteUrl}/features/pain-point-mining`);
    expect(meta.twitter?.card).toBe("summary_large_image");
  });
});
