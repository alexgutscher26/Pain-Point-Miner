import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  MessageSquareWarning,
  Search,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Get help with searches, billing, reports, and account setup.",
};

const quickActions = [
  {
    title: "Start a new search",
    description:
      "Launch another investigation and validate a new market angle in minutes.",
    href: "/dashboard/search",
    icon: Search,
    cta: "Open Search",
  },
  {
    title: "Manage billing",
    description:
      "Review plan limits, trial status, and upgrade options from one place.",
    href: "/dashboard/billing",
    icon: CreditCard,
    cta: "Open Billing",
  },
  {
    title: "Update settings",
    description:
      "Change notifications, default scan settings, and account preferences.",
    href: "/dashboard/settings",
    icon: Settings,
    cta: "Open Settings",
  },
];

const faqs = [
  {
    question: "Why can't I start a new search?",
    answer:
      "If your trial ended or your plan limit was reached, the app switches to read-only mode until a paid plan is active.",
  },
  {
    question: "How do I improve report quality?",
    answer:
      "Use a specific niche, narrow the subreddits when possible, and add custom intelligence patterns for the signals you care about most.",
  },
  {
    question: "Where do I change scan defaults?",
    answer:
      "Head to Settings to adjust your default subreddit count, minimum opportunity score, locale, and notification preferences.",
  },
  {
    question: "What should I do if a report looks stuck?",
    answer:
      "Open Reports to check the current status. If a run failed, start a new search with fewer subreddits or a simpler keyword scope.",
  },
];

export default function HelpSupportPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <section className="bg-[#111] border-2 border-white/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] overflow-hidden">
          <div className="border-b border-white/10 px-8 py-7">
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-[#ff4500]"></div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff4500]">
                Help Desk
              </p>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              Help & Support
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium text-zinc-400">
              Use these shortcuts when you need answers fast, want to resolve a
              billing question, or need a clean place to troubleshoot your next
              investigation.
            </p>
          </div>

          <div className="grid gap-4 p-6 sm:p-8">
            {quickActions.map(({ title, description, href, icon: Icon, cta }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-[#ff4500]/40 hover:bg-[#ff4500]/[0.06]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#ff4500]/35 bg-[#ff4500]/10 text-[#ff4500]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black tracking-tight text-white">
                    {title}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400">
                    {description}
                  </p>
                </div>
                <div className="hidden items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-zinc-500 transition-colors group-hover:text-[#ff4500] sm:flex">
                  {cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <section className="bg-[#111] border-2 border-white/10 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
            <h3 className="flex items-center gap-3 text-lg font-black tracking-tight text-white">
              <LifeBuoy className="h-5 w-5 text-[#ff4500]" />
              Support Checklist
            </h3>
            <div className="mt-6 space-y-5">
              <div className="border-l-2 border-[#ff4500] pl-4">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Before You Retry
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400">
                  Double-check your keyword scope, subreddit count, and current
                  plan limits.
                </p>
              </div>
              <div className="border-l-2 border-white/10 pl-4">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Best Next Step
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-zinc-400">
                  If the issue is plan-related, head to Billing. If it affects
                  search quality, update your defaults in Settings first.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-[#111] border-2 border-white/10 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
            <h3 className="flex items-center gap-3 text-lg font-black tracking-tight text-white">
              <MessageSquareWarning className="h-5 w-5 text-[#ff4500]" />
              Need Deeper Troubleshooting?
            </h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-zinc-400">
              Review your most recent run status in Reports, then compare it
              with your current plan and settings. That usually identifies
              whether the blocker is scope, permissions, or billing.
            </p>
            <Link
              href="/dashboard/reports"
              className="mt-6 inline-flex items-center gap-2 border border-[#ff8a57] bg-[#ff4500] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-[#e63e00]"
            >
              Open Reports
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>
        </aside>
      </div>

      <section className="bg-[#111] border-2 border-white/10 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] overflow-hidden">
        <div className="border-b border-white/10 px-8 py-6">
          <h3 className="flex items-center gap-3 text-xl font-black tracking-tight text-white">
            <HelpCircle className="h-5 w-5 text-[#ff4500]" />
            Common Questions
          </h3>
        </div>
        <div className="grid gap-px bg-white/5 md:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question} className="bg-[#111] p-6">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.15em] text-[#ff4500]">
                {faq.question}
              </p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-zinc-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
