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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export function constructOgImageUrl(options?: {
  title?: string;
  description?: string;
  badge?: string;
  category?: string;
}): string {
  const url = new URL(`${siteUrl}/api/og`);
  if (options?.title) url.searchParams.set("title", options.title);
  if (options?.description)
    url.searchParams.set("description", options.description);
  if (options?.badge) url.searchParams.set("badge", options.badge);
  if (options?.category) url.searchParams.set("category", options.category);
  return url.toString();
}

export function constructMetadata({
  title,
  description = siteConfig.description,
  path = "",
  ogImage,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}): Metadata {
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${siteUrl}${formattedPath === "/" ? "" : formattedPath}`;
  const resolvedOgImage =
    ogImage ||
    constructOgImageUrl({
      title,
      description,
    });

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: resolvedOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [resolvedOgImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}
