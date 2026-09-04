/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Shield,
  CreditCard,
  PieChart,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "Best Subreddits for Validating a Fintech or Billing Tool Idea | ThreddIQ Blog",
  description:
    "The highest-signal subreddits for fintech and billing tool validation — where finance professionals, founders, and operators complain about payment processing, invoicing, and subscription management.",
};

const fintechSubs = [
  {
    name: "r/fintech",
    desc: "The central hub for fintech professionals. Discussions cover payment rails, regulatory friction, banking APIs, and embedded finance. High concentration of people who understand the space deeply — their complaints are detailed and actionable.",
    focus: "Payments, APIs, compliance, banking",
    score: "10/10",
  },
  {
    name: "r/SaaS",
    desc: "SaaS founders complain about billing constantly. Stripe fees, dunning management, invoice generation, revenue recognition — every operational billing pain shows up here. These are people who will pay to never think about billing again.",
    focus: "Subscription billing, invoicing, dunning",
    score: "9/10",
  },
  {
    name: "r/smallbusiness",
    desc: "Owner-operators who handle their own billing. They want tools that 'just work' without enterprise complexity. Their complaints are cost-sensitive and practical — perfect for validating simple billing solutions.",
    focus: "Invoicing, payment processing, accounting",
    score: "8/10",
  },
  {
    name: "r/stripe",
    desc: "A dedicated community of Stripe users who post about every edge case, limitation, and frustration. If Stripe doesn't do something natively, someone in this sub has hacked around it — and that hack is a feature request.",
    focus: "Payment gateways, webhooks, fraud",
    score: "9/10",
  },
  {
    name: "r/Bookkeeping",
    desc: "Bookkeepers deal with billing messes all day. Their complaints about reconciliation, categorization, and client payment follow-ups are a roadmap for any billing or accounting tool.",
    focus: "Reconciliation, categorization, reporting",
    score: "7/10",
  },
  {
    name: "r/Accounting",
    desc: "Accountants who work with multiple clients see the full spectrum of billing failures. Their pain points are experienced across dozens of businesses — multiply every complaint by 50 clients and you see the market size.",
    focus: "Compliance, reporting, audit trails",
    score: "7/10",
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
            <CreditCard className="h-3.5 w-3.5" /> Industry Deep-Dive
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            The best subreddits for validating a{" "}
            <span className="text-[#ff4500]">fintech or billing tool</span> idea
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Billing and fintech tools solve high-stakes problems — payment
            failures lose revenue, compliance gaps invite audits, bad UX costs
            customers. Here's where to find the people living those problems
            every day.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            The top subreddits for billing and fintech signals
          </h2>
          <p className="mb-10 text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">
            These communities consistently surface high-desperation,
            budget-backed complaints about payment processing, billing systems,
            and financial tools.
          </p>
          <div className="space-y-8">
            {fintechSubs.map((sub, i) => (
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
                      Signal density: {sub.score}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
                    {sub.score}
                  </span>
                </div>
                <p className="mb-4 text-lg leading-relaxed font-medium text-zinc-500">
                  {sub.desc}
                </p>
                <div className="flex items-center gap-2 text-xs font-black tracking-widest text-zinc-400 uppercase">
                  <Zap className="h-3.5 w-3.5 text-[#ff4500]" /> {sub.focus}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mb-32 rounded-[48px] p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">
            Top billing pain points showing up right now
          </h2>
          <p className="mb-8 text-lg leading-relaxed font-medium text-zinc-500">
            Based on current Reddit signal volume, these are the billing and
            fintech problems generating the most high-desperation posts:
          </p>
          <div className="space-y-4">
            {[
              {
                pain: "Subscription management complexity",
                context:
                  "Proration, upgrades, downgrades, failed payments — tools handle these poorly and customers feel the friction directly.",
              },
              {
                pain: "International payment and tax compliance",
                context:
                  "Sales tax, VAT, currency conversion — expanding globally means multiplying billing complexity, and current tools fall short.",
              },
              {
                pain: "Revenue recognition and reporting",
                context:
                  "ASC 606 compliance, deferred revenue tracking, MRR calculations that actually match bank statements.",
              },
              {
                pain: "Dunning and failed payment recovery",
                context:
                  "Tools either automate nothing or automate everything, leaving no room for nuanced customer communication.",
              },
              {
                pain: "Invoice customization and delivery",
                context:
                  "Enterprise clients want branded invoices, specific formats, and automated delivery — most billing tools treat this as an afterthought.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-baseline gap-4 rounded-[16px] border border-black/5 p-5"
              >
                <span className="min-w-[200px] text-xs font-black tracking-widest text-zinc-600 uppercase">
                  {item.pain}
                </span>
                <span className="text-lg font-medium text-zinc-800">
                  {item.context}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">
            Niche fintech communities worth tracking
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                title: "r/plaid",
                desc: "Plaid users post about connection issues, data quality, and authentication friction. Every complaint is a signal about the broader open-banking ecosystem.",
              },
              {
                title: "r/PaymentProcessing",
                desc: "Merchants and developers discuss gateway options, rate negotiation, and fraud prevention. High-density budget signal community.",
              },
              {
                title: "r/defi",
                desc: "DeFi users complain about gas fees, UX complexity, and protocol risks. Smaller audience but extremely high signal quality for Web3 fintech ideas.",
              },
              {
                title: "r/personalfinance",
                desc: "Consumer-side pain points. Not directly B2B, but the frustrations consumers express often mirror what SMBs experience — and SMB tools are where the money is.",
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
            &ldquo;Billing is the last thing anyone wants to think about — which
            means the people who are thinking about it are already desperate. A
            post in r/SaaS about dunning emails is worth ten posts in r/startups
            about invoicing features. Follow the money pain.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-zinc-500 italic md:text-2xl">
            For a complete list of industry-by-industry subreddits, visit our{" "}
            <Link
              href="/resources/best-subreddits-by-industry"
              className="font-bold text-[#ff4500] underline underline-offset-4 transition-colors hover:text-zinc-900"
            >
              Best Subreddits by Industry
            </Link>{" "}
            guide.
          </p>
        </section>

        <div className="glass-card relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <DollarSign className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Find billing pain points{" "}
            <span className="text-[#ff4500]">automatically</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ scans fintech and billing subreddits around the clock. Get
            alerted when someone describes exactly the billing problem you're
            trying to solve.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]"
            >
              <Link href="/sign-up">
                Monitor Fintech Signals <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
