"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Play, 
  Rocket, 
  Loader2,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  SkipForward
} from "lucide-react";
import { useState, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { completeOnboardingAction } from "../actions";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NICHES_DATA: Record<string, { name: string; keyword: string }> = {
  saas: { name: "SaaS & B2B", keyword: "SaaS pain points" },
  ai: { name: "AI & Automation", keyword: "AI automation problems" },
  ecommerce: { name: "E-commerce", keyword: "ecommerce challenges" },
  agency: { name: "Agencies & Freelancing", keyword: "agency client pain points" },
  finance: { name: "FinTech & Money", keyword: "personal finance app missing features" },
};

export default function OnboardingStep3() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const niche = searchParams.get("niche") || "saas";
  const subs = searchParams.get("subs") || "";
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "starting" | "mining" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  
  const isScanningRef = useRef(false);
  const pollerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const subList = subs.split(",").filter(Boolean);
  const nicheName = NICHES_DATA[niche]?.name || "Custom Niche";
  const keyword = NICHES_DATA[niche]?.keyword || niche;

  const startScan = async () => {
    setIsScanning(true);
    isScanningRef.current = true;
    setScanStatus("starting");
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": `onboarding-${Date.now()}`
        },
        body: JSON.stringify({
          keyword,
          subreddits: subs,
          miningDepth: "basic",
          timeWindow: "90d"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start scan");
      }

      const data = await response.json();
      const scraperId = data.scraperId;
      setScanStatus("mining");
      
      const poll = async () => {
        if (!isScanningRef.current) return;

        try {
          const res = await fetch(`/api/scrapers/${scraperId}/status?t=${Date.now()}`); // Bypass cache
          if (!res.ok) {
             pollerTimeoutRef.current = setTimeout(poll, 3000);
             return;
          }
          const statusData = await res.json();
          
          const isActuallyFinished = 
            statusData.status === "completed" || 
            statusData.status === "failed" || 
            statusData.status === "success";

          if (isActuallyFinished) {
            console.log("[Onboarding-Poll] Scan finished detection:", statusData.status);
            setScanStatus("success");
            isScanningRef.current = false;
            if (pollerTimeoutRef.current) clearTimeout(pollerTimeoutRef.current);
            
            await completeOnboardingAction();
            setTimeout(() => {
               router.push(`/onboarding/celebration?count=${statusData.count || 0}`);
            }, 1000);
            return;
          }

          if (statusData.status === "error") {
             setError("Something went wrong with the scan.");
             setScanStatus("error");
             setIsScanning(false);
             isScanningRef.current = false;
          } else {
             // Continue polling if still running or pending
             pollerTimeoutRef.current = setTimeout(poll, 3000);
          }
        } catch (pollErr) {
           console.error("[Onboarding-Poll] Call failed:", pollErr);
           pollerTimeoutRef.current = setTimeout(poll, 5000); // Retry later
        }
      };

      // Start the poll
      pollerTimeoutRef.current = setTimeout(poll, 2000);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setScanStatus("error");
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  const handleSkip = async () => {
    isScanningRef.current = false;
    if (pollerTimeoutRef.current) clearTimeout(pollerTimeoutRef.current);
    const { completeOnboardingAction } = await import("../actions");
    await completeOnboardingAction();
    router.push("/dashboard");
  };

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          Ready to launch?
        </h2>
        <p className="text-lg text-zinc-400">
          We'll run your first scan on <span className="text-white font-bold">{subList.length} subreddits</span> searching for <span className="text-white font-bold">{nicheName}</span> problems.
        </p>
      </div>

      <div className="relative overflow-hidden border-2 border-white/10 bg-[#0d0d0d] p-8">
        {isScanning && (
          <div className="absolute inset-0 bg-[#ff4500]/5 animate-pulse" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center space-y-8 text-center pt-4 pb-4">
          {!isScanning ? (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#ff4500]/20 bg-[#ff4500]/10 text-[#ff4500] shadow-[0_0_30px_rgba(255,69,0,0.1)]">
                <Play className="h-8 w-8 ml-1" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Initial Scan Readiness</h3>
                <p className="text-sm text-zinc-500 max-w-sm">
                  This scan will analyze recent discussions and extract the most painful problems Founders like you can solve.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-[#ff4500]/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#ff4500] bg-[#ff4500]/10 text-[#ff4500]">
                   {scanStatus === "success" ? (
                     <CheckCircle2 className="h-10 w-10 text-green-500 animate-in zoom-in" />
                   ) : (
                     <Loader2 className="h-10 w-10 animate-spin" />
                   )}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  {scanStatus === "starting" && "Initializing Engine..."}
                  {scanStatus === "mining" && "Mining reddit for pain points..."}
                  {scanStatus === "success" && "Scan Complete!"}
                </h3>
                <div className="flex items-center justify-center gap-4">
                     <StatusBadge icon={Zap} label="Extraction" active={scanStatus === "mining"} complete={scanStatus === "success"} />
                     <StatusBadge icon={Sparkles} label="AI Analysis" active={scanStatus === "mining"} complete={scanStatus === "success"} />
                     <StatusBadge icon={Rocket} label="Reports" active={scanStatus === "mining"} complete={scanStatus === "success"} />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500 uppercase font-mono">
               <AlertCircle className="h-4 w-4" />
               {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse justify-between gap-6 pt-10 sm:flex-row sm:items-center">
        {!isScanning ? (
            <div className="flex items-center gap-6">
                <button
                onClick={() => router.push(`/onboarding/step-2?niche=${niche}&subs=${subs}`)}
                className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-600 uppercase transition-colors hover:text-white"
                >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
                </button>
                <button
                onClick={handleSkip}
                className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-800 transition-colors hover:text-zinc-600 uppercase"
                >
                <SkipForward className="h-3 w-3" />
                Skip
                </button>
            </div>
        ) : (
            <button
                onClick={handleSkip}
                className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-600 uppercase transition-colors hover:text-white"
            >
                <SkipForward className="h-3.5 w-3.5" />
                Force Finish
            </button>
        )}

        <button
          disabled={isScanning}
          onClick={startScan}
          className={cn(
            "flex w-full items-center justify-center gap-3 border shadow-lg transition-all duration-300 sm:w-auto",
            !isScanning 
              ? "border-[#ff4500] bg-[#ff4500] px-8 py-3.5 text-white hover:bg-[#e63e00] hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,69,0,0.3)]" 
              : "cursor-wait border-white/5 bg-white/5 px-8 py-3.5 text-zinc-700"
          )}
        >
          <span className="font-mono text-[13px] font-black tracking-widest uppercase">
            {isScanning ? "Scanning..." : "Launch First Scan"}
          </span>
          {!isScanning && <Rocket className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ icon: Icon, label, active, complete }: { icon: any, label: string, active: boolean, complete: boolean }) {
    return (
        <div className={cn(
            "flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors",
            complete ? "text-green-500" : active ? "text-[#ff4500] animate-pulse" : "text-zinc-600"
        )}>
            <Icon className="h-3 w-3" />
            {label}
        </div>
    )
}
