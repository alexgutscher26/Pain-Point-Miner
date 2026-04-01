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

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
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
    ...toolsEntries,
    ...resourcesEntries,
  ];
}
