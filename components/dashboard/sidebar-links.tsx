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
            className={`group flex items-center gap-3.5 border px-3.5 py-2.5 font-mono text-[11px] tracking-wide uppercase transition-colors ${
              isActive
                ? "border-[#ff8a57] bg-[#ff4500] text-white shadow-[2px_2px_0px_0px_rgba(255,69,0,0.35)]"
                : "border-white/10 text-zinc-400 hover:border-white/30 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span
              className={`${isActive ? "text-white" : "text-zinc-500 group-hover:text-white"} transition-colors`}
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
