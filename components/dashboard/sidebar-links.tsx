/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileText,
  CreditCard,
  Settings,
  ShieldCheck,
  Activity,
  Bookmark,
  Compass,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface SidebarGroup {
  category: string;
  items: {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export function SidebarLinks() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const groups: SidebarGroup[] = [
    {
      category: "Intelligence",
      items: [
        {
          href: "/dashboard",
          label: "Overview",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          href: "/dashboard/search",
          label: "Live Scanner",
          icon: <Search className="h-4 w-4" />,
          badge: "New",
        },
        {
          href: "/niches",
          label: "Pre-Mined Niches",
          icon: <Compass className="h-4 w-4" />,
        },
      ],
    },
    {
      category: "Research Dossiers",
      items: [
        {
          href: "/dashboard/reports",
          label: "Reports",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          href: "/dashboard/bookmarks",
          label: "Bookmarks",
          icon: <Bookmark className="h-4 w-4" />,
        },
      ],
    },
    {
      category: "Account & Engine",
      items: [
        {
          href: "/dashboard/billing",
          label: "Billing & LTD",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          icon: <Settings className="h-4 w-4" />,
        },
        {
          href: "/dashboard/health",
          label: "System Health",
          icon: <Activity className="h-4 w-4" />,
        },
      ],
    },
  ];

  if (isAdmin) {
    groups[2].items.push({
      href: "/dashboard/admin",
      label: "Admin Panel",
      icon: <ShieldCheck className="h-4 w-4" />,
    });
  }

  return (
    <nav className="space-y-6">
      {groups.map((group) => (
        <div key={group.category}>
          <p className="mb-2 px-3 font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            {group.category}
          </p>
          <div className="space-y-1">
            {group.items.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "border border-zinc-200 bg-white font-bold text-[#ff4500] shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-orange-400"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`transition-colors ${
                        isActive
                          ? "text-[#ff4500] dark:text-orange-400"
                          : "text-zinc-400 group-hover:text-zinc-900 dark:text-zinc-500 dark:group-hover:text-zinc-200"
                      }`}
                    >
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="rounded-md bg-[#ff4500]/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#ff4500] uppercase dark:bg-orange-950/50 dark:text-orange-300">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
