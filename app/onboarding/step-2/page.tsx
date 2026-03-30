"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  SkipForward, 
  Plus, 
  Check, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NICHES_DATA: Record<string, { subreddits: string[] }> = {
  saas: { subreddits: ["saas", "entrepreneur", "startups", "smallbusiness", "sales"] },
  ai: { subreddits: ["artificial", "artificialinteligence", "openai", "chatgpt", "machinelearning"] },
  ecommerce: { subreddits: ["ecommerce", "shopify", "dropshipping", "amazonfba", "marketing"] },
  agency: { subreddits: ["freelance", "marketing", "digitalmarketing", "agency", "upwork"] },
  finance: { subreddits: ["personalfinance", "fintech", "investing", "cryptocurrency", "wealth"] },
};

export default function OnboardingStep2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const niche = searchParams.get("niche") || "saas";
  
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [customSub, setCustomSub] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (NICHES_DATA[niche]) {
      setSelectedSubs(NICHES_DATA[niche].subreddits);
    }
  }, [niche]);

  const toggleSub = (sub: string) => {
    if (selectedSubs.includes(sub)) {
      setSelectedSubs(selectedSubs.filter(s => s !== sub));
    } else {
      setSelectedSubs([...selectedSubs, sub]);
    }
  };

  const addCustomSub = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSub = customSub.trim().toLowerCase().replace(/^r\//, "");
    if (!cleanSub) return;
    if (selectedSubs.includes(cleanSub)) {
      setError("Subreddit already added");
      return;
    }
    if (!/^[a-z0-9_]{2,24}$/.test(cleanSub)) {
      setError("Invalid subreddit name");
      return;
    }
    setSelectedSubs([...selectedSubs, cleanSub]);
    setCustomSub("");
    setError(null);
  };

  const handleSkip = async () => {
    const { completeOnboardingAction } = await import("../actions");
    await completeOnboardingAction();
    router.push("/dashboard");
  };

  const handleNext = () => {
    if (selectedSubs.length > 0) {
      router.push(`/onboarding/step-3?niche=${niche}&subs=${selectedSubs.join(",")}`);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Pick your battlefields
        </h2>
        <p className="text-lg text-zinc-400">
          We've suggested these subreddits based on your niche. Add or remove them as you like.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap gap-3">
          {selectedSubs.map((sub) => (
            <div
              key={sub}
              className="group flex items-center gap-2 border border-[#ff4500]/30 bg-[#ff4500]/5 px-4 py-2 font-mono text-sm font-bold text-[#ff4500] animate-in zoom-in-95"
            >
              <span className="opacity-60">r/</span>
              {sub}
              <button
                onClick={() => toggleSub(sub)}
                className="ml-2 rounded-full p-0.5 transition-colors hover:bg-[#ff4500]/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {selectedSubs.length === 0 && (
            <div className="flex w-full items-center justify-center border-2 border-dashed border-white/5 bg-white/5 py-12 text-zinc-600">
              <p className="font-mono text-xs font-black tracking-widest uppercase">
                No subreddits selected
              </p>
            </div>
          )}
        </div>

        <form onSubmit={addCustomSub} className="max-w-md space-y-2">
          <label className="block font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
            Add custom subreddit
          </label>
          <div className="group relative flex items-center">
            <span className="absolute left-4 font-mono text-sm font-bold text-zinc-600">r/</span>
            <input
              type="text"
              value={customSub}
              onChange={(e) => {
                setCustomSub(e.target.value);
                setError(null);
              }}
              placeholder="saas-founders"
              className="w-full border-2 border-white/10 bg-[#161616] py-3 pl-10 pr-12 font-mono text-sm font-bold text-white transition-all focus:border-[#ff4500] focus:outline-none focus:ring-4 focus:ring-[#ff4500]/10"
            />
            <button
              type="submit"
              className="absolute right-2 flex h-8 w-8 items-center justify-center bg-white text-black transition-colors hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {error && (
            <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-tight text-red-500 uppercase">
              <AlertCircle className="h-3 w-3" />
              {error}
            </p>
          )}
        </form>
      </div>

      <div className="flex flex-col-reverse justify-between gap-6 pt-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push(`/onboarding/step-1?niche=${niche}`)}
            className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-600 uppercase transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-800 transition-colors hover:text-zinc-600 uppercase"
          >
            <SkipForward className="h-3 w-3" />
            Skip
          </button>
        </div>

        <button
          disabled={selectedSubs.length === 0}
          onClick={handleNext}
          className={cn(
            "flex w-full items-center justify-center gap-3 border shadow-lg transition-all duration-300 sm:w-auto",
            selectedSubs.length > 0 
              ? "border-[#ff4500] bg-[#ff4500] px-8 py-3.5 text-white animate-in zoom-in-95 hover:bg-[#e63e00] hover:scale-105 active:scale-95" 
              : "cursor-not-allowed border-white/5 bg-white/5 px-8 py-3.5 text-zinc-700"
          )}
        >
          <span className="font-mono text-[13px] font-black tracking-widest uppercase">
            Start Free Scan
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
