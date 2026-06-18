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
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function SidebarLinks() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const links = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
      label: "Overview",
    },
    {
      href: "/dashboard/search",
      icon: <Search className="h-[18px] w-[18px]" />,
      label: "New Search",
    },
    {
      href: "/dashboard/reports",
      icon: <FileText className="h-[18px] w-[18px]" />,
      label: "Reports",
    },
    {
      href: "/dashboard/billing",
      icon: <CreditCard className="h-[18px] w-[18px]" />,
      label: "Billing",
    },
    {
      href: "/dashboard/settings",
      icon: <Settings className="h-[18px] w-[18px]" />,
      label: "Settings",
    },
    {
      href: "/dashboard/health",
      icon: <Activity className="h-[18px] w-[18px]" />,
      label: "System Health",
    },
  ];

  if (isAdmin) {
    links.push({
      href: "/dashboard/admin",
      icon: <ShieldCheck className="h-[18px] w-[18px]" />,
      label: "Admin",
    });
  }

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center gap-3.5 border px-3.5 py-2.5 font-mono text-[11px] tracking-wide uppercase transition-colors rounded-lg ${
              isActive
                ? "border-[#ff4500]/10 bg-[#ff4500]/5 text-[#ff4500] font-bold"
                : "border-transparent text-zinc-500 hover:bg-[#ff4500]/5 hover:text-zinc-900"
            }`}
          >
            <span
              className={`${isActive ? "text-[#ff4500]" : "text-zinc-400 group-hover:text-zinc-900"} transition-colors`}
            >
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
