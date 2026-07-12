/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Search,
  ArrowRight,
  Users,
  Briefcase,
  Clock,
  Wrench,
  MessageCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Where Freelancers and Agencies Vent About Their Tools | ThreddIQ Blog",
  description: "The top subreddits where freelancers and agencies complain about project management, CRM, invoicing, and collaboration tools — and what those complaints mean for your product roadmap.",
};

const freelancerSubs = [
  {
    name: "r/freelance",
    desc: "The central hub for independent professionals. Tool complaints here cover the full lifecycle — finding clients, managing projects, sending invoices, getting paid. High density of budget-specific complaints because freelancers spend their own money on tools.",
    focus: "CRM, invoicing, project management, payments",
    score: "10/10",
  },
  {
    name: "r/Upwork",
    desc: "Upwork freelancers live and die by the platform. Their complaints about proposal systems, payment protection, and client communication expose broader freelancer-platform pain points. Useful for anyone building tools for the gig economy.",
    focus: "Platform fees, proposals, payments",
    score: "8/10",
  },
  {
    name: "r/webdev",
    desc: "Web dev freelancers complain about client management, scope creep, and tool sprawl. Their 'does anyone have a tool that…' posts are feature requests with immediate purchase intent.",
    focus: "Client management, hosting, communication",
    score: "8/10",
  },
  {
    name: "r/agency",
    desc: "Agency owners manage teams, tools, and client expectations simultaneously. Their complaints are systemic — they reveal gaps in tools designed for individual freelancers that break at the agency level.",
    focus: "Team collaboration, reporting, billing",
    score: "9/10",
  },
  {
    name: "r/Entrepreneur",
    desc: "Solo founders and freelancers often blur together here. Tool complaints are practical and cost-aware. Look for threads about 'what tool do you wish existed' — they're literally describing your next product.",
    focus: "All categories — broad signal",
    score: "7/10",
  },
  {
    name: "r/DigitalMarketing",
    desc: "Freelance marketers complain about reporting tools, client dashboards, and campaign management. These complaints often include exact budgets and tool-stack details.",
    focus: "Reporting, dashboards, campaign tools",
    score: "7/10",
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
          <span className="text-zinc-900">Industry Deep-Dive</span>
        </div>
        <header className="mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#ff4500]/10 px-4 py-1.5 text-[11px] font-black text-[#ff4500] uppercase tracking-widest">
            <Briefcase className="h-3.5 w-3.5" /> Industry Deep-Dive
          </div>
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-zinc-900 md:text-[72px]">
            Where freelancers and agencies{" "}
            <span className="text-[#ff4500]">vent about their tools</span>
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-500 md:text-2xl">
            Freelancers and agencies spend more on SaaS per person than almost any other segment.
            They also switch tools more frequently — making their complaints the most actionable
            market research you'll find.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">The highest-signal subreddits for freelancer & agency tools</h2>
          <p className="mb-10 text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
            These communities are rich with tool-switching announcements, pricing complaints,
            and feature requests disguised as rants.
          </p>
          <div className="space-y-8">
            {freelancerSubs.map((sub, i) => (
              <div key={i} className="rounded-[32px] glass-card p-8 transition-all hover:shadow-lg">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900">{sub.name}</h3>
                    <span className="text-sm font-bold text-zinc-400">Signal density: {sub.score}</span>
                  </div>
                  <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black text-[#ff4500] uppercase tracking-widest">
                    {sub.score}
                  </span>
                </div>
                <p className="mb-4 text-lg font-medium text-zinc-500 leading-relaxed">{sub.desc}</p>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400">
                  <Zap className="h-3.5 w-3.5 text-[#ff4500]" /> {sub.focus}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32 rounded-[48px] glass-card p-12 md:p-20">
          <h2 className="mb-8 text-3xl font-black text-zinc-900 md:text-4xl">Common freelancer tool complaints (and what they mean)</h2>
          <p className="mb-8 text-lg font-medium text-zinc-500 leading-relaxed">
            After tracking these subreddits for months, here are the recurring complaint patterns
            that signal genuine product opportunities:
          </p>
          <div className="space-y-4">
            {[
              { complaint: '"I"m managing invoices, proposals, and contracts in three different tools"', opportunity: "Freelancers want an all-in-one business management tool. The tools exist, but none do all three well. Integration or consolidation play." },
              { complaint: '"My client keeps asking for status updates and I hate sending manual emails"', opportunity: "Client-facing dashboards are underbuilt for freelancers. Most project management tools are built for teams, not for solo operators sharing read-only views with clients." },
              { complaint: '"I spent 3 hours this week on expense tracking for tax season"', opportunity: "Automated expense tracking with tax categorization is a clear pain point. Freelancers dread tax season and would pay monthly to reduce the pain." },
              { complaint: '"Every CRM is overkill for a solo freelancer — I just want a simple contact tracker"', opportunity: "The 'too much tool' problem is acute for freelancers. Lightweight, single-purpose tools that do one thing well have a loyal audience." },
            ].map((item, i) => (
              <div key={i} className="rounded-[16px] border border-black/5 p-5">
                <p className="mb-1 text-base font-black text-zinc-900 italic">"{item.complaint}"</p>
                <p className="text-[15px] font-medium text-zinc-500">{item.opportunity}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-32">
          <h2 className="mb-10 text-3xl font-black text-zinc-900 md:text-4xl">Why freelancers are your best early customers</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { title: "They make purchase decisions alone", desc: "No procurement committee, no manager approval. If they like your tool, they buy it today." },
              { title: "They're vocal about switching", desc: "A freelancer who cancels a tool will post about it, explaining exactly why. Free competitive research." },
              { title: "They pay with their own money", desc: "Price sensitivity means they'll tell you exactly what your tool is worth. Painful feedback, but invaluable for pricing." },
              { title: "They scale with you", desc: "A solo freelancer today might run an agency in 3 years. Early adopters become enterprise customers." },
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
            &ldquo;Freelancers don't have the luxury of bad tools. Every minute spent fighting their
            software is a minute they're not earning. That's why their complaints are so specific —
            they've already calculated exactly how much each friction point costs them.&rdquo;
          </blockquote>
        </section>

        <section className="mb-32 border-t border-black/10 py-16 text-center">
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-500 italic md:text-2xl leading-relaxed">
            See our full{" "}
            <Link href="/resources/best-subreddits-by-industry" className="font-bold text-[#ff4500] underline underline-offset-4 transition-colors hover:text-zinc-900">
              Best Subreddits by Industry
            </Link>{" "}
            resource for the complete list of communities worth tracking.
          </p>
        </section>

        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] glass-card p-16">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Users className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-zinc-900 md:text-5xl">
            Know what freelancers are{" "}
            <span className="text-[#ff4500]">complaining about</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            ThreddIQ tracks freelancer and agency communities around the clock. Get notified
            the moment someone describes the exact tool gap you're filling.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]">
              <Link href="/sign-up">Track Freelancer Pain Points <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
