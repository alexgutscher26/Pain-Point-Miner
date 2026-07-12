/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  Swords,
  Target,
  TrendingUp,
  Lightbulb,
  Users,
  MessageCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How to Track a Competitor's Complaints on Reddit and Turn Them Into Your Roadmap | ThreddIQ Blog",
  description: "Step-by-step guide to monitoring competitor mentions, complaints, and churn signals on Reddit — and using that intel to build your product roadmap.",
};

const steps = [
  {
    icon: <Search className="h-6 w-6 text-[#ff4500]" />,
    title: "Add competitors as tracked entities in ThreddIQ",
    desc: "From your dashboard, add up to 10 competitors as tracked entities. Include their product name, common misspellings, and the tool they're most often compared against. ThreddIQ will scan every post across your tracked subreddits for any mention of these names.",
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-[#ff4500]" />,
    title: "Filter by complaint keywords around competitor names",
    desc: "Not every mention is useful. 'We use [competitor] and it's fine' is not actionable. Set secondary filters to catch complaint-intent posts: '[competitor] is slow,' '[competitor] raised prices,' 'switching from [competitor],' '[competitor] sucks.' These compound filters surface the gold.",
  },
  {
    icon: <Swords className="h-6 w-6 text-[#ff4500]" />,
    title: "Analyze the complaint pattern per competitor",
    desc: "Your dashboard groups complaints by competitor so you can see patterns at a glance. Competitor A might have 40% of complaints about pricing, while Competitor B has 60% about missing features. Their weaknesses become your feature roadmap.",
  },
  {
    icon: <Users className="h-6 w-6 text-[#ff4500]" />,
    title: "Engage with switching signals",
    desc: "When a user says 'I'm looking for an alternative to [competitor]' or 'We're evaluating options,' that's a lead. ThreddIQ flags these as high-intent switching signals. You can route them to Slack, tag them in your CRM, or respond directly.",
  },
];

const complaintCategories = [
  { label: "Pricing complaints", share: "34%", desc: "Too expensive, raised prices, bad value for money" },
  { label: "Feature gaps", share: "28%", desc: "Missing integrations, limited functionality, bugs" },
  { label: "Customer support", share: "18%", desc: "Slow response, unhelpful, automated loops" },
  { label: "UX / usability", share: "12%", desc: "Steep learning curve, confusing interface, slow" },
  { label: "Trust / reliability", share: "8%", desc: "Downtime, security concerns, data loss" },
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
            <Eye className="h-3.5 w-3.5" /> Tutorial
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            Track a competitor&apos;s complaints on{" "}
            <span className="text-[#ff4500]">Reddit</span>
            <br className="hidden md:block" /> and turn them into your roadmap
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Your competitors&apos; customers are posting their biggest frustrations in public — every
            single day. Here&apos;s how to collect that intel automatically and use it to build a
            product roadmap your competitors won&apos;t see coming.
          </p>
        </header>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Why Reddit is better than any competitive research tool</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              { title: "No NDA required", desc: "Competitor customers speak freely on Reddit. They name features they hate, pricing they resent, and support experiences that made them rage. This is market research you can't buy from G2." },
              { title: "Churn signals in real time", desc: "A user posting 'We're evaluating alternatives to [competitor]' is a lead that's actively shopping. Traditional competitive intel catches this months later — if at all." },
              { title: "Feature requests for your backlog", desc: "Every '[competitor] should have X' thread is a feature request for your product. The market is telling you exactly where your competitor is falling short." },
              { title: "Pricing intel straight from buyers", desc: "Users discuss what they pay, what they think is fair, and what would make them switch. That's pricing research without a sales call." },
            ].map((item, i) => (
              <div key={i} className="rounded-[32px] glass-card p-10">
                <h3 className="mb-4 text-xl font-black text-zinc-900">{item.title}</h3>
                <p className="text-lg font-medium text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">The 4-step competitor tracking workflow</h2>
          <div className="space-y-10">
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
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">What competitor complaint data looks like</h2>
          <p className="mb-8 text-lg font-medium text-zinc-500">ThreddIQ categorizes every competitor mention by complaint type:</p>
          <div className="space-y-4">
            {complaintCategories.map((c, i) => (
              <div key={i} className="flex items-center gap-6 rounded-[16px] border border-black/5 p-5">
                <span className="min-w-[80px] text-2xl font-black text-[#ff4500]">{c.share}</span>
                <div className="flex-1">
                  <span className="text-sm font-black text-zinc-900 uppercase tracking-wider">{c.label}</span>
                  <p className="text-[13px] font-medium text-zinc-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Turning complaints into roadmap items</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "High frequency + pricing complaints", desc: "Your competitor's pricing is their biggest weakness. Position yourself as the affordable alternative. Build features that justify the price gap and make switching a no-brainer." },
              { title: "High frequency + feature gaps", desc: "This is your product roadmap. Build the feature your competitor won't or can't ship. Every complaint is a prioritization signal from the market." },
              { title: "High frequency + support complaints", desc: "Your opportunity is to be the competitor with great onboarding and support. Feature parity + better service is a winning combo when the market is frustrated with both." },
            ].map((item, i) => (
              <div key={i} className="rounded-[24px] glass-card p-8">
                <h3 className="mb-3 text-lg font-black text-zinc-900">{item.title}</h3>
                <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32 border-l-4 border-[#ff4500] glass-card py-12 px-10 rounded-r-[32px]">
          <blockquote className="text-3xl font-black italic leading-tight text-zinc-900 md:text-4xl">
            &ldquo;Every complaint about your competitor is a gift. It&apos;s a feature request you didn&apos;t have
            to pay for, validated by a customer you didn&apos;t have to find.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-500 italic md:text-2xl leading-relaxed">
            Your competitors&apos; Reddit threads are a public roadmap with their customers doing the
            research for you. The only question is whether you&apos;re reading it.
          </p>
        </section>

        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Swords className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Start tracking competitors <span className="text-[#ff4500]">today</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            Add your competitors to ThreddIQ and start receiving categorized complaint reports.
            Your next feature roadmap is already being written on Reddit.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]">
              <Link href="/sign-up">Track Competitors <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
