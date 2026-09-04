/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  Users,
  MessageCircle,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Best Subreddits for Finding B2B SaaS Ideas in 2026 | ThreddIQ Blog",
  description:
    "The definitive guide to the highest-signal subreddits for B2B SaaS idea validation — where founders, operators, and engineers complain about the tools they use every day.",
};

const subreddits = [
  {
    name: "r/SaaS",
    desc: "The motherlode. Founders and operators post daily about what's broken in their stack — billing headaches, analytics gaps, integration pains. Watch for 'any tool that does X' posts; those are feature requests with budgets attached.",
    focus: "Billing, CRM, analytics, deployment",
    score: "10/10",
  },
  {
    name: "r/startups",
    desc: "Earlier stage than r/SaaS, which means rawer complaints. Founders here are cost-sensitive and vocal about what they refuse to pay for. Excellent for spotting pricing-model opportunities and underserved niches.",
    focus: "Pricing, growth tools, founder pain",
    score: "9/10",
  },
  {
    name: "r/webdev",
    desc: "Developers complaining about their toolchain is free market research. Hosting costs, CI/CD friction, framework fatigue — every complaint is a feature waiting to be built.",
    focus: "Dev tools, hosting, CI/CD, APIs",
    score: "8/10",
  },
  {
    name: "r/ProductManagement",
    desc: "PMs talk openly about what their existing tools don't do. Roadmap gaps, prioritization frameworks, stakeholder management — if you're building for product people, this is your focus group.",
    focus: "Roadmapping, analytics, user research",
    score: "8/10",
  },
  {
    name: "r/ExperiencedDevs",
    desc: "Senior engineers with real budget authority. Their complaints cut deep — architecture debt, monitoring gaps, deployment friction. Higher signal-to-noise than general dev subs.",
    focus: "Architecture, monitoring, infra",
    score: "9/10",
  },
  {
    name: "r/consulting",
    desc: "Consultants use every SaaS tool under the sun and have zero loyalty to any of them. Their complaints are brutally honest and often include exact dollar figures they'd pay for a fix.",
    focus: "CRM, reporting, billing, automation",
    score: "7/10",
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
          <span className="text-zinc-900">Guide</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black tracking-widest text-[#ff4500] uppercase">
            <Users className="h-3.5 w-3.5" /> Guide
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            Best Subreddits for Finding
            <br className="hidden md:block" />
            <span className="text-[#ff4500]"> B2B SaaS Ideas</span> in 2026
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Not all subreddits are created equal. Here are the highest-signal
            communities for B2B SaaS idea validation — ranked by desperation
            score density, budget mention frequency, and how likely the posters
            are to become paying customers.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            The top B2B SaaS subreddits
          </h2>
          <p className="mb-10 text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">
            These subreddits consistently produce high-desperation,
            budget-present pain points. Each one has its own signal profile —
            knowing which to track depends on what you're building.
          </p>
          <div className="space-y-8">
            {subreddits.map((sub, i) => (
              <div
                key={i}
                className="glass-card rounded-[32px] p-8 transition-all hover:shadow-lg"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900">
                      {sub.name}
                    </h3>
                    <span className="text-sm font-bold text-zinc-400">
                      Signal density: {sub.score}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
                    {sub.score}
                  </span>
                </div>
                <p className="mb-4 text-lg leading-relaxed font-medium text-zinc-500">
                  {sub.desc}
                </p>
                <div className="flex items-center gap-2 text-xs font-black tracking-widest text-zinc-400 uppercase">
                  <Zap className="h-3.5 w-3.5 text-[#ff4500]" /> {sub.focus}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mb-32 rounded-[48px] p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">
            How to track them all at once
          </h2>
          <p className="mb-8 text-lg leading-relaxed font-medium text-zinc-500">
            Manually monitoring even three of these subreddits is a full-time
            job. ThreddIQ lets you track all of them — and hundreds more — from
            a single dashboard. Set keyword filters, desperation score
            thresholds, and budget signal detection, then get alerts when
            something worth your attention drops.
          </p>
          <p className="text-lg leading-relaxed font-medium text-zinc-500">
            For a complete list by industry, check out our{" "}
            <Link
              href="/resources/best-subreddits-by-industry"
              className="font-bold text-[#ff4500] underline underline-offset-4 transition-colors hover:text-zinc-900"
            >
              Best Subreddits by Industry
            </Link>{" "}
            resource page.
          </p>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            Beyond the big six
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "r/Entrepreneur",
                desc: "Broader audience but rich in 'I wish there was a tool that…' posts. Filter for threads with 50+ comments — engagement signals genuine pain.",
              },
              {
                title: "r/smallbusiness",
                desc: "Owner-operators who buy tools with their own money. Their complaints are cost-anchored and specific. Excellent for validating pricing models.",
              },
              {
                title: "r/LeadGeneration",
                desc: "A niche sub where people literally describe what they'd pay for. If you're building a sales or marketing tool, this is a goldmine.",
              },
              {
                title: "r/CRM",
                desc: "Dedicated entirely to CRM complaints. Every post is a feature request in disguise. Track this sub alone and you'll have a year-long roadmap.",
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
            &ldquo;The difference between a good SaaS idea and a great one is
            usually just a better subreddit. Pick the wrong community and you'll
            validate noise. Pick the right one and your next feature is already
            written for you.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-zinc-500 italic md:text-2xl">
            Start with these six subreddits and you'll have more validated pain
            points than you can build for. The key is consistency — check daily,
            score every complaint, and build what the data tells you to build.
          </p>
        </section>

        <div className="glass-card relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Search className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Track all of them in{" "}
            <span className="text-[#ff4500]">one place</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ monitors 1,400+ subreddits and surfaces the pain points
            that matter. No manual scanning required.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]"
            >
              <Link href="/sign-up">
                Start Tracking <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
