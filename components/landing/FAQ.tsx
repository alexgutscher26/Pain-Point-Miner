"use client";

import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      q: "How does the Lifetime Deal (LTD) work?",
      a: "You pay once and receive recurring monthly scan credits that automatically refresh every month forever with zero recurring subscription fees. You also receive lifetime access to platform updates and a 14-day 100% money-back guarantee.",
    },
    {
      q: "Can I test the platform before purchasing an LTD?",
      a: "Yes! You can run an instant sample scan completely free without entering any credit card or billing details to preview extracted pain points and buyer intent.",
    },
    {
      q: "How does ThreddIQ source Reddit discussions compliantly?",
      a: "We use official authenticated endpoints and rate-limited worker queues to parse public discussions compliantly and reliably without scraping or violating platform policies.",
    },
    {
      q: "How does the AI differentiate noise and spam from real pain points?",
      a: "Our classification pipeline filters out self-promotion, memes, and automated bot discussions, scoring only repeated workflow friction, workarounds, and explicit user struggles.",
    },
    {
      q: "Can I export my extracted research data to CSV, JSON, or Notion?",
      a: "Yes. You can export structured pain points, willingness to pay markers, competitor mentions, and direct thread permalinks to CSV, JSON, or Notion with one click.",
    },
    {
      q: "How fresh is the Reddit discussion data?",
      a: "Scans pull fresh discussions from the last 24 hours while also indexing historical deep scans across 12 months of community archives.",
    },
    {
      q: "What if my target market or niche is very specific?",
      a: "You can analyze any public subreddit, combine multiple subreddits into custom clusters, or run targeted keyword queries across the entire platform.",
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 14-day 100% money-back guarantee on all Lifetime Deals. If you don't find high-value, actionable customer pain points, simply reach out within 14 days for a full refund.",
    },
  ];

  return (
    <section
      id="faq"
      className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-12 lg:grid-cols-12">
        {/* Left Column */}
        <div className="flex flex-col items-start lg:col-span-5 lg:pr-6">
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#ff4500] shadow-2xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Everything you need to know about ThreddIQ
          </h2>
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            Have questions about compliance, data freshness, or our Lifetime
            Deal allocation? Here is how ThreddIQ empowers founders and
            marketers.
          </p>
        </div>

        {/* Right Column: Accordion */}
        <div className="w-full lg:col-span-7">
          <div className="w-full rounded-3xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
    <div className="border-b border-zinc-100 p-4 last:border-0 dark:border-zinc-800">
      <button
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left text-sm font-bold text-zinc-900 transition-colors hover:text-[#ff4500] sm:text-base dark:text-zinc-100 dark:hover:text-orange-400"
        onClick={() => setOpen(!open)}
      >
        <span className="leading-snug">{question}</span>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 ${
            open
              ? "border-[#ff4500]/30 bg-[#ff4500]/10 text-[#ff4500]"
              : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
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
        className={`grid transition-all duration-300 ease-in-out ${
          open
            ? "grid-rows-[1fr] pt-3 opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-300">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}
