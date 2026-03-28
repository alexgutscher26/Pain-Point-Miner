"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      q: "What is ThreddIQ exactly?",
      a: "ThreddIQ is an AI-powered insights engine that mines Reddit to uncover real customer frustrations. We help founders and product teams find validated SaaS opportunities by identifying 'pain points' that people are actively complaining about and willing to pay to solve.",
    },
    {
      q: "How does the 'Pain Point Miner' work?",
      a: "Our algorithm scans thousands of threads across targeted subreddits. It uses natural language processing to filter for 'desperate' sentiment markers—like requests for workarounds, complaints about existing tools, and explicit 'I would pay for...' statements.",
    },
    {
      q: "Can I use ThreddIQ to validate a specific SaaS idea?",
      a: "Absolutely. You can enter your niche or competitor names, and ThreddIQ will generate a 'Market Density' report, showing you how often that specific problem is discussed and the intensity of the desire for a better solution.",
    },
    {
      q: "How often does the platform scan Reddit?",
      a: "On the Pro plan, we monitor your target communities in near real-time. You'll get instant alerts when a high-intent 'pain point' is posted, allowing you to reach out to potential users while their frustration is fresh.",
    },
    {
      q: "Is this compliant with Reddit's Terms of Service?",
      a: "Yes. ThreddIQ is a read-only listening tool that uses official APIs. We provide market intelligence and analytics; we do not automate posting, spamming, or any actions that violate community guidelines.",
    },
    {
      q: "Do you offer a free trial?",
      a: "Yes! We offer a 3-day full-access trial for our Pro plan so you can see the depth of our mining engine yourself. No credit card is required to start your discovery journey.",
    },
  ];

  return (
    <>
      <section
        id="faq"
        className="flex w-full flex-col items-center bg-[#080808] px-6 py-24"
      >
        <div className="mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-zinc-400">
            Everything you need to know about the product and building products
            that users actually want.
          </p>
        </div>

        <div className="w-full max-w-2xl rounded-2xl border border-white/5 bg-[#0a0a0a] p-2 shadow-xl md:p-6">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA Block explicitly broken out per screenshot under FAQ */}
      <section className="flex w-full justify-center bg-[#080808] px-6 pt-16 pb-32">
        <div className="relative flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-3xl border border-red-500/20 bg-linear-to-b from-[#141414] to-[#ff4500]/10 p-12 text-center shadow-2xl md:p-16">
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-[#ff4500] opacity-20 blur-[150px]"></div>
          <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#ff4500] opacity-20 blur-[150px]"></div>

          <h2 className="relative z-10 mb-6 text-3xl leading-tight font-bold text-white md:text-4xl lg:text-5xl">
            Ready to find your next <br className="hidden md:block" /> SaaS
            opportunity?
          </h2>
          <p className="relative z-10 mb-10 text-sm font-medium tracking-wide text-zinc-300 md:text-base">
            Join 600+ founders using ThreddIQ to build products people actually
            want.
          </p>

          <button className="relative z-10 rounded-lg bg-[#ff4500] px-10 py-4 text-lg font-bold text-white shadow-[0_0_30px_rgba(255,69,0,0.4)] transition-transform hover:scale-105 hover:bg-[#e03d00]">
            Start 3-day free trial
          </button>
          <p className="relative z-10 mt-4 text-xs font-bold tracking-widest text-red-300 uppercase">
            No Credit Card Required
          </p>
        </div>
      </section>
    </>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 p-4 last:border-0">
      <button
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-white transition-colors hover:text-[#ff4500]"
        onClick={() => setOpen(!open)}
      >
        <span className="leading-snug">{question}</span>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border ${open ? "border-[#ff4500]/50 bg-[#ff4500]/10" : "border-white/10 bg-white/5"} transition-colors`}
        >
          {open ? (
            <Minus
              className={`h-3 w-3 ${open ? "text-[#ff4500]" : "text-zinc-500"}`}
            />
          ) : (
            <Plus className="h-3 w-3 text-zinc-400" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pt-4 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="max-w-[90%] text-xs leading-relaxed text-zinc-400">
          {answer}
        </p>
      </div>
    </div>
  );
}
