import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import {
  Target,
  Bot,
  Shield,
  MessageSquare,
  Bell,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Feature {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  details: string;
  gradient: string;
  howItWorks?: { title: string; desc: string }[];
  useCases?: { title: string; desc: string }[];
  preview?: {
    type: string;
    target: string;
    intensity: string;
    insight: string;
    score: number;
  };
}

const features: Record<string, Feature> = {
  "pain-point-mining": {
    title: "AI Pain Point Mining",
    subtitle: "Stop guessing. Find the real problems your customers are already venting about.",
    description:
      "Our AI engine doesn't just scrape Reddit; it understands it. We scan thousands of horizontal and vertical communities to extract the underlying frustrations, manual workarounds, and unmet needs that represent your next big opportunity.",
    icon: <Bot className="h-12 w-12 text-[#ff4500]" />,
    benefits: [
      "Semantic clustering of 1,000+ individual rants",
      "Automatic root cause identification (not just symptoms)",
      "Sentiment-weighted priority based on frustration",
      "Direct quote extraction for customer research",
    ],
    details:
      "Most founders build products based on shallow keyword research. ThreddIQ identifies the 'Frustration Threshold'—the exact point where a user's annoyance becomes a willingness to pay. We group thousands of raw Reddit posts into structured 'Pain Pillars', showing you not just what people are saying, but the emotional intensity behind every complaint.",
    howItWorks: [
      {
        title: "Community Targeting",
        desc: "We monitor 100k+ subreddits to find where your potential audience lives and breathes.",
      },
      {
        title: "Contextual Extraction",
        desc: "Our AI filters out the noise, memes, and filler to find pure 'I wish there was a tool for...' moments.",
      },
      {
        title: "Opportunity Scoring",
        desc: "Every pain point is ranked by volume, upvote velocity, and emotional desperation.",
      },
    ],
    useCases: [
      {
        title: "SaaS Builders",
        desc: "Find low-competition technical problems in niche subreddits before they become mainstream trends.",
      },
      {
        title: "Product Managers",
        desc: "Validate your roadmap against real-world complaints. Stop building features based on loud minorities.",
      },
      {
        title: "Growth Marketers",
        desc: "Extract the exact language and 'hooks' your customers use to describe their frustrations for your ad copy.",
      },
    ],
    preview: {
      type: "Pain Point Analysis",
      target: "r/SaaS",
      intensity: "Critical (9.4/10)",
      insight: "Users are reporting 2+ hours wasted daily on manual spreadsheet reconciliation between Stripe and QuickBooks.",
      score: 88,
    },
    gradient: "from-orange-500/20 to-transparent",
  },
  "idea-validation": {
    title: "SaaS Idea Validation",
    subtitle: "Validate with real-world demand signals",
    description:
      "Stop guessing if your idea will work. Use upvotes, comment volume, and discussion frequency to measure hard validation signals from real communities.",
    icon: <Shield className="h-12 w-12 text-[#ff4500]" />,
    benefits: [
      "Upvote-weighted demand signals",
      "Historical sentiment tracking",
      "Competitor mention analysis",
      "Market saturation indicators",
    ],
    details:
      "We provide an Opportunity Score for every pain point found. This score aggregates upvotes, comment volume, and the frequency of mentions to give you a data-backed validation signal you can trust before writing a single line of code.",
    gradient: "from-blue-500/20 to-transparent",
  },
  "market-discovery": {
    title: "Market Discovery",
    subtitle: "Uncover underserved niches",
    description:
      "Find high-opportunity markets that everyone else is missing by analyzing community growth and problem density across 100k+ subreddits.",
    icon: <Bell className="h-12 w-12 text-[#ff4500]" />,
    benefits: [
      "Niche growth velocity tracking",
      "Cross-community trend detection",
      "Under-served subreddit identification",
      "Emerging problem alerts",
    ],
    details:
      "ThreddIQ maps out 'Problem Density' across different industries. We help you find the 'Goldilocks' subreddits: active enough to have volume, but underserved enough that users are still desperately asking for solutions.",
    gradient: "from-emerald-500/20 to-transparent",
  },
  "keyword-monitoring": {
    title: "Keyword Monitoring",
    subtitle: "Real-time niche surveillance",
    description:
      "Monitor specific technical terms, brand names, or competitor mentions across all of Reddit to stay on top of every high-intent conversation.",
    icon: <Target className="h-12 w-12 text-[#ff4500]" />,
    benefits: [
      "Real-time keyword alerts",
      "Regex-powered advanced filters",
      "Specific subreddit white-listing",
      "Automated mention reporting",
    ],
    details:
      "Stay ahead of the curve. Whether it's tracking mentions of a competitor's bugs or watching for people asking 'what is a good tool for...', ThreddIQ keeps you in the loop with real-time analytics and digests.",
    gradient: "from-indigo-500/20 to-transparent",
  },
  "sentiment-analysis": {
    title: "Sentiment Analysis",
    subtitle: "Measure the intensity of pain",
    description:
      "Go beyond 'positive' and 'negative'. Understand frustration levels, desperation, and willingness to pay through our proprietary AI sentiment engine.",
    icon: <MessageSquare className="h-12 w-12 text-[#ff4500]" />,
    benefits: [
      "Desperation index extraction",
      "Emotional intensity mapping",
      "Budget signal detection",
      "Context-aware mood tracking",
    ],
    details:
      "Not all complaints are equal. ThreddIQ detects the 'Desperation Index' — spotting users who explicitly mention budgets, timeline urgency, or the failures of existing expensive enterprise tools.",
    gradient: "from-fuchsia-500/20 to-transparent",
  },
};

export function generateStaticParams() {
  return Object.keys(features).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  const feature = features[slug as keyof typeof features];
  if (!feature) return {};

  return {
    title: `${feature.title} - ${siteConfig.name}`,
    description: feature.description,
  };
}

export default async function FeaturePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const feature = features[slug as keyof typeof features];

  if (!feature) {
    notFound();
  }

  return (
    <div className="min-h-screen overflow-x-hidden landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />

      <main className="flex flex-col items-center px-6 pt-32 pb-24">
        {/* Hero Section */}
        <section className="relative mb-24 w-full max-w-5xl">
          <div
            className={`bg-gradient-radial absolute -top-24 left-1/2 h-[400px] w-[600px] -translate-x-1/2 ${feature.gradient} pointer-events-none opacity-50 blur-[100px]`}
          />

          <div className="relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-2xl border border-black/10 bg-black/5 p-4 shadow-sm">
                {feature.icon}
              </div>
            </div>
            <h1 className="mb-6 text-[48px] leading-tight font-extrabold tracking-tight text-zinc-900 md:text-[64px]">
              {feature.title}
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
              {feature.subtitle}
            </p>
          </div>
        </section>

        {/* Feature Overview */}
        <section className="mb-32 grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-zinc-900">
              The Power of Contextual Mining
            </h2>
            <p className="text-lg leading-relaxed font-medium text-zinc-500">
              {feature.details}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {feature.benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 font-bold text-zinc-700"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-[32px] glass-card p-8">
            <div className="absolute inset-0 bg-[#ff4500]/5 opacity-0 transition-opacity group-hover:opacity-100" />
            
            {feature.preview ? (
              <div className="relative z-10 w-full space-y-4 rounded-2xl border border-black/10 bg-white/80 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-[#ff4500]">
                    Live Analysis
                  </span>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Source:</span>
                    <span className="font-bold text-zinc-900">{feature.preview.target}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Intensity:</span>
                    <span className="font-bold text-red-500">{feature.preview.intensity}</span>
                  </div>
                  <div className="rounded-lg bg-black/5 p-4 text-xs italic leading-relaxed text-zinc-600">
                    "{feature.preview.insight}"
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 flex-1 rounded-full bg-black/10">
                      <div 
                        className="h-full rounded-full bg-[#ff4500]" 
                        style={{ width: `${feature.preview.score}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-900">Score: {feature.preview.score}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl border border-black/10 bg-white/80 p-12 text-center backdrop-blur-sm">
                <Sparkles className="mb-6 h-16 w-16 text-[#ff4500] opacity-80 transition-transform duration-500 group-hover:scale-110" />
                <h4 className="mb-2 text-xl font-bold text-zinc-900">
                  Automated Discovery
                </h4>
                <p className="text-sm font-medium text-zinc-500">
                  Built with advanced NLP to find what generic scrapers miss.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        {feature.howItWorks && (
          <section className="mb-32 w-full max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-extrabold text-zinc-900 md:text-4xl">
                How It Works
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {feature.howItWorks.map((step, idx) => (
                <div
                  key={step.title}
                  className="group relative rounded-[32px] glass-card p-8 transition-all"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff4500]/10 text-xl font-black text-[#ff4500]">
                    {idx + 1}
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-zinc-900">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Use Cases Section */}
        {feature.useCases && (
          <section className="mb-32 w-full max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-extrabold text-zinc-900 md:text-4xl">
                Who Is It For?
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {feature.useCases.map((useCase) => (
                <div
                  key={useCase.title}
                  className="rounded-[32px] glass-card p-8"
                >
                  <h3 className="mb-4 text-lg font-bold text-zinc-900">
                    {useCase.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500">
                    {useCase.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}


        {/* Call to Action */}
        <section className="relative w-full max-w-4xl overflow-hidden rounded-[40px] border border-[#ff4500]/10 bg-linear-to-b from-[#ff4500]/5 to-[#f59e0b]/5 p-12 text-center md:p-16">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 bg-[#ff4500]/10 blur-[80px]" />
          <h2 className="relative z-10 mb-6 text-3xl font-extrabold text-zinc-900 md:text-4xl">
            Ready to find your next SaaS idea?
          </h2>
          <p className="relative z-10 mx-auto mb-10 max-w-2xl text-lg text-zinc-500">
            Join 1,000+ founders using ThreddIQ to build products people
            actually want.
          </p>
          <div className="relative z-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-[#ff4500] px-10 py-6 text-lg font-extrabold text-white shadow-xl shadow-[#ff4500]/20 hover:bg-[#ff5a1a]"
            >
              <Link href="/sign-up">
                Start Mining Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl border-black/10 bg-white px-10 py-6 text-lg font-extrabold text-zinc-800 shadow-sm transition-colors hover:bg-zinc-100"
            >
              <Link href="/#pricing">View Pricing</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
