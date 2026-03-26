import type { Metadata } from "next";

const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function toAbsoluteUrl(rawUrl: string | undefined): string {
  if (!rawUrl) {
    return DEFAULT_SITE_URL;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/+$/, "");
  }

  return `https://${trimmed}`.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "ThreddIQ",
  description:
    "Discover validated SaaS opportunities by mining real customer frustrations from Reddit. Stop guessing and start building what users actually want.",
  locale: "en_US",
  keywords: [
    "reddit pain point analysis",
    "saas idea validation",
    "market research tool",
    "customer pain points",
    "startup research",
    "reddit monitoring",
    "business idea validation",
    "market sentiment analysis",
    "reddit keyword research",
    "customer discovery tool",
    "reddit for marketers",
    "find business ideas on reddit",
  ],
} as const;

export const siteUrl = toAbsoluteUrl(
  process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "https://threddiq.com",
);

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: {
    icon: "/favicon.ico",
  },
};
