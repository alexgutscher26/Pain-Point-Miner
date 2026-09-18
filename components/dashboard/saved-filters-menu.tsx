"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Bookmark,
  BookmarkPlus,
  Check,
  Trash2,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SavedFilterPreset, DEFAULT_FILTER_PRESETS } from "@/lib/saved-filters";

interface SavedFiltersMenuProps {
  currentFilters: {
    days: string;
    status: string;
    minScore: string;
    savedOnly: string;
    category: string;
    searchTerm?: string;
  };
  onApplyPreset: (preset: SavedFilterPreset["filters"], presetName?: string) => void;
}

export function SavedFiltersMenu({
  currentFilters,
  onApplyPreset,
}: SavedFiltersMenuProps) {
  const [presets, setPresets] = useState<SavedFilterPreset[]>(DEFAULT_FILTER_PRESETS);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isSavingModalOpen, setIsSavingModalOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // Load presets from server
  useEffect(() => {
    let mounted = true;
    async function loadPresets() {
      try {
        const res = await fetch("/api/settings/saved-filters");
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data.presets)) {
            setPresets(data.presets);
          }
        }
      } catch (err) {
        console.error("Failed to load saved filter presets:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadPresets();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = presetNameInput.trim();
    if (!trimmed) {
      toast.error("Please enter a name for the saved filter preset");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/settings/saved-filters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmed,
            filters: currentFilters,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to save preset");
        }

        const data = await res.json();
        setPresets(data.presets);
        setActivePresetId(data.preset.id);
        setIsSavingModalOpen(false);
        setPresetNameInput("");
        toast.success(`Saved filter preset "${trimmed}"`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Error saving preset");
      }
    });
  };

  const handleDeletePreset = async (e: React.MouseEvent, preset: SavedFilterPreset) => {
    e.stopPropagation();
    if (preset.isDefault) return;

    try {
      const res = await fetch(`/api/settings/saved-filters?id=${preset.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setPresets(data.presets);
        if (activePresetId === preset.id) {
          setActivePresetId(null);
        }
        toast.success(`Removed preset "${preset.name}"`);
      }
    } catch {
      toast.error("Failed to delete preset");
    }
  };

  const activePreset = presets.find((p) => p.id === activePresetId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="group flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3.5 py-2 font-mono text-[11px] font-bold tracking-wide text-zinc-700 uppercase transition-all outline-none hover:border-[#ff4500]/40 hover:bg-white hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300 dark:hover:bg-zinc-900">
            <Bookmark className={`h-3.5 w-3.5 transition-colors ${activePreset ? "text-[#ff4500]" : "text-zinc-400 group-hover:text-[#ff4500]"}`} />
            <span>{activePreset ? activePreset.name : "Saved Views"}</span>
            {isLoading && <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-72 rounded-2xl border border-zinc-200/90 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between px-2.5 py-1.5">
            <DropdownMenuLabel className="p-0 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              Filter Presets
            </DropdownMenuLabel>
            <button
              type="button"
              onClick={() => setIsSavingModalOpen(true)}
              className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold text-[#ff4500] hover:bg-[#ff4500]/10 transition-colors cursor-pointer"
            >
              <BookmarkPlus className="h-3 w-3" />
              <span>Save Current</span>
            </button>
          </div>

          <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900 my-1" />

          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {presets.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <DropdownMenuItem
                  key={preset.id}
                  onClick={() => {
                    setActivePresetId(preset.id);
                    onApplyPreset(preset.filters, preset.name);
                    toast.info(`Applied view: ${preset.name}`);
                  }}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#ff4500]/10 text-[#ff4500] font-bold"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {preset.isDefault ? (
                      <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#ff4500] shrink-0" />
                    )}
                    <span className="truncate">{preset.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#ff4500]" />}
                    {!preset.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleDeletePreset(e, preset)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Delete custom preset"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Preset Modal */}
      {isSavingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ff4500]/10 text-[#ff4500]">
                  <BookmarkPlus className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Save Filter Preset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSavingModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrent} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={presetNameInput}
                  onChange={(e) => setPresetNameInput(e.target.value)}
                  placeholder="e.g. High-Urgency Fintech (70+)"
                  autoFocus
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm font-medium text-zinc-900 outline-none transition-all focus:border-[#ff4500] focus:bg-white focus:ring-2 focus:ring-[#ff4500]/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:bg-zinc-900"
                />
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                <p className="font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                  Included Filters:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>Date: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{currentFilters.days === "all" ? "All Time" : `${currentFilters.days}d`}</span></div>
                  <div>Status: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{currentFilters.status}</span></div>
                  <div>Min Score: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{currentFilters.minScore}+</span></div>
                  <div>Starred: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{currentFilters.savedOnly === "true" ? "Yes" : "No"}</span></div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSavingModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !presetNameInput.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ff4500] px-5 py-2 font-mono text-xs font-bold uppercase text-white shadow-xs hover:bg-[#e03d00] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Preset</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
