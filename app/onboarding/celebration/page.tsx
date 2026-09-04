"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
  Target,
  Lightbulb,
  TrendingUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { completeOnboardingAction } from "../actions";

export default function OnboardingCelebration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const niche = searchParams.get("niche");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      completeOnboardingAction().then(() => {
        router.push("/dashboard");
      });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const handleDashNow = async () => {
    await completeOnboardingAction();
    router.push("/dashboard");
  };

  const benefits = [
    {
      icon: Target,
      label: "Your subreddits are being monitored for pain points",
    },
    {
      icon: Lightbulb,
      label: "AI will surface the most common frustrations and needs",
    },
    {
      icon: TrendingUp,
      label: "Get weekly digests with actionable product insights",
    },
    {
      icon: Zap,
      label: "Build what your audience actually wants — no more guessing",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#ff4500]/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#ff4500]/20 bg-[#ff4500]/10">
            <Sparkles className="h-9 w-9 text-[#ff4500]" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            You're all set{niche ? ` for ${niche}` : ""}!
          </h2>
          <p className="mx-auto max-w-md text-lg leading-relaxed text-zinc-500">
            We're already scanning Reddit for pain points your future customers
            are sharing right now.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.label}
              className="flex items-start gap-4 rounded-[24px] border border-zinc-200/60 bg-white/60 p-5 backdrop-blur-md transition-all duration-300 hover:border-[#ff4500]/20 hover:bg-white/80"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.04] bg-white/80">
                <Icon className="h-5 w-5 text-zinc-600" />
              </div>
              <p className="text-sm leading-relaxed font-semibold text-zinc-700">
                {benefit.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-6 pt-6">
        <button
          onClick={handleDashNow}
          className="flex items-center gap-3 rounded-full border border-[#ff4500] bg-[#ff4500] px-8 py-3.5 text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all duration-300 hover:scale-105 hover:bg-[#e63e00] active:scale-95"
        >
          <span className="font-mono text-[13px] font-black tracking-widest uppercase">
            Go to dashboard
          </span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
          Redirecting in {countdown}s
        </p>
      </div>
    </div>
  );
}
