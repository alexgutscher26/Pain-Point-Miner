"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock } from "lucide-react";

export type TimeRangeWindow = "24h" | "7d" | "30d" | "90d" | "1y" | "all";

export const TIME_RANGE_OPTIONS: {
  id: TimeRangeWindow;
  label: string;
  subLabel: string;
}[] = [
  { id: "24h", label: "24h", subLabel: "Realtime" },
  { id: "7d", label: "7d", subLabel: "Past Week" },
  { id: "30d", label: "30d", subLabel: "Past Month" },
  { id: "90d", label: "90d", subLabel: "Quarter" },
  { id: "1y", label: "1y", subLabel: "1 Year" },
  { id: "all", label: "All", subLabel: "All Time" },
];

interface DashboardTimeRangeSelectorProps {
  currentWindow: string;
  className?: string;
}

export function DashboardTimeRangeSelector({
  currentWindow,
  className = "",
}: DashboardTimeRangeSelectorProps) {
  const searchParams = useSearchParams();

  const getHref = (windowId: TimeRangeWindow) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("window", windowId);
    return `/dashboard?${params.toString()}`;
  };

  // Normalize currentWindow: "realtime" maps to "24h"
  const activeWindow: TimeRangeWindow =
    currentWindow === "realtime"
      ? "24h"
      : TIME_RANGE_OPTIONS.some((o) => o.id === currentWindow)
        ? (currentWindow as TimeRangeWindow)
        : "30d";

  return (
    <div
      className={`flex items-center gap-1 rounded-xl border border-zinc-200 bg-white/80 p-1 shadow-2xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 ${className}`}
    >
      <div className="hidden items-center pr-1 pl-2 text-zinc-400 sm:flex">
        <Clock className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-0.5 overflow-x-auto">
        {TIME_RANGE_OPTIONS.map((opt) => {
          const isActive = activeWindow === opt.id;
          return (
            <Link
              key={opt.id}
              href={getHref(opt.id)}
              title={opt.subLabel}
              className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition-all sm:px-3 ${
                isActive
                  ? "bg-[#ff4500] text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
