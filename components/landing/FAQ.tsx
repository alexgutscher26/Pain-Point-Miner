"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FAQ() {
  const faqs = [
    { q: "What exactly is Raddle?", a: "Raddle is a Reddit marketing toolkit that automatically finds threads where people are discussing your industry, tracks competitor mentions, and alerts you when there's an opportunity to pitch your product." },
    { q: "How does the AI lead scoring work?", a: "Our AI model analyzes the context of a mention to determine if the user is showing buying intent (like asking for recommendations) or just making a casual remark, saving you time from reading false positives." },
    { q: "Can I use it for multiple projects?", a: "Yes, depending on the plan you choose, you can track keywords and configure alerts for multiple distinct projects or brands from a single account." },
    { q: "Do you offer a free trial?", a: "We don't have a free trial currently, but we offer a 7-day money-back guarantee if you don't find any relevant discussions in your niche." },
    { q: "Is this against Reddit's terms of service?", a: "No. Raddle acts as a listening tool, similar to Google Alerts. We do not automate posting or spam interactions, which keeps your accounts safe." }
  ];

  return (
    <>
      <section className="w-full py-24 px-6 flex flex-col items-center bg-[#080808]">
        <div className="text-center max-w-2xl mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-zinc-400 text-sm">Everything you need to know about the product and billing.</p>
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
              Ready to find your first customers on <br className="hidden md:block"/> Reddit?
           </h2>
           <p className="text-zinc-300 text-sm md:text-base font-medium mb-10 tracking-wide relative z-10">
              Join 100+ startups getting organic leads today.
           </p>
           
           <button className="bg-[#ff4500] hover:bg-[#e03d00] text-white px-10 py-4 rounded-lg font-bold text-lg transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,69,0,0.4)] relative z-10">
                Start 7-day free trial
           </button>
           <p className="text-xs text-red-300 font-bold mt-4 tracking-widest uppercase relative z-10">No Credit Card Required</p>
        </div>
      </section>
    </>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/5 last:border-0 p-4">
      <button 
        className="w-full flex items-center justify-between text-left text-white font-semibold text-sm hover:text-[#ff4500] transition-colors gap-4"
        onClick={() => setOpen(!open)}
      >
        <span className="leading-snug">{question}</span>
        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${open ? 'border-[#ff4500]/50 bg-[#ff4500]/10' : 'border-white/10 bg-white/5'} transition-colors`}>
           {open ? <Minus className={`w-3 h-3 ${open ? 'text-[#ff4500]' : 'text-zinc-500'}`}/> : <Plus className="w-3 h-3 text-zinc-400"/>}
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pt-4 opacity-100" : "max-h-0 opacity-0"}`}>
        <p className="text-zinc-400 text-xs leading-relaxed max-w-[90%]">{answer}</p>
      </div>
    </div>
  );
}
