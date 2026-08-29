/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Compass,
  ArrowRight,
  Target,
  DollarSign,
  Briefcase,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Spot $10k/mo Micro-SaaS Niches Hiding in Plain Sight | ThreddIQ Blog",
  description: "A proven playbook for finding boring, high-margin B2B software ideas in professional subreddits with low churn and zero VC competition.",
};

const nicheCriteria = [
  {
    title: "1. Industry-Specific Compliance & Regulatory Changes",
    desc: "Every time a government mandate or state compliance rule updates (OSHA, HIPAA, GDPR, local tax laws), existing enterprise software takes 18 months to adapt. Micro-SaaS founders build focused solutions in 3 weeks and capture desperate niche buyers.",
    examples: "r/tax, r/legaladvice, r/smallbusiness",
  },
  {
    title: "2. The 'Excel Sheet with 50 Tabs' Syndrome",
    desc: "When business owners post asking how to automate formulas in massive Google Sheets or Excel workbooks, they are telling you they have outgrown spreadsheets but cannot afford a $50k enterprise ERP. That gap is a $10k/mo SaaS product.",
    examples: "r/excel, r/logistics, r/supplychain",
  },
  {
    title: "3. Fragmented Local Service Operations",
    desc: "HVAC contractors, commercial cleaning crews, and property managers do not want generic CRMs. They want dispatch software, route optimization, and customer SMS review collection tailored to their exact workflow.",
    examples: "r/sweatystartup, r/HVAC, r/commercialcleaning",
  },
];

export default function BlogPost() {
  return (
    <div className="min-h-screen landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-bold text-zinc-600 uppercase tracking-widest">
          <Link href="/blog" className="hover:text-[#ff4500] transition-colors">
            Blog
          </Link>
          <span>/</span>
          <span>Micro-SaaS</span>
        </div>

        {/* Header */}
        <header className="mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-3.5 py-1 text-xs font-black text-[#ff4500] uppercase tracking-widest">
            <Compass className="h-3.5 w-3.5" />
            Niche Discovery Playbook
          </div>
          <h1 className="mb-6 text-[40px] leading-[1.1] font-black tracking-tight text-zinc-900 md:text-[52px]">
            How to Spot $10k/mo Micro-SaaS Niches Hiding in Plain Sight
          </h1>
          <p className="text-xl font-medium text-zinc-600 leading-relaxed">
            The most profitable indie software businesses are rarely flashy consumer apps. They are boring B2B workflow automations discovered in niche professional communities.
          </p>
          <div className="mt-8 flex items-center gap-4 border-y border-black/5 py-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">
            <span>By ThreddIQ Research</span>
            <span>&bull;</span>
            <span>August 2026</span>
            <span>&bull;</span>
            <span>8 min read</span>
          </div>
        </header>

        {/* Content */}
        <div className="space-y-12 text-base leading-relaxed text-zinc-700">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-zinc-900">
              Why 'Boring' Is Where Bootstrappers Win
            </h2>
            <p>
              Venture-backed startups compete for billion-dollar TAMs like CRM, email marketing, and general project management. Indie founders, on the other hand, build sustainable wealth by dominating narrow, underserved verticals with 500 to 2,000 potential customers who eagerly pay $49–$199/month.
            </p>
            <p>
              The best place to find these verticals is not TechCrunch or Product Hunt—it is in subreddits where professionals vent about the everyday clunkiness of their operational tools.
            </p>
          </section>

          {/* Criteria Cards */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-900">
              3 Signals of a Goldmine Niche
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {nicheCriteria.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs space-y-3"
                >
                  <h3 className="text-lg font-black text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-2 pt-2 text-xs font-bold text-[#ff4500]">
                    <span>Target subreddits:</span>
                    <span className="font-mono">{item.examples}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Checklist */}
          <section className="rounded-3xl border border-[#ff4500]/20 bg-[#ff4500]/5 p-8">
            <h3 className="mb-4 text-xl font-black text-zinc-900">
              The 4-Step Validation Checklist
            </h3>
            <ul className="space-y-3 text-sm font-medium text-zinc-700">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#ff4500] shrink-0" />
                <span>Can users quantify the money or hours this problem costs them?</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#ff4500] shrink-0" />
                <span>Are they already paying for imperfect software or manual workarounds?</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#ff4500] shrink-0" />
                <span>Can you reach 50 potential buyers directly in public communities?</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#ff4500] shrink-0" />
                <span>Is the market size large enough for $10k MRR but too small for Salesforce or Oracle?</span>
              </li>
            </ul>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-[32px] border border-black/10 bg-zinc-900 p-8 text-center text-white shadow-xl md:p-12">
          <h3 className="mb-4 text-2xl font-black md:text-3xl">
            Find your next micro-SaaS in minutes
          </h3>
          <p className="mx-auto mb-8 max-w-xl text-sm font-medium text-zinc-400">
            ThreddIQ mines 1,400+ specialized subreddits to surface high-converting B2B software ideas backed by real demand.
          </p>
          <Button
            asChild
            className="h-12 rounded-full bg-[#ff4500] px-8 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#e03d00]"
          >
            <Link href="/sign-up?plan=starter">
              Start Mining for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
