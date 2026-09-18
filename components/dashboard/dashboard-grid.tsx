"use client";

import React, { useState, useTransition } from "react";
import {
  GripVertical,
  RotateCcw,
  SlidersHorizontal,
  Check,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { notify } from "@/lib/notifications";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";

export type DashboardCardId =
  | "metrics"
  | "quick-actions"
  | "search-hero"
  | "top-opportunities"
  | "market-radar"
  | "activity-heatmap"
  | "cluster-growth"
  | "community-map"
  | "recent-reports";

export const DEFAULT_CARD_ORDER: DashboardCardId[] = [
  "metrics",
  "quick-actions",
  "search-hero",
  "top-opportunities",
  "market-radar",
  "activity-heatmap",
  "cluster-growth",
  "community-map",
  "recent-reports",
];

const CARD_TITLES: Record<DashboardCardId, string> = {
  metrics: "Core Metrics & Quotas",
  "quick-actions": "Quick Actions Panel",
  "search-hero": "Live Reddit Search Hero",
  "top-opportunities": "Top Opportunities This Week",
  "market-radar": "Market Competition Radar (2D)",
  "activity-heatmap": "Scan & Insight Activity Heatmap",
  "cluster-growth": "Cluster Growth Sparkline",
  "community-map": "Target Communities Map",
  "recent-reports": "Recent Investigations & Market Pulse",
};

interface DashboardGridProps {
  initialCardOrder?: DashboardCardId[];
  metricsSlot: React.ReactNode;
  quickActionsSlot?: React.ReactNode;
  searchHeroSlot: React.ReactNode;
  topOpportunitiesSlot: React.ReactNode;
  marketRadarSlot?: React.ReactNode;
  heatmapSlot: React.ReactNode;
  clusterGrowthSlot: React.ReactNode;
  communityMapSlot: React.ReactNode;
  recentReportsSlot: React.ReactNode;
}

export function DashboardGrid({
  initialCardOrder,
  metricsSlot,
  quickActionsSlot,
  searchHeroSlot,
  topOpportunitiesSlot,
  marketRadarSlot,
  heatmapSlot,
  clusterGrowthSlot,
  communityMapSlot,
  recentReportsSlot,
}: DashboardGridProps) {
  const sanitizeOrder = (order?: DashboardCardId[]): DashboardCardId[] => {
    if (!order || !Array.isArray(order) || order.length === 0) {
      return DEFAULT_CARD_ORDER;
    }
    const valid = order.filter((id) => DEFAULT_CARD_ORDER.includes(id));
    // Append any missing default cards
    for (const d of DEFAULT_CARD_ORDER) {
      if (!valid.includes(d)) valid.push(d);
    }
    return valid;
  };

  const [cardOrder, setCardOrder] = useState<DashboardCardId[]>(() =>
    sanitizeOrder(initialCardOrder),
  );
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const persistLayout = (newOrder: DashboardCardId[]) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/layout", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cardOrder: newOrder }),
        });
        if (!res.ok) {
          throw new Error("Failed to save layout");
        }
      } catch {
        notify.error("Could not save dashboard layout preferences.");
      }
    });
  };

  const moveCard = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= cardOrder.length) return;
    const updated = [...cardOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setCardOrder(updated);
    persistLayout(updated);
  };

  const resetLayout = () => {
    setCardOrder(DEFAULT_CARD_ORDER);
    persistLayout(DEFAULT_CARD_ORDER);
    notify.success("Dashboard layout reset to default.");
  };

  const slotMap: Record<DashboardCardId, React.ReactNode> = {
    metrics: metricsSlot,
    "quick-actions": quickActionsSlot,
    "search-hero": searchHeroSlot,
    "top-opportunities": topOpportunitiesSlot,
    "market-radar": marketRadarSlot,
    "activity-heatmap": heatmapSlot,
    "cluster-growth": clusterGrowthSlot,
    "community-map": communityMapSlot,
    "recent-reports": recentReportsSlot,
  };


  return (
    <div className="space-y-6">
      {/* Layout Customizer Controls Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4500]" />
          <span>Customizable Modular Dashboard</span>
        </div>

        <div className="flex items-center gap-2">
          {isReordering && (
            <button
              type="button"
              onClick={resetLayout}
              className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 font-mono text-[11px] font-bold text-zinc-600 shadow-2xs hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Default</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsReordering((prev) => {
                if (prev) {
                  notify.success("Layout arrangement saved.");
                }
                return !prev;
              });
            }}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] font-bold uppercase transition-all ${
              isReordering
                ? "border-[#ff4500] bg-[#ff4500] text-white shadow-xs"
                : "border-black/10 bg-white text-zinc-700 shadow-2xs hover:border-black/20 hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {isReordering ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Done Editing</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
                <span>Reorder Cards</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Reorderable Cards */}
      <div className="space-y-8">
        {cardOrder.map((cardId, index) => {
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index && draggedIndex !== index;

          return (
            <div
              key={cardId}
              draggable={isReordering}
              onDragStart={(e) => {
                setDraggedIndex(index);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverIndex(index);
              }}
              onDragLeave={() => {
                if (dragOverIndex === index) setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedIndex !== null && draggedIndex !== index) {
                  moveCard(draggedIndex, index);
                }
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              className={`relative transition-all duration-200 ${
                isDragging
                  ? "opacity-40 scale-[0.99] ring-2 ring-[#ff4500]/50 rounded-2xl"
                  : ""
              } ${
                isDragOver
                  ? "ring-2 ring-[#ff4500] ring-offset-4 rounded-2xl scale-[1.005]"
                  : ""
              } ${
                isReordering
                  ? "rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-2 bg-zinc-50/50 dark:bg-zinc-950/20"
                  : ""
              }`}
            >
              {/* Reorder Header Badge in Customization Mode */}
              {isReordering && (
                <div className="mb-2 flex items-center justify-between rounded-xl bg-zinc-900 px-3 py-2 text-white shadow-md dark:bg-zinc-800">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-zinc-400 cursor-grab active:cursor-grabbing" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-200">
                      {CARD_TITLES[cardId]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveCard(index, index - 1)}
                      className="rounded p-1 hover:bg-zinc-700 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === cardOrder.length - 1}
                      onClick={() => moveCard(index, index + 1)}
                      className="rounded p-1 hover:bg-zinc-700 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* The Actual Card Component with Error Boundary */}
              <SectionErrorBoundary title={CARD_TITLES[cardId]}>
                <div>{slotMap[cardId]}</div>
              </SectionErrorBoundary>
            </div>
          );
        })}
      </div>
    </div>
  );
}
