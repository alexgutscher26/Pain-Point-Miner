"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

export function DashboardFooterLinks() {
  const pathname = usePathname();
  const isHelpActive = pathname === "/dashboard/help-support";

  return (
    <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
      <Link
        href="/dashboard/help-support"
        className={`flex w-full items-center gap-3 px-3 py-2 text-left font-mono text-[11px] tracking-wide uppercase transition-colors ${
          isHelpActive
            ? "border border-[#ff8a57] bg-[#ff4500] text-white shadow-[2px_2px_0px_0px_rgba(255,69,0,0.35)]"
            : "border border-transparent text-zinc-400 hover:border-white/20 hover:bg-white/5 hover:text-white"
        }`}
      >
        <HelpCircle
          className={`h-[18px] w-[18px] ${
            isHelpActive ? "text-white" : "text-zinc-500"
          }`}
        />
        Help & Support
      </Link>
      <SignOutButton />
    </div>
  );
}
