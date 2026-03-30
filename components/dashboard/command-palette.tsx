"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Settings,
  CreditCard,
  Plus,
  History,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface Report {
  id: string;
  niche: string;
  date: string;
  status: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recent_scans");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error("Failed to parse recent scans", e);
      }
    }
  }, []);

  // Fetch reports for the palette
  const fetchReports = useCallback(async () => {
    if (reports.length > 0) return; 
    setIsLoading(true);
    try {
      const response = await fetch("/api/reports?days=all");
      if (response.ok) {
        const data = await response.json();
        setReports(data.slice(0, 50)); 
      }
    } catch (e) {
      console.error("Failed to fetch reports for command palette", e);
    } finally {
      setIsLoading(false);
    }
  }, [reports.length]);

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Fetch reports when the palette is opened
  useEffect(() => {
    if (open) {
      fetchReports();
    }
  }, [open, fetchReports]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    setInputValue("");
    command();
  };

  const handleScan = (keyword: string) => {
    // Save to recent searches
    const updated = [keyword, ...recentSearches.filter((k) => k !== keyword)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recent_scans", JSON.stringify(updated));
    router.push(`/dashboard/search?q=${encodeURIComponent(keyword)}`);
  };

  const handleSelectReport = (id: string) => {
    runCommand(() => router.push(`/dashboard/reports/${id}`));
  };

  const handleSelectScan = () => {
    if (!inputValue) {
      runCommand(() => router.push("/dashboard/search"));
    } else {
      runCommand(() => handleScan(inputValue));
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type / to scan or search reports..." 
        value={inputValue}
        onValueChange={setInputValue}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {inputValue && (
          <CommandGroup heading="Actions">
            <CommandItem onSelect={handleSelectScan} className="bg-[#ff4500]/5!">
              <Search className="mr-2 h-4 w-4 text-[#ff4500]" />
              <span>Scan for <strong className="text-white">"{inputValue}"</strong></span>
              <CommandShortcut>⏎</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}

        <CommandGroup heading="Commands">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/search"))}>
            <Plus className="mr-2 h-4 w-4 text-[#ff4500]" />
            <span>New Scan</span>
            <CommandShortcut>/scan</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
            <Settings className="mr-2 h-4 w-4 text-zinc-500" />
            <span>Settings</span>
            <CommandShortcut>/settings</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/billing"))}>
            <CreditCard className="mr-2 h-4 w-4 text-zinc-500" />
            <span>Billing</span>
            <CommandShortcut>/billing</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator className="border-white/5" />

        {recentSearches.length > 0 && !inputValue && (
          <CommandGroup heading="Recent Searches">
            {recentSearches.map((keyword) => (
              <CommandItem key={keyword} onSelect={() => runCommand(() => handleScan(keyword))}>
                <History className="mr-2 h-4 w-4 text-zinc-500" />
                <span>{keyword}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {reports.length > 0 && (
          <CommandGroup heading="Investigations">
            {reports.map((report) => (
              <CommandItem 
                key={report.id} 
                onSelect={() => handleSelectReport(report.id)}
                value={report.niche + " " + report.id} 
              >
                <FileText className="mr-2 h-4 w-4 text-[#ff4500]" />
                <span className="truncate text-white font-medium italic">{report.niche}</span>
                <span className="ml-auto text-[10px] font-mono opacity-40 uppercase tracking-tighter">
                  {report.status === "Completed" ? report.date : report.status}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
