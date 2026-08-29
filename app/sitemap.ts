import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const freeTools = [
  "pain-point-miner",
  "opportunity-scoreboard",
  "sentiment-context-map",
  "reddit-lead-generator",
];

const resources = [
  "best-subreddits-by-industry",
  "monitor-reddit-by-industry",
  "reddit-monitoring-use-cases",
  "reddit-marketing-glossary",
  "reddit-marketing-by-industry",
  "tool-comparisons",
  "reddit-tools",
];

const blogPosts = [
  "reddit-vs-interviews-vs-surveys",
  "id-pay-for-this-test",
  "why-validated-ideas-still-fail",
  "how-to-validate-saas-idea-reddit",
  "analyzed-10000-reddit-complaints",
  "most-repeated-saas-complaint-this-month",
  "phrases-before-id-pay-for-this",
  "churn-patterns-in-developer-tools",
  "ai-wrapper-fatigue-reddit-sentiment",
  "finding-high-intent-b2b-micro-saas-niches",
  "automating-user-research-with-ai-scrapers",
  "why-saas-founders-cant-stop-bleeding-users",
  "slack-alerts-hot-pain-points",
  "desperation-score-explained",
  "track-competitor-complaints-reddit",
  "reddit-to-notion-10-minutes",
  "best-subreddits-b2b-saas-ideas-2026",
  "where-marketers-complain-online",
  "best-subreddits-fintech-billing-tool",
  "where-freelancers-agencies-vent-tools",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const toolsEntries = freeTools.map((slug) => ({
    url: `${siteUrl}/free-tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const resourcesEntries = resources.map((slug) => ({
    url: `${siteUrl}/resources/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const blogEntries = blogPosts.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...blogEntries,
    ...toolsEntries,
    ...resourcesEntries,
  ];
}
