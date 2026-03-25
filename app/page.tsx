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
import { Testimonial } from "@/components/landing/Testimonial";
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
  title: "ThreddIQ for SaaS Validation",
  description:
    "Mine Reddit conversations to uncover urgent customer pain points, validate SaaS ideas, and prioritize high-opportunity markets faster.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ThreddIQ for SaaS Validation",
    description:
      "Mine Reddit conversations to uncover urgent customer pain points, validate SaaS ideas, and prioritize high-opportunity markets faster.",
    url: siteUrl,
  },
  twitter: {
    title: "ThreddIQ for SaaS Validation",
    description:
      "Mine Reddit conversations to uncover urgent customer pain points, validate SaaS ideas, and prioritize high-opportunity markets faster.",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#ff4500]/30 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(softwareApplicationJsonLd),
        }}
      />
      <Header />
      <main className="flex flex-col items-center w-full">
        <Hero />
        <Testimonial />
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
