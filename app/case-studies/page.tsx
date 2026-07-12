import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import { CheckCircle2, TrendingUp, Users, Target } from "lucide-react";

const caseStudies = [
  {
    company: "SaaS Rocket",
    domain: "Project Management",
    title: "How SaaS Rocket reduced customer churn by 40% with Reddit mining",
    results: "40% reduction in churn",
    impact:
      "Used ThreddIQ to identify a specific missing feature that was frustrating users. We implemented it in a week.",
    date: "Jan 2026",
    slug: "saas-rocket-churn-reduction",
  },
  {
    company: "DevDash",
    domain: "Developer Tools",
    title: "DevDash validated a $50k/month niche in just 48 hours",
    results: "$50k/month niche identified",
    impact:
      "Mined r/rust to find a common developer networking problem. Validated with 50+ prospective users found via ThreddIQ.",
    date: "Dec 2025",
    slug: "devdash-validation-niche",
  },
  {
    company: "ContentKing",
    domain: "AI Marketing",
    title:
      "ContentKing's story of pivoting from a failed product to a market leader",
    results: "Saved 6 months of development",
    impact:
      "Stopped a failing product pivot by discovering that the intended market didn't have the problem we thought they had. ThreddIQ saved us 6 months of development time.",
    date: "Feb 2026",
    slug: "content-king-pivot",
  },
];

export const metadata: Metadata = {
  title: `Case Studies - ${siteConfig.name}`,
  description:
    "Real stories of SaaS founders using Reddit mining to build high-growth products.",
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen overflow-x-hidden landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />

      <main className="flex flex-col items-center px-6 pt-32 pb-24">
        <div className="w-full max-w-5xl">
          <header className="mb-20 text-center">
            <h1 className="mb-6 text-[48px] leading-tight font-extrabold text-zinc-900 md:text-[64px]">
              Proof that validation{" "}
              <span className="text-[#ff4500]">works</span>
            </h1>
            <p className="text-xl font-medium text-zinc-400">
              Stories from the frontlines of product discovery and market
              mining.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.map((cs) => (
              <div
                key={cs.slug}
                className="group relative flex flex-col items-start overflow-hidden rounded-[32px] glass-card p-10 text-left transition-all"
              >
                <div className="pointer-events-none absolute top-0 right-0 h-32 w-32 bg-[#ff4500]/5 opacity-50 blur-[80px] transition-opacity" />

                <div className="mb-8 flex items-center gap-2">
                  <div className="rounded-lg border border-black/10 bg-black/5 p-2 transition-transform duration-500 group-hover:scale-110">
                    <CheckCircle2
                      className="h-5 w-5 text-green-500"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-sm font-black tracking-widest text-zinc-900 uppercase">
                    {cs.company}
                  </span>
                </div>

                <h3 className="mb-6 text-2xl leading-snug font-extrabold text-zinc-900 transition-colors group-hover:text-[#ff4500]">
                  {cs.title}
                </h3>

                <p className="mb-10 flex-1 text-lg leading-relaxed font-medium text-zinc-500">
                  {cs.impact}
                </p>

                <div className="mt-auto w-full border-t border-black/10 pt-8">
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#ff4500]" />
                    <span className="text-sm font-black tracking-widest text-zinc-900 uppercase">
                      Key Result
                    </span>
                  </div>
                  <div className="text-xl font-black text-zinc-900">
                    {cs.results}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative mt-32 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/30 to-transparent opacity-80" />
            <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/5">
              <Users className="h-8 w-8 text-[#ff4500]" />
            </div>
            <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
              Be our next success <span className="text-[#ff4500]">story</span>
            </h2>
            <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
              Join 100+ startups getting organic leads and making data-driven
              product decisions every day.
            </p>
            <button className="flex items-center gap-3 rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-5 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]">
              Start Mining Insights <Target className="h-6 w-6" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
