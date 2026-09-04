"use client";

import React from "react";
import {
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  Radio,
  Layers,
} from "lucide-react";
import { type MiningPhase } from "@/hooks/use-mining-stream";

export interface LiveScanCounterProps {
  postsFetched: number;
  postsSkipped: number;
  commentsFetched: number;
  painPointCount: number;
  subreddits: string[];
  phase: MiningPhase;
  progress: number;
  className?: string;
}

export function LiveScanCounter({
  postsFetched,
  postsSkipped,
  commentsFetched,
  painPointCount,
  subreddits,
  phase,
  progress,
  className = "",
}: LiveScanCounterProps) {
  const isScanning = phase === "scanning" || phase === "running";
  const isExtracting = phase === "extracting";
  const isClustering = phase === "clustering";
  const isDone = phase === "completed";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Live Counter Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Card 1: Posts Scanned */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#161616] p-4 shadow-sm transition-all">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
              Posts Scanned
            </span>
            <div className="flex items-center gap-1.5">
              {isScanning && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4500]"></span>
                </span>
              )}
              <Search className="h-3.5 w-3.5 text-zinc-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-white tabular-nums">
              {postsFetched.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-zinc-500">posts</span>
          </div>
          <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-zinc-400">
            <Radio className="h-2.5 w-2.5 text-[#ff4500]" />
            <span>
              {isScanning
                ? "Live stream active"
                : isDone
                  ? "Extraction complete"
                  : "Ingestion parsed"}
            </span>
          </div>
        </div>

        {/* Card 2: Filtered Noise */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#161616] p-4 shadow-sm transition-all">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
              Filtered Noise
            </span>
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-zinc-300 tabular-nums">
              {postsSkipped.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-zinc-500">
              skipped
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-zinc-400">
            Deleted & low-relevance
          </p>
        </div>

        {/* Card 3: Comments & Threads */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#161616] p-4 shadow-sm transition-all">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
              Discussions
            </span>
            <div className="flex items-center gap-1.5">
              {isExtracting && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                </span>
              )}
              <MessageSquare className="h-3.5 w-3.5 text-zinc-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-blue-400 tabular-nums">
              {commentsFetched.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-zinc-500">
              comments
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-zinc-400">
            {isExtracting ? "Traversing comment trees" : "Deep trees analyzed"}
          </p>
        </div>

        {/* Card 4: Discovered Pain Points */}
        <div className="relative overflow-hidden rounded-xl border border-[#ff4500]/30 bg-[#1e130f] p-4 shadow-sm transition-all">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-mono text-[10px] font-bold tracking-wider text-amber-400 uppercase">
              Pain Points
            </span>
            <Sparkles className="h-3.5 w-3.5 text-[#ff4500]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-black text-[#ff8a57] tabular-nums">
              {painPointCount.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-amber-500/80">
              insights
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-amber-300/70">
            {isClustering ? "Clustering themes..." : "High-conviction gaps"}
          </p>
        </div>
      </div>

      {/* Per-Subreddit Breakdown Pills */}
      {subreddits.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#131313] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              <Layers className="h-3 w-3 text-[#ff4500]" />
              <span>Target Communities ({subreddits.length})</span>
            </div>
            <span className="font-mono text-[10px] text-zinc-400">
              {phase === "completed" ? "All scanned" : "Live ingestion"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {subreddits.map((sub, idx) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-zinc-300"
              >
                <span className="text-[#ff4500]">r/</span>
                <span>{sub}</span>
                {isScanning && idx === 0 && (
                  <span className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff4500]" />
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
