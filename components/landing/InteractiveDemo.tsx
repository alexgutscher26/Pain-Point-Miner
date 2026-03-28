"use client";

import { useState } from "react";
import { Search, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const demoData = [
  {
    id: 1,
    text: "Spending 4+ hours a week manually cleaning data in Excel.",
    intensity: "High",
  },
  {
    id: 2,
    text: "Current tools are too expensive for solopreneurs.",
    intensity: "Medium",
  },
  {
    id: 3,
    text: "No way to automate the reporting process for clients.",
    intensity: "High",
  },
];

export function InteractiveDemo() {
  const [keyword, setKeyword] = useState("");
  const [step, setStep] = useState<
    "not-started" | "searching" | "mining" | "results"
  >("not-started");
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
    <section className="flex w-full justify-center bg-[#0a0a0a] px-6 py-24">
      <div className="w-full max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-[12px] font-black tracking-[0.2em] text-[#ff4500] uppercase">
            LIVE PREVIEW
          </h2>
          <h3 className="mb-6 text-4xl font-black text-white md:text-5xl">
            Test our AI in <span className="text-[#ff4500]">Seconds</span>
          </h3>
          <p className="mx-auto max-w-2xl text-lg font-medium text-zinc-400">
            Curious what we find? Enter a niche below to see a simulated
            analysis. No account required.
          </p>
        </div>

        <div className="relative overflow-hidden border-2 border-white/10 bg-[#111] p-8 shadow-2xl md:p-12">
          <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-[#ff4500]/30 to-transparent"></div>

          {step === "not-started" && (
            <form
              onSubmit={startDemo}
              className="mx-auto max-w-xl space-y-8 text-center"
            >
              <div className="relative">
                <input
                  type="text"
                  aria-label="Enter a niche to scan"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. cold email, property management..."
                  className="w-full rounded-none border border-white/10 bg-[#0c0c0c] px-6 py-5 text-lg font-medium text-white transition-colors focus:border-[#ff4500]/50 focus:outline-none"
                  required
                />
                <Search className="absolute top-1/2 right-6 h-6 w-6 -translate-y-1/2 text-zinc-600" />
              </div>
              <button
                type="submit"
                className="group flex w-full items-center justify-center gap-3 bg-[#ff4500] py-5 font-black tracking-widest text-white uppercase transition-colors hover:bg-[#ff5500]"
              >
                Run Sample Scan{" "}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}

          {(step === "searching" || step === "mining") && (
            <div className="animate-in fade-in flex flex-col items-center space-y-8 py-12 duration-500">
              <div className="relative">
                <div className="h-24 w-24 animate-spin rounded-full border-4 border-white/5 border-t-[#ff4500]"></div>
                <Sparkles className="absolute inset-0 m-auto h-8 w-8 animate-pulse text-[#ff4500]" />
              </div>
              <div className="w-full max-w-md space-y-4 text-center">
                <p className="font-mono text-[11px] font-black tracking-widest text-[#ff4500] uppercase">
                  {step === "searching"
                    ? "Scanning Subreddits..."
                    : "AI Extraction in Progress..."}
                </p>
                <div className="h-1 w-full overflow-hidden bg-white/5">
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
              <div className="mb-8 flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="rounded-full border border-green-500/30 bg-green-500/10 p-2 text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h4 className="text-xl font-bold tracking-tight text-white uppercase">
                  Sample Analysis:{" "}
                  <span className="text-[#ff4500]">{keyword}</span>
                </h4>
              </div>

              <div className="mb-10 grid gap-4">
                {demoData.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 border border-white/5 bg-white/2 p-5"
                  >
                    <p className="font-medium text-zinc-200">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <span
                      className={`px-2 py-1 font-mono text-[10px] font-black tracking-widest whitespace-nowrap uppercase ${
                        item.intensity === "High"
                          ? "border border-red-500/30 bg-red-500/10 text-red-400"
                          : "border border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {item.intensity} Intensity
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center border border-[#ff4500]/20 bg-[#ff4500]/5 p-8 text-center">
                <p className="mb-2 text-xl font-bold text-white">
                  Want to see the real deal?
                </p>
                <p className="mb-8 max-w-md text-sm text-zinc-400">
                  We found 42+ potential entry points for{" "}
                  <strong className="text-zinc-200">{keyword}</strong>. Unlock
                  the full reports, budget extraction, and market scores now.
                </p>
                <Link
                  href="/sign-up"
                  className="bg-[#ff4500] px-10 py-4 font-black tracking-widest text-white uppercase transition-colors hover:bg-[#ff5500]"
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
