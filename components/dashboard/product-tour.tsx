"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Compass,
  Search,
  BookOpen,
  Bookmark,
  Shield,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  targetId?: string;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "tour-new-scan",
    title: "1. Launch Mining Scans",
    description:
      "Target specific customer friction keywords and niche subreddits. Choose Quick Scan or step-by-step Guided Wizard to initiate AI extraction.",
    icon: Search,
    badge: "Mining Engine",
  },
  {
    targetId: "tour-idea-reports",
    title: "2. Deep Opportunity Reports",
    description:
      "Every scan clusters hundreds of raw discussions into structured IdeaBrowser dossiers with 2x2 viability metrics, WTP evidence, and MVP blueprints.",
    icon: BookOpen,
    badge: "Intelligence Dossier",
  },
  {
    targetId: "tour-my-stuff",
    title: "3. Bookmark & Categorize",
    description:
      "Save your favorite high-conviction ideas, filter by category (Product, Marketing, Ops), and generate 1-click developer specifications.",
    icon: Bookmark,
    badge: "Opportunity Vault",
  },
  {
    targetId: "tour-billing-credits",
    title: "4. Plan & Mining Credits",
    description:
      "Monitor your monthly credit pool, unlock Ultra comment tree traversal, and export unlimited market research.",
    icon: Shield,
    badge: "Plan Entitlements",
  },
];

const TOUR_STORAGE_KEY = "threddiq-product-tour-v1";

export function ProductTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    try {
      const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!hasCompleted) {
        // Automatically prompt first-time visitors after short delay
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleFinish = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {}
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const startTourManually = () => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={startTourManually}
        className="group fixed right-6 bottom-6 z-40 flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-[#161616]/90 px-3.5 py-2 font-mono text-xs font-bold text-zinc-300 uppercase shadow-xl backdrop-blur-md transition-all hover:bg-[#202020] hover:text-white"
        title="Start Interactive Product Tour"
      >
        <Sparkles className="h-3.5 w-3.5 text-[#ff4500] transition-transform group-hover:rotate-12" />
        <span className="hidden sm:inline">Product Tour</span>
      </button>
    );
  }

  const step = TOUR_STEPS[currentStepIndex]!;
  const Icon = step.icon;

  return (
    <div className="animate-in fade-in-50 fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs duration-200">
      <div className="relative w-full max-w-md space-y-6 overflow-hidden rounded-2xl border-2 border-white/15 bg-[#141414] p-6 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#ff4500]/15 px-2 py-0.5 font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
              {step.badge || "Product Tour"}
            </span>
            <span className="font-mono text-xs text-zinc-400">
              Step {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Card */}
        <div className="space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10 text-[#ff4500] shadow-xs">
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-mono text-lg font-black tracking-tight text-white uppercase">
              {step.title}
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              {step.description}
            </p>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          {TOUR_STEPS.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === currentStepIndex
                  ? "w-6 bg-[#ff4500]"
                  : "w-1.5 bg-white/20",
              )}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-1 font-mono text-xs font-bold text-zinc-400 transition-colors hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFinish}
              className="px-3 py-1.5 font-mono text-xs text-zinc-400 uppercase transition-colors hover:text-zinc-200"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl border border-[#ff8a57] bg-[#ff4500] px-4 py-2 font-mono text-xs font-black text-white uppercase shadow-md transition-all hover:bg-[#ff571a] active:scale-95"
            >
              <span>
                {currentStepIndex === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
