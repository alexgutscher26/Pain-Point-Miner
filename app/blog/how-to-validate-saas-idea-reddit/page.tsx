/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  Brain,
  Target,
  BarChart3,
  Lightbulb,
  Users,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Validate a SaaS Idea Using Reddit Before You Write a Line of Code | ThreddIQ Blog",
  description: "Stop building in the dark. Learn how to mine Reddit for real pain points, budget signals, and market demand — before you write a single line of code.",
};

const stats = [
  { label: "Subreddits analyzed", value: "1,400+", sub: "Across SaaS niches" },
  { label: "Signal accuracy", value: "87%", sub: "Pain point detection rate" },
  { label: "Unique pain points", value: "15K+", sub: "Extracted and scored" },
  { label: "Time saved per founder", value: "40h", sub: "Vs. manual research" },
];

const steps = [
  {
    title: "Define your niche and target subreddits",
    icon: <Target className="h-6 w-6 text-[#ff4500]" />,
    body: "Start by listing the communities where your ideal customers already hang out. If you're building for developers, that's r/webdev, r/ExperiencedDevs, r/SaaS. For founders, r/startups, r/Entrepreneur, r/SaaS. The key is finding subreddits where people vent about real problems — not just memes and news.",
  },
  {
    title: "Let AI extract every frustration signal",
    icon: <Brain className="h-6 w-6 text-[#ff4500]" />,
    body: "Rather than skimming hundreds of posts manually, ThreddIQ scans each thread with a structured extraction pipeline. It identifies pain points, scores their intensity and urgency, flags budget mentions like 'I'd pay $50/month', and surfaces the underlying sentiment — all in under a second per post.",
  },
  {
    title: "Filter by intent and willingness to pay",
    icon: <Lightbulb className="h-6 w-6 text-[#ff4500]" />,
    body: "Not all complaints are opportunities. The real gold is in threads where users are actively searching for solutions — they've tried workarounds, they're frustrated, and they mention budget. ThreddIQ's scoring system lets you filter for these high-intent signals so you focus on problems people will actually pay to solve.",
  },
  {
    title: "Quantify market maturity and competition",
    icon: <BarChart3 className="h-6 w-6 text-[#ff4500]" />,
    body: "Our analysis cross-references each pain point against known tools and existing solutions. A high market maturity score with high dissatisfaction means the category is validated but no winner has emerged — the perfect entry point. Low maturity with high pain means you might be first to market.",
  },
  {
    title: "Rank opportunities by difficulty and ROI",
    icon: <MessageCircle className="h-6 w-6 text-[#ff4500]" />,
    body: "Every extracted pain point gets a difficulty rating from weekend project to VC-scale moat. Weekend projects are simple CRUD apps or browser extensions you can ship in days. VC-scale moats require network effects, regulatory complexity, or years of data. Most successful SaaS companies start in the 'side project' or 'startup MVP' bucket.",
  },
];

const signals = [
  {
    title: "Users mention specific dollar amounts",
    desc: "\"I'd pay $50/month for this\" is a stronger signal than \"I wish this existed.\"",
  },
  {
    title: "They've tried existing workarounds",
    desc: "Spreadsheets, manual processes, duct-taped tools — workarounds prove the problem is real enough to invest time in.",
  },
  {
    title: "Multiple threads repeat the same frustration",
    desc: "A pain point that surfaces across 5+ subreddits is a pattern, not a fluke. Validation by repetition.",
  },
  {
    title: "The tone is desperate, not curious",
    desc: "Sentiment analysis reveals whether users are casually wondering or genuinely stuck. 'Desperate' converts.",
  },
];

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-300 selection:bg-[#ff4500]/30">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="mb-12 flex items-center gap-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href="/resources" className="transition-colors hover:text-white">
            Resources
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-white">Idea Validation</span>
        </div>

        {/* Hero */}
        <header className="mb-20">
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-white md:text-[72px]">
            How to validate a <br className="hidden md:block" />
            SaaS idea using{" "}
            <span className="text-[#ff4500]">Reddit</span>
          </h1>
          <em className="block mb-10 text-lg font-medium text-zinc-500 md:text-xl">
            Before you write a single line of code
          </em>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-400 md:text-2xl">
            Every failed SaaS product has one thing in common: nobody asked if the problem was real. Reddit is the world's largest focus group — 430 million monthly active users, organized by interest, actively venting about what's broken. Here's how to mine it systematically.
          </p>
        </header>

        {/* Stats Grid */}
        <section className="mb-24 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-[#0f0f0f] p-8 transition-all hover:border-[#ff4500]/20">
              <div className="absolute top-0 right-0 h-24 w-24 bg-[#ff4500]/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-2 text-4xl font-black text-white">{stat.value}</div>
                <div className="mb-1 text-sm font-bold text-zinc-300 uppercase tracking-wide">{stat.label}</div>
                <div className="text-[11px] font-medium text-zinc-500">{stat.sub}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Why Reddit */}
        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-white md:text-4xl">Why Reddit is the best customer research platform</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-[32px] border border-white/5 bg-[#0f0f0f] p-10">
              <h3 className="mb-4 text-xl font-black text-white">Unfiltered honesty</h3>
              <p className="text-lg font-medium text-zinc-400 leading-relaxed">
                Redditors are anonymous. They don't sugarcoat. A user who says "this tool is garbage and I hate paying for it" in a Reddit thread would never say that in a survey. The signal is raw and real.
              </p>
            </div>
            <div className="rounded-[32px] border border-white/5 bg-[#0f0f0f] p-10">
              <h3 className="mb-4 text-xl font-black text-white">Pre-segmented by interest</h3>
              <p className="text-lg font-medium text-zinc-400 leading-relaxed">
                Subreddits are built-in audience segments. r/smallbusiness, r/webdev, r/legaladvice — each one is a self-selected group of people with shared needs. You don't need a marketing list; you need the right subreddit.
              </p>
            </div>
            <div className="rounded-[32px] border border-white/5 bg-[#0f0f0f] p-10">
              <h3 className="mb-4 text-xl font-black text-white">Real budget signals</h3>
              <p className="text-lg font-medium text-zinc-400 leading-relaxed">
                Founders and professionals openly discuss what they spend. Monthly budgets, tool stacks, pricing complaints — the data is there if you know where to look. ThreddIQ extracts these signals automatically.
              </p>
            </div>
            <div className="rounded-[32px] border border-white/5 bg-[#0f0f0f] p-10">
              <h3 className="mb-4 text-xl font-black text-white">Competitive intelligence, for free</h3>
              <p className="text-lg font-medium text-zinc-400 leading-relaxed">
                Every mention of a competitor is a data point. Users explain exactly why they switched, what's missing, and what they wish existed. That's product roadmap research you can't get from a landing page A/B test.
              </p>
            </div>
          </div>
        </section>

        {/* The five steps */}
        <section className="mb-32">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-black text-white md:text-5xl">The five-step validation pipeline</h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
              Here's how to go from a vague idea to a data-backed product decision — without leaving your terminal.
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col gap-6 md:flex-row md:items-start md:gap-12">
                {/* Number + Icon */}
                <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl font-black text-white">
                    {i + 1}
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                    {step.icon}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1">
                  <h3 className="mb-4 text-2xl font-black text-white md:text-3xl">{step.title}</h3>
                  <p className="text-lg leading-relaxed font-medium text-zinc-400 md:text-xl">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Signals Section */}
        <section className="mb-32">
          <div className="rounded-[48px] border border-white/5 bg-linear-to-br from-[#121212] to-[#0a0a0a] p-12 md:p-20">
            <h2 className="mb-12 text-3xl font-black text-white md:text-4xl">Four signals that separate real SaaS ideas from wishful thinking</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {signals.map((signal, i) => (
                <div key={i} className="rounded-[24px] border border-white/5 bg-white/2 p-8">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#ff4500]" />
                    <h3 className="text-lg font-black text-white">{signal.title}</h3>
                  </div>
                  <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">{signal.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Red Flag Section */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-white md:text-4xl">When Reddit data can mislead you</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[24px] border border-red-500/10 bg-red-500/2 p-8">
              <h3 className="mb-3 text-lg font-black text-white">Vocal minority</h3>
              <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">
                A 200-upvote thread doesn't mean a market. Power users are loud but small. Cross-reference thread volume with subreddit size and post frequency.
              </p>
            </div>
            <div className="rounded-[24px] border border-red-500/10 bg-red-500/2 p-8">
              <h3 className="mb-3 text-lg font-black text-white">Selection bias</h3>
              <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">
                Reddit skews technical, young, and male. A validated pain point on r/SaaS may not replicate in an enterprise boardroom. Know your audience's audience.
              </p>
            </div>
            <div className="rounded-[24px] border border-red-500/10 bg-red-500/2 p-8">
              <h3 className="mb-3 text-lg font-black text-white">Complaints aren't contracts</h3>
              <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">
                Someone who vents about a problem isn't guaranteed to buy your solution. Budget signals and explicit "I would pay X" quotes are far stronger than general frustration.
              </p>
            </div>
          </div>
        </section>

        {/* The bigger point */}
        <section className="mb-32 border-l-4 border-[#ff4500] bg-[#0f0f0f] py-12 px-10 rounded-r-[32px]">
          <blockquote className="text-3xl font-black italic leading-tight text-white md:text-4xl">
            &ldquo;The best startup advice I can give: Don't build for a problem you invented. Find a problem people are already shouting about — and listen.&rdquo;
          </blockquote>
        </section>

        {/* Conclusion */}
        <section className="mb-32 py-16 text-center border-t border-white/5">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-400 italic md:text-2xl leading-relaxed">
            Idea validation isn't a one-time checkbox. It's a continuous feedback loop. The founders who win aren't the ones with the best intuition — they're the ones who build in public, listen in public, and let their market tell them what to ship next.
          </p>
          <div className="mt-12 text-xs font-bold text-zinc-700 uppercase tracking-widest">
            Data sourced from ThreddIQ's Reddit intelligence engine. 15,000+ pain points analyzed across 1,400+ subreddits.
          </div>
        </section>

        {/* CTA */}
        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] border-2 border-white/5 bg-[#0c0c0c] p-16 shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Search className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-white md:text-5xl">
            Find your next <span className="text-[#ff4500]">validated idea</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            Stop guessing. Start shipping. ThreddIQ mines Reddit for real pain points, budget signals, and competitive gaps — so you can build something people actually need.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]"
            >
              <Link href="/sign-up">Get Started Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
