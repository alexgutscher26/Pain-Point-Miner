"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const STEPS = [
  { id: 1, label: "Choose Niche", path: "/onboarding/step-1" },
  { id: 2, label: "Select Subreddits", path: "/onboarding/step-2" },
  { id: 3, label: "Run First Scan", path: "/onboarding/step-3" },
];

export function OnboardingProgressBar() {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const step = STEPS.findIndex((s) => s.path === pathname) + 1;
    if (step > 0) setCurrentStep(step);
    if (pathname === "/onboarding/celebration") setCurrentStep(3);
  }, [pathname]);

  return (
    <div className="flex w-full items-center justify-between gap-4">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isActive = currentStep === step.id;

        return (
          <div key={step.id} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* Step Indicator */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-500",
                  isCompleted
                    ? "border-[#ff4500] bg-[#ff4500] text-white"
                    : isActive
                      ? "border-[#ff4500] bg-[#ff4500]/10 text-[#ff4500]"
                      : "border-zinc-200/60 bg-white/60 text-zinc-400",
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="font-mono text-xs font-black">
                    {step.id}
                  </span>
                )}
              </div>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div className="mx-2 h-[2px] flex-1 overflow-hidden bg-zinc-200/60">
                  <div
                    className={cn(
                      "h-full bg-[#ff4500] transition-all duration-700 ease-in-out",
                      currentStep > step.id ? "w-full" : "w-0",
                    )}
                  />
                </div>
              )}
            </div>

            <p
              className={cn(
                "mt-2 hidden truncate font-mono text-[9px] font-bold tracking-widest text-zinc-400 uppercase md:block",
                isActive && "text-[#ff4500]",
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
