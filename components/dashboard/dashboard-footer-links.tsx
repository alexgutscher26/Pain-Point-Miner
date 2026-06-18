"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export function DashboardFooterLinks() {
  const pathname = usePathname();
  const isHelpActive = pathname === "/dashboard/help-support";

  return (
    <div className="flex flex-col gap-1 border-t border-black/[0.06] pt-4">
      <Link
        href="/dashboard/help-support"
        className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left font-mono text-[11px] tracking-wide uppercase transition-colors rounded-lg ${
          isHelpActive
            ? "border border-[#ff4500]/10 bg-[#ff4500]/5 text-[#ff4500] font-bold"
            : "border-transparent text-zinc-500 hover:bg-[#ff4500]/5 hover:text-[#ff4500]"
        }`}
      >
        <HelpCircle
          className={`h-[18px] w-[18px] ${
            isHelpActive ? "text-[#ff4500]" : "text-zinc-400"
          }`}
        />
        Help & Support
      </Link>

      {/* Command Palette Trigger Hint */}
      <div className="mt-1 flex w-full items-center justify-between px-3.5 py-2 font-mono text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">terminal</span>
          <span>Commands</span>
        </div>
        <div className="flex items-center gap-1 border border-black/[0.08] bg-black/[0.02] px-1.5 py-0.5 rounded text-zinc-500">
          <span className="text-[9px]">⌘</span>
          <span>K</span>
        </div>
      </div>
      
      <SignOutButton />
    </div>
  );
}
