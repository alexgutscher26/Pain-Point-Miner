"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Search,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NICHE_SUBREDDITS: Record<
  string,
  Array<{ name: string; subscribers: string; description: string }>
> = {
  saas: [
    {
      name: "SaaS",
      subscribers: "150k",
      description: "Software as a Service discussions",
    },
    {
      name: "Entrepreneur",
      subscribers: "3.2m",
      description: "Entrepreneurship & business",
    },
    {
      name: "startups",
      subscribers: "1.4m",
      description: "Startup culture & growth",
    },
    {
      name: "smallbusiness",
      subscribers: "1.1m",
      description: "Small business owners",
    },
    { name: "sales", subscribers: "600k", description: "Sales professionals" },
  ],
  ai: [
    {
      name: "artificialintelligence",
      subscribers: "2.8m",
      description: "AI research & discussions",
    },
    {
      name: "openai",
      subscribers: "1.9m",
      description: "OpenAI & GPT discussions",
    },
    {
      name: "automation",
      subscribers: "400k",
      description: "Automation technologies",
    },
    { name: "ChatGPT", subscribers: "4.5m", description: "ChatGPT use cases" },
    {
      name: "Futurology",
      subscribers: "19m",
      description: "Future of technology",
    },
  ],
  ecommerce: [
    {
      name: "ecommerce",
      subscribers: "900k",
      description: "E-commerce strategies",
    },
    { name: "shopify", subscribers: "400k", description: "Shopify ecosystem" },
    {
      name: "dropshipping",
      subscribers: "500k",
      description: "Dropshipping business",
    },
    {
      name: "AmazonFBA",
      subscribers: "300k",
      description: "Amazon FBA sellers",
    },
    {
      name: "marketing",
      subscribers: "1.1m",
      description: "Marketing professionals",
    },
  ],
  agency: [
    {
      name: "freelance",
      subscribers: "950k",
      description: "Freelancing community",
    },
    {
      name: "marketing",
      subscribers: "1.1m",
      description: "Digital marketing",
    },
    {
      name: "digitalmarketing",
      subscribers: "600k",
      description: "Digital marketing strategies",
    },
    { name: "agency", subscribers: "150k", description: "Agency owners" },
    { name: "Upwork", subscribers: "350k", description: "Upwork freelancers" },
  ],
  finance: [
    {
      name: "personalfinance",
      subscribers: "19m",
      description: "Personal finance advice",
    },
    {
      name: "fintech",
      subscribers: "400k",
      description: "Financial technology",
    },
    {
      name: "investing",
      subscribers: "2.5m",
      description: "Investment strategies",
    },
    {
      name: "CryptoCurrency",
      subscribers: "6.5m",
      description: "Cryptocurrency discussions",
    },
    { name: "wealth", subscribers: "100k", description: "Wealth building" },
  ],
};

export default function OnboardingStep2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const niche = searchParams.get("niche") || "saas";
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const subreddits = NICHE_SUBREDDITS[niche] || NICHE_SUBREDDITS.saas;

  const filtered = subreddits.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const selectAll = () => {
    if (selected.length === subreddits.length) {
      setSelected([]);
    } else {
      setSelected(subreddits.map((s) => s.name));
    }
  };

  const handleNext = () => {
    const params = new URLSearchParams();
    if (niche) params.set("niche", niche);
    if (selected.length > 0) {
      params.set("subreddits", selected.join(","));
    }
    router.push(`/onboarding/step-3?${params.toString()}`);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Pick your subreddits
        </h2>
        <p className="text-lg text-zinc-500">
          We'll monitor these communities for pain points related to{" "}
          <span className="font-bold text-zinc-900 capitalize">{niche}</span>.
        </p>
      </div>

      {/* Search */}
      <div className="group relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-[#ff4500]" />
        <input
          type="text"
          placeholder="Search subreddits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-zinc-200/60 bg-white/70 py-3.5 pr-4 pl-12 font-mono text-sm tracking-tight text-zinc-900 backdrop-blur-md placeholder:text-zinc-400 focus:border-[#ff4500]/30 focus:bg-white/90 focus:ring-2 focus:ring-[#ff4500]/10 focus:outline-none"
        />
      </div>

      {/* Subreddit Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
            Recommended subreddits
          </p>
          <button
            onClick={selectAll}
            className="font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase transition-colors hover:text-[#ff4500]"
          >
            {selected.length === subreddits.length
              ? "Deselect all"
              : "Select all"}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((sub) => {
            const isSelected = selected.includes(sub.name);
            return (
              <button
                key={sub.name}
                onClick={() => toggle(sub.name)}
                className={cn(
                  "flex items-start gap-4 rounded-[20px] border border-zinc-200/60 bg-white/60 p-4 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff4500]/30 hover:bg-white/80 hover:shadow-md",
                  isSelected &&
                    "border-[#ff4500] bg-white/85 ring-2 ring-[#ff4500]/20",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                    isSelected
                      ? "border-[#ff4500] bg-[#ff4500]"
                      : "border-zinc-300 bg-white/80",
                  )}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    r/{sub.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {sub.description}
                  </p>
                  <p className="mt-1 font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                    {sub.subscribers} members
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((name) => (
            <div
              key={name}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/5 px-3 py-1.5 text-xs font-bold text-[#ff4500] transition-all hover:bg-[#ff4500]/10"
              onClick={() => toggle(name)}
            >
              r/{name}
              <X className="h-3 w-3" />
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col-reverse justify-between gap-6 pt-6 sm:flex-row sm:items-center">
        <button
          onClick={() => router.push(`/onboarding/step-1?niche=${niche}`)}
          className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              if (niche) params.set("niche", niche);
              router.push(`/onboarding/step-3?${params.toString()}`);
            }}
            className="flex items-center justify-center gap-2 rounded-full border border-zinc-200/60 bg-white/60 px-6 py-3 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase backdrop-blur-md transition-all hover:border-zinc-300 hover:text-zinc-700"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Skip — use all
          </button>

          <button
            disabled={selected.length === 0}
            onClick={handleNext}
            className={cn(
              "flex items-center justify-center gap-3 rounded-full border shadow-lg transition-all duration-300",
              selected.length > 0
                ? "animate-in zoom-in-95 border-[#ff4500] bg-[#ff4500] px-8 py-3.5 text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] hover:scale-105 hover:bg-[#e63e00] active:scale-95"
                : "cursor-not-allowed border-zinc-200/60 bg-zinc-100/50 px-8 py-3.5 text-zinc-400",
            )}
          >
            <span className="font-mono text-[13px] font-black tracking-widest uppercase">
              Monitor {selected.length > 0 ? selected.length : ""} subreddit
              {selected.length !== 1 ? "s" : ""}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
