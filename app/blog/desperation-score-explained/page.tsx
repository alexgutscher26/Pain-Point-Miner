/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  Brain,
  BarChart3,
  TrendingUp,
  Target,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "Reading a Desperation Score: What Actually Makes a Complaint 'Validated' | ThreddIQ Blog",
  description:
    "Behind the scenes of ThreddIQ's scoring engine — how we separate validated pain points from noise using desperation, frequency, budget signals, and competitive context.",
};

const factors = [
  {
    icon: <TrendingUp className="h-6 w-6 text-[#ff4500]" />,
    title: "Signal frequency across subreddits",
    desc: "A pain point that appears in r/SaaS, r/startups, and r/Entrepreneur in the same week is not a fluke — it is a pattern. The more independent communities a frustration surfaces in, the higher the frequency score. One post is noise. Ten posts across five subreddits is a market.",
    weight: "30% of score",
  },
  {
    icon: <MessageCircle className="h-6 w-6 text-[#ff4500]" />,
    title: "Sentiment intensity and urgency",
    desc: "Natural language processing evaluates the emotional weight. Does the user say 'I wish there was a better way' (curious, low urgency) or 'This is literally costing us hours every week and I'm about to lose my mind' (desperate, high urgency)? The model scores word choice, sentence structure, and contextual cues.",
    weight: "25% of score",
  },
  {
    icon: <Target className="h-6 w-6 text-[#ff4500]" />,
    title: "Budget signal detection",
    desc: "Mentions of specific dollar amounts, price ranges, or willingness-to-pay language trigger the budget signal sub-score. A post that includes 'I'd pay $50/month' scores higher than one with equal desperation but no budget context. Money talk is the strongest single predictor of purchase intent.",
    weight: "20% of score",
  },
  {
    icon: <Brain className="h-6 w-6 text-[#ff4500]" />,
    title: "Workaround complexity",
    desc: "Users who describe manual processes, duct-taped solutions, or multi-tool workflows are living with the problem daily. The more elaborate the workaround, the higher the score — because that user has already invested time solving the problem. They're primed to switch.",
    weight: "15% of score",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-[#ff4500]" />,
    title: "Competitive awareness and churn risk",
    desc: "If the user mentions a current tool by name and explains why they're frustrated with it, that's a churn signal we can score. Users who name-drop competitors and list specific complaints are further down the purchase funnel than users with generic frustration.",
    weight: "10% of score",
  },
];

const scoreRanges = [
  {
    range: "1–3",
    label: "Casual noise",
    desc: "Mild frustration or hypothetical wondering. Not actionable.",
    color: "bg-zinc-500/10 text-zinc-600",
  },
  {
    range: "4–6",
    label: "Signal emerging",
    desc: "Real frustration but low urgency. Worth monitoring. May grow.",
    color: "bg-amber-500/10 text-amber-700",
  },
  {
    range: "7–8",
    label: "Validated pain point",
    desc: "Clear frustration + workaround or tool mention. Act on this.",
    color: "bg-[#ff4500]/10 text-[#ff4500]",
  },
  {
    range: "9–10",
    label: "Hot buying signal",
    desc: "Desperation + budget + competitor mention. Drop everything.",
    color: "bg-green-500/10 text-green-700",
  },
];

const examples = [
  {
    text: '"Our team has tried three different project management tools. Asana is too bloated, ClickUp is too buggy, and Monday is too expensive. We just want something simple. I\'d happily pay $15/user/month."',
    score: "9.4",
    why: "Multiple tools tried (workaround), specific complaints per tool (competitive awareness), explicit price point (budget signal), team context (buying authority). This is a customer ready to switch.",
  },
  {
    text: '"Why is every analytics tool so overpriced? Frustrating."',
    score: "2.1",
    why: "Generic complaint with no specific tool, no budget context, no workaround mention. The user is venting emotionally, not shopping actively.",
  },
  {
    text: "\"We're currently using Airtable as a CRM because we couldn't find anything that fit. It's a hack and it's breaking. If there's a lightweight CRM that integrates with Gmail and Slack, we'd pay up to $50/seat.\"",
    score: "8.8",
    why: "Elaborate workaround (Airtable as CRM), specific integration requirements (Gmail + Slack), budget per seat mentioned. High intent.",
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
          <span className="text-zinc-900">Methodology</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black tracking-widest text-[#ff4500] uppercase">
            <Brain className="h-3.5 w-3.5" /> Methodology
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            Reading a <span className="text-[#ff4500]">desperation score</span>
          </h1>
          <em className="mb-6 block text-lg font-medium text-zinc-500 md:text-xl">
            What actually makes a complaint &ldquo;validated&rdquo;
          </em>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Every Reddit post ThreddIQ scans gets a desperation score from 1 to
            10. It&apos;s the single most important number in our system — and
            once you understand how it works, you&apos;ll never look at a
            complaint the same way again.
          </p>
        </header>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            The five factors behind every score
          </h2>
          <p className="mb-12 text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">
            No single factor determines the score. It&apos;s a weighted
            composite of five signals, each contributing to the final number:
          </p>
          <div className="space-y-10">
            {factors.map((f, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                  {f.icon}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-xl font-black text-zinc-900">
                      {f.title}
                    </h3>
                    <span className="rounded-full bg-zinc-500/10 px-3 py-0.5 text-[11px] font-black tracking-widest text-zinc-600 uppercase">
                      {f.weight}
                    </span>
                  </div>
                  <p className="text-lg leading-relaxed font-medium text-zinc-500">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mb-32 rounded-[48px] p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">
            Score ranges: what each tier means for you
          </h2>
          <div className="space-y-4">
            {scoreRanges.map((r, i) => (
              <div
                key={i}
                className="flex items-baseline gap-6 rounded-[16px] border border-black/5 p-6"
              >
                <span className="min-w-[60px] text-3xl font-black text-zinc-900">
                  {r.range}
                </span>
                <div>
                  <span
                    className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase ${r.color}`}
                  >
                    {r.label}
                  </span>
                  <p className="mt-2 text-[15px] font-medium text-zinc-500">
                    {r.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            See it in action
          </h2>
          <div className="space-y-8">
            {examples.map((ex, i) => (
              <div key={i} className="glass-card rounded-[24px] p-8">
                <div className="mb-4 flex items-center gap-4">
                  <span className="text-4xl font-black text-[#ff4500]">
                    {ex.score}
                  </span>
                  <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">
                    Desperation Score
                  </span>
                </div>
                <p className="mb-4 text-lg leading-relaxed font-bold text-zinc-800 italic">
                  {ex.text}
                </p>
                <div className="rounded-[16px] border border-black/5 bg-black/2 p-5">
                  <p className="text-sm leading-relaxed font-medium text-zinc-500">
                    <span className="font-bold text-zinc-700">
                      Why this score:
                    </span>{" "}
                    {ex.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mb-32 rounded-r-[32px] border-l-4 border-[#ff4500] px-10 py-12">
          <blockquote className="text-3xl leading-tight font-black text-zinc-900 italic md:text-4xl">
            &ldquo;The desperation score is the single most useful signal we
            track. It cuts through the noise and tells us exactly which threads
            to drop everything for.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-zinc-500 italic md:text-2xl">
            The desperation score turns Reddit from a firehose of opinions into
            a ranked list of market opportunities. Every post gets a number.
            Every number tells you what to do next.
          </p>
        </section>

        <div className="glass-card relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <BarChart3 className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            See every post&apos;s <span className="text-[#ff4500]">score</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ scores every Reddit pain point across your niche. Stop
            guessing which complaints matter. Start building what people will
            actually pay for.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]"
            >
              <Link href="/sign-up">
                Try the Score Engine <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
