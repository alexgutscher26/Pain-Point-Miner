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
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
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

export const metadata: Metadata = {
  title: "ThreddIQ | Reddit Pain Point Mining & SaaS Validation",
  description:
    "ThreddIQ uses AI to mine Reddit for urgent customer pain points. Validate software ideas before you build and turn Reddit threads into high-growth SaaS tools.",
  keywords: [
    ...siteConfig.keywords,
    "software validation",
    "reddit market research",
    "founder tools 2026",
    "saas marketing reddit",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "ThreddIQ | Reddit Pain Point Mining & SaaS Validation",
    description:
      "ThreddIQ uses AI to mine Reddit for urgent customer pain points, validating software ideas before you build.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ThreddIQ Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ThreddIQ | Reddit Pain Point Mining & SaaS Validation",
    description:
      "ThreddIQ uses AI to mine Reddit for urgent customer pain points, validating software ideas before you build.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <script type="application/ld+json">
        {safeJsonLd(organizationJsonLd)}
      </script>
      <script type="application/ld+json">
        {safeJsonLd(softwareApplicationJsonLd)}
      </script>
      <Header />
      <main className="flex w-full flex-col items-center">
        <Hero />
        {/* <Testimonial /> */}
        <InteractiveDemo />
        <GoldMine />
        <Steps />
        <Toolkit />
        <Opportunities />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
