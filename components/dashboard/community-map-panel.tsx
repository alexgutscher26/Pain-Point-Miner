"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Flame, Layers3, MapPinned } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type {
  CommunityPainPointRow,
  SubredditCommunityNode,
} from "@/lib/community-map";

type CommunityMapPanelProps = {
  nodes: SubredditCommunityNode[];
  selectedWindowLabel: string;
};

function toIntensityTone(intensity: number) {
  if (intensity >= 8) {
    return {
      fill: "#ff4500",
      fillMuted: "rgba(255, 69, 0, 0.08)",
      border: "rgba(255, 69, 0, 0.25)",
      text: "#9a2a00",
      badgeText: "#ff4500",
      badgeBg: "rgba(255, 69, 0, 0.05)",
      badgeBorder: "rgba(255, 69, 0, 0.15)",
      badge: "High intensity",
    };
  }

  if (intensity >= 6) {
    return {
      fill: "#ff7a33",
      fillMuted: "rgba(255, 122, 51, 0.08)",
      border: "rgba(255, 122, 51, 0.25)",
      text: "#a14000",
      badgeText: "#ff7a33",
      badgeBg: "rgba(255, 122, 51, 0.05)",
      badgeBorder: "rgba(255, 122, 51, 0.15)",
      badge: "Rising pain",
    };
  }

  return {
    fill: "#f59e0b",
    fillMuted: "rgba(245, 158, 11, 0.06)",
    border: "rgba(245, 158, 11, 0.25)",
    text: "#855300",
    badgeText: "#d97706",
    badgeBg: "rgba(245, 158, 11, 0.05)",
    badgeBorder: "rgba(245, 158, 11, 0.15)",
    badge: "Emerging signal",
  };
}

function getDesktopSpan(
  node: SubredditCommunityNode,
  largestCount: number,
): { colSpan: string; rowSpan: string } {
  const ratio = largestCount > 0 ? node.painPointCount / largestCount : 0;

  if (ratio >= 0.85) {
    return { colSpan: "md:col-span-6", rowSpan: "md:row-span-2" };
  }

  if (ratio >= 0.55) {
    return { colSpan: "md:col-span-4", rowSpan: "md:row-span-2" };
  }

  if (ratio >= 0.3) {
    return { colSpan: "md:col-span-4", rowSpan: "md:row-span-1" };
  }

  return { colSpan: "md:col-span-3", rowSpan: "md:row-span-1" };
}

function formatUrgency(urgency: number | null) {
  if ((urgency ?? 0) >= 8) return "Extreme urgency";
  if ((urgency ?? 0) >= 5) return "High urgency";
  if ((urgency ?? 0) > 0) return "Moderate urgency";
  return "Unscored urgency";
}

function formatSentiment(sentiment: string | null) {
  if (!sentiment) return "Unknown sentiment";
  return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
}

function formatDifficulty(difficulty: string | null) {
  const map: Record<string, { label: string; color: string }> = {
    weekend_project: {
      label: "Weekend Project",
      color: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    },
    side_project: {
      label: "Side Project",
      color: "border-amber-500/20 bg-amber-500/10 text-amber-600",
    },
    startup_mvp: {
      label: "Startup MVP",
      color: "border-orange-500/20 bg-orange-500/10 text-orange-600",
    },
    vc_scale_moat: {
      label: "VC-Scale Moat",
      color:
        "border-rose-500/20 bg-rose-500/10 text-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.05)]",
    },
  };
  return map[difficulty || "weekend_project"] || map.weekend_project;
}

function CommunityPainPointCard({
  painPoint,
}: {
  painPoint: CommunityPainPointRow;
}) {
  const tone = toIntensityTone(painPoint.score);

  return (
    <div className="border border-zinc-200/60 bg-white p-5 rounded-2xl shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm leading-tight font-extrabold text-zinc-900">
            {painPoint.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
            <span>{formatUrgency(painPoint.urgency)}</span>
            <span className="h-1 w-1 bg-zinc-300 rounded-full" />
            <span>{formatSentiment(painPoint.sentiment)}</span>
            <span className="h-1 w-1 bg-zinc-300 rounded-full" />
            {(() => {
              const { label, color } = formatDifficulty(painPoint.difficulty);
              return (
                <span className={`rounded-md border px-1.5 py-0.5 ${color}`}>
                  {label}
                </span>
              );
            })()}
            <span className="h-1 w-1 bg-zinc-300 rounded-full" />
            <span>{Math.max(0, painPoint.mentionCount ?? 0)} mentions</span>
          </div>
        </div>
        <div
          className="shrink-0 border px-2 py-1 text-[10px] font-black tracking-widest uppercase rounded-md"
          style={{
            color: tone.text,
            borderColor: tone.border,
            backgroundColor: tone.fillMuted,
          }}
        >
          {painPoint.score}/10
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-black/[0.03] pt-3">
        <div>
          <p className="font-mono text-[9px] font-black tracking-widest text-zinc-400 uppercase">
            Investigation
          </p>
          <p className="text-sm font-bold text-zinc-700">
            {painPoint.reportTitle}
          </p>
        </div>
        <Link
          href={`/dashboard/reports/${painPoint.reportId}`}
          className="inline-flex items-center gap-2 border border-zinc-200 bg-white/60 px-3 py-2 font-mono text-[10px] font-black tracking-widest text-zinc-600 uppercase transition-all hover:border-[#ff4500] hover:bg-[#ff4500] hover:text-white rounded-full cursor-pointer"
        >
          Open report
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function CommunityMapPanel({
  nodes,
  selectedWindowLabel,
}: CommunityMapPanelProps) {
  const [selectedNode, setSelectedNode] =
    useState<SubredditCommunityNode | null>(null);
  const largestCount = nodes[0]?.painPointCount ?? 0;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white/60 backdrop-blur-md shadow-xs animate-in fade-in duration-300">
        <div className="flex items-center justify-between gap-4 border-b border-black/[0.05] bg-black/[0.01] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-[#ff4500]" />
            <div>
              <h4 className="text-lg font-black tracking-tight text-zinc-900">
                Community Map
              </h4>
              <p className="mt-1 font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                Subreddit problem density over {selectedWindowLabel}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 border border-black/[0.05] bg-black/[0.02] px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-widest text-zinc-600 uppercase rounded-full md:flex">
            <Flame className="h-3.5 w-3.5 text-[#ff4500] animate-pulse" />
            Color = avg intensity
          </div>
        </div>

        {nodes.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-black/[0.05] bg-black/[0.02] text-zinc-400 rounded-2xl">
              <MapPinned className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-zinc-900">
                No community map yet
              </p>
              <p className="max-w-md text-sm font-medium text-zinc-500">
                Run more investigations in this time window to see where pain is
                concentrating across subreddits.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden gap-4 p-5 md:grid md:auto-rows-[120px] md:grid-cols-12">
              {nodes.map((node) => {
                const tone = toIntensityTone(node.averageIntensity);
                const span = getDesktopSpan(node, largestCount);

                return (
                  <button
                    key={node.subreddit}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    className={`${span.colSpan} ${span.rowSpan} group border p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xs rounded-2xl cursor-pointer`}
                    style={{
                      borderColor: tone.border,
                      backgroundColor: tone.fillMuted,
                    }}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-black text-zinc-900 transition-colors group-hover:text-[#ff4500]">
                            {node.label}
                          </p>
                          <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                            {node.painPointCount} pain points
                          </p>
                        </div>
                        <span 
                          className="border px-2 py-0.5 font-mono text-[9px] font-black tracking-widest uppercase rounded-full"
                          style={{
                            color: tone.badgeText,
                            backgroundColor: tone.badgeBg,
                            borderColor: tone.badgeBorder,
                          }}
                        >
                          {tone.badge}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-3xl font-black" style={{ color: tone.text }}>
                            {node.averageIntensity}/10
                          </p>
                          <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-450 uppercase">
                            avg intensity
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-zinc-800">
                            {node.averageUrgency}/10
                          </p>
                          <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-450 uppercase">
                            urgency
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
              {nodes.map((node) => {
                const tone = toIntensityTone(node.averageIntensity);
                return (
                  <button
                    key={node.subreddit}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    className="border p-4 text-left transition-all duration-200 rounded-xl cursor-pointer"
                    style={{
                      borderColor: tone.border,
                      backgroundColor: tone.fillMuted,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-zinc-900">
                          {node.label}
                        </p>
                        <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                          {node.painPointCount} pain points
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black" style={{ color: tone.text }}>
                          {node.averageIntensity}/10
                        </p>
                        <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-450 uppercase">
                          avg intensity
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-black/[0.05] px-8 py-4 bg-black/[0.005]">
              <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Largest blocks reflect pain-point count. Hotter tones indicate
                stronger average intensity.
              </p>
            </div>
          </>
        )}
      </div>

      <Drawer
        open={Boolean(selectedNode)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNode(null);
          }
        }}
        direction="right"
      >
        <DrawerContent className="border-l border-zinc-200/50 bg-white/95 backdrop-blur-xl text-zinc-900 sm:max-w-xl">
          {selectedNode ? (
            <>
              <DrawerHeader className="border-b border-black/[0.05] px-6 py-5 text-left">
                <div className="flex items-center gap-2 text-[#ff4500]">
                  <Layers3 className="h-4 w-4" />
                  <p className="font-mono text-[10px] font-black tracking-widest uppercase">
                    Community drill-in
                  </p>
                </div>
                <DrawerTitle className="mt-2 text-2xl font-black tracking-tight text-zinc-900">
                  {selectedNode.label}
                </DrawerTitle>
                <DrawerDescription className="mt-2 text-sm font-medium text-zinc-500">
                  {selectedNode.painPointCount} pain points, average intensity{" "}
                  {selectedNode.averageIntensity}/10, average urgency{" "}
                  {selectedNode.averageUrgency}/10.
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4 overflow-y-auto px-6 py-6 bg-zinc-50/30">
                {selectedNode.topPainPoints.map((painPoint) => (
                  <CommunityPainPointCard
                    key={painPoint.id}
                    painPoint={painPoint}
                  />
                ))}
              </div>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    </>
  );
}
