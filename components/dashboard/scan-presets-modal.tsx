"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Search,
  Check,
  ArrowRight,
  Briefcase,
  Cpu,
  ShoppingCart,
  Video,
  Home,
  Code2,
} from "lucide-react";
import { SCAN_PRESETS, type ScanPreset } from "@/lib/scan-presets";
import { getTimeWindowLabel } from "@/lib/time-window";
import { MINING_PRESETS } from "@/lib/mining-presets";

export interface ScanPresetsModalProps {
  onSelectPreset: (preset: ScanPreset) => void;
  trigger?: React.ReactNode;
}

const CATEGORY_ICONS: Record<ScanPreset["category"], React.ElementType> = {
  saas: Briefcase,
  developer: Code2,
  ecommerce: ShoppingCart,
  ai: Cpu,
  creator: Video,
  service: Home,
};

export function ScanPresetsModal({
  onSelectPreset,
  trigger,
}: ScanPresetsModalProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Presets" },
    { id: "saas", label: "SaaS" },
    { id: "developer", label: "Dev Tools" },
    { id: "ecommerce", label: "E-Commerce" },
    { id: "ai", label: "AI & Agents" },
    { id: "creator", label: "Creators" },
    { id: "service", label: "Services" },
  ];

  const filteredPresets = SCAN_PRESETS.filter((preset) => {
    const matchesCategory =
      selectedCategory === "all" || preset.category === selectedCategory;
    const matchesSearch =
      preset.name.toLowerCase().includes(search.toLowerCase()) ||
      preset.description.toLowerCase().includes(search.toLowerCase()) ||
      preset.keyword.toLowerCase().includes(search.toLowerCase()) ||
      preset.subreddits.some((s) =>
        s.toLowerCase().includes(search.toLowerCase()),
      );

    return matchesCategory && matchesSearch;
  });

  const handleApply = (preset: ScanPreset) => {
    onSelectPreset(preset);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 font-mono text-xs font-bold text-amber-500 shadow-xs transition-all hover:bg-amber-500/20 hover:text-amber-400"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Scan Presets</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto rounded-2xl border-2 border-white/15 bg-[#121212] p-6 text-white shadow-2xl sm:p-8">
        <DialogHeader className="space-y-2 text-left">
          <div className="flex items-center gap-2 font-mono text-[10px] font-black tracking-widest text-[#ff4500] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Quick-Start Mining Templates</span>
          </div>
          <DialogTitle className="font-mono text-2xl font-black tracking-tight text-white uppercase">
            Curated Niche Presets
          </DialogTitle>
          <DialogDescription className="font-sans text-xs text-zinc-400">
            Select a battle-tested template to instantly load keywords, target
            subreddits, and optimal extraction parameters.
          </DialogDescription>
        </DialogHeader>

        {/* Search & Category Filter */}
        <div className="my-2 space-y-4">
          <div className="relative">
            <Search className="absolute top-3.5 left-3.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates by niche, subreddits, or keywords..."
              className="w-full rounded-xl border border-white/10 bg-black/60 py-2.5 pr-4 pl-10 font-mono text-xs text-white placeholder-zinc-500 focus:border-[#ff4500] focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3 py-1 font-mono text-[11px] font-bold uppercase transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#ff4500] text-white"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="mt-2 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {filteredPresets.map((preset) => {
            const Icon = CATEGORY_ICONS[preset.category] || Briefcase;

            return (
              <div
                key={preset.id}
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#181818] p-4 shadow-xs transition-all hover:border-[#ff4500]/50 hover:bg-[#1e1e1e]"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-white group-hover:text-[#ff8a57]">
                        {preset.name}
                      </span>
                    </div>
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                      {preset.estimatedCredits} CR
                    </span>
                  </div>

                  <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
                    {preset.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {preset.subreddits.map((sub) => (
                        <span
                          key={sub}
                          className="rounded border border-white/5 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
                        >
                          r/{sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="font-mono text-[10px] text-zinc-400">
                    Depth:{" "}
                    <b className="text-zinc-300">
                      {MINING_PRESETS[preset.miningDepth].label}
                    </b>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApply(preset)}
                    className="flex items-center gap-1 rounded-lg bg-[#ff4500] px-3 py-1.5 font-mono text-[11px] font-black text-white uppercase shadow-xs transition-all hover:bg-[#ff571a] active:scale-95"
                  >
                    <span>Use Preset</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
