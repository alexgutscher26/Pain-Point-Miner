"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/search",
    label: "Mine",
    icon: Search,
    highlight: true,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: FileText,
  },
  {
    href: "/dashboard/bookmarks",
    label: "Saved",
    icon: Bookmark,
  },
  {
    href: "/dashboard/billing",
    label: "Plan",
    icon: CreditCard,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-black/[0.08] bg-white/90 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl px-2.5 py-1 transition-all duration-200",
                isActive
                  ? "text-[#ff4500]"
                  : "text-zinc-500 hover:text-zinc-900 active:scale-95",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-1 transition-all",
                  isActive && "bg-[#ff4500]/10",
                  item.highlight && !isActive && "text-[#ff4500]",
                )}
              >
                <Icon
                  className={cn("h-4 w-4", item.highlight && "h-4.5 w-4.5")}
                />
              </div>
              <span
                className={cn(
                  "font-mono text-[10px] leading-none tracking-tight uppercase",
                  isActive
                    ? "font-bold text-[#ff4500]"
                    : "font-medium text-zinc-500",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
