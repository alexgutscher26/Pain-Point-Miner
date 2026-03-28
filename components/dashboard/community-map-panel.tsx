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
      fillMuted: "rgba(255, 69, 0, 0.16)",
      border: "rgba(255, 138, 87, 0.9)",
      text: "#ffffff",
      badge: "High intensity",
    };
  }

  if (intensity >= 6) {
    return {
      fill: "#ff7a33",
      fillMuted: "rgba(255, 122, 51, 0.16)",
      border: "rgba(255, 173, 92, 0.9)",
      text: "#fff7ed",
      badge: "Rising pain",
    };
  }

  return {
    fill: "#f59e0b",
    fillMuted: "rgba(245, 158, 11, 0.14)",
    border: "rgba(251, 191, 36, 0.9)",
    text: "#fff7ed",
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

function CommunityPainPointCard({
  painPoint,
}: {
  painPoint: CommunityPainPointRow;
}) {
  const tone = toIntensityTone(painPoint.score);

  return (
    <div className="border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm leading-tight font-black text-white">
            {painPoint.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
            <span>{formatUrgency(painPoint.urgency)}</span>
            <span className="h-1 w-1 bg-zinc-700" />
            <span>{formatSentiment(painPoint.sentiment)}</span>
            <span className="h-1 w-1 bg-zinc-700" />
            <span>{Math.max(0, painPoint.mentionCount ?? 0)} mentions</span>
          </div>
        </div>
        <div
          className="shrink-0 border px-2 py-1 text-[10px] font-black tracking-widest uppercase"
          style={{
            color: tone.text,
            borderColor: tone.border,
            backgroundColor: tone.fillMuted,
          }}
        >
          {painPoint.score}/10
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/5 pt-3">
        <div>
          <p className="font-mono text-[10px] font-black tracking-widest text-zinc-500 uppercase">
            Investigation
          </p>
          <p className="text-sm font-bold text-zinc-200">
            {painPoint.reportTitle}
          </p>
        </div>
        <Link
          href={`/dashboard/reports/${painPoint.reportId}`}
          className="inline-flex items-center gap-2 border border-white/15 px-3 py-2 font-mono text-[10px] font-black tracking-widest text-zinc-200 uppercase transition-colors hover:border-[#ff8a57] hover:bg-[#ff4500] hover:text-white"
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
      <div className="overflow-hidden border-2 border-white/10 bg-[#111] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-[#ff4500]" />
            <div>
              <h4 className="text-lg font-black tracking-tight text-white">
                Community Map
              </h4>
              <p className="mt-1 font-mono text-[11px] font-bold tracking-widest text-zinc-500 uppercase">
                Subreddit problem density over {selectedWindowLabel}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 font-mono text-[10px] font-black tracking-widest text-zinc-400 uppercase md:flex">
            <Flame className="h-3.5 w-3.5 text-[#ff4500]" />
            Color = avg intensity
          </div>
        </div>

        {nodes.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center border border-white/15 bg-white/5 text-zinc-500">
              <MapPinned className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-black text-white">
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
                    className={`${span.colSpan} ${span.rowSpan} group border p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.45)]`}
                    style={{
                      borderColor: tone.border,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)), " +
                        tone.fillMuted,
                    }}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-black text-white">
                            {node.label}
                          </p>
                          <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-zinc-200 uppercase">
                            {node.painPointCount} pain points
                          </p>
                        </div>
                        <span className="border border-white/10 bg-black/20 px-2 py-1 font-mono text-[9px] font-black tracking-widest text-zinc-100 uppercase">
                          {tone.badge}
                        </span>
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-3xl font-black text-white">
                            {node.averageIntensity}/10
                          </p>
                          <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-200 uppercase">
                            avg intensity
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-white">
                            {node.averageUrgency}/10
                          </p>
                          <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-200 uppercase">
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
                    className="border p-4 text-left transition-colors"
                    style={{
                      borderColor: tone.border,
                      backgroundColor: tone.fillMuted,
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">
                          {node.label}
                        </p>
                        <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-zinc-200 uppercase">
                          {node.painPointCount} pain points
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white">
                          {node.averageIntensity}/10
                        </p>
                        <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-200 uppercase">
                          avg intensity
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-white/10 px-8 py-4">
              <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
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
        <DrawerContent className="border-l border-white/10 bg-[#0c0c0c] text-white sm:max-w-xl">
          {selectedNode ? (
            <>
              <DrawerHeader className="border-b border-white/10 px-6 py-5 text-left">
                <div className="flex items-center gap-2 text-[#ff4500]">
                  <Layers3 className="h-4 w-4" />
                  <p className="font-mono text-[10px] font-black tracking-widest uppercase">
                    Community drill-in
                  </p>
                </div>
                <DrawerTitle className="mt-2 text-2xl font-black tracking-tight text-white">
                  {selectedNode.label}
                </DrawerTitle>
                <DrawerDescription className="mt-2 text-sm font-medium text-zinc-400">
                  {selectedNode.painPointCount} pain points, average intensity{" "}
                  {selectedNode.averageIntensity}/10, average urgency{" "}
                  {selectedNode.averageUrgency}/10.
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-3 overflow-y-auto px-6 py-5">
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
