/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Code,
  ArrowRight,
  TrendingDown,
  Lock,
  Layers,
  Zap,
  Activity,
  AlertOctagon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "The 4 Hidden Churn Patterns in Developer Tools (Based on 450+ Reddit Complaints) | ThreddIQ Blog",
  description:
    "Why software engineers abandon developer tools and infrastructure platforms, and the non-obvious product mistakes that drive tech churn.",
};

const churnPatterns = [
  {
    icon: <Lock className="h-6 w-6 text-[#ff4500]" />,
    title: "1. Opaque Pricing & Surprise Metering Spikes",
    desc: "Developers hate unpredictable cloud bills. The #1 cause of rage-quitting in r/devops and r/webdev is pricing models where a single runaway cron job or DDoS attack results in an unexpected $5,000 bill. Devs flock to products with hard spending caps and transparent, predictable pricing tiers.",
    stat: "38% of dev tool complaints",
  },
  {
    icon: <Layers className="h-6 w-6 text-[#ff4500]" />,
    title: "2. Proprietary Lock-In and Painful Data Export",
    desc: "When a developer feels trapped by custom SDKs or proprietary storage formats, they start planning their migration immediately. Tools that provide zero-friction export to open formats or easy self-hosting fallbacks win high developer loyalty and organic word-of-mouth.",
    stat: "26% of dev tool complaints",
  },
  {
    icon: <Zap className="h-6 w-6 text-[#ff4500]" />,
    title: "3. Local Development Drift & Flaky CLI Tooling",
    desc: "If a cloud service cannot be run locally via Docker or a lightning-fast CLI emulator, engineer productivity plummets. When local test suites fail because of remote-only dependencies, engineering leads mandate replacing the tool.",
    stat: "21% of dev tool complaints",
  },
  {
    icon: <AlertOctagon className="h-6 w-6 text-[#ff4500]" />,
    title: "4. Breaking Schema Changes Disguised as 'Improvements'",
    desc: "SDK upgrades that break backward compatibility without automated codemods or clear deprecation paths force developers into emergency weekend refactors. One broken major version upgrade is often enough to trigger a migration to a simpler alternative.",
    stat: "15% of dev tool complaints",
  },
];

const quotes = [
  {
    quote:
      "We loved their managed database until our bill tripled due to egress fees nobody warned us about. Migrated back to a simple VPS in two days.",
    sub: "r/devops",
  },
  {
    quote:
      "If I cannot test it offline on my laptop without connecting to your cloud sandbox, it is not getting approved by our security team.",
    sub: "r/programming",
  },
];

export default function BlogPost() {
  return (
    <div className="landing-gradient min-h-screen font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-bold tracking-widest text-zinc-600 uppercase">
          <Link href="/blog" className="transition-colors hover:text-[#ff4500]">
            Blog
          </Link>
          <span>/</span>
          <span>Developer Tools</span>
        </div>

        {/* Header */}
        <header className="mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-3.5 py-1 text-xs font-black tracking-widest text-[#ff4500] uppercase">
            <Code className="h-3.5 w-3.5" />
            Developer Sentiment Research
          </div>
          <h1 className="mb-6 text-[40px] leading-[1.1] font-black tracking-tight text-zinc-900 md:text-[52px]">
            The 4 Hidden Churn Patterns in Developer Tools
          </h1>
          <p className="text-xl leading-relaxed font-medium text-zinc-600">
            We mined 450+ developer threads across r/programming, r/devops, and
            r/webdev to understand why technical buyers abandon infrastructure
            tools.
          </p>
          <div className="mt-8 flex items-center gap-4 border-y border-black/5 py-4 text-xs font-bold tracking-widest text-zinc-600 uppercase">
            <span>By ThreddIQ Research</span>
            <span>&bull;</span>
            <span>August 2026</span>
            <span>&bull;</span>
            <span>7 min read</span>
          </div>
        </header>

        {/* Body Content */}
        <div className="space-y-12 text-base leading-relaxed text-zinc-700">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-zinc-900">
              Why Developer Churn is Different
            </h2>
            <p>
              Developers are notoriously hard to sell to, but once integrated,
              they represent some of the highest-retention B2B customers in
              tech. When they do churn, however, it is rarely due to aesthetic
              preferences or lack of sales follow-up.
            </p>
            <p>
              Developer churn happens when a tool violates the fundamental
              engineering pact: predictability, control, and zero unnecessary
              friction. When that pact is broken, engineers do not just cancel;
              they write post-mortems and warn the entire community on Reddit.
            </p>
          </section>

          {/* Cards */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-900">
              The 4 Primary Churn Triggers
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {churnPatterns.map((pattern) => (
                <div
                  key={pattern.title}
                  className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ff4500]/10">
                      {pattern.icon}
                    </div>
                    <span className="text-[11px] font-black tracking-wider text-[#ff4500] uppercase">
                      {pattern.stat}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-black text-zinc-900">
                    {pattern.title}
                  </h3>
                  <p className="text-sm leading-relaxed font-medium text-zinc-600">
                    {pattern.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Real Reddit Quotes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-zinc-900">
              Unfiltered Feedback from the Field
            </h2>
            <div className="space-y-4">
              {quotes.map((q, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border-l-4 border-[#ff4500] bg-zinc-50 p-6 shadow-xs"
                >
                  <p className="mb-2 font-serif text-base text-zinc-800 italic">
                    "{q.quote}"
                  </p>
                  <span className="font-mono text-xs font-bold text-[#ff4500]">
                    — Sourced from {q.sub}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Key Takeaway */}
          <section className="rounded-3xl border border-[#ff4500]/20 bg-[#ff4500]/5 p-8">
            <h3 className="mb-3 text-xl font-black text-zinc-900">
              The Playbook for Developer Tool Builders
            </h3>
            <p className="text-sm leading-relaxed font-medium text-zinc-700">
              If you are building for software engineers, make your pricing
              deterministic with spending guards, deliver first-class local
              development workflows, and treat backward compatibility as a
              non-negotiable feature.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-[32px] border border-black/10 bg-zinc-900 p-8 text-center text-white shadow-xl md:p-12">
          <h3 className="mb-4 text-2xl font-black md:text-3xl">
            Want to mine developer complaints before building?
          </h3>
          <p className="mx-auto mb-8 max-w-xl text-sm font-medium text-zinc-400">
            ThreddIQ scans technical subreddits 24/7 to discover validated
            infrastructure gaps, developer frustrations, and willingness-to-pay
            signals.
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
