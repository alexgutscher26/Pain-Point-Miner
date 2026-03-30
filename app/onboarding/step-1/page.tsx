"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
  Briefcase, 
  Cpu, 
  ShoppingCart, 
  Users, 
  Banknote, 
  ArrowRight, 
  SkipForward 
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ONBOARDING_NICHES = [
  {
    id: "saas",
    name: "SaaS & B2B",
    icon: Briefcase,
    description: "Software as a service, enterprise tools, and business solutions.",
    color: "#ff4500",
    subreddits: ["saas", "entrepreneur", "startups", "smallbusiness", "sales"]
  },
  {
    id: "ai",
    name: "AI & Automation",
    icon: Cpu,
    description: "LLMs, AI agents, specialized automation, and productivity tools.",
    color: "#4a90e2",
    subreddits: ["artificialintelligence", "openai", "automation", "chatgpt", "futureology"]
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    icon: ShoppingCart,
    description: "Online stores, supply chain, Shopify apps, and logistics.",
    color: "#50e3c2",
    subreddits: ["ecommerce", "shopify", "dropshipping", "amazonfba", "marketing"]
  },
  {
    id: "agency",
    name: "Agencies & Freelancing",
    icon: Users,
    description: "Service-based businesses, agency workflows, and client management.",
    color: "#f5a623",
    subreddits: ["freelance", "marketing", "digitalmarketing", "agency", "upwork"]
  },
  {
    id: "finance",
    name: "FinTech & Money",
    icon: Banknote,
    description: "Personal finance tools, crypto, investing, and wealth management.",
    color: "#7ed321",
    subreddits: ["personalfinance", "fintech", "investing", "cryptocurrency", "wealth"]
  }
];

export default function OnboardingStep1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedNicheId = searchParams.get("niche");

  const handleNext = () => {
    if (selectedNicheId) {
      router.push(`/onboarding/step-2?niche=${selectedNicheId}`);
    }
  };

  const handleSkip = async () => {
    const { completeOnboardingAction } = await import("../actions");
    await completeOnboardingAction();
    router.push("/dashboard");
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          What niche are you targeting?
        </h2>
        <p className="text-lg text-zinc-400">
          We'll suggest the best subreddits where your audience is venting their pain points.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ONBOARDING_NICHES.map((niche) => {
          const Icon = niche.icon;
          const isSelected = selectedNicheId === niche.id;

          return (
            <button
              key={niche.id}
              onClick={() => router.push(`/onboarding/step-1?niche=${niche.id}`)}
              className={cn(
                "group relative flex flex-col items-start gap-4 border-2 border-white/10 bg-[#161616] p-6 text-left transition-all duration-300 hover:border-[#ff4500]/50 hover:bg-[#1a1a1a]",
                isSelected && "border-[#ff4500] bg-[#1a1a1a] ring-2 ring-[#ff4500]/20"
              )}
            >
              <div 
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-all group-hover:scale-110 group-hover:border-[#ff4500]/30",
                  isSelected && "border-[#ff4500]/30 bg-[#ff4500]/10 text-[#ff4500]"
                )}
              >
                <Icon className={cn("h-6 w-6", isSelected && "text-[#ff4500]")} />
              </div>

              <div>
                <h3 className="font-bold text-white transition-colors group-hover:text-[#ff4500]">
                  {niche.name}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {niche.description}
                </p>
              </div>

              {isSelected && (
                <div className="absolute right-4 top-4">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4500]">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col-reverse justify-between gap-6 pt-10 sm:flex-row sm:items-center">
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-600 uppercase transition-colors hover:text-white"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Skip everything
        </button>

        <button
          disabled={!selectedNicheId}
          onClick={handleNext}
          className={cn(
            "flex w-full items-center justify-center gap-3 border shadow-lg transition-all duration-300 sm:w-auto",
            selectedNicheId 
              ? "border-[#ff4500] bg-[#ff4500] px-8 py-3.5 text-white animate-in zoom-in-95 hover:bg-[#e63e00] hover:scale-105 active:scale-95" 
              : "cursor-not-allowed border-white/5 bg-white/5 px-8 py-3.5 text-zinc-700"
          )}
        >
          <span className="font-mono text-[13px] font-black tracking-widest uppercase">
            Continue
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
