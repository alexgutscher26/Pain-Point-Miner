/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { getPreminedNiche, getAllPreminedNiches } from "@/lib/premined-niches";
import { constructMetadata, siteConfig, siteUrl } from "@/lib/seo";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Flame,
  DollarSign,
  Search,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface NichePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const niches = getAllPreminedNiches();
  return niches.map((n) => ({
    slug: n.slug,
  }));
}

export async function generateMetadata({
  params,
}: NichePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const niche = getPreminedNiche(resolvedParams.slug);

  if (!niche) {
    return {
      title: "Niche Not Found | ThreddIQ",
    };
  }

  return constructMetadata({
    title: `${niche.title} - Reddit Pain Points & Opportunity Teardown`,
    description: niche.tagline,
    path: `/niches/${resolvedParams.slug}`,
    ogImage: `${siteUrl}/api/og?title=${encodeURIComponent(niche.title)}&description=${encodeURIComponent(niche.tagline)}&badge=${encodeURIComponent(niche.category)}&category=Niche+Intelligence`,
  });
}

export default async function NicheDetailPage({ params }: NichePageProps) {
  const resolvedParams = await params;
  const niche = getPreminedNiche(resolvedParams.slug);

  if (!niche) {
    notFound();
  }

  const nicheSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: niche.title,
    description: niche.tagline,
    url: `${siteUrl}/niches/${resolvedParams.slug}`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", item: "/" },
          { name: "Pre-Mined Niches", item: "/niches" },
          { name: niche.title, item: `/niches/${resolvedParams.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(nicheSchema) }}
      />
      <Header />

      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/niches"
            className="inline-flex items-center text-xs font-semibold text-zinc-500 hover:text-zinc-900"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Pre-Mined Niches
          </Link>

          {/* Header Card */}
          <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-[#ff4500]">
                  {niche.category}
                </span>
                <span className="text-xs text-zinc-500">
                  Target Subreddits:{" "}
                  {niche.subreddits.map((s) => `r/${s}`).join(", ")}
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-orange-300 bg-orange-50 text-xs font-semibold text-[#ff4500]"
              >
                Opportunity Score: {niche.opportunityScore}/100
              </Badge>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
              {niche.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-zinc-600 sm:text-lg">
              {niche.tagline}
            </p>

            {/* Metrics Row */}
            <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-center sm:grid-cols-4">
              <div>
                <div className="text-xs font-medium text-zinc-500">
                  Opportunity
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 text-xl font-extrabold text-[#ff4500]">
                  <Flame className="h-4 w-4 fill-[#ff4500]" />
                  {niche.opportunityScore}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-500">
                  Urgency Level
                </div>
                <div className="mt-1 text-xl font-extrabold text-zinc-800">
                  {niche.urgencyScore}%
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-500">
                  Monetization
                </div>
                <div className="mt-1 text-xl font-extrabold text-emerald-600">
                  {niche.monetizationScore}%
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-500">
                  Estimated TAM
                </div>
                <div className="mt-1 text-base font-bold text-zinc-900">
                  {niche.estimatedTam}
                </div>
              </div>
            </div>
          </div>

          {/* Market Overview & Blueprint */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-zinc-900">
                <AlertCircle className="h-5 w-5 text-[#ff4500]" />
                Market Friction Overview
              </div>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {niche.marketOverview}
              </p>
            </div>

            <div className="rounded-3xl border border-orange-200 bg-linear-to-br from-orange-50/80 to-amber-50/40 p-6 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-orange-950">
                <Sparkles className="h-5 w-5 text-[#ff4500]" />
                Recommended SaaS Blueprint
              </div>
              <p className="mt-3 text-sm leading-relaxed font-medium text-orange-950/90">
                {niche.solutionBlueprint}
              </p>
            </div>
          </div>

          {/* Extracted Reddit Pain Points */}
          <div className="mt-10">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Extracted Reddit Pain Points ({niche.topPainPoints.length})
            </h2>

            <div className="mt-4 space-y-4">
              {niche.topPainPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-zinc-900">
                      {pt.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                        r/{pt.sourceSubreddit}
                      </span>
                      <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-bold text-[#ff4500]">
                        Pain: {pt.painIntensity}/10
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {pt.body}
                  </p>

                  {/* Quote from Reddit */}
                  <div className="mt-4 rounded-xl border-l-4 border-[#ff4500] bg-zinc-50 p-3 text-xs text-zinc-700 italic">
                    "{pt.sampleQuote}"
                  </div>

                  {/* Willingness to pay quote */}
                  {pt.willingnessToPayQuote && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
                      <DollarSign className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        <strong>Budget Signal:</strong> "
                        {pt.willingnessToPayQuote}"
                      </span>
                    </div>
                  )}

                  {/* Solutions tried */}
                  {pt.triedSolutions.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="font-semibold text-zinc-700">
                        Failed / Incomplete Workarounds:
                      </span>
                      {pt.triedSolutions.map((sol, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-600"
                        >
                          {sol}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Banner */}
          <div className="mt-12 rounded-3xl bg-zinc-900 p-8 text-center text-white shadow-xl">
            <h3 className="text-2xl font-extrabold tracking-tight">
              Ready to Mine Your Specific SaaS Idea?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-300">
              Run a live scan across Reddit in seconds. New free accounts get 2
              free starter scans every month.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link href="/dashboard/search">
                <Button className="rounded-full bg-[#ff4500] px-8 py-5 font-bold text-white shadow-md hover:bg-[#e03d00]">
                  <Search className="mr-2 h-4 w-4" />
                  Mine Custom Reddit Keywords
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
