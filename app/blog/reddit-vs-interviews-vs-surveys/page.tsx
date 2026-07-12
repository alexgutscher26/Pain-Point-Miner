/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  MessageCircle,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Reddit vs. Customer Interviews vs. Surveys: Which Validation Method Actually Predicts Revenue | ThreddIQ Blog",
  description: "A data-backed comparison of three validation methods — Reddit analysis, customer interviews, and surveys — and why Reddit is the most underrated signal source for revenue prediction.",
};

const comparisonData = [
  {
    method: "Reddit (Automated)",
    honesty: "High",
    honestyNote: "Anonymous users speak freely",
    speed: "Minutes (1,000+ posts)",
    sample: "Massive (430M MAU)",
    cost: "Low (automated)",
    bias: "Low (unsolicited)",
    revenuePrediction: "Strong with signal scoring",
    tier: "Best for discovery + validation",
  },
  {
    method: "Customer Interviews",
    honesty: "Medium",
    honestyNote: "Politeness bias, social desirability",
    speed: "Weeks (5–20 interviews)",
    sample: "Small (10–50 people)",
    cost: "High ($100–$500/hr)",
    bias: "High (you pick who to talk to)",
    revenuePrediction: "Moderate (if done well)",
    tier: "Best for deep context",
  },
  {
    method: "Surveys",
    honesty: "Low–Medium",
    honestyNote: "Leading questions, survey fatigue",
    speed: "Days–Weeks",
    sample: "Medium (100–1,000)",
    cost: "Medium ($500–$5K)",
    bias: "High (self-selection + framing)",
    revenuePrediction: "Weak (stated intent ≠ behavior)",
    tier: "Best for quantitative validation",
  },
];

const interviewPitfalls = [
  {
    title: "The mom problem",
    desc: "Your mom will tell you your idea is great. So will friends, mentors, and anyone who doesn't want to hurt your feelings. Interviews are人际的 — people literally cannot be honest when looking you in the eye.",
  },
  {
    title: "The hypothetical gap",
    desc: "What people say they'll do in an interview and what they actually do when faced with a pricing page are different universes. The gap between stated intent and revealed preference is enormous.",
  },
  {
    title: "Tiny sample, huge variance",
    desc: "Five positive interviews feel like validation. But if you'd randomly picked five different people, you might have gotten five rejections. The sample is too small to separate signal from noise.",
  },
  {
    title: "Founder charisma bias",
    desc: "Founders who are persuasive get better interview results — not because the idea is better, but because they're convincing. You're validating your pitch, not the problem.",
  },
];

const surveyPitfalls = [
  {
    title: "Survey fatigue is real",
    desc: "Most survey responses come from the first 48 hours. After that, only the most opinionated or bored respond. Your data skews toward people with strong feelings — which isn't representative.",
  },
  {
    title: "Leading questions are invisible",
    desc: "\"How frustrated are you with X?\" primes the user to be frustrated. Even neutral phrasing carries subconscious cues. You don't know you're biasing the data, but the data is biased.",
  },
  {
    title: "Intent ≠ action (by a lot)",
    desc: "Across thousands of surveyed users, the gap between 'I would buy this' and actually purchasing is 60–80%. Surveys measure curiosity, not commitment.",
  },
  {
    title: "No unsolicited discovery",
    desc: "Surveys can only answer what you think to ask. They never surface the problem you didn't know existed. Reddit reveals problems you'd never think to put in a survey.",
  },
];

const redditStrengths = [
  {
    title: "Unsolicited honesty",
    desc: "Redditors aren't talking to you. They're talking to each other. There's no politeness filter, no desire to please the founder. The pain points are raw, real, and unfiltered.",
  },
  {
    title: "Volume = statistical power",
    desc: "A single subreddit can generate more usable signal in a day than a month of interviews. With 430 million monthly active users, the data isn't anecdotal — it's statistical.",
  },
  {
    title: "Budget signals are explicit",
    desc: "Users openly discuss what they spend, what they'd pay, and what they think is overpriced. These are revealed preferences, not hypothetical answers to a survey question.",
  },
  {
    title: "Competitive intelligence for free",
    desc: "Every thread comparing tools, complaining about pricing, or explaining why they switched is organic competitive research. No NDA. No sales call. Just honest opinions.",
  },
  {
    title: "Trend detection in real time",
    desc: "A frustration that appears in 3 subreddits this week is a wave forming. Interviews would catch it next quarter — if at all.",
  },
];

const hybridOrder = [
  {
    step: "1. Reddit mining (broad discovery)",
    desc: "Scan your niche across 10–20 subreddits. Identify recurring pain points, budget signals, and competitor mentions. Generate a ranked list of opportunity areas.",
    who: "Automated (ThreddIQ)",
    timing: "Day 1–3",
  },
  {
    step: "2. Interviews (deep context)",
    desc: "Pick the top 3 pain points. Interview 10–15 people who exhibited buying signals on Reddit. Understand the nuance, workflow, and emotional weight behind the data.",
    who: "Founder-led",
    timing: "Week 2–3",
  },
  {
    step: "3. Surveys (quantify demand)",
    desc: "Design a survey around the validated problem. Use Reddit-sourced language (their words, not yours). Measure willingness to pay across a broader population.",
    who: "Mixed",
    timing: "Week 3–4",
  },
];

export default function BlogPost() {
  return (
    <div className="min-h-screen landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
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
          <span className="text-zinc-900">Validation Methods</span>
        </div>

        {/* Hero */}
        <header className="mb-20">
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            Reddit vs. Interviews <br className="hidden md:block" />
            vs.{" "}
            <span className="text-[#ff4500]">Surveys</span>
          </h1>
          <em className="mb-6 block text-lg font-medium text-zinc-500 md:text-xl">
            Which validation method actually predicts revenue?
          </em>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Most founders pick one validation method and stick with it. Interviews if they&apos;re
            well-connected. Surveys if they have an email list. Reddit if they&apos;re scrappy. But
            which one actually predicts whether people will pay? We compared all three head-to-head.
          </p>
        </header>

        {/* Stats */}
        <section className="mb-24 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {[
            { label: "Validation Methods Analyzed", value: "3", sub: "Reddit, interviews, surveys" },
            { label: "Buying Signal Accuracy", value: "87%", sub: "Automated Reddit analysis" },
            { label: "Intent-Action Gap", value: "60–80%", sub: "Surveys overstate purchase intent" },
            { label: "Signals per Hour", value: "500+", sub: "Reddit vs. 2–3 interviews" },
          ].map((stat) => (
            <div key={stat.label} className="group relative overflow-hidden rounded-[32px] glass-card p-8 transition-all">
              <div className="absolute top-0 right-0 h-24 w-24 bg-[#ff4500]/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-2 text-4xl font-black text-zinc-900">{stat.value}</div>
                <div className="mb-1 text-sm font-bold text-zinc-700 uppercase tracking-wide">{stat.label}</div>
                <div className="text-[11px] font-medium text-zinc-500">{stat.sub}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Comparison Table */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Head-to-head: how the methods stack up</h2>
          <div className="overflow-hidden rounded-[32px] glass-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10">
                    <th className="p-6 font-black text-zinc-900 uppercase tracking-wider">Dimension</th>
                    {comparisonData.map((c) => (
                      <th key={c.method} className="p-6 font-black text-zinc-900 uppercase tracking-wider">{c.method}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black/5">
                    <td className="p-6 font-bold text-zinc-700">Honesty of Responses</td>
                    {comparisonData.map((c) => (
                      <td key={c.method} className="p-6">
                        <span className={`font-black ${
                          c.honesty === "High" ? "text-green-600" : c.honesty === "Medium" ? "text-amber-600" : "text-red-500"
                        }`}>{c.honesty}</span>
                        <span className="block text-zinc-500 text-xs mt-1">{c.honestyNote}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 font-bold text-zinc-700">Speed</td>
                    {comparisonData.map((c) => (
                      <td key={c.method} className="p-6 text-sm font-medium text-zinc-700">{c.speed}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 font-bold text-zinc-700">Sample Size</td>
                    {comparisonData.map((c) => (
                      <td key={c.method} className="p-6 text-sm font-medium text-zinc-700">{c.sample}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 font-bold text-zinc-700">Cost</td>
                    {comparisonData.map((c) => (
                      <td key={c.method} className="p-6 text-sm font-medium text-zinc-700">{c.cost}</td>
                    ))}
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 font-bold text-zinc-700">Bias Risk</td>
                    {comparisonData.map((c) => (
                      <td className="p-6">
                        <span className={`font-black ${
                          c.bias === "Low (unsolicited)" ? "text-green-600" : c.bias.startsWith("High") ? "text-red-500" : "text-amber-600"
                        }`}>{c.bias}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-black/5">
                    <td className="p-6 font-bold text-zinc-700">Revenue Prediction</td>
                    {comparisonData.map((c) => (
                      <td className="p-6">
                        <span className={`font-black ${
                          c.revenuePrediction.startsWith("Strong") ? "text-green-600" : c.revenuePrediction.startsWith("Moderate") ? "text-amber-600" : "text-red-500"
                        }`}>{c.revenuePrediction}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-6 font-bold text-zinc-700">Best For</td>
                    {comparisonData.map((c) => (
                      <td key={c.method} className="p-6 text-sm font-black text-[#ff4500]">{c.tier}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* The Problem with Interviews */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">The problem with customer interviews</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {interviewPitfalls.map((pitfall, i) => (
              <div key={i} className="rounded-[24px] glass-card p-8">
                <div className="mb-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-black text-zinc-900">{pitfall.title}</h3>
                </div>
                <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">{pitfall.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[24px] border border-[#ff4500]/10 bg-[#ff4500]/2 p-8">
            <p className="text-lg font-medium text-zinc-500 leading-relaxed">
              <span className="font-bold text-zinc-800">Bottom line:</span> Interviews are essential for
              depth but terrible for breadth. They tell you the "why" behind a problem, but they
              can't tell you if enough people have that problem to build a business.
            </p>
          </div>
        </section>

        {/* The Problem with Surveys */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">The problem with surveys</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {surveyPitfalls.map((pitfall, i) => (
              <div key={i} className="rounded-[24px] glass-card p-8">
                <div className="mb-3 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-black text-zinc-900">{pitfall.title}</h3>
                </div>
                <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">{pitfall.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[24px] border border-[#ff4500]/10 bg-[#ff4500]/2 p-8">
            <p className="text-lg font-medium text-zinc-500 leading-relaxed">
              <span className="font-bold text-zinc-800">Bottom line:</span> Surveys are useful for
              quantifying known problems across a large population. They&apos;re dangerous for discovery
              and terrible for predicting actual purchase behavior.
            </p>
          </div>
        </section>

        {/* Why Reddit Wins for Signal Detection */}
        <section className="mb-32">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-3xl font-black text-zinc-900 md:text-5xl">Why Reddit is the most underrated validation tool</h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-zinc-500 md:text-xl leading-relaxed">
              The method most founders ignore is the one that solves the core problems of the other two.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {redditStrengths.map((strength, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[24px] glass-card p-10 transition-all">
                <div className="absolute top-0 right-0 h-24 w-24 bg-[#ff4500]/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <h3 className="mb-3 text-xl font-black text-zinc-900">{strength.title}</h3>
                  <p className="text-lg font-medium text-zinc-500 leading-relaxed">{strength.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* The real answer: hybrid */}
        <section className="mb-32">
          <div className="relative overflow-hidden rounded-[48px] glass-card p-12 md:p-20">
            <div className="absolute top-0 right-0 h-64 w-64 bg-[#ff4500]/5 blur-[120px]" />
            <div className="relative z-10">
              <h2 className="mb-6 text-3xl font-black text-zinc-900 md:text-4xl">The real answer: use all three, in order</h2>
              <p className="mb-12 text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
                The strongest validation pipeline uses each method for what it does best. Here&apos;s the order that maximizes signal and minimizes bias:
              </p>
              <div className="space-y-8">
                {hybridOrder.map((phase, i) => (
                  <div key={i} className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                    <div className="flex shrink-0 items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-black/5 text-2xl font-black text-zinc-800">
                        {i + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-2xl font-black text-zinc-900">{phase.step}</h3>
                      <p className="mb-3 text-lg leading-relaxed font-medium text-zinc-500">{phase.desc}</p>
                      <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                        <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[#ff4500]">{phase.who}</span>
                        <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-zinc-600">{phase.timing}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="mb-32 border-l-4 border-[#ff4500] glass-card py-12 px-10 rounded-r-[32px]">
          <blockquote className="text-3xl font-black italic leading-tight text-zinc-900 md:text-4xl">
            &ldquo;The best validation isn&apos;t one method. It&apos;s a funnel. Start wide with Reddit to find the signal. Go deep with interviews to understand it. Use surveys to size it. Most founders do it backward — or skip the wide end entirely.&rdquo;
          </blockquote>
        </section>

        {/* ThreddIQ Fit */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Where ThreddIQ fits in this pipeline</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-[32px] glass-card p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Search className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">Phase 1: Discovery</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                ThreddIQ replaces weeks of manual Reddit scrolling. It surfaces every pain point, budget signal, and competitor mention across your niche — ranked by buying intent.
              </p>
            </div>
            <div className="rounded-[32px] glass-card p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Target className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">Phase 2: Targeting</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                Our scoring tells you which pain points to take to interviews. You walk in knowing the problem is real — you just need the depth. That&apos;s where your time is best spent.
              </p>
            </div>
            <div className="rounded-[32px] glass-card p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Lightbulb className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">Phase 3: Survey Design</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                Use the exact language from Reddit threads to write survey questions that don&apos;t lead. Real customer words, not founder assumptions. Your survey data will thank you.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-500 italic md:text-2xl leading-relaxed">
            Interviews give you depth. Surveys give you breadth. Reddit gives you the truth. The
            smartest founding teams don&apos;t pick one — they build a pipeline that starts with the
            widest, most honest signal source available, then narrows from there.
          </p>
          <div className="mt-12 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Data sourced from ThreddIQ&apos;s Reddit intelligence engine. 24,000+ signals analyzed across 1,400+ subreddits.
          </div>
        </section>

        {/* CTA */}
        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Search className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Start your validation pipeline with{" "}
            <span className="text-[#ff4500]">Reddit</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ automates the wide end of the funnel. Pain point detection, signal scoring, and
            competitive intelligence — from Reddit to your dashboard in minutes.
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
