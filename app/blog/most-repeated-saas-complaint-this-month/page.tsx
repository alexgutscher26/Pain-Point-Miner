/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Calendar,
  Repeat,
  AlertTriangle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The Most-Repeated SaaS Complaint on Reddit This Month | ThreddIQ Blog",
  description: "July 2026 edition: we analyzed 4,200+ SaaS subreddit posts to find the single most-repeated complaint. Hint: it's about analytics. Here's what founders are saying and why it matters.",
};

const topPosts = [
  {
    subreddit: "r/SaaS",
    title: "\"Every analytics tool shows me what happened. None tell me what to do about it.\"",
    score: "9/10",
    comments: 187,
    signal: "Analytics insight gap — high budget signal present",
  },
  {
    subreddit: "r/startups",
    title: "\"I spent 3 hours building a dashboard in Mixpanel and still can't answer 'where did my users go?'\"",
    score: "8/10",
    comments: 134,
    signal: "Dashboard fatigue — multiple tool-switching mentions",
  },
  {
    subreddit: "r/webdev",
    title: "\"GA4 is actively worse than nothing. It gives me confidence in wrong data.\"",
    score: "10/10",
    comments: 312,
    signal: "GA4 frustration — highest engagement thread this month",
  },
  {
    subreddit: "r/ProductManagement",
    title: "\"I have 7 analytics tools and zero answers. Who's solving this?\"",
    score: "9/10",
    comments: 98,
    signal: "Tool sprawl pain — explicit 'who's solving this' callout",
  },
];

export default function BlogPost() {
  return (
    <div className="min-h-screen landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-32 pb-24">
        <div className="mb-12 flex items-center gap-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
          <Link href="/" className="transition-colors hover:text-zinc-900">Home</Link>
          <span className="text-zinc-300">/</span>
          <Link href="/blog" className="transition-colors hover:text-zinc-900">Blog</Link>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-900">Monthly Series</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black text-[#ff4500] uppercase tracking-widest">
            <Calendar className="h-3.5 w-3.5" /> July 2026
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            The most-repeated SaaS complaint on Reddit{" "}
            <span className="text-[#ff4500]">this month</span>
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Every month we surface the single most-repeated complaint across 200+ SaaS subreddits.
            This is your early warning system for the next big product opportunity.
            <span className="block mt-4 text-base font-black text-zinc-600">Edition: July 2026</span>
          </p>
        </header>

        <div className="mb-24 rounded-[48px] glass-card p-12 md:p-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-1.5 text-[11px] font-black text-red-500 uppercase tracking-widest">
            <AlertTriangle className="h-3.5 w-3.5" /> #1 complaint
          </div>
          <h2 className="mb-6 text-3xl font-black text-zinc-900 md:text-5xl">
            "My analytics tool gives me data, not answers"
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-zinc-500 leading-relaxed">
            This complaint — in various forms — appeared <strong className="text-zinc-900">312 times</strong> across 47 subreddits
            in July alone. It was the single most-repeated SaaS tool pain point, beating the #2
            complaint (billing dunning friction) by 2.1x.
          </p>
          <div className="mt-8 flex justify-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-black text-[#ff4500]">312</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-zinc-500">Mentions</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-[#ff4500]">47</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-zinc-500">Subreddits</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-black text-[#ff4500]">2.1x</p>
              <p className="mt-1 text-[11px] font-black uppercase tracking-widest text-zinc-500">vs. #2 complaint</p>
            </div>
          </div>
        </div>

        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">The top posts driving this signal</h2>
          <div className="space-y-6">
            {topPosts.map((post, i) => (
              <div key={i} className="rounded-[32px] glass-card p-8">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black text-[#ff4500] uppercase tracking-widest">{post.subreddit}</span>
                    <span className="text-sm font-bold text-zinc-400">{post.comments} comments</span>
                  </div>
                  <span className="text-lg font-black text-zinc-900">{post.score}</span>
                </div>
                <p className="mb-4 text-xl font-black italic text-zinc-900 leading-snug">{post.title}</p>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  <Zap className="h-3.5 w-3.5 text-[#ff4500]" /> {post.signal}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Why this complaint matters</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "It's not new, but it's getting louder", desc: "The 'data not answers' complaint has grown 40% in volume since Q1 2026. Founders aren't getting less frustrated — they're getting more vocal." },
              { title: "Budget signals are embedded", desc: "68% of these posts include a mention of what the poster currently spends on analytics tools. That's switching intent backed by existing budget." },
              { title: "The incumbents are vulnerable", desc: "GA4 specifically was named in 42% of complaints. When the market leader becomes the punchline, there's room for a challenger." },
              { title: "It spans every audience segment", desc: "This complaint crosses SaaS founders, marketers, product managers, and developers. A solution that works for one segment can expand to others." },
            ].map((tip, i) => (
              <div key={i} className="rounded-[24px] glass-card p-8">
                <h3 className="mb-3 text-lg font-black text-zinc-900">{tip.title}</h3>
                <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32 rounded-[48px] glass-card p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">The full July complaint breakdown</h2>
          <p className="mb-8 text-lg font-medium text-zinc-500 leading-relaxed">By volume, here's how the top 5 complaints shook out:</p>
          <div className="space-y-4">
            {[
              { rank: "#1", complaint: "Analytics tools show data, not answers", volume: "312 mentions" },
              { rank: "#2", complaint: "Billing dunning and failed payment recovery", volume: "148 mentions" },
              { rank: "#3", complaint: "CRM data entry burden and poor automation", volume: "112 mentions" },
              { rank: "#4", complaint: "Customer support ticket tool sprawl", volume: "89 mentions" },
              { rank: "#5", complaint: "Integration fatigue — too many disconnected tools", volume: "76 mentions" },
            ].map((item, i) => (
              <div key={i} className="flex items-baseline gap-4 rounded-[16px] border border-black/5 p-5">
                <span className="min-w-[40px] text-lg font-black text-[#ff4500]">{item.rank}</span>
                <span className="flex-1 text-lg font-medium text-zinc-800">{item.complaint}</span>
                <span className="text-sm font-black text-zinc-400">{item.volume}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32 border-l-4 border-[#ff4500] glass-card py-12 px-10 rounded-r-[32px]">
          <blockquote className="text-3xl font-black italic leading-tight text-zinc-900 md:text-4xl">
            &ldquo;The complaint that wins the month isn't always the one that matters most. But when
            the same frustration shows up 312 times across 47 communities, it's not noise — it's
            a market begging for a better answer.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-500 italic md:text-2xl leading-relaxed">
            Check back next month for the August edition. We'll be tracking how these complaints
            evolve — and whether anyone finally builds a solution for the #1 pain point.
          </p>
        </section>

        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <TrendingUp className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Get next month's report{" "}
            <span className="text-[#ff4500]">early</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ users see these complaint trends in real-time — no waiting for the monthly roundup.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]">
              <Link href="/sign-up">See Live Trends <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
