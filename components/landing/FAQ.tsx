"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      q: "What is ThreddIQ exactly?",
      a: "ThreddIQ is a semantic insights engine that mines Reddit to uncover real customer frustrations. We help founders and product teams find validated SaaS opportunities by identifying 'pain points' that people are actively complaining about and willing to pay to solve.",
    },
    {
      q: "How does the 'ThreddIQ' work?",
      a: "Our algorithm scans thousands of threads across targeted subreddits. It uses natural language processing to filter for 'desperate' sentiment markers—like requests for workarounds, complaints about existing tools, and explicit 'I would pay for...' statements.",
    },
    {
      q: "Can I use ThreddIQ to validate a specific SaaS idea?",
      a: "Absolutely. You can enter your niche or competitor names, and ThreddIQ will generate a 'Market Density' report, showing you how often that specific problem is discussed and the intensity of the desire for a solution.",
    },
    {
      q: "How often does the platform scan Reddit?",
      a: "On the Pro plan, we monitor your target communities in near real-time. You'll get instant alerts when a high-intent 'pain point' is posted, allowing you to reach out to potential users while their frustration is fresh.",
    },
    {
      q: "Is this compliant with Reddit's Terms of Service?",
      a: "Yes. ThreddIQ is a read-only listening tool that uses official APIs. We provide market intelligence and analytics; we do not automate posting, spamming, or any actions that violate community guidelines.",
    },
  ];

  return (
    <>
      <section
        id="faq"
        className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-24 sm:px-6 sm:py-32"
      >
        <div className="grid w-full grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Left Column: Heading and Support Callout */}
          <div className="flex flex-col items-start lg:col-span-5 lg:pr-6">
            <span className="mb-4 inline-block text-[11px] font-extrabold tracking-widest text-[#ff4500] uppercase">
              SUPPORT & FAQ
            </span>
            <h2 className="mb-6 text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-zinc-950 sm:text-[44px]">
              Frequently asked questions
            </h2>
            <p className="mb-8 text-[15px] leading-relaxed font-medium text-zinc-500">
              Everything you need to know about the product, search metrics, compliance, and building tools people actually want.
            </p>
          </div>

          {/* Right Column: Accordion Rows */}
          <div className="lg:col-span-7 w-full space-y-2">
            <div className="w-full rounded-2xl border border-black/[0.05] bg-white/60 backdrop-blur-md p-2 shadow-xs transition-all hover:shadow-sm">
              {faqs.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/[0.05] p-4 last:border-0">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left text-[13px] font-bold text-zinc-800 transition-colors hover:text-[#ff4500]"
        onClick={() => setOpen(!open)}
      >
        <span className="leading-snug">{question}</span>
        <div
          className={`flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded border ${
            open ? "border-[#ff4500]/30 bg-[#ff4500]/5" : "border-black/[0.06] bg-black/[0.02]"
          } transition-colors`}
        >
          {open ? (
            <Minus className={`h-3 w-3 ${open ? "text-[#ff4500]" : "text-zinc-400"}`} />
          ) : (
            <Plus className="h-3 w-3 text-zinc-500" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 pt-4 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="max-w-[95%] text-xs leading-relaxed text-zinc-650 font-medium">
          {answer}
        </p>
      </div>
    </div>
  );
}
