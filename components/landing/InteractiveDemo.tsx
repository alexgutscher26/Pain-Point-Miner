"use client";

import { useState } from "react";
import { Search, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const demoData = [
  { id: 1, text: "Spending 4+ hours a week manually cleaning data in Excel.", intensity: "High" },
  { id: 2, text: "Current tools are too expensive for solopreneurs.", intensity: "Medium" },
  { id: 3, text: "No way to automate the reporting process for clients.", intensity: "High" },
];

export function InteractiveDemo() {
  const [keyword, setKeyword] = useState("");
  const [step, setStep] = useState<"not-started" | "searching" | "mining" | "results">("not-started");
  const [progress, setProgress] = useState(0);

  const startDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword) return;

    setStep("searching");
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p === 30) setStep("mining");
      if (p >= 100) {
        clearInterval(interval);
        setStep("results");
      }
    }, 50);
  };

  return (
    <section className="w-full py-24 px-6 flex justify-center bg-[#0a0a0a]">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-16">
          <h2 className="text-[12px] font-black tracking-[0.2em] text-[#ff4500] uppercase mb-4">
            LIVE PREVIEW
          </h2>
          <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
            Test our AI in <span className="text-[#ff4500]">Seconds</span>
          </h3>
          <p className="text-zinc-400 max-w-2xl mx-auto font-medium text-lg">
            Curious what we find? Enter a niche below to see a simulated analysis. No account required.
          </p>
        </div>

        <div className="bg-[#111] border-2 border-white/10 p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-[#ff4500]/30 to-transparent"></div>

          {step === "not-started" && (
            <form onSubmit={startDemo} className="space-y-8 max-w-xl mx-auto text-center">
              <div className="relative">
                <input
                  type="text"
                  aria-label="Enter a niche to scan"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. cold email, property management..."
                  className="w-full bg-[#0c0c0c] border border-white/10 px-6 py-5 rounded-none text-white text-lg font-medium focus:outline-none focus:border-[#ff4500]/50 transition-colors"
                  required
                />
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-600" />
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-[#ff4500] text-white font-black uppercase tracking-widest hover:bg-[#ff5500] transition-colors flex items-center justify-center gap-3 group"
              >
                Run Sample Scan <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {(step === "searching" || step === "mining") && (
            <div className="flex flex-col items-center py-12 space-y-8 animate-in fade-in duration-500">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-[#ff4500] animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#ff4500] animate-pulse" />
              </div>
              <div className="text-center space-y-4 w-full max-w-md">
                <p className="font-mono text-[11px] font-black uppercase tracking-widest text-[#ff4500]">
                  {step === "searching" ? "Scanning Subreddits..." : "AI Extraction in Progress..."}
                </p>
                <div className="h-1 w-full bg-white/5 overflow-hidden">
                  <div 
                    className="h-full bg-[#ff4500] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-zinc-500 italic">
                  &ldquo;Hunting for frustrations related to {keyword}&rdquo;
                </p>
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
                <div className="p-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xl font-bold text-white uppercase tracking-tight">
                  Sample Analysis: <span className="text-[#ff4500]">{keyword}</span>
                </h4>
              </div>

              <div className="grid gap-4 mb-10">
                {demoData.map((item) => (
                  <div key={item.id} className="p-5 bg-white/2 border border-white/5 flex items-start justify-between gap-4">
                    <p className="text-zinc-200 font-medium">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <span className={`px-2 py-1 font-mono text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${
                      item.intensity === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.intensity} Intensity
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#ff4500]/5 border border-[#ff4500]/20 p-8 text-center flex flex-col items-center">
                <p className="text-white font-bold text-xl mb-2">Want to see the real deal?</p>
                <p className="text-zinc-400 text-sm mb-8 max-w-md">
                  We found 42+ potential entry points for <strong className="text-zinc-200">{keyword}</strong>.
                  Unlock the full reports, budget extraction, and market scores now.
                </p>
                <Link 
                  href="/sign-up"
                  className="px-10 py-4 bg-[#ff4500] text-white font-black uppercase tracking-widest hover:bg-[#ff5500] transition-colors"
                >
                  Start Mining for Free
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
