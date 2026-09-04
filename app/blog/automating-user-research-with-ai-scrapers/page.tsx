/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Sparkles,
  ArrowRight,
  Clock,
  Search,
  Zap,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title:
    "Automating User Research: From 20 Hours of Calls to 2 Minutes of AI Mining | ThreddIQ Blog",
  description:
    "How modern founders and product managers use automated semantic intelligence to validate customer pain points without cold outreach.",
};

const comparison = [
  {
    feature: "Time to First 50 Data Points",
    manual: "3–4 weeks of calendar scheduling & cold DMs",
    automated: "90 seconds of AI semantic extraction",
  },
  {
    feature: "Customer Bias Risk",
    manual: "High — people say what sounds polite on Zoom",
    automated: "Zero — organic, unprompted venting in public forums",
  },
  {
    feature: "Sample Size",
    manual: "10–15 customer interviews",
    automated: "1,000+ categorized threads & comment trees",
  },
  {
    feature: "Willingness to Pay Signal",
    manual: "Hypothetical ('Would you buy this?')",
    automated: "Historical ('I spent $3k on tool X and it broke')",
  },
];

export default function BlogPost() {
  return (
    <div className="landing-gradient min-h-screen font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />

      <main className="mx-auto max-w-4xl px-6 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs font-bold tracking-widest text-zinc-600 uppercase">
          <Link href="/blog" className="transition-colors hover:text-[#ff4500]">
            Blog
          </Link>
          <span>/</span>
          <span>Product Discovery</span>
        </div>

        {/* Header */}
        <header className="mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-3.5 py-1 text-xs font-black tracking-widest text-[#ff4500] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Continuous Customer Discovery
          </div>
          <h1 className="mb-6 text-[40px] leading-[1.1] font-black tracking-tight text-zinc-900 md:text-[52px]">
            Automating User Research: From 20 Hours of Calls to 2 Minutes of AI
            Mining
          </h1>
          <p className="text-xl leading-relaxed font-medium text-zinc-600">
            Why product teams are replacing slow, biased customer discovery
            calls with real-time semantic mining across thousands of Reddit
            discussions.
          </p>
          <div className="mt-8 flex items-center gap-4 border-y border-black/5 py-4 text-xs font-bold tracking-widest text-zinc-600 uppercase">
            <span>By ThreddIQ Research</span>
            <span>&bull;</span>
            <span>August 2026</span>
            <span>&bull;</span>
            <span>5 min read</span>
          </div>
        </header>

        {/* Content */}
        <div className="space-y-12 text-base leading-relaxed text-zinc-700">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-zinc-900">
              The 'Mom Test' Problem on Zoom
            </h2>
            <p>
              Traditional user research tells you to get on 20 Zoom calls. But
              every founder who has done this knows the trap: people are
              naturally agreeable. When you ask if they would use your app, they
              say "Yes, that looks amazing!"—and then never convert when you
              launch.
            </p>
            <p>
              When people post on Reddit, they are not trying to be polite. They
              are angry, exhausted, and desperately asking their peers for
              recommendations. That is where raw, unfiltered product truth
              lives.
            </p>
          </section>

          {/* Table */}
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-zinc-900">
              Manual Interviews vs. AI Semantic Mining
            </h2>
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 font-mono text-xs text-zinc-500 uppercase">
                  <tr>
                    <th className="p-4">Dimension</th>
                    <th className="p-4 text-zinc-500">Manual Calls</th>
                    <th className="p-4 text-[#ff4500]">ThreddIQ Mining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {comparison.map((row) => (
                    <tr key={row.feature} className="hover:bg-zinc-50/50">
                      <td className="p-4 font-bold text-zinc-900">
                        {row.feature}
                      </td>
                      <td className="p-4 text-zinc-600">{row.manual}</td>
                      <td className="bg-[#ff4500]/5 p-4 font-semibold text-zinc-900">
                        {row.automated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* How to use both */}
          <section className="rounded-3xl border border-[#ff4500]/20 bg-[#ff4500]/5 p-8">
            <h3 className="mb-3 text-xl font-black text-zinc-900">
              The Hybrid Discovery Engine
            </h3>
            <p className="text-sm leading-relaxed font-medium text-zinc-700">
              Use automated semantic mining first to detect recurring clusters,
              exact competitor frustrations, and market urgency. Then, if
              needed, reach out to authors of high-signal comments with
              questions tailored to their exact situation.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-[32px] border border-black/10 bg-zinc-900 p-8 text-center text-white shadow-xl md:p-12">
          <h3 className="mb-4 text-2xl font-black md:text-3xl">
            Run your first semantic customer search
          </h3>
          <p className="mx-auto mb-8 max-w-xl text-sm font-medium text-zinc-400">
            Enter your niche or competitor name and extract structured pain
            points in seconds.
          </p>
          <Button
            asChild
            className="h-12 rounded-full bg-[#ff4500] px-8 text-sm font-bold text-white shadow-lg transition-all hover:bg-[#e03d00]"
          >
            <Link href="/sign-up?plan=starter">
              Start Mining for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
