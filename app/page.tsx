import type { Metadata } from "next";
import { GoldMine } from "@/components/landing/GoldMine";
import { Steps } from "@/components/landing/Steps";
import { Toolkit } from "@/components/landing/Toolkit";
import { Opportunities } from "@/components/landing/Opportunities";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TaglineReveal } from "@/components/landing/TaglineReveal";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { siteConfig, siteUrl } from "@/lib/seo";

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteUrl,
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: siteUrl,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does ThreddIQ source Reddit discussions without getting blocked?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use official authenticated endpoints and rate-limited worker queues to parse public discussions compliantly and reliably without violating platform policies.",
      },
    },
    {
      "@type": "Question",
      name: "How does the AI differentiate noise and spam from real pain points?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our classification models filter out self promotion, bots, and memes, scoring only repeated workflow friction, workarounds, and explicit user struggles.",
      },
    },
    {
      "@type": "Question",
      name: "Can I export my extracted research data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can export structured pain points, willingness to pay markers, competitor mentions, and direct thread permalinks to CSV, JSON, or Notion with one click.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a credit card to start scanning?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. You can test your initial subreddit scans completely free without entering any billing details.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "ThreddIQ | AI Reddit Market Research & SaaS Pain Point Miner",
  description:
    "Mine Reddit discussions for high-intent customer pain points and software ideas. Validate buyer demand, track competitor flaws, and build what customers pay for.",
  keywords: [
    ...siteConfig.keywords,
    "software validation",
    "reddit market research",
    "founder tools 2026",
    "saas marketing reddit",
    "pain point mining",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "ThreddIQ | AI Reddit Market Research & SaaS Pain Point Miner",
    description:
      "Mine Reddit discussions for high-intent customer pain points and software ideas. Validate buyer demand before you build.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ThreddIQ Landing Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ThreddIQ | AI Reddit Market Research & SaaS Pain Point Miner",
    description:
      "Mine Reddit discussions for high-intent customer pain points and software ideas. Validate buyer demand before you build.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function Home() {
  return (
    <div className="landing-gradient min-h-screen overflow-x-hidden font-sans text-zinc-900 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <script type="application/ld+json">
        {safeJsonLd(organizationJsonLd)}
      </script>
      <script type="application/ld+json">
        {safeJsonLd(softwareApplicationJsonLd)}
      </script>
      <script type="application/ld+json">{safeJsonLd(faqJsonLd)}</script>
      <Header />
      <main className="flex w-full flex-col items-center">
        <Hero />
        <TaglineReveal />
        <InteractiveDemo />
        <GoldMine />
        <Steps />
        <Toolkit />
        <Opportunities />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
