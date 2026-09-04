import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Top Breadcrumb / Nav Bar Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg bg-zinc-200" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28 rounded bg-zinc-200" />
            <Skeleton className="h-7 w-64 rounded-lg bg-zinc-300" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-xl bg-zinc-200" />
          <Skeleton className="h-9 w-28 rounded-xl bg-zinc-200" />
          <Skeleton className="h-9 w-32 rounded-xl bg-zinc-200" />
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="space-y-2 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs"
          >
            <Skeleton className="h-3 w-20 rounded bg-zinc-200" />
            <Skeleton className="h-8 w-24 rounded-lg bg-zinc-300" />
            <Skeleton className="h-3 w-32 rounded bg-zinc-100" />
          </div>
        ))}
      </div>

      {/* Main Grid: Left Sidebar List + Right Detail View */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Pain Points List */}
        <div className="space-y-3 lg:col-span-4">
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-32 rounded bg-zinc-200" />
            <Skeleton className="h-4 w-12 rounded bg-zinc-200" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16 rounded-full bg-zinc-200" />
                <Skeleton className="h-4 w-12 rounded bg-zinc-200" />
              </div>
              <Skeleton className="h-5 w-full rounded bg-zinc-300" />
              <Skeleton className="h-4 w-4/5 rounded bg-zinc-200" />
              <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
                <Skeleton className="h-3 w-20 rounded bg-zinc-100" />
                <Skeleton className="h-3 w-16 rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Detail Pane */}
        <div className="space-y-6 lg:col-span-8">
          {/* Header Card */}
          <div className="space-y-6 rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full bg-blue-100" />
              <Skeleton className="h-6 w-20 rounded-full bg-emerald-100" />
              <Skeleton className="h-6 w-28 rounded-full bg-amber-100" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4 rounded-xl bg-zinc-300" />
              <Skeleton className="h-4 w-full rounded bg-zinc-200" />
              <Skeleton className="h-4 w-5/6 rounded bg-zinc-200" />
              <Skeleton className="h-4 w-2/3 rounded bg-zinc-200" />
            </div>
            <div className="border-zinc-150 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Skeleton className="h-3 w-20 rounded bg-zinc-200" />
                <Skeleton className="h-5 w-28 rounded bg-zinc-300" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20 rounded bg-zinc-200" />
                <Skeleton className="h-5 w-28 rounded bg-zinc-300" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-20 rounded bg-zinc-200" />
                <Skeleton className="h-5 w-28 rounded bg-zinc-300" />
              </div>
            </div>
          </div>

          {/* Tab Content Placeholder */}
          <div className="space-y-4 rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xs">
            <div className="flex gap-4 border-b border-zinc-200 pb-4">
              <Skeleton className="h-8 w-28 rounded-xl bg-zinc-200" />
              <Skeleton className="h-8 w-28 rounded-xl bg-zinc-200" />
              <Skeleton className="h-8 w-28 rounded-xl bg-zinc-200" />
            </div>
            <div className="space-y-3 pt-2">
              <Skeleton className="h-5 w-1/3 rounded bg-zinc-300" />
              <Skeleton className="h-4 w-full rounded bg-zinc-200" />
              <Skeleton className="h-4 w-full rounded bg-zinc-200" />
              <Skeleton className="h-4 w-4/5 rounded bg-zinc-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
