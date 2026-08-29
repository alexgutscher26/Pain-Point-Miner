/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { getAllPreminedNiches } from "@/lib/premined-niches";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Flame,
  Search,
  Lightbulb,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pre-Mined Reddit SaaS Opportunities & Pain Point Library | ThreddIQ",
  description:
    "Explore 20+ pre-validated startup niches mined from Reddit conversations. Uncover real user frustrations, willingness-to-pay signals, and TAM estimates without running a scan.",
};

export default function NichesDirectoryPage() {
  const niches = getAllPreminedNiches();

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900">
      <Header />

      <main className="pt-28 pb-20">
        {/* Hero Header */}
        <section className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 text-xs font-semibold text-[#ff4500]">
            <Sparkles className="h-3.5 w-3.5" />
            Zero-Wait Pre-Mined Intelligence Library
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
            Pre-Mined Reddit Opportunities
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 sm:text-lg">
            Real customer pain points, extracted from thousands of Reddit threads across active subreddits. Browse validated problems with willingness-to-pay signals for free.
          </p>

          {/* Quick CTA bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard/search">
              <Button className="rounded-full bg-[#ff4500] px-6 py-5 font-semibold text-white shadow-md hover:bg-[#e03d00]">
                <Search className="mr-2 h-4 w-4" />
                Mine Your Custom Niche Free
              </Button>
            </Link>
            <Link href="/free-tools/pain-point-miner">
              <Button variant="outline" className="rounded-full border-zinc-300 bg-white px-6 py-5 font-medium text-zinc-800 hover:bg-zinc-50">
                Try Free Micro-Tool
              </Button>
            </Link>
          </div>
        </section>

        {/* Niche Grid */}
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              Browse {niches.length} Validated Niches
            </h2>
            <span className="text-xs text-zinc-500">
              Updated weekly with fresh Reddit signal mining
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {niches.map((niche) => {
              const difficultyColors = {
                weekend_project: "bg-emerald-50 text-emerald-700 border-emerald-200",
                side_project: "bg-blue-50 text-blue-700 border-blue-200",
                startup_mvp: "bg-purple-50 text-purple-700 border-purple-200",
                vc_scale_moat: "bg-amber-50 text-amber-700 border-amber-200",
              };

              const difficultyLabels = {
                weekend_project: "Weekend Project",
                side_project: "Side Project",
                startup_mvp: "Startup MVP",
                vc_scale_moat: "Scale Moat",
              };

              return (
                <div
                  key={niche.slug}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {niche.category}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[11px] font-medium ${difficultyColors[niche.recommendedDifficulty]}`}
                      >
                        {difficultyLabels[niche.recommendedDifficulty]}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 text-lg font-bold text-zinc-900 group-hover:text-[#ff4500]">
                      {niche.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600 line-clamp-2">
                      {niche.tagline}
                    </p>

                    {/* Scores Bar */}
                    <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3 text-center border border-zinc-100">
                      <div>
                        <div className="text-[10px] font-medium uppercase text-zinc-500">
                          Opportunity
                        </div>
                        <div className="mt-0.5 flex items-center justify-center gap-1 font-bold text-[#ff4500]">
                          <Flame className="h-3.5 w-3.5 fill-[#ff4500]" />
                          {niche.opportunityScore}
                        </div>
                      </div>
                      <div className="border-x border-zinc-200/80">
                        <div className="text-[10px] font-medium uppercase text-zinc-500">
                          Urgency
                        </div>
                        <div className="mt-0.5 font-bold text-zinc-800">
                          {niche.urgencyScore}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium uppercase text-zinc-500">
                          Est. TAM
                        </div>
                        <div className="mt-0.5 text-xs font-bold text-emerald-600">
                          {niche.estimatedTam.split(" ")[0]}
                        </div>
                      </div>
                    </div>

                    {/* Top Pain Point Teaser */}
                    {niche.topPainPoints[0] && (
                      <div className="mt-4 rounded-lg bg-orange-50/50 p-3 border border-orange-100">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-900">
                          <Lightbulb className="h-3.5 w-3.5 text-orange-600" />
                          Top Extracted Problem:
                        </div>
                        <p className="mt-1 text-xs text-orange-950 font-medium line-clamp-2">
                          "{niche.topPainPoints[0].title}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer subreddits & CTA */}
                  <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {niche.subreddits.slice(0, 2).map((sub) => (
                        <span
                          key={sub}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600"
                        >
                          r/{sub}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/niches/${niche.slug}`}
                      className="inline-flex items-center text-xs font-bold text-[#ff4500] hover:underline"
                    >
                      View Breakdown
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
