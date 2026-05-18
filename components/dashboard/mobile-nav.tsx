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
          className="inline-flex h-9 w-9 items-center justify-center border border-white/20 bg-white/5 text-zinc-200 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[88%] max-w-xs border-white/10 bg-[#0d0d0d] p-0 text-zinc-100"
      >
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Access your dashboard, reports, and settings.
        </SheetDescription>
        <div className="flex h-full flex-col">

          <div className="border-b border-white/10 px-5 py-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center border border-[#ff8a57] bg-[#ff4500] p-2 text-white shadow-[2px_2px_0px_0px_rgba(255,69,0,0.35)]">
                <LogoIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base leading-tight font-black tracking-tight">
                  ThreddIQ
                </p>
                <p className="font-mono text-[10px] font-bold tracking-[0.15em] text-zinc-500 uppercase">
                  {planLabel}
                </p>
              </div>
            </Link>
          </div>
          <div className="px-4 py-4">
            <SidebarLinks />
          </div>
          <div className="mt-auto px-4 py-4">
            <p className="mb-2 font-mono text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
              {userName}
            </p>
            <DashboardFooterLinks />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
