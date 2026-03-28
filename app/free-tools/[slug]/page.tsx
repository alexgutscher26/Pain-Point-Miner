import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import {
  Search,
  Sparkles,
  TrendingUp,
  Filter,
  MessageSquare,
  Target,
  ArrowRight,
  Zap,
  Database,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

const freeTools = {
  "pain-point-miner": {
    title: "Free Reddit Pain Point Miner",
    tagline: "Instantly extract root frustrations from any subreddit.",
    description:
      "Our AI-powered engine scans the top 100 threads in any subreddit to find the 'Desperation Index'. This tool helps you validate SaaS ideas before writing a single line of code.",
    icon: <Search className="h-12 w-12 text-[#ff4500]" />,
    placeholder: "e.g. r/startups or r/SaaS",
    buttonText: "Mine Insights",
    seoKeywords: [
      "reddit pain points",
      "validation tool",
      "market research free",
      "saas idea finder",
    ],
    demoResult: {
      label: "Top Pain Point",
      value: "High churn in PLG tools",
      confidence: "94%",
    },
  },
  "opportunity-scoreboard": {
    title: "Reddit Opportunity Scoreboard",
    tagline: "Score any market niche based on Reddit activity and sentiment.",
    description:
      "Enter a keyword, and we'll scan its ecosystem on Reddit. We calculate the Opportunity Score based on thread volume, upvote velocity, and comment density.",
    icon: <TrendingUp className="h-12 w-12 text-emerald-500" />,
    placeholder: "e.g. 'Project Management' or 'Next.js'",
    buttonText: "Check Score",
    seoKeywords: [
      "reddit opportunity",
      "market score",
      "keyword research reddit",
      "niche validation",
    ],
    demoResult: {
      label: "Niche Score",
      value: "8.4 / 10",
      confidence: "High Demand",
    },
  },
  "sentiment-context-map": {
    title: "Sentiment Context Map",
    tagline: "Map the emotional tone of any Reddit conversation.",
    description:
      "Upload a Reddit thread URL to see a sentiment map. We categorize comments into 'Desperate', 'Frustrated', 'Indifferent', and 'Happy' using advanced NLP.",
    icon: <Filter className="h-12 w-12 text-blue-500" />,
    placeholder: "Paste Reddit Thread URL...",
    buttonText: "Map Sentiment",
    seoKeywords: [
      "reddit sentiment analysis",
      "thread tone checker",
      "reddit nlp",
      "customer sentiment tool",
    ],
    demoResult: {
      label: "Emotional Tone",
      value: "Predominantly Frustrated",
      confidence: "72% Desperation",
    },
  },
  "reddit-lead-generator": {
    title: "Reddit Lead Generator (Lite)",
    tagline: "Find the exact users who need your solution right now.",
    description:
      "Scan for users asking 'How do I X?' or 'Alternatives to Y'. This tool gives you a list of prospective customers who are actively looking for a solution.",
    icon: <MessageSquare className="h-12 w-12 text-purple-500" />,
    placeholder: "e.g. 'Looking for a CRM'",
    buttonText: "Generate Leads",
    seoKeywords: [
      "reddit lead generation",
      "find customers on reddit",
      "outreach tool",
      "market intelligence",
    ],
    demoResult: {
      label: "Leads Found",
      value: "42 Qualified Users",
      confidence: "Real Intent",
    },
  },
};

export async function generateStaticParams() {
  return Object.keys(freeTools).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = freeTools[slug as keyof typeof freeTools];
  if (!tool) return {};

  return {
    title: `${tool.title} - Free Tools | ${siteConfig.name}`,
    description: tool.description,
    keywords: tool.seoKeywords.join(", "),
  };
}

export default async function FreeToolPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const tool = freeTools[slug as keyof typeof freeTools];

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] font-sans text-zinc-300 selection:bg-[#ff4500]/30">
      <Header />

      <main className="flex flex-col items-center px-6 pt-32 pb-24">
        <div className="w-full max-w-[1240px]">
          {/* Section Header */}
          <header className="mb-20 text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/10 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-[#ff4500]" />
              <span className="text-xs font-black tracking-widest text-white uppercase">
                Free SEO Tool
              </span>
            </div>
            <h1 className="mb-6 text-[48px] leading-tight font-extrabold tracking-tight text-white md:text-[80px]">
              {tool.title}
            </h1>
            <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-zinc-400 md:text-2xl">
              {tool.tagline}
            </p>
          </header>

          {/* Interactive Tool UI */}
          <section className="group relative mb-24 overflow-hidden rounded-[48px] border-2 border-white/5 bg-[#0f0f0f] p-8 shadow-2xl md:p-16">
            <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 bg-[#ff4500]/10 opacity-20 blur-[100px] transition-opacity group-hover:opacity-40" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 bg-blue-500/10 opacity-10 blur-[100px]" />

            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center">
              <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-6 transition-transform duration-500 group-hover:scale-110">
                {tool.icon}
              </div>

              <div className="relative mb-8 w-full">
                <input
                  type="text"
                  placeholder={tool.placeholder}
                  className="w-full rounded-2xl border border-white/10 bg-black/50 px-8 py-6 text-lg font-bold text-white shadow-2xl outline-hidden transition-all focus:border-[#ff4500]/50 md:rounded-3xl md:text-xl"
                />
                <div className="absolute top-1/2 right-4 hidden -translate-y-1/2 md:block">
                  <Database className="h-6 w-6 text-zinc-700" />
                </div>
              </div>

              <Button
                size="lg"
                className="mb-12 w-full rounded-2xl bg-[#ff4500] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 hover:bg-[#ff5a1a]"
              >
                {tool.buttonText} <ArrowRight className="ml-2 h-6 w-6" />
              </Button>

              {/* Demo Result Visualizer */}
              <div className="w-full animate-pulse rounded-3xl border border-white/5 bg-black/30 p-8 opacity-40 grayscale backdrop-blur-md transition-all group-hover:animate-none group-hover:opacity-100 group-hover:grayscale-0">
                <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                  <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
                    <span className="text-[11px] font-black tracking-widest text-zinc-500 uppercase">
                      {tool.demoResult.label}
                    </span>
                    <span className="text-2xl font-black text-white">
                      {tool.demoResult.value}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center sm:items-end sm:text-right">
                    <span className="text-[11px] font-black tracking-widest text-zinc-500 uppercase">
                      Reliability Score
                    </span>
                    <span className="text-2xl font-black text-emerald-500">
                      {tool.demoResult.confidence}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex flex-col items-center gap-1"></div>
              </div>
            </div>
          </section>

          {/* Features / SEO Content */}
          <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
            <div>
              <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-white">
                How our {tool.title} helps you build better products.
              </h2>
              <p className="mb-10 text-xl leading-relaxed font-medium text-zinc-400">
                {tool.description} Unlike manual research, our AI doesn&apos;t
                just look for words—it looks for intent, desperation, and
                willingness to pay.
              </p>
              <ul className="space-y-6">
                {[
                  "Scan unlimited threads with semantic grouping.",
                  "Filter by specific sentiment markers (e.g. 'I hate that...').",
                  "Export your research as high-quality validation data.",
                  "Use it for programmatic SEO and market targeting.",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-4">
                    <Zap className="mt-0.5 h-6 w-6 shrink-0 text-[#ff4500]" />
                    <span className="text-lg font-bold text-zinc-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="group rounded-[40px] border border-white/5 bg-linear-to-b from-[#1c0c0a] to-[#0a0a0a] p-12 text-center">
              <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/5 transition-transform duration-500 group-hover:rotate-12">
                <Target className="h-10 w-10 text-[#ff4500]" />
              </div>
              <h3 className="mb-6 text-3xl font-extrabold text-white">
                Want to unlock full power?
              </h3>
              <p className="mb-10 text-xl font-medium text-zinc-500">
                Get pro monitoring, unlimited scans, and advanced AI reporting
                with a premium ThreddIQ account.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full rounded-2xl bg-[#ff4500] py-7 text-xl font-black text-white hover:bg-[#ff5a1a]"
              >
                <Link href="/sign-up">Start 3-Day Free Trial</Link>
              </Button>
              <p className="mt-6 text-[11px] font-bold tracking-widest text-zinc-600 uppercase">
                Cancel anytime • No credit card required
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
