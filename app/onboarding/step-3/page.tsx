"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  SkipForward,
  FileSearch,
  Brain,
  BarChart3,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { completeOnboardingAction } from "../actions";

export default function OnboardingStep3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const niche = searchParams.get("niche");
  const initialSubreddits = searchParams.get("subreddits");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async () => {
    setIsSubmitting(true);
    await completeOnboardingAction();
    router.push("/dashboard");
  };

  const handleContinue = () => {
    router.push(
      `/onboarding/celebration?niche=${niche ?? ""}${initialSubreddits ? `&subreddits=${initialSubreddits}` : ""}`,
    );
  };

  const benefits = [
    { icon: FileSearch, label: "We'll scan thousands of posts for you" },
    { icon: Brain, label: "AI identifies recurring pain points" },
    { icon: BarChart3, label: "Get actionable insights to build better" },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Run your first scan
        </h2>
        <p className="text-lg text-zinc-500">
          Let us analyze conversations in your chosen subreddits to find real
          customer pain points.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div
              key={benefit.label}
              className="flex items-center gap-3 rounded-[20px] border border-zinc-200/60 bg-white/60 p-4 backdrop-blur-md"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/[0.04] bg-white/80">
                <Icon className="h-4 w-4 text-zinc-600" />
              </div>
              <p className="text-xs leading-relaxed font-semibold text-zinc-700">
                {benefit.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sample Insights Preview */}
      <div className="space-y-3 rounded-[24px] border border-amber-500/20 bg-amber-50/40 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-black tracking-widest text-amber-700 uppercase">
            Sample Output Preview ({niche ? niche.toUpperCase() : "SAAS"})
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-zinc-800 shadow-2xs">
            ★ 8.8/10 Viability
          </span>
        </div>
        <p className="font-serif text-sm font-bold text-zinc-900">
          &quot;Solo HVAC technicians and contractors losing thousands in lost
          high-ticket jobs due to missed after-hours calls.&quot;
        </p>
        <p className="font-serif text-xs text-zinc-600 italic">
          &quot;I'd easily pay $150 to $300/mo for an AI dispatcher that
          answered emergency calls and booked calendar slots.&quot;
        </p>
      </div>

      {/* Scan Card */}
      <div className="rounded-[24px] border border-zinc-200/60 bg-white/60 p-8 backdrop-blur-md">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/[0.04] bg-white/80">
            <Rocket className="h-7 w-7 text-[#ff4500]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">
              Activate Your AI Miner
            </h3>
            <p className="mt-1 max-w-md text-sm text-zinc-500">
              We'll start analyzing{" "}
              {niche ? `${niche} subreddits` : "your chosen communities"} and
              seed your workspace with validated pain points.
            </p>
          </div>
          <button
            onClick={handleContinue}
            className="flex items-center gap-3 rounded-full border border-[#ff4500] bg-[#ff4500] px-8 py-3.5 text-white shadow-[0_4px_20px_rgba(255,69,0,0.3)] transition-all duration-300 hover:scale-105 hover:bg-[#e63e00] active:scale-95"
          >
            <span className="font-mono text-[13px] font-black tracking-widest uppercase">
              Launch Setup
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse justify-between gap-6 pt-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              router.push(
                `/onboarding/step-2?niche=${niche ?? ""}${initialSubreddits ? `&subreddits=${initialSubreddits}` : ""}`,
              )
            }
            className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-zinc-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            disabled={isSubmitting}
            onClick={handleFinish}
            className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase transition-colors hover:text-zinc-900 disabled:opacity-50"
          >
            <SkipForward className="h-3.5 w-3.5" />
            {isSubmitting ? "Redirecting..." : "Skip to dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}
