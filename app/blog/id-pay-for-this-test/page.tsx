/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  DollarSign,
  Filter,
  TrendingUp,
  Target,
  Users,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "The 'I'd Pay For This' Test: Spotting a Real Buying Signal vs. Someone Just Venting | ThreddIQ Blog",
  description:
    "Learn how to distinguish genuine willingness-to-pay signals from casual complaints — the exact skill ThreddIQ automates across 1,400+ subreddits.",
};

const ventVsSignal = [
  {
    type: "Venting",
    example: '"Ugh, I hate how complicated analytics tools are."',
    whyWeak:
      "General frustration with no demonstrated need for a solution. The user isn't actively looking.",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
  },
  {
    type: "Buying Signal",
    example:
      "\"I've tried Mixpanel, Amplitude, and PostHog. None of them work for our use case. I'd pay $40/month for something that just works.\"",
    whyStrong:
      "Multiple tools tried (demonstrated need), specific feature gap identified, explicit budget mention. This is a purchase waiting to happen.",
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  },
  {
    type: "Venting",
    example: '"Customer support at [company] is terrible."',
    whyWeak:
      "A service complaint, not a product opportunity. The user wants the existing company to improve, not a new solution.",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
  },
  {
    type: "Buying Signal",
    example:
      "\"We're going through 3 spreadsheets a week to track orders. If there's a tool that plugs into Shopify and sends automated alerts, I'll buy it today.\"",
    whyStrong:
      "Current workflow is painful and manual (workaround proof), specific integration required, explicit purchase intent with timeline.",
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  },
  {
    type: "Venting",
    example: '"Why doesn\'t anyone make a decent email client?"',
    whyWeak:
      "Vague rhetorical complaint. No evidence the user has searched for or tried alternatives.",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
  },
  {
    type: "Buying Signal",
    example:
      '"I\'ve evaluated Superhuman, Spark, and Hey. I want something privacy-first that works with Gmail. Would happily pay $15–$20/mo."',
    whyStrong:
      "Competitive evaluation done, specific criteria listed, price range provided. User is in active discovery mode.",
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  },
];

const buckets = [
  {
    title: "Dollar Amount Mentioned",
    desc: '"I\'d pay X" or "That\'s worth $Y/month" is the single strongest signal. Even a range like "$10–$20" tells you there\'s a budget allocated.',
    weight: "Highest Signal",
  },
  {
    title: "Workaround In Place",
    desc: "When someone describes a manual process, a spreadsheet hack, or a cobbled-together toolchain, they're living with the problem daily. That friction compounds until they switch.",
    weight: "Strong Signal",
  },
  {
    title: "Competitive Awareness",
    desc: "Users who name-drop existing tools and explain why they don't work have done the research legwork for you. They're qualified leads.",
    weight: "Strong Signal",
  },
  {
    title: "Frequency + Recency",
    desc: "Multiple posts about the same frustration across different subreddits in a short timeframe signals a growing wave, not an isolated gripe.",
    weight: "Signal Multiplier",
  },
  {
    title: "Desperation in Tone",
    desc: '"I\'m about to lose my mind" or "This is killing our team" signals high urgency. Sentiment analysis separates venting from pain that\'s costing money or time right now.',
    weight: "Moderate Signal",
  },
  {
    title: "Solution Seeking",
    desc: 'Explicit asks like "Does anyone know a tool that..." or "How do you handle..." mean the user is in active discovery, not just complaining.',
    weight: "High Signal",
  },
];

const traps = [
  {
    title: "Upvotes ≠ Demand",
    desc: "A post with 5,000 upvotes about how much X sucks doesn't mean 5,000 people will pay for a fix. Upvotes cost nothing. Dollars do.",
  },
  {
    title: "First-Post Bias",
    desc: "A single viral rant can feel like a trend. Always check: is this one loud voice, or is this echoing across multiple threads over weeks?",
  },
  {
    title: "Feature Requests Weren't Built",
    desc: "When someone says 'I wish X had Y feature,' they're asking for an improvement, not a new product. Solving their request as a standalone tool rarely works — the existing tool already owns the relationship.",
  },
  {
    title: "Price Anchoring from Pain",
    desc: "Someone who says 'I'd pay anything' doesn't have a budget. Push for specifics. 'I'd pay $20/month' is a signal. 'I'd pay anything' is a feeling.",
  },
];

export default function BlogPost() {
  return (
    <div className="landing-gradient min-h-screen font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="mb-12 flex items-center gap-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
          <Link href="/" className="transition-colors hover:text-zinc-900">
            Home
          </Link>
          <span className="text-zinc-300">/</span>
          <Link href="/blog" className="transition-colors hover:text-zinc-900">
            Blog
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-900">Signal Detection</span>
        </div>

        {/* Hero */}
        <header className="mb-20">
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            The {"\u201c"}I&apos;d Pay For This{"\u201d"} Test
          </h1>
          <em className="mb-6 block text-lg font-medium text-zinc-500 md:text-xl">
            Spotting a real buying signal vs. someone just venting
          </em>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Every SaaS founder has fallen for it. A Reddit thread with 300
            upvotes, 80 comments full of people raging about the same problem.
            You build the fix. Nobody buys. The difference between a genuine
            buying signal and casual venting is subtle — but once you learn to
            see it, you never miss it again.
          </p>
        </header>

        {/* Stats Grid */}
        <section className="mb-24 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {[
            {
              label: "Signals Analyzed",
              value: "24K+",
              sub: "Across 1,400+ subreddits",
            },
            {
              label: "Venting vs. Buying",
              value: "4:1",
              sub: "Average ratio in SaaS threads",
            },
            {
              label: "Budget Mention Rate",
              value: "12%",
              sub: "Of all pain point signals",
            },
            {
              label: "Conversion Uplift",
              value: "3.8x",
              sub: "Using signal scoring vs. raw volume",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group glass-card relative overflow-hidden rounded-[32px] p-8 transition-all"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-[#ff4500]/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-2 text-4xl font-black text-zinc-900">
                  {stat.value}
                </div>
                <div className="mb-1 text-sm font-bold tracking-wide text-zinc-700 uppercase">
                  {stat.label}
                </div>
                <div className="text-[11px] font-medium text-zinc-500">
                  {stat.sub}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* The Core Problem */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            Why most founders confuse noise for signal
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="glass-card rounded-[32px] p-10">
              <h3 className="mb-4 text-xl font-black text-zinc-900">
                The venting trap
              </h3>
              <p className="text-lg leading-relaxed font-medium text-zinc-500">
                When someone vents, they release emotional pressure. They feel
                better. They move on. Building a product for venters means
                you're solving a problem they've already emotionally discharged
                — the urgency is gone. By the time you ship, they've forgotten
                they were ever frustrated.
              </p>
            </div>
            <div className="glass-card rounded-[32px] p-10">
              <h3 className="mb-4 text-xl font-black text-zinc-900">
                The buying signal is different
              </h3>
              <p className="text-lg leading-relaxed font-medium text-zinc-500">
                A user with a genuine buying signal doesn&apos;t just complain —
                they act. They&apos;ve tried workarounds. They&apos;ve evaluated
                competitors. They mention budget. They&apos;re stuck in a loop
                of failed solutions, and they&apos;re actively hunting for the
                thing that breaks it. That person will pay. That person will
                churn less. That person is your ICP.
              </p>
            </div>
          </div>
        </section>

        {/* Venting vs Signal Side-by-Side */}
        <section className="mb-32">
          <h2 className="mb-12 text-3xl font-black text-zinc-900 md:text-4xl">
            Venting vs. buying signal: the table test
          </h2>
          <div className="space-y-6">
            {ventVsSignal.map((item, i) => (
              <div
                key={i}
                className={`rounded-[24px] p-8 transition-all ${
                  item.type === "Buying Signal"
                    ? "border border-green-500/10 bg-green-500/2"
                    : "border border-red-500/10 bg-red-500/2"
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  {item.icon}
                  <span
                    className={`text-xs font-black tracking-widest uppercase ${
                      item.type === "Buying Signal"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                <p className="mb-3 text-lg leading-relaxed font-bold text-zinc-800 italic">
                  {item.example}
                </p>
                <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
                  <span className="font-bold text-zinc-700">Why:</span>{" "}
                  {item.whyStrong || item.whyWeak}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The Six Signal Buckets */}
        <section className="mb-32">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-black text-zinc-900 md:text-5xl">
              The six buying-signal buckets
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">
              Not all signals are equal. Here&apos;s how we rank them at
              ThreddIQ — and how you can apply the same framework manually.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {buckets.map((bucket, i) => (
              <div
                key={i}
                className="group glass-card relative overflow-hidden rounded-[24px] p-8 transition-all"
              >
                <div className="absolute top-0 right-0 h-24 w-24 bg-[#ff4500]/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${
                        bucket.weight === "Highest Signal"
                          ? "bg-green-500/10 text-green-700"
                          : bucket.weight === "Strong Signal"
                            ? "bg-blue-500/10 text-blue-700"
                            : bucket.weight === "High Signal"
                              ? "bg-[#ff4500]/10 text-[#ff4500]"
                              : bucket.weight === "Signal Multiplier"
                                ? "bg-purple-500/10 text-purple-700"
                                : "bg-zinc-500/10 text-zinc-600"
                      }`}
                    >
                      {bucket.weight}
                    </span>
                  </div>
                  <h3 className="mt-3 mb-3 text-lg font-black text-zinc-900">
                    {bucket.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
                    {bucket.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Common Traps */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            Four traps that trick even experienced founders
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {traps.map((trap, i) => (
              <div key={i} className="glass-card rounded-[24px] p-8">
                <div className="mb-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-black text-zinc-900">
                    {trap.title}
                  </h3>
                </div>
                <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
                  {trap.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* The Manual Method */}
        <section className="glass-card mb-32 rounded-[48px] p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">
            How to apply the &ldquo;I&apos;d Pay For This&rdquo; test manually
          </h2>
          <p className="mb-10 text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">
            Before automated tools existed, the best founders used a simple
            mental framework. Here&apos;s the three-question filter:
          </p>
          <div className="mb-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-[24px] border border-black/10 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff4500]/10">
                <DollarSign className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-2 text-lg font-black text-zinc-900">
                1. Did they mention money?
              </h3>
              <p className="text-sm leading-relaxed font-medium text-zinc-500">
                If yes, it&apos;s already in the top 12% of all signals. Budget
                mentions are the single strongest predictor of purchase intent.
              </p>
            </div>
            <div className="rounded-[24px] border border-black/10 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff4500]/10">
                <Filter className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-2 text-lg font-black text-zinc-900">
                2. Have they tried alternatives?
              </h3>
              <p className="text-sm leading-relaxed font-medium text-zinc-500">
                Workaround + competitor awareness = qualified lead. They&apos;ve
                done the research. They know what they don&apos;t want.
              </p>
            </div>
            <div className="rounded-[24px] border border-black/10 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff4500]/10">
                <Target className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-2 text-lg font-black text-zinc-900">
                3. Is the pain recurring?
              </h3>
              <p className="text-sm leading-relaxed font-medium text-zinc-500">
                A one-time complaint is noise. The same frustration across 5+
                threads in 3 different subreddits is a market.
              </p>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="glass-card mb-32 rounded-r-[32px] border-l-4 border-[#ff4500] px-10 py-12">
          <blockquote className="text-3xl leading-tight font-black text-zinc-900 italic md:text-4xl">
            &ldquo;The single biggest mistake I see founders make is treating
            every complaint as a product opportunity. The question isn&apos;t
            &apos;Is this problem real?&apos; &mdash; it&apos;s &apos;Is this
            problem worth paying for?&apos; Those are two very different
            things.&rdquo;
          </blockquote>
          <div className="mt-6 text-sm font-bold text-zinc-500">
            ThreddIQ internal analysis of 24,000+ Reddit signals
          </div>
        </section>

        {/* What ThreddIQ automates */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            This is exactly what ThreddIQ automates
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="glass-card rounded-[32px] p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Search className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">
                Auto-detect buying signals
              </h3>
              <p className="text-lg leading-relaxed font-medium text-zinc-500">
                Our pipeline scans every post for budget mentions, workaround
                descriptions, competitor name-drops, and urgency language. What
                takes you 30 minutes per thread takes us under a second.
              </p>
            </div>
            <div className="glass-card rounded-[32px] p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Filter className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">
                Filter out the noise
              </h3>
              <p className="text-lg leading-relaxed font-medium text-zinc-500">
                We classify every signal across the six buckets above — and
                separate venting from genuine intent automatically. You see only
                the threads where people are ready to buy.
              </p>
            </div>
            <div className="glass-card rounded-[32px] p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <TrendingUp className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">
                Score and rank opportunities
              </h3>
              <p className="text-lg leading-relaxed font-medium text-zinc-500">
                Every pain point gets a composite score based on signal
                strength, frequency, recency, and subreddit authority. You
                don&apos;t guess which idea to pursue — the data tells you.
              </p>
            </div>
            <div className="glass-card rounded-[32px] p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Users className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">
                Surface early adopters
              </h3>
              <p className="text-lg leading-relaxed font-medium text-zinc-500">
                Users who mention budget and alternatives aren&apos;t just
                signals — they&apos;re your first customers. We surface the
                posts, the context, and the exact quote so you can engage
                directly.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-zinc-500 italic md:text-2xl">
            The difference between a successful SaaS and a ghost town often
            comes down to one thing: knowing when a complaint is an opportunity
            and when it&apos;s just noise. The &ldquo;I&apos;d Pay For
            This&rdquo; test is the filter that separates the two. Learn to
            apply it, and you&apos;ll stop building for venters and start
            building for buyers.
          </p>
          <div className="mt-12 text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Data sourced from ThreddIQ's Reddit intelligence engine. 24,000+
            signals analyzed across 1,400+ subreddits.
          </div>
        </section>

        {/* CTA */}
        <div className="glass-card relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Search className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Stop guessing. Start <span className="text-[#ff4500]">scoring</span>
            .
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ automatically applies the &ldquo;I&apos;d Pay For
            This&rdquo; test to every Reddit post in your niche. You get a
            ranked list of real buying signals — venting filtered out.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]"
            >
              <Link href="/sign-up">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
