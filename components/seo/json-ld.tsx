import React from "react";
import { siteConfig, siteUrl } from "@/lib/seo";

/**
 * Escapes characters that could terminate <script> tags or inject HTML into JSON-LD scripts.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  name: string;
  text: string;
  url?: string;
  imageUrl?: string;
}

export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: "Pain Point Miner",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/icon.png`,
      width: 512,
      height: 512,
    },
    description: siteConfig.description,
    sameAs: [
      "https://twitter.com/snackforcode",
      "https://github.com/alexgutscher26/Pain-Point-Miner",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      url: `${siteUrl}/dashboard/help-support`,
      email: "support@painpointminer.com",
    },
    knowsAbout: [
      "Customer Pain Point Discovery",
      "Reddit Data Mining",
      "SaaS Idea Validation",
      "Market Opportunity Scoring",
      "Competitor Intelligence",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: "Pain Point Miner",
    url: siteUrl,
    description: siteConfig.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/niches?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function SoftwareAppJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Market Research & Intelligence Tool",
    operatingSystem: "All (Cloud-based Web Application)",
    url: siteUrl,
    description: siteConfig.description,
    screenshot: `${siteUrl}/og.png`,
    softwareVersion: "2.5.0",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Starter Tier",
        description: "1 free monthly scan with basic AI pain point discovery",
        category: "Free",
      },
      {
        "@type": "Offer",
        price: "149",
        priceCurrency: "USD",
        name: "Founder Pass (Lifetime Deal)",
        description:
          "30 monthly Reddit scans renewed forever, 10 subreddits per search, deep mining depth, saved reports, and permanent lifetime access",
        category: "Lifetime Access",
      },
      {
        "@type": "Offer",
        price: "299",
        priceCurrency: "USD",
        name: "Professional Studio Master (Lifetime Deal)",
        description:
          "100 monthly Reddit scans renewed forever, unlimited subreddits, ultra deep dive, trend detection, SaaS opportunity engine, and custom patterns",
        category: "Lifetime Access",
      },
    ],
    featureList: [
      "Reddit Pain Point Extraction",
      "AI Opportunity Scoring & Willingness-to-Pay Analysis",
      "Sentiment & Desperation Index",
      "Niche Market Discovery & Pre-mined Catalogs",
      "Competitor Alternative & Switching Cost Extraction",
      "Automated Weekly Intelligence Digests",
      "Semantic Clustering & Vector Search",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "128",
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function BlogPostJsonLd({
  title,
  description,
  url,
  datePublished,
  dateModified,
  author = "ThreddIQ Research Team",
  imageUrl,
  keywords,
  articleSection = "SaaS Research",
  wordCount,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string | { name: string; url?: string };
  imageUrl?: string;
  keywords?: string[];
  articleSection?: string;
  wordCount?: number;
}) {
  const authorObj =
    typeof author === "string"
      ? {
          "@type": "Person",
          name: author,
        }
      : {
          "@type": "Person",
          name: author.name,
          ...(author.url ? { url: author.url } : {}),
        };

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    image: imageUrl || `${siteUrl}/api/og?title=${encodeURIComponent(title)}`,
    datePublished,
    dateModified: dateModified || datePublished,
    inLanguage: "en-US",
    author: authorObj,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
    articleSection,
    ...(keywords && keywords.length > 0
      ? { keywords: keywords.join(", ") }
      : {}),
    ...(wordCount ? { wordCount } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item.startsWith("http") ? item.item : `${siteUrl}${item.item}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime,
  imageUrl,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  imageUrl?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(totalTime ? { totalTime } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url ? { url: step.url } : {}),
      ...(step.imageUrl ? { image: step.imageUrl } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
