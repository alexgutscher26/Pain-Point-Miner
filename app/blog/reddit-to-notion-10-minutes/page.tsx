/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  Zap,
  ClipboardList,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "From Reddit Thread to Notion Doc in 10 Minutes | ThreddIQ Blog",
  description: "A complete workflow for turning Reddit pain points into structured Notion docs — using ThreddIQ to extract, score, and export signals to your research database.",
};

const workflowSteps = [
  {
    step: "Set up your search in ThreddIQ",
    time: "3 minutes",
    desc: "Create a new search for your niche. Add 5–10 relevant subreddits and a keyword group targeting pain points. Set your minimum desperation score to 6 to filter out casual noise. ThreddIQ will start scanning immediately — no waiting for results.",
  },
  {
    step: "Review and select signals",
    time: "3 minutes",
    desc: "Open your ThreddIQ dashboard. Scan the ranked list of pain points. Each entry shows the desperation score, subreddit, budget signal (if any), and a preview of the thread. Select the ones that match your current research focus — typically 5–10 posts per session.",
  },
  {
    step: "Export to Notion with one click",
    time: "1 minute",
    desc: "Click the export button on any pain point card and select 'Send to Notion.' Your selected threads are automatically structured into a pre-formatted Notion database — title, link, desperation score, budget signal, subreddit, and your notes field pre-populated.",
  },
  {
    step: "Add context and prioritize",
    time: "3 minutes",
    desc: "Open the Notion database. Each entry is ready for prioritization. Add tags like 'High Priority,' 'Needs Research,' or 'Competitor Intel.' Drop in related threads, customer quotes, and internal notes. Your team now has a living research document.",
  },
];

const exportFields = [
  "Post title (linked to original thread)",
  "Subreddit name",
  "Desperation score (1–10)",
  "Budget signal highlight",
  "Competitor mentions",
  "Notes field (pre-populated with AI summary)",
  "Date captured",
  "Status (ready for prioritization)",
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
          <span className="text-zinc-900">Workflow</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black text-[#ff4500] uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" /> Workflow
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            From Reddit thread to{" "}
            <span className="text-[#ff4500]">Notion doc</span>
            <br className="hidden md:block" /> in 10 minutes
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            You found a Reddit thread full of pain points. Now what? Here&apos;s the exact workflow to
            go from scrolling to a structured Notion research database — in the time it takes to
            drink your coffee.
          </p>
        </header>

        {/* The problem */}
        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">The problem with manual research</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-[32px] glass-card p-10">
              <h3 className="mb-4 text-xl font-black text-zinc-900">Signal leaks away</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                You find a great thread. You bookmark it. You mean to come back. You never do. The
                signal is lost because there&apos;s no system to capture and structure it.
              </p>
            </div>
            <div className="rounded-[32px] glass-card p-10">
              <h3 className="mb-4 text-xl font-black text-zinc-900">Context disappears</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                When you finally do revisit that bookmark, you&apos;ve forgotten why it mattered. The
                desperation score, the budget mention, the reason you flagged it — gone.
              </p>
            </div>
            <div className="rounded-[32px] glass-card p-10">
              <h3 className="mb-4 text-xl font-black text-zinc-900">No team visibility</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                Great findings live in your head or your browser bookmarks. Your co-founder, your
                product team, your sales team — they never see the evidence behind the decisions.
              </p>
            </div>
            <div className="rounded-[32px] glass-card p-10">
              <h3 className="mb-4 text-xl font-black text-zinc-900">No prioritization system</h3>
              <p className="text-lg font-medium text-zinc-500 leading-relaxed">
                A pile of bookmarks doesn&apos;t tell you what to build first. Without scores, tags, and
                structured fields, every thread looks equally important — and nothing gets done.
              </p>
            </div>
          </div>
        </section>

        {/* The workflow */}
        <section className="mb-32">
          <h2 className="mb-12 text-3xl font-black text-zinc-900 md:text-4xl">The 10-minute workflow</h2>
          <div className="space-y-10">
            {workflowSteps.map((w, i) => (
              <div key={i} className="flex flex-col gap-4 md:flex-row md:items-start md:gap-8">
                <div className="flex shrink-0 items-center gap-4 md:flex-col md:items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-black/5 text-2xl font-black text-zinc-800">{i + 1}</div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <h3 className="text-2xl font-black text-zinc-900">{w.step}</h3>
                    <span className="rounded-full bg-green-500/10 px-3 py-0.5 text-[10px] font-black text-green-700 uppercase tracking-widest">{w.time}</span>
                  </div>
                  <p className="text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What gets exported */}
        <section className="mb-32 rounded-[48px] glass-card p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">What lands in your Notion database</h2>
          <p className="mb-8 text-lg font-medium text-zinc-500">Every exported pain point includes these fields — automatically populated:</p>
          <div className="grid gap-3 md:grid-cols-2">
            {exportFields.map((field, i) => (
              <div key={i} className="flex items-center gap-3 rounded-[12px] border border-black/5 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                <span className="text-sm font-medium text-zinc-700">{field}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Real use case */}
        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">How one founder uses this workflow</h2>
          <div className="rounded-[32px] glass-card p-10">
            <p className="mb-6 text-lg leading-relaxed font-medium text-zinc-500 md:text-xl">
              &ldquo;Every Monday morning, I open ThreddIQ and scan my niche&apos;s new pain points. I select
              the 10 highest-scored signals, hit export to Notion, and by 9:15 AM my product team has
              a ranked list of what users are frustrated about. We prioritize Tuesday. By Wednesday,
              we&apos;re designing solutions for a problem we knew about 48 hours ago. That speed was
              impossible before.&rdquo;
            </p>
            <div className="text-sm font-bold text-zinc-500">
              — Weekly workflow of a B2B SaaS founder using ThreddIQ + Notion
            </div>
          </div>
        </section>

        <section className="mb-32 border-l-4 border-[#ff4500] glass-card py-12 px-10 rounded-r-[32px]">
          <blockquote className="text-3xl font-black italic leading-tight text-zinc-900 md:text-4xl">
            &ldquo;Your Notion research database is only as good as the signals you feed it. ThreddIQ makes
            sure those signals are scored, structured, and sourced — not just a pile of bookmarks.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-500 italic md:text-2xl leading-relaxed">
            The distance between a Reddit thread and a product decision should be measured in
            minutes, not weeks. With the right workflow, it can be.
          </p>
        </section>

        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <ClipboardList className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Start your 10-minute{" "}
            <span className="text-[#ff4500]">workflow</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            Connect ThreddIQ to Notion and turn Reddit threads into structured research in one click.
            No manual copying. No lost signals.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]">
              <Link href="/sign-up">Connect to Notion <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
