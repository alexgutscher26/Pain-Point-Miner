"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  CreditCard, 
  Settings 
} from "lucide-react";

export function SidebarLinks() {
  const pathname = usePathname();

  const links = [
    { 
      href: "/dashboard", 
      icon: <LayoutDashboard className="w-[18px] h-[18px]" />, 
      label: "Overview" 
    },
    { 
      href: "/dashboard/search", 
      icon: <Search className="w-[18px] h-[18px]" />, 
      label: "New Search" 
    },
    { 
      href: "/dashboard/reports", 
      icon: <FileText className="w-[18px] h-[18px]" />, 
      label: "Reports" 
    },
    { 
      href: "/dashboard/billing", 
      icon: <CreditCard className="w-[18px] h-[18px]" />, 
      label: "Billing" 
    },
    { 
      href: "/dashboard/settings", 
      icon: <Settings className="w-[18px] h-[18px]" />, 
      label: "Settings" 
    },
  ];

  return (
    <nav className="space-y-1.5">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all font-medium text-sm group ${
              isActive 
                ? "bg-[#ff4500] text-white shadow-lg shadow-[#ff4500]/20" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className={`${isActive ? "text-white" : "text-zinc-500 group-hover:text-white"} transition-colors`}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
