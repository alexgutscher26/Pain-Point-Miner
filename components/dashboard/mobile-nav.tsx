"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { LogoIcon } from "@/components/Logo";

import { SidebarLinks } from "@/components/dashboard/sidebar-links";
import { DashboardFooterLinks } from "@/components/dashboard/dashboard-footer-links";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

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
          className="inline-flex h-9 w-9 items-center justify-center border border-black/[0.08] bg-white/60 text-zinc-700 hover:bg-white rounded-full lg:hidden shadow-xs"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[88%] max-w-xs border-r border-black/[0.06] bg-white/95 backdrop-blur-lg p-0 text-zinc-800"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Access your dashboard, reports, and settings.
        </SheetDescription>
        <div className="flex h-full flex-col">

          <div className="border-b border-black/[0.06] px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-tr from-[#ff4500] to-[#ff6b33] p-2 text-white shadow-[0_2px_8px_rgba(255,69,0,0.15)]">
                <LogoIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base leading-tight font-black tracking-tight text-zinc-900">
                  ThreddIQ
                </p>
                <p className="font-mono text-[10px] font-bold tracking-[0.15em] text-[#ff4500] uppercase">
                  {planLabel}
                </p>
              </div>
            </Link>
          </div>
          <div className="px-4 py-4">
            <SidebarLinks />
          </div>
          <div className="mt-auto px-4 py-4">
            <p className="mb-2 font-mono text-[11px] font-semibold tracking-wide text-zinc-500 uppercase">
              {userName}
            </p>
            <DashboardFooterLinks />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
