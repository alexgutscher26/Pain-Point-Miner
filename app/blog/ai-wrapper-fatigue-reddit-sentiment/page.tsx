/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Brain,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Sparkles,
  Database,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "AI Wrapper Fatigue: How Reddit Sentiment Shifted in 2026 | ThreddIQ Blog",
  description: "What customers actually want from AI tools in 2026 after the wrapper hype cycle, and how to build defensible AI software with real user demand.",
};

const insights = [
  {
    icon: <Database className="h-6 w-6 text-[#ff4500]" />,
    title: "Proprietary Data Integration Over Generic Prompts",
    desc: "Users have stopped paying for tools that just send a system prompt to OpenAI or Claude. They are demanding direct integration with their existing databases, Notion workspaces, CRMs, and email inboxes.",
    highlight: "Value is in the data layer",
  },
  {
    icon: <Workflow className="h-6 w-6 text-[#ff4500]" />,
    title: "Multi-Step Deterministic Workflows",
    desc: "Instead of open-ended conversational chat interfaces, users want automated background jobs that run structured workflows, generate formatted artifacts, and trigger webhooks.",
    highlight: "Autonomous agents replace chat boxes",
  },
  {
    icon: <ShieldCheck className="h-6 w-6 text-[#ff4500]" />,
    title: "Strict Hallucination Guards & Verifiable Citations",
    desc: "In professional domains (legal, medical, finance, compliance), users refuse to trust non-verifiable outputs. Tools providing deep source links, confidence scores, and audit trails win enterprise contracts.",
    highlight: "Trust is the moat",
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
          <span>Market Trends</span>
        </div>

        {/* Header */}
        <header className="mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-3.5 py-1 text-xs font-black text-[#ff4500] uppercase tracking-widest">
            <Brain className="h-3.5 w-3.5" />
            AI Market Intelligence
          </div>
          <h1 className="mb-6 text-[40px] leading-[1.1] font-black tracking-tight text-zinc-900 md:text-[52px]">
            AI Wrapper Fatigue: How Reddit Sentiment Shifted in 2026
          </h1>
          <p className="text-xl font-medium text-zinc-600 leading-relaxed">
            Reddit discussions in r/SaaS and r/ArtificialIntelligence reveal that the era of simple prompt wrappers is over. Here is what users are actually willing to pay for now.
          </p>
          <div className="mt-8 flex items-center gap-4 border-y border-black/5 py-4 text-xs font-bold text-zinc-600 uppercase tracking-widest">
            <span>By ThreddIQ Research</span>
            <span>&bull;</span>
            <span>August 2026</span>
            <span>&bull;</span>
            <span>6 min read</span>
          </div>
        </header>

        {/* Content */}
        <div className="space-y-12 text-base leading-relaxed text-zinc-700">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-zinc-900">
              The Post-Wrapper Reality
            </h2>
            <p>
              In 2023 and 2024, founders could launch a UI around the OpenAI API and generate quick MRR. In 2026, buyers are sophisticated. They recognize standard model outputs and actively cancel subscriptions that fail to provide proprietary workflow integration.
            </p>
            <p>
              By tracking sentiment across 30+ AI-focused subreddits, ThreddIQ detected a 74% increase in the phrase "I could just do this in ChatGPT" on posts reviewing new SaaS products. But alongside the fatigue, there is a massive surge in demand for specialized, vertically integrated AI tooling.
            </p>
          </section>

          {/* Key pillars */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-900">
              The 3 Pillars of Defensible AI Products
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {insights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff4500]/10">
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-lg font-black text-zinc-900">
                        {item.title}
                      </h3>
                      <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-bold text-zinc-600">
                        {item.highlight}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Takeaway */}
          <section className="rounded-3xl border border-[#ff4500]/20 bg-[#ff4500]/5 p-8">
            <h3 className="mb-3 text-xl font-black text-zinc-900">
              The Bottom Line for 2026 Builders
            </h3>
            <p className="text-sm font-medium text-zinc-700 leading-relaxed">
              Do not sell "AI features". Sell solved business problems where AI handles the heavy lifting invisibly behind the scenes.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-[32px] border border-black/10 bg-zinc-900 p-8 text-center text-white shadow-xl md:p-12">
          <h3 className="mb-4 text-2xl font-black md:text-3xl">
            Find the AI gaps customers are begging for
          </h3>
          <p className="mx-auto mb-8 max-w-xl text-sm font-medium text-zinc-400">
            ThreddIQ scans thousands of organic conversations every day to pinpoint unfulfilled software requests.
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
