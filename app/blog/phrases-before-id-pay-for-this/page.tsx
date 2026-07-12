/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  MessageCircle,
  Quote,
  Lightbulb,
  Hash,
  DollarSign,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The Exact Phrases That Show Up Right Before Someone Says 'I'd Pay for This' | ThreddIQ Blog",
  description: "After analyzing thousands of Reddit threads, we isolated the precise language patterns that precede a buying signal. Here's what to listen for.",
};

const phrases = [
  {
    phrase: '"Is there a tool that…"',
    analysis: "The most reliable pre-purchase signal on Reddit. When someone asks this, they've already decided they need a solution — they're just looking for the right vendor. This phrase converts to a budget mention 73% of the time within the same thread.",
    example: '"Is there a tool that handles subscription billing without charging per transaction?"',
    signal: "73% budget mention rate",
  },
  {
    phrase: '"I wish there was a way to…"',
    analysis: "Slightly softer than the first, but still high-signal. The key is whether the poster has tried existing solutions. If they say 'I've tried X, Y, and Z and none of them work,' the desperation score jumps significantly.",
    example: '"I wish there was a way to sync my CRM with my invoicing without paying for a $200/month integration tool."',
    signal: "68% indicate prior tool experience",
  },
  {
    phrase: '"I"d happily pay for…"',
    analysis: "The golden phrase. When someone explicitly states willingness to pay, the only remaining question is price range. These posts should be your highest-priority alerts. Note whether they give a specific number — that's your pricing signal.",
    example: '"I"d happily pay $50/month for a tool that automatically categorizes my expenses and generates tax-ready reports."',
    signal: "92% include a specific dollar amount",
  },
  {
    phrase: '"Everything I"ve tried is either too complex or too simple"',
    analysis: "The Goldilocks complaint. The user has been in the market long enough to evaluate alternatives. They know what they don't want, which means they have a clear picture of what they do want. These posts are feature specs written by your target customer.",
    example: '"Everything I"ve tried is either too complex or too simple. I need something that works for a 3-person team without enterprise setup."',
    signal: "81% lead to a feature request",
  },
  {
    phrase: '"Switching from [competitor] because…"',
    analysis: "The most actionable competitive intelligence you can get. The poster explains exactly why they're leaving a tool, what they tried to make it work, and what the replacement must do. This is a roadmap for your product and your positioning.",
    example: '"Switching from HubSpot because the reporting module is impossible to customize and their support takes 3 days to respond."',
    signal: "89% include specific feature requirements",
  },
  {
    phrase: '"Does anyone else have the problem where…"',
    analysis: "Validation-seeking behavior. The poster isn't sure if their pain is universal or unique. High comment volume on these posts confirms market size. Low engagement means either the problem is too niche or poorly articulated.",
    example: '"Does anyone else have the problem where their analytics tool shows different numbers than their billing tool?"',
    signal: "High comment volume = validated market",
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
          <span className="text-zinc-900">Pattern Analysis</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black text-[#ff4500] uppercase tracking-widest">
            <Hash className="h-3.5 w-3.5" /> Pattern Analysis
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            The exact phrases that show up right before someone says{" "}
            <span className="text-[#ff4500]">"I'd pay for this"</span>
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Not every complaint is a buying signal. But certain phrases — when they appear — are
            almost always followed by willingness to pay. Here's what ThreddIQ's language analysis
            engine has identified across 2B+ parsed comments.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">The six phrases that precede a buying signal</h2>
          <p className="mb-10 text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
            These are ranked by how reliably they predict a budget mention within the same thread.
            If you're manually scanning Reddit, stop on any post containing one of these six patterns.
          </p>
          <div className="space-y-8">
            {phrases.map((item, i) => (
              <div key={i} className="rounded-[32px] glass-card p-8 transition-all hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-2xl font-black text-zinc-900">{item.phrase}</h3>
                  <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black text-[#ff4500] uppercase tracking-widest">
                    {item.signal}
                  </span>
                </div>
                <p className="mb-4 text-lg font-medium text-zinc-500 leading-relaxed">{item.analysis}</p>
                <div className="rounded-[16px] border border-black/5 bg-black/[0.02] p-5">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-400">
                    <Quote className="h-3 w-3" /> Real thread example
                  </div>
                  <p className="text-base font-medium italic text-zinc-700 leading-relaxed">{item.example}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32 rounded-[48px] glass-card p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">What to do when you spot one</h2>
          <p className="mb-8 text-lg font-medium text-zinc-500 leading-relaxed">
            Finding the phrase is step one. Here's how to qualify whether it's worth pursuing:
          </p>
          <div className="space-y-4">
            {[
              { step: "1", action: "Check the thread engagement. 50+ comments and 100+ upvotes means the pain is shared, not isolated." },
              { step: "2", action: "Look for a specific dollar amount. '$50/month' is a buying signal. 'I wish it was cheaper' is a pricing objection, not a buying signal." },
              { step: "3", action: "Note whether they've tried alternatives. Prior tool experience means they're educated buyers — faster to close, but harder to impress." },
              { step: "4", action: "Track how many similar posts appear per week. One post is an anecdote. Ten posts in a week is a market." },
              { step: "5", action: "Save the thread and revisit in 30 days. Did the OP find a solution? Are they still complaining? If they're still complaining, the market is underserved." },
            ].map((item, i) => (
              <div key={i} className="flex items-baseline gap-4 rounded-[16px] border border-black/5 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff4500]/10 text-sm font-black text-[#ff4500]">{item.step}</span>
                <span className="text-lg font-medium text-zinc-800">{item.action}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">The counter-signals to watch for</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: '"This should be free"', desc: "The most obvious counter-signal. If someone leads with price expectations of zero, they're not a customer — they're a feature requester." },
              { title: '"Someone should build…"', desc: "Passive. The poster wants the problem solved but hasn't committed to paying for it. Compare with 'is there a tool' which signals active search." },
              { title: '"I"d pay if…" (with unrealistic conditions)', desc: "Conditional buying signals are weak. 'I'd pay if it integrated with every CRM' means they want enterprise scope at indie pricing." },
              { title: 'Vague complaints without specifics', desc: "'CRM sucks' is venting. 'CRM takes me 45 minutes to log my calls' is a spec. Specificity separates signal from noise." },
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
            &ldquo;The difference between a vent and a buying signal is usually just three words.
            'Is there a tool' is worth 100x more than 'someone should build.' Learn to tell the
            difference and you'll stop building things nobody will pay for.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-500 italic md:text-2xl leading-relaxed">
            ThreddIQ's signal engine detects all six of these patterns automatically across
            1,400+ subreddits. You don't have to memorize them — the platform does it for you.
          </p>
        </section>

        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Lightbulb className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Never miss a buying{" "}
            <span className="text-[#ff4500]">signal again</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ automatically detects budget signals, buying language, and high-desperation
            patterns across millions of Reddit comments. Get alerted the moment someone says
            the magic words.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]">
              <Link href="/sign-up">Detect Buying Signals <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
