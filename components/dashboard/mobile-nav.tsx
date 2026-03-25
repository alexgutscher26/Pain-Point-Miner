"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { SidebarLinks } from "@/components/dashboard/sidebar-links";
import { DashboardFooterLinks } from "@/components/dashboard/dashboard-footer-links";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardMobileNav({
  userName,
  planLabel,
}: {
  userName: string;
  planLabel: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center border border-white/20 bg-white/5 text-zinc-200"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[88%] max-w-xs border-white/10 bg-[#0d0d0d] p-0 text-zinc-100"
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="bg-[#ff4500] border border-[#ff8a57] p-2 text-white shadow-[2px_2px_0px_0px_rgba(255,69,0,0.35)]">
                <span className="material-symbols-outlined block text-xl font-bold">
                  query_stats
                </span>
              </div>
              <div>
                <p className="text-base font-black leading-tight tracking-tight">
                  ThreddIQ
                </p>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                  {planLabel}
                </p>
              </div>
            </Link>
          </div>
          <div className="px-4 py-4">
            <SidebarLinks />
          </div>
          <div className="mt-auto px-4 py-4">
            <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              {userName}
            </p>
            <DashboardFooterLinks />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
