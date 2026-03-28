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

const features = {
  "pain-point-mining": {
    title: "AI Pain Point Mining",
    subtitle: "Identify root frustrations automatically",
    description:
      "Our AI engine scans thousands of Reddit conversations to extract the underlying problems, recurring complaints, and unmet needs of your target audience.",
    icon: <Bot className="h-12 w-12 text-[#ff4500]" />,
    benefits: [
      "Semantic clustering of similar complaints",
      "Automatic root cause identification",
      "Sentiment-weighted problem priority",
      "Direct quote extraction for user research",
    ],
    details:
      "ThreddIQ doesn't just look for keywords. It understands context. Using deep semantic search, we group thousands of posts into structured problem clusters, showing you exactly what keeps your potential customers awake at night.",
    gradient: "from-orange-500/20 to-transparent",
  },
  "idea-validation": {
    title: "SaaS Idea Validation",
    subtitle: "Validate with real-world demand",
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

export async function generateStaticParams() {
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
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] font-sans text-zinc-300 selection:bg-[#ff4500]/30">
      <Header />

      <main className="flex flex-col items-center px-6 pt-32 pb-24">
        {/* Hero Section */}
        <section className="relative mb-24 w-full max-w-5xl">
          <div
            className={`bg-gradient-radial absolute -top-24 left-1/2 h-[400px] w-[600px] -translate-x-1/2 ${feature.gradient} pointer-events-none opacity-50 blur-[100px]`}
          />

          <div className="relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl">
                {feature.icon}
              </div>
            </div>
            <h1 className="mb-6 text-[48px] leading-tight font-extrabold tracking-tight text-white md:text-[64px]">
              {feature.title}
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed font-medium text-zinc-400 md:text-2xl">
              {feature.subtitle}
            </p>
          </div>
        </section>

        {/* Feature Overview */}
        <section className="mb-32 grid w-full max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-white">
              The Power of Contextual Mining
            </h2>
            <p className="text-lg leading-relaxed font-medium text-zinc-400">
              {feature.details}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {feature.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 font-bold text-zinc-200"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-[32px] border-2 border-white/3 bg-[#0f0f0f] p-8 shadow-2xl">
            <div className="absolute inset-0 bg-[#ff4500]/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center rounded-2xl border border-white/5 bg-black/40 p-12 text-center backdrop-blur-sm">
              <Sparkles className="mb-6 h-16 w-16 text-[#ff4500] opacity-80 transition-transform duration-500 group-hover:scale-110" />
              <h4 className="mb-2 text-xl font-bold text-white">
                Automated Discovery
              </h4>
              <p className="text-sm font-medium text-zinc-500">
                Built with advanced NLP to find what generic scrapers miss.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative w-full max-w-4xl overflow-hidden rounded-[40px] border border-[#ff4500]/10 bg-linear-to-b from-[#1c0c0a] to-[#0f0504] p-12 text-center shadow-2xl md:p-16">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 bg-[#ff4500]/10 blur-[80px]" />
          <h2 className="relative z-10 mb-6 text-3xl font-extrabold text-white md:text-4xl">
            Ready to find your next SaaS idea?
          </h2>
          <p className="relative z-10 mx-auto mb-10 max-w-2xl text-lg text-zinc-400">
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
              className="rounded-xl border-white/20 bg-transparent px-10 py-6 text-lg font-extrabold text-white transition-colors hover:bg-white/10"
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
