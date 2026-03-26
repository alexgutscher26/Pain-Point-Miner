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
      <section id="faq" className="w-full py-24 px-6 flex flex-col items-center bg-[#080808]">
        <div className="text-center max-w-2xl mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-zinc-400 text-sm">
            Everything you need to know about the product and building products that users actually want.
          </p>
        </div>

        <div className="max-w-2xl w-full border border-white/5 rounded-2xl bg-[#0a0a0a] p-2 md:p-6 shadow-xl">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA Block explicitly broken out per screenshot under FAQ */}
      <section className="w-full pb-32 pt-16 px-6 flex justify-center bg-[#080808]">
        <div className="max-w-4xl w-full border border-red-500/20 rounded-3xl bg-linear-to-b from-[#141414] to-[#ff4500]/10 p-12 md:p-16 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4500] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#ff4500] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight relative z-10">
            Ready to find your next <br className="hidden md:block" /> SaaS opportunity?
          </h2>
          <p className="text-zinc-300 text-sm md:text-base font-medium mb-10 tracking-wide relative z-10">
            Join 600+ founders using ThreddIQ to build products people actually want.
          </p>

          <button className="bg-[#ff4500] hover:bg-[#e03d00] text-white px-10 py-4 rounded-lg font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,69,0,0.4)] relative z-10">
            Start 3-day free trial
          </button>
          <p className="text-xs text-red-300 font-bold mt-4 tracking-widest uppercase relative z-10">
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
    <div className="border-b border-white/5 last:border-0 p-4">
      <button
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left text-white font-semibold text-sm hover:text-[#ff4500] transition-colors gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="leading-snug">{question}</span>
        <div
          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${open ? "border-[#ff4500]/50 bg-[#ff4500]/10" : "border-white/10 bg-white/5"} transition-colors`}
        >
          {open ? (
            <Minus
              className={`w-3 h-3 ${open ? "text-[#ff4500]" : "text-zinc-500"}`}
            />
          ) : (
            <Plus className="w-3 h-3 text-zinc-400" />
          )}
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pt-4 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-zinc-400 text-xs leading-relaxed max-w-[90%]">
          {answer}
        </p>
      </div>
    </div>
  );
}
