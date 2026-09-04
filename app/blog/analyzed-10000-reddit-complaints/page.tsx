/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  BarChart3,
  TrendingUp,
  PieChart,
  AlertCircle,
  Lightbulb,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "We Analyzed 10,000 Reddit Complaints — Here's What SaaS Founders Are Actually Building | ThreddIQ Blog",
  description:
    "After parsing 10,000 Reddit complaints from 200+ SaaS-related subreddits, we found the five categories where founder attention clusters — and the one nobody's building for.",
};

const stats = [
  { value: "10,000", label: "Reddit complaints analyzed" },
  { value: "200+", label: "SaaS subreddits monitored" },
  { value: "5", label: "Dominant pain categories" },
  { value: "1", label: "Underserved opportunity cluster" },
];

const categories = [
  {
    name: "Billing & Subscription Management",
    pct: "28%",
    desc: "By far the largest cluster. Failed payments, proration confusion, upgrade/downgrade friction, invoice disputes. Every SaaS business deals with billing, and almost none of them enjoy it. Posts here average the highest desperation scores because billing problems lose revenue directly.",
    building: "High — 12+ active YC startups in this space",
  },
  {
    name: "Analytics & Reporting",
    pct: "22%",
    desc: "Too much data, not enough insight. Founders complain about tools that surface vanity metrics instead of actionable signals. The gap between 'what happened' and 'what to do about it' is where most analytics tools fail. GA4 hate alone accounts for 4% of all complaints.",
    building: "High — crowded space, differentiation is hard",
  },
  {
    name: "CRM & Sales Tools",
    pct: "18%",
    desc: "CRMs are universally loathed but tolerated. Complaints center on data entry burden, poor automation, and the gap between sales and product feedback loops. Founders want lightweight alternatives that don't require a dedicated admin.",
    building: "Medium — incumbents are sticky but vulnerable",
  },
  {
    name: "Customer Support & In-App Communication",
    pct: "15%",
    desc: "Founders building for other SaaS companies are obsessed with support tooling. Ticket management, knowledge bases, chatbots, and user messaging all show strong complaint velocity. The 'too many tools' problem is acute here.",
    building: "Medium-high — growing with AI support agents",
  },
  {
    name: "Dev Tools & Infrastructure Monitoring",
    pct: "12%",
    desc: "Uptime monitoring, logging, and deployment tooling generate fewer total complaints but higher specificity. When a dev tool complaint appears, it almost always includes a budget signal. These users know exactly what they want and how much they'd pay.",
    building: "Medium — entrenched players, small surface area",
  },
];

export default function BlogPost() {
  return (
    <div className="landing-gradient min-h-screen font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-32 pb-24">
        <div className="mb-12 flex items-center gap-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
          <Link href="/" className="transition-colors hover:text-zinc-900">
            Home
          </Link>
          <span className="text-zinc-300">/</span>
          <Link href="/blog" className="transition-colors hover:text-zinc-900">
            Blog
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-900">Research</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black tracking-widest text-[#ff4500] uppercase">
            <BarChart3 className="h-3.5 w-3.5" /> Research
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            We analyzed{" "}
            <span className="text-[#ff4500]">10,000 Reddit complaints</span>
            <br className="hidden md:block" />
            here's what SaaS founders are actually building
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            We ran 10,000 raw Reddit complaints through ThreddIQ's signal
            analysis pipeline. The results show exactly where founder attention
            is concentrated — and where the biggest gap between demand and
            supply still exists.
          </p>
        </header>

        <div className="mb-24 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card rounded-[24px] p-6 text-center">
              <p className="text-4xl font-black text-[#ff4500] md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-black tracking-widest text-zinc-500 uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <section className="mb-24">
          <h2 className="mb-6 text-3xl font-black text-zinc-900 md:text-4xl">
            The data set
          </h2>
          <p className="mb-10 text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">
            We pulled 10,000 posts from 200+ SaaS-adjacent subreddits logged
            between April and June 2026. Each post was scored for desperation
            level, budget signal presence, competitor mentions, and pain
            category. Here's what we found.
          </p>

          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            The five pain categories (ranked by volume)
          </h2>
          <div className="space-y-8">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="glass-card rounded-[32px] p-8 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-2xl font-black text-zinc-900">
                      {i + 1}. {cat.name}
                    </h3>
                    <span className="text-sm font-bold text-zinc-400">
                      {cat.building}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#ff4500]/10 px-4 py-1 text-lg font-black text-[#ff4500]">
                    {cat.pct}
                  </span>
                </div>
                <p className="text-lg leading-relaxed font-medium text-zinc-500">
                  {cat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mb-32 rounded-[48px] p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">
            The underserved opportunity
          </h2>
          <p className="mb-8 text-lg leading-relaxed font-medium text-zinc-500">
            While billing and analytics get the most founder attention, one
            category is conspicuously underserved relative to complaint volume:{" "}
            <strong className="text-zinc-900">
              customer support and in-app communication
            </strong>
            .
          </p>
          <p className="mb-8 text-lg leading-relaxed font-medium text-zinc-500">
            Despite representing 15% of all high-desperation complaints, this
            category has fewer than half the active startups targeting it
            compared to billing or analytics. The complaints are specific,
            budget-backed, and recurring. Every SaaS needs a support stack, and
            most founders are unhappy with theirs.
          </p>
          <div className="rounded-[24px] border border-[#ff4500]/20 bg-[#ff4500]/5 p-8">
            <p className="text-lg font-black text-zinc-900 italic">
              "If we had to pick one category to build in based purely on data,
              it would be customer support tooling. The demand signal is loud,
              the competition is fragmented, and the switching costs are low."
            </p>
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            Key takeaways for founders
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Red flag markets (billing + analytics)",
                desc: "These are the most crowded founder targets. Unless you have a genuine breakthrough, you're fighting for attention against dozens of well-funded competitors. The data says demand is high — but so is supply.",
              },
              {
                title: "Green flag (support + communication)",
                desc: "Less competition, strong demand, and a clear pain narrative. Support tools also benefit from AI tailwinds — incumbents are slow to adapt.",
              },
              {
                title: "Don't ignore dev tools",
                desc: "Lower volume but higher conversion potential. Dev tool buyers arrive with budget pre-approved. A single well-executed tool can be a million-dollar business with 50 customers.",
              },
              {
                title: "General CRMs are a trap",
                desc: "The 18% CRM complaint share is real, but the incumbents (Salesforce, HubSpot) are entrenched. Better to build for a CRM sub-niche — proposal management, contact enrichment, pipeline visualization — than compete head-on.",
              },
            ].map((tip, i) => (
              <div key={i} className="glass-card rounded-[24px] p-8">
                <h3 className="mb-3 text-lg font-black text-zinc-900">
                  {tip.title}
                </h3>
                <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mb-32 rounded-r-[32px] border-l-4 border-[#ff4500] px-10 py-12">
          <blockquote className="text-3xl leading-tight font-black text-zinc-900 italic md:text-4xl">
            &ldquo;The data doesn't tell you what to build. It tells you what
            people are frustrated enough to write about. The difference between
            a good idea and a bad one is whether that frustration comes with a
            wallet attached.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-zinc-500 italic md:text-2xl">
            This analysis was powered by ThreddIQ's signal engine. Want to run
            this same analysis on your specific niche? Every ThreddIQ account
            surfaces these categories automatically.
          </p>
        </section>

        <div className="glass-card relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <PieChart className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Run your own <span className="text-[#ff4500]">data analysis</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ automatically categorizes, scores, and surfaces every pain
            point across 1,400+ subreddits. See the data for your market.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]"
            >
              <Link href="/sign-up">
                Analyze Your Market <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
