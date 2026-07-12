/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  Bell,
  Zap,
  Filter,
  Settings,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Set Up Real-Time Slack Alerts for Reddit Pain Points | ThreddIQ Blog",
  description: "Step-by-step guide to configuring ThreddIQ Slack alerts so you never miss a hot pain point — filter by keyword, subreddit, desperation score, and budget signal.",
};

const steps = [
  {
    icon: <Search className="h-6 w-6 text-[#ff4500]" />,
    title: "Define your signal keywords",
    desc: "Start with the terms your target customers actually use when they're frustrated. Think 'overpriced,' 'waste of money,' 'switching to,' 'wish there was,' 'workaround.' Add your niche-specific terms — 'CRM migration,' 'analytics sucks,' 'deployment pain.' ThreddIQ lets you create multiple keyword groups so you can track different angles simultaneously.",
  },
  {
    icon: <Filter className="h-6 w-6 text-[#ff4500]" />,
    title: "Set your signal-quality threshold",
    desc: "Not every mention is worth waking up for. In your ThreddIQ dashboard, set a minimum desperation score — we recommend 7+ for Slack alerts. You can also filter by budget signal presence (someone mentions a dollar amount) and competitive mentions (they name-drop a tool they're leaving). This is the difference between a ping and a signal.",
  },
  {
    icon: <Bell className="h-6 w-6 text-[#ff4500]" />,
    title: "Connect your Slack workspace",
    desc: "One click from the ThreddIQ integrations page. Authorize the ThreddIQ Slack app, pick which channel gets the alerts — we recommend a dedicated #reddit-signals channel per product or niche — and you're live. The entire connection takes under 60 seconds.",
  },
  {
    icon: <Settings className="h-6 w-6 text-[#ff4500]" />,
    title: "Configure alert frequency and format",
    desc: "Choose real-time (every new matching post), digest (hourly summary), or daily roundup. Each alert includes the post title, subreddit, desperation score, budget mention highlight, and a direct link to the thread. Your team can discuss and decide without leaving Slack.",
  },
];

const alertExample = [
  { label: "Subreddit", value: "r/SaaS" },
  { label: "Desperation Score", value: "9/10" },
  { label: "Budget Signal", value: "$100–$200/month detected" },
  { label: "Pain Point", value: "\"Every analytics tool is overkill for what we need\"" },
  { label: "Competitor Mention", value: "Mixpanel, Amplitude" },
  { label: "Action", value: "→ Research opportunity" },
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
          <span className="text-zinc-900">Tutorial</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black text-[#ff4500] uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" /> Tutorial
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            How to set up real-time{" "}
            <span className="text-[#ff4500]">Slack alerts</span>
            <br className="hidden md:block" /> for Reddit pain points
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Hot pain points don't wait for your morning scan. A thread with a 9/10 desperation score
            and a &ldquo;I&apos;d pay $200/month&rdquo; mention is a customer knocking. Here&apos;s how to route that
            signal straight to your team&apos;s Slack in under 5 minutes.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">What you&apos;ll build</h2>
          <p className="mb-10 text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
            By the end of this tutorial, you&apos;ll have a live Slack integration that pushes
            high-quality Reddit pain points to a channel of your choice — filtered by relevance,
            scored by desperation, and enriched with budget signals. Here&apos;s the full setup:
          </p>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-black/5 text-2xl font-black text-zinc-800">{i + 1}</div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">{step.icon}</div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-3 text-2xl font-black text-zinc-900">{step.title}</h3>
                  <p className="text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32 rounded-[48px] glass-card p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">What an alert looks like in Slack</h2>
          <p className="mb-8 text-lg font-medium text-zinc-500">Every ThreddIQ Slack alert includes:</p>
          <div className="space-y-4">
            {alertExample.map((item, i) => (
              <div key={i} className="flex items-baseline gap-4 rounded-[16px] border border-black/5 p-5">
                <span className="min-w-[160px] text-xs font-black uppercase tracking-widest text-zinc-600">{item.label}</span>
                <span className="text-lg font-medium text-zinc-800">{item.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Pro tips for better alerts</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "Separate channels per product", desc: "If you're tracking multiple niches, create one Slack channel per product line. #signals-analytics, #signals-devops, #signals-sales — each with its own keyword filter." },
              { title: "Escalate by score range", desc: "Route 9–10 desperation scores to a private #hot-leads channel. Route 6–8 to #pain-points for team discussion. Below 6, let them accumulate in your dashboard digest." },
              { title: "Add competitor names as keywords", desc: "Include your top 3 competitors in your keyword groups. Every time a user complains about them, you get an alert. It's the cheapest competitive research you'll ever run." },
              { title: "Share alerts with your whole team", desc: "Product, sales, and support all benefit from real-time Reddit signals. Product learns what to build. Sales learns who's shopping. Support learns what's broken." },
            ].map((tip, i) => (
              <div key={i} className="rounded-[24px] glass-card p-8">
                <h3 className="mb-3 text-lg font-black text-zinc-900">{tip.title}</h3>
                <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32 border-l-4 border-[#ff4500] glass-card py-12 px-10 rounded-r-[32px]">
          <blockquote className="text-3xl font-black italic leading-tight text-zinc-900 md:text-4xl">
            &ldquo;The best time to respond to a pain point is the minute it&apos;s posted. By hour 6, the thread
            has 200 comments and the OP has already moved on. Slack alerts cut your response time from
            hours to seconds.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-500 italic md:text-2xl leading-relaxed">
            Slack alerts turn Reddit from a place you check once a week into a real-time customer
            research feed. Once you&apos;ve felt the rush of catching a 9/10 desperation score
            10 minutes after it&apos;s posted, you&apos;ll never go back to manual scanning.
          </p>
        </section>

        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Bell className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Get alerts in{" "}
            <span className="text-[#ff4500]">5 minutes</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            Connect Slack, set your filters, and start receiving real-time pain point alerts. No
            credit card required.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]">
              <Link href="/sign-up">Set Up Slack Alerts <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
