import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SidebarLinks } from "@/components/dashboard/sidebar-links";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardFooterLinks } from "@/components/dashboard/dashboard-footer-links";
import { resolveCurrentPlan } from "@/lib/plan-resolver";
import { Plus, Crown, LayoutDashboard } from "lucide-react";
import {
  getMonthlyScanUsage,
  getMonthlyUsageSummary,
} from "@/lib/plan-gating";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard | ThreddIQ",
  },
  description: "Private workspace for searches, reports, and account settings.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/sign-in");
  }
  const plan = await resolveCurrentPlan({
    userId: session.user.id,
    email: session.user.email,
    requestHeaders,
  });
  const planLabel = `${plan.charAt(0).toUpperCase()}${plan.slice(1)} Plan`;
  const upgradeMessage =
    plan === "pro"
      ? "You have full access to all features."
      : plan === "growth"
        ? "Upgrade to Pro for unlimited scans and deep analysis."
        : "Upgrade to Growth or Pro for advanced features.";

  const monthlyScansUsed = await getMonthlyScanUsage(session.user.id);
  const { monthlyScansLimit } = getMonthlyUsageSummary(plan, monthlyScansUsed);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-[#ff4500]/30 antialiased">
      {/* Sidebar */}
      <aside className="hidden sticky top-0 h-screen w-60 shrink-0 self-start border-r-2 border-white/15 bg-[#0d0d0d] lg:flex lg:flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#ff4500] border border-[#ff8a57] p-2 text-white shadow-[2px_2px_0px_0px_rgba(255,69,0,0.35)]">
              <span className="material-symbols-outlined block text-2xl font-bold">
                query_stats
              </span>
            </div>
            <div>
              <h1 className="text-[17px] font-black leading-tight tracking-tight">
                Threddiq
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-400 font-bold">
                Market Analysis
              </p>
            </div>
          </div>
          <SidebarLinks />
        </div>

        <div className="mt-auto p-5">
          <div className="bg-[#161616] p-4 border-2 border-white/10 mb-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Crown className="w-4 h-4 text-[#ff4500]" />
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#ff4500]">
                {planLabel}
              </p>
            </div>

            {/* Usage Meter */}
            <div className="mb-4 relative z-10">
              <div className="flex justify-between items-end mb-1.5 font-mono">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Usage
                </p>
                <p className="text-[11px] font-black text-zinc-300">
                  {monthlyScansUsed}
                  {monthlyScansLimit === null ? (
                    <span className="text-zinc-500 ml-1">/ Unlimited</span>
                  ) : (
                    <span className="text-zinc-500 ml-1">/ {monthlyScansLimit}</span>
                  )}
                </p>
              </div>
              <div className="h-1 w-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#ff4500]"
                  style={{
                    width: `${
                      monthlyScansLimit === null
                        ? 0
                        : Math.min(
                            100,
                            (monthlyScansUsed / monthlyScansLimit) * 100,
                          )
                    }%`,
                  }}
                />
              </div>
            </div>

            <p className="text-[12px] text-zinc-400 mb-4 leading-relaxed relative z-10">
              {upgradeMessage}
            </p>
            <Link
              href="/dashboard/billing"
              className="block w-full border border-[#ff8a57] bg-[#ff4500] hover:bg-[#e63e00] text-white font-mono text-[11px] font-bold py-2.5 transition-colors uppercase tracking-widest relative z-10 text-center"
            >
              Upgrade Now
            </Link>
          </div>
          <DashboardFooterLinks />
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex min-h-screen flex-1 flex-col overflow-x-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b-2 border-white/15 bg-[#0a0a0a] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <DashboardMobileNav
              userName={session.user.name ?? "Founder"}
              planLabel={planLabel}
            />
            <div className="flex items-center gap-2 border border-green-400/50 bg-green-500/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-green-200 max-sm:hidden">
              <div className="w-2 h-2 bg-green-400"></div>
              System Active
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 sm:hidden">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/dashboard/search"
              className="border-2 border-white bg-white hover:bg-zinc-200 text-black px-3 sm:px-5 py-2 font-mono text-[12px] sm:text-[13px] font-bold flex items-center gap-2 transition-colors whitespace-nowrap uppercase tracking-wide"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Scan</span>
              <span className="sm:hidden">Scan</span>
            </Link>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-white leading-none mb-1">
                  {session.user.name}
                </p>
                <p className="font-mono text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  Founder
                </p>
              </div>
              <div className="h-10 w-10 bg-[#ff4500] flex items-center justify-center text-white border-2 border-[#ff8a57] shadow-[2px_2px_0px_0px_rgba(255,69,0,0.35)] overflow-hidden group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 transition-transform">
                <span className="text-sm font-black">
                  {session.user.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="relative flex-1">{children}</div>
      </main>
    </div>
  );
}
