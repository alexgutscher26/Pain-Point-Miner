"use client";

import React from "react";
import { HelpCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MetricType =
  | "painIntensity"
  | "urgency"
  | "monetization"
  | "marketMaturity"
  | "validationScore"
  | "confidenceScore"
  | "willingnessToPay"
  | "difficulty"
  | "switchingCosts"
  | "custom";

export const METRIC_EXPLANATIONS: Record<
  Exclude<MetricType, "custom">,
  { label: string; explanation: string; scale?: string }
> = {
  painIntensity: {
    label: "Pain Intensity",
    explanation: "Severity of the friction or blocker experienced by users.",
    scale: "1 = Minor annoyance | 10 = Business-critical operational failure",
  },
  urgency: {
    label: "Urgency",
    explanation:
      "How actively users are seeking an immediate workaround or fix.",
    scale:
      "1 = Exploratory / someday | 10 = Active emergency / immediate relief needed",
  },
  monetization: {
    label: "Monetization Potential",
    explanation:
      "Likelihood and capacity of users to pay for a dedicated solution.",
    scale:
      "1 = Free-tier / hobbyist | 10 = High commercial budget / revenue driver",
  },
  marketMaturity: {
    label: "Market Maturity",
    explanation:
      "Competitive density and presence of known incumbent products.",
    scale:
      "1 = Untapped greenfield | 10 = Crowded category with major competitors",
  },
  validationScore: {
    label: "Opportunity Score",
    explanation:
      "Composite viability rating combining pain severity, urgency, and monetization signals.",
    scale: "0–100 Scale (80+ represents high venture / bootstrap potential)",
  },
  confidenceScore: {
    label: "AI Confidence",
    explanation:
      "Statistical conviction that this extraction represents a distinct, verified user struggle.",
    scale: "0–100% (extractions below 30% are automatically pruned)",
  },
  willingnessToPay: {
    label: "Willingness To Pay (WTP)",
    explanation:
      "Explicit pricing quotes or commercial buyer intent detected in the discussion text.",
    scale: "free_only / paid_signal / explicit_budget",
  },
  difficulty: {
    label: "Build Difficulty",
    explanation:
      "Estimated engineering scope and technical moat required to deliver a solution.",
    scale: "weekend_project → side_project → startup_mvp → vc_scale_moat",
  },
  switchingCosts: {
    label: "Switching Costs",
    explanation:
      "Friction involved for customers to migrate from their existing setup or legacy tool.",
    scale: "Low, Medium, or High migration complexity",
  },
};

export interface MetricTooltipProps {
  /** Known metric type for standard explanations */
  metric?: MetricType;
  /** Custom explanation text */
  explanation?: string;
  /** Custom title/label */
  title?: string;
  /** Optional children trigger (defaults to subtle info/help icon) */
  children?: React.ReactNode;
  /** Custom side positioning */
  side?: "top" | "right" | "bottom" | "left";
  /** Optional icon size */
  iconSize?: number;
  className?: string;
}

export function MetricTooltip({
  metric = "validationScore",
  explanation,
  title,
  children,
  side = "top",
  iconSize = 13,
  className = "",
}: MetricTooltipProps) {
  const info = metric !== "custom" ? METRIC_EXPLANATIONS[metric] : undefined;
  const heading = title || info?.label;
  const description = explanation || info?.explanation;
  const scale = info?.scale;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children ? (
            <span
              className={`inline-flex cursor-help items-center gap-1 ${className}`}
            >
              {children}
            </span>
          ) : (
            <button
              type="button"
              className={`inline-flex cursor-help items-center justify-center text-zinc-400 transition-colors hover:text-[#ff4500] ${className}`}
              aria-label={heading || "Metric explanation"}
            >
              <HelpCircle style={{ width: iconSize, height: iconSize }} />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className="z-50 max-w-xs rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-200 shadow-xl backdrop-blur-md"
        >
          {heading && (
            <p className="mb-1 font-mono text-[11px] font-black tracking-wider text-white uppercase">
              {heading}
            </p>
          )}
          {description && (
            <p className="leading-relaxed text-zinc-300">{description}</p>
          )}
          {scale && (
            <p className="mt-2 border-t border-zinc-800/80 pt-1.5 font-mono text-[10px] text-zinc-400">
              {scale}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
