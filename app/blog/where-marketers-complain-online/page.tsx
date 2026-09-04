/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  MessageCircle,
  TrendingUp,
  Target,
  DollarSign,
  Eye,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Where Marketers Complain Online | ThreddIQ Blog",
  description:
    "The top subreddits and communities where marketers vent about their tools — and what those complaints mean if you're building a marketing SaaS.",
};

const marketers = [
  {
    name: "r/marketing",
    desc: "The biggest marketing subreddit. Expect broad complaints — analytics sucks, attribution is broken, content calendars are a mess. Great for spotting category-level pain points. Filter for threads with 100+ upvotes to find universal frustrations.",
    signal: "Analytics, attribution, reporting",
    tier: "Primary",
  },
  {
    name: "r/PPC",
    desc: "Ad spend managers are vocal about waste. Every complaint about budget leakage, bad targeting, or platform changes is a product opportunity. These users have high budgets and low tolerance for bad UX.",
    signal: "Ad platforms, bidding, reporting",
    tier: "Primary",
  },
  {
    name: "r/SEO",
    desc: "SEO tools are a crowded space, but the complaints tell you exactly where the gaps are. Algorithm updates killing rankings, link-building pain, content optimization friction — all documented daily.",
    signal: "Rank tracking, content, analytics",
    tier: "Primary",
  },
  {
    name: "r/EmailMarketing",
    desc: "Deliverability, spam filters, template builders — email marketers have a long list of grievances. If you're building in the email space, this subreddit is your spec sheet.",
    signal: "Deliverability, templates, automation",
    tier: "Secondary",
  },
  {
    name: "r/socialmedia",
    desc: "Social media managers complain about scheduling tools, analytics gaps, and platform algorithm changes. The pain is real and recurring — tool-switching is common here.",
    signal: "Scheduling, analytics, content",
    tier: "Secondary",
  },
  {
    name: "r/content_marketing",
    desc: "Content marketers gripe about production workflows, distribution challenges, and measuring ROI. These complaints often include tool-stack details and willingness to switch.",
    signal: "Content ops, measurement, AI tools",
    tier: "Secondary",
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
          <span className="text-zinc-900">Industry Deep-Dive</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black tracking-widest text-[#ff4500] uppercase">
            <Target className="h-3.5 w-3.5" /> Industry Deep-Dive
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            Where marketers complain online,
            <br className="hidden md:block" />
            and what it means if you're{" "}
            <span className="text-[#ff4500]">building for them</span>
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Marketers are a vocal bunch. They post daily about what's broken,
            what they'd pay to fix, and which tools they're about to cancel.
            Here's where to listen and what to look for.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            The top marketing subreddits for pain point mining
          </h2>
          <p className="mb-10 text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">
            Marketing professionals cluster in specific communities. Each one
            has a distinct complaint profile. Here are the highest-signal
            subreddits ranked by tool-related desperation.
          </p>
          <div className="space-y-8">
            {marketers.map((sub, i) => (
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
                      {sub.tier} source
                    </span>
                  </div>
                  <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
                    {sub.tier}
                  </span>
                </div>
                <p className="mb-4 text-lg leading-relaxed font-medium text-zinc-500">
                  {sub.desc}
                </p>
                <div className="flex items-center gap-2 text-xs font-black tracking-widest text-zinc-400 uppercase">
                  <Zap className="h-3.5 w-3.5 text-[#ff4500]" /> {sub.signal}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mb-32 rounded-[48px] p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">
            What marketers' complaints actually mean
          </h2>
          <p className="mb-8 text-lg leading-relaxed font-medium text-zinc-500">
            The key to turning marketing subreddit complaints into product ideas
            is pattern recognition. Here are the three most common complaint
            archetypes and what they signal:
          </p>
          <div className="space-y-6">
            {[
              {
                archetype:
                  '"Our analytics tool shows everything but tells us nothing"',
                meaning:
                  "Marketers are data-rich and insight-poor. They want tools that interpret, not just display. Opportunity: AI-powered recommendations layered on existing data.",
              },
              {
                archetype:
                  '"I"m managing 5 different tools and nothing talks to each other"',
                meaning:
                  "Integration fatigue is real. They'd pay a premium for a tool that replaces two or more existing ones. Opportunity: all-in-one platforms or best-in-class integrations.",
              },
              {
                archetype:
                  '"I have no idea which channel is actually driving revenue"',
                meaning:
                  "Attribution is the #1 unsolved pain in marketing. Any tool that credibly solves it — even for a specific channel — has a built-in audience.",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-[24px] border border-black/5 p-6">
                <p className="mb-2 text-lg font-black text-zinc-900 italic">
                  "{item.archetype}"
                </p>
                <p className="text-[15px] leading-relaxed font-medium text-zinc-500">
                  {item.meaning}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            Niche communities worth watching
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "r/analytics",
                desc: "Hardcore analytics practitioners. Their complaints are technical and detailed — exactly the kind of signal that translates into a spec.",
              },
              {
                title: "r/GoogleAnalytics",
                desc: "Half the posts are people frustrated with GA4. Every frustrated GA4 user is a potential customer for a simpler analytics tool.",
              },
              {
                title: "r/copywriting",
                desc: "Copywriters complain about workflow tools, AI writing assistants, and client feedback cycles. Niche but high-signal for content tool builders.",
              },
              {
                title: "r/AskMarketing",
                desc: "Q&A format means people explicitly ask 'is there a tool that does X?' These are direct, unqualified feature requests with no middleman.",
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
            &ldquo;Marketers complain about tools more than any other
            profession. It's not that they're hard to please — it's that most
            marketing tools were built by engineers who've never run a campaign.
            Build for the person who wakes up to 17 tabs open and 3 reports
            due.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-zinc-500 italic md:text-2xl">
            For a complete breakdown of every industry and its highest-signal
            subreddits, check out our{" "}
            <Link
              href="/resources/best-subreddits-by-industry"
              className="font-bold text-[#ff4500] underline underline-offset-4 transition-colors hover:text-zinc-900"
            >
              Best Subreddits by Industry
            </Link>{" "}
            resource.
          </p>
        </section>

        <div className="glass-card relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Eye className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Stop scrolling. Start{" "}
            <span className="text-[#ff4500]">building</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            Let ThreddIQ monitor the marketing subreddits for you. Get alerts
            when someone describes exactly what you should build next.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]"
            >
              <Link href="/sign-up">
                Monitor Marketing Pain Points{" "}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
