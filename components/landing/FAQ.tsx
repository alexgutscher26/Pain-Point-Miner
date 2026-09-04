"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      q: "How does ThreddIQ source Reddit discussions without getting blocked?",
      a: "We use official authenticated endpoints and rate-limited worker queues to parse public discussions compliantly and reliably without violating platform policies.",
    },
    {
      q: "How does the AI differentiate noise and spam from real pain points?",
      a: "Our classification models filter out self promotion, bots, and memes, scoring only repeated workflow friction, workarounds, and explicit user struggles.",
    },
    {
      q: "Can I export my extracted research data?",
      a: "Yes. You can export structured pain points, willingness to pay markers, competitor mentions, and direct thread permalinks to CSV, JSON, or Notion with one click.",
    },
    {
      q: "Do I need a credit card to start scanning?",
      a: "No. You can test your initial subreddit scans completely free without entering any billing details.",
    },
    {
      q: "How fresh is the Reddit discussion data?",
      a: "Scans pull fresh threads from the last 24 hours while allowing historical deep scans going back across 12 months of community archives.",
    },
    {
      q: "What if my target market or niche is very specific?",
      a: "You can analyze any public subreddit, combine multiple subreddits into custom clusters, or run global searches across the entire platform.",
    },
    {
      q: "How does ThreddIQ measure willingness to pay?",
      a: "Our extraction pipeline scans for explicit buyer intent markers such as active budget discussions, tool replacement queries, and direct requests for commercial alternatives.",
    },
    {
      q: "Can I monitor communities on autopilot?",
      a: "Yes. Set up continuous alerts to receive email digests whenever high priority customer complaints appear in your watched niches.",
    },
  ];

  return (
    <section
      id="faq"
      className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-20 sm:px-6 sm:py-28"
    >
      <div className="grid w-full grid-cols-1 items-start gap-12 lg:grid-cols-12">
        {/* Left Column */}
        <div className="flex flex-col items-start lg:col-span-5 lg:pr-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-[#ff4500] dark:border-white/10 dark:bg-zinc-900/60">
            Common questions
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance text-zinc-950 sm:text-4xl dark:text-white">
            Everything you need to know about ThreddIQ
          </h2>
          <p className="text-base leading-relaxed text-pretty text-zinc-600 dark:text-zinc-400">
            Have questions about compliance, data freshness, or extraction
            accuracy? Here are the most common questions from founders.
          </p>
        </div>

        {/* Right Column: Accordion */}
        <div className="w-full lg:col-span-7">
          <div className="w-full rounded-2xl border border-black/10 bg-white/70 p-2 shadow-xs backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/5 p-4 last:border-0 dark:border-white/5">
      <button
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left text-base font-semibold text-zinc-900 transition-colors hover:text-[#ff4500] dark:text-zinc-100"
        onClick={() => setOpen(!open)}
      >
        <span className="leading-snug text-balance">{question}</span>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open
              ? "border-[#ff4500]/30 bg-[#ff4500]/10 text-[#ff4500]"
              : "border-black/10 bg-black/5 text-zinc-500 dark:border-white/10 dark:bg-white/5"
          }`}
        >
          {open ? (
            <Minus className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </div>
      </button>
      <div
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open
            ? "grid-rows-[1fr] pt-3 opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed font-normal text-pretty text-zinc-600 dark:text-zinc-400">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
