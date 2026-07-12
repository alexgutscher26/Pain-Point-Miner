/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  Target,
  Swords,
  Shield,
  Zap,
  TrendingUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why Most 'Validated' Ideas Still Fail | ThreddIQ Blog",
  description: "Validation proves demand exists. It doesn't prove you can win. Here's why most founders confuse market demand with competitive readiness — and how to avoid the trap.",
};

const reasons = [
  {
    icon: <Swords className="h-6 w-6 text-red-500" />,
    title: "The market is validated, but the moat isn't",
    desc: "The most dangerous place to be is a validated market that everyone can see. If 100 founders can read the same Reddit threads and identify the same pain point, you're not validating demand — you're crowding a race. Demand alone isn't a moat. The question isn't 'Is the problem real?' It's 'Why us?'",
  },
  {
    icon: <Shield className="h-6 w-6 text-amber-500" />,
    title: "Existing solutions are 'good enough'",
    desc: "Users say they're frustrated with Tool X. But they're still paying for Tool X. The switching cost — retraining the team, migrating data, changing workflows — is higher than the frustration. Validation catches the complaint. It misses the inertia. And inertia kills SaaS.",
  },
  {
    icon: <Zap className="h-6 w-6 text-purple-500" />,
    title: "Willingness to vent ≠ willingness to switch",
    desc: "Someone will spend 10 minutes writing a scathing Reddit post about how much they hate their CRM. They will not spend 10 hours migrating to a new one. The energy behind a complaint and the energy required to switch are rarely proportional. Validation measures the complaint. It doesn't measure the switching cost.",
  },
  {
    icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
    title: "The market is growing, but not for you",
    desc: "A growing market is the #1 predictor of startup success — but only if you're positioned in the growth vector. If the market is growing 30% YoY but your solution targets a shrinking segment within it (or the wrong buyer persona), the tide won't lift your boat.",
  },
  {
    icon: <Target className="h-6 w-6 text-green-500" />,
    title: "You validated the feature, not the company",
    desc: "One of the most common validation traps: building a feature that users want, but that can't sustain a business. Users will pay $10/month for a better calendar integration. They won't pay enough for it to fund a team, infrastructure, and support. The feature is validated. The company isn't.",
  },
];

const questions = [
  {
    q: "Is the switching cost higher than the frustration?",
    why: "Most validation methods only measure frustration. The real math is frustration minus switching cost. If switching cost wins, nobody moves.",
  },
  {
    q: "Can you win this market as a startup, or does it require an incumbent?",
    why: "Some problems are best solved by the existing player adding a feature. If the feature is table-stakes for the incumbent's roadmap, you're building a feature, not a company.",
  },
  {
    q: "What's your unfair advantage — or are you betting on out-executing everyone?",
    why: "Out-execution is not a strategy. If your only edge is 'we'll build faster' and the market is obvious, someone with more capital will out-execute you.",
  },
  {
    q: "Is the revenue per customer enough to build a real business?",
    why: "A validated pain point at $5/user/month with a niche audience is a lifestyle business. A validated pain point at $100/user/month in a growing market is a VC-backable company. Both are validated. Only one is fundable.",
  },
  {
    q: "Do the people who signal the pain have budget authority?",
    why: "Reddit is full of individual contributors who want better tools. The person who signs the check is their CTO or CFO. Validation with the user is not validation with the buyer.",
  },
];

const misreadExamples = [
  {
    signal: "\"I hate how complicated [tool] is.\"",
    misread: "They want a simpler tool.",
    reality: "They want [tool] to improve. They won't abandon their entire workflow unless the new tool is 10x better AND has zero migration pain.",
  },
  {
    signal: "\"I would pay $50/month for a solution to X.\"",
    misread: "Confirmed willingness to pay. Build it.",
    reality: "They'd pay $50/month once. The question is whether they'll still be paying in 12 months. Churn is the silent validator-killer.",
  },
  {
    signal: "\"None of the existing tools do Y properly.\"",
    misread: "Gap in the market. Ship Y.",
    reality: "The incumbents will ship Y in their next release. They have the data, the distribution, and the existing relationship. You have a feature.",
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
          <span className="text-zinc-900">Strategy</span>
        </div>

        {/* Hero */}
        <header className="mb-20">
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            Why most {"\u201c"}validated{"\u201d"}{" "}
            <br className="hidden md:block" />
            ideas still{" "}
            <span className="text-[#ff4500]">fail</span>
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Validation has become a security blanket for founders. &ldquo;I talked to 20 people.&rdquo;
            &ldquo;The survey said yes.&rdquo; &ldquo;Reddit threads confirm the pain.&rdquo; Good. You know demand
            exists. But demand is table stakes. The question that separates companies that
            raise Series A from companies that shut down is different: can you win?
          </p>
        </header>

        {/* Stats */}
        <section className="mb-24 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {[
            { label: "Startups That Fail", value: "90%", sub: "Despite some form of validation" },
            { label: "Products That Never Ship", value: "42%", sub: "Even after positive user feedback" },
            { label: "Churn Rate First Year", value: "60–80%", sub: "For 'validated' SaaS products" },
            { label: "Incumbent Advantage", value: "5–10x", sub: "Distribution vs. a new entrant" },
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

        {/* The Core Argument */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Validation answers one question. It misses five more.</h2>
          <p className="mb-12 text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
            Every validation method — Reddit mining, customer interviews, surveys, landing page A/B
            tests — answers the same question: &ldquo;Does someone want this?&rdquo; That&apos;s useful. But
            it&apos;s not sufficient. Here are the five things validation doesn&apos;t tell you:
          </p>
          <div className="space-y-12">
            {reasons.map((reason, i) => (
              <div key={i} className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-black/5">
                  {reason.icon}
                </div>
                <div className="flex-1">
                  <h3 className="mb-3 text-2xl font-black text-zinc-900">{reason.title}</h3>
                  <p className="text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">{reason.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contrarian grid */}
        <section className="mb-32 rounded-[48px] glass-card p-12 md:p-20">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Three signals founders consistently misread</h2>
          <div className="space-y-6">
            {misreadExamples.map((ex, i) => (
              <div key={i} className="rounded-[24px] border border-black/10 p-8">
                <p className="mb-4 text-lg font-bold text-zinc-800 italic leading-relaxed">{ex.signal}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-500">
                      <AlertTriangle className="h-3.5 w-3.5" /> Typical Misread
                    </div>
                    <p className="text-[15px] font-medium text-zinc-500">{ex.misread}</p>
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> What&apos;s Actually Happening
                    </div>
                    <p className="text-[15px] font-medium text-zinc-500">{ex.reality}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Five questions */}
        <section className="mb-32">
          <h2 className="mb-12 text-3xl font-black text-zinc-900 md:text-4xl">The five questions validation doesn&apos;t answer</h2>
          <div className="space-y-8">
            {questions.map((item, i) => (
              <div key={i} className="rounded-[24px] glass-card p-8">
                <div className="mb-3 flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff4500]/10 text-sm font-black text-[#ff4500]">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-zinc-900">{item.q}</h3>
                  </div>
                </div>
                <p className="ml-12 text-[15px] font-medium text-zinc-500 leading-relaxed">{item.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quote */}
        <section className="mb-32 border-l-4 border-[#ff4500] glass-card py-12 px-10 rounded-r-[32px]">
          <blockquote className="text-3xl font-black italic leading-tight text-zinc-900 md:text-4xl">
            &ldquo;Validation is a necessary condition for success. It is not a sufficient one. The graveyard of failed startups is full of ideas that someone, somewhere, really wanted.&rdquo;
          </blockquote>
        </section>

        {/* The ThreddIQ difference */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">What we do differently at ThreddIQ</h2>
          <p className="mb-12 text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
            Most validation tools stop at &ldquo;yes, the problem exists.&rdquo; We go further — because knowing
            demand exists is only half the picture.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-[32px] glass-card p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Swords className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">Competitive density scoring</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                We don&apos;t just tell you a pain point exists. We tell you how many other startups are
                already targeting it, how entrenched the incumbents are, and whether the market is
                under-served or overcrowded.
              </p>
            </div>
            <div className="rounded-[32px] glass-card p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Zap className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">Buying power analysis</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                We distinguish IC complaints from executive buying signals. If the pain is loud in the
                comments but quiet in the budget, we flag it. You see who&apos;s venting and who&apos;s writing
                checks.
              </p>
            </div>
            <div className="rounded-[32px] glass-card p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <TrendingUp className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">Market maturity signals</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                We score each pain point by how&apos;s it trending — growing, peaking, or fading. Validating
                against a dying trend is worse than not validating at all.
              </p>
            </div>
            <div className="rounded-[32px] glass-card p-10">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/5">
                <Lightbulb className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="mb-3 text-xl font-black text-zinc-900">Switching cost estimation</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                We surface threads where users mention migration pain, contract lock-in, and team
                adoption friction. If the switching cost is higher than the frustration, we tell you
                before you build.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-500 italic md:text-2xl leading-relaxed">
            The best founders don&apos;t just ask &ldquo;Is this problem real?&rdquo; They ask &ldquo;Is this problem
            winnable?&rdquo; Validation gets you to the starting line. Competitive intelligence,
            market maturity analysis, and switching cost estimation are what get you to the
            finish line.
          </p>
          <div className="mt-12 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            Data sourced from ThreddIQ&apos;s competitive intelligence engine. 24,000+ signals analyzed across 1,400+ subreddits and 800+ competing products.
          </div>
        </section>

        {/* CTA */}
        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Search className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Don&apos;t just validate.{" "}
            <span className="text-[#ff4500]">Win</span>.
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ validates demand and competitive readiness — so you know not just if the
            problem is real, but if you can win in that market.
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
