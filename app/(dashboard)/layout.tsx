import type { Metadata } from "next";
import { auth, getServerSession } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SidebarLinks } from "@/components/dashboard/sidebar-links";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardFooterLinks } from "@/components/dashboard/dashboard-footer-links";
import { resolveCurrentPlan } from "@/lib/plan-resolver";
import { Plus, Crown, LayoutDashboard } from "lucide-react";
import { getMonthlyScanUsage, getMonthlyUsageSummary } from "@/lib/plan-gating";
import { SystemBanner } from "@/components/dashboard/system-banner";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { LogoIcon } from "@/components/Logo";


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
  const session = await getServerSession(requestHeaders);

  if (!session) {
    redirect("/sign-in");
  }

  const prefs = await db.query.userPreferences.findFirst({
    where: eq(userPreferences.userId, session.user.id),
  });

  if (!prefs?.onboardingComplete) {
    redirect("/onboarding/step-1");
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
    <div className="flex min-h-screen landing-gradient font-sans text-zinc-800 antialiased selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      {/* Command Palette */}
      <CommandPalette />

      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 self-start border-r border-black/[0.06] bg-white/40 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="p-6">

          <div className="mb-8 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-tr from-[#ff4500] to-[#ff6b33] p-2 text-white shadow-[0_4px_12px_rgba(255,69,0,0.15)]">
              <LogoIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-[17px] leading-tight font-black tracking-tight text-zinc-900">
                ThreddIQ
              </h1>
              <p className="font-mono text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase">
                Market Analysis
              </p>
            </div>
          </div>
          <SidebarLinks />
        </div>

        <div className="mt-auto p-5">
          <div className="glass-card relative mb-6 overflow-hidden rounded-2xl p-4">
            <div className="relative z-10 mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4 text-[#ff4500]" />
              <p className="font-mono text-[11px] font-bold tracking-widest text-[#ff4500] uppercase">
                {planLabel}
              </p>
            </div>

            {/* Usage Meter */}
            <div className="relative z-10 mb-4">
              <div className="mb-1.5 flex items-end justify-between font-mono">
                <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                  Usage
                </p>
                <p className="text-[11px] font-black text-zinc-700">
                  {monthlyScansUsed}
                  {monthlyScansLimit === null ? (
                    <span className="ml-1 text-zinc-400">/ Unlimited</span>
                  ) : (
                    <span className="ml-1 text-zinc-400">
                      / {monthlyScansLimit}
                    </span>
                  )}
                </p>
              </div>
              <div className="h-1 w-full overflow-hidden bg-zinc-200/80 rounded-full">
                <div
                  className="h-full bg-[#ff4500] rounded-full"
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

            <p className="relative z-10 mb-4 text-[12px] leading-relaxed text-zinc-500">
              {upgradeMessage}
            </p>
            <Link
              href="/dashboard/billing"
              className="relative z-10 block w-full rounded-full bg-[#ff4500] py-2 text-center font-mono text-[11px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-[#e03d00] shadow-xs"
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
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/[0.06] bg-white/40 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <DashboardMobileNav
              userName={session.user.name ?? "Founder"}
              planLabel={planLabel}
            />
            <div className="flex items-center gap-2 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-widest text-emerald-700 uppercase max-sm:hidden">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              System Active
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-zinc-500 uppercase sm:hidden">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link
              href="/dashboard/search"
              className="flex items-center gap-2 bg-[#ff4500] hover:bg-[#e03d00] px-4 py-2 rounded-full font-mono text-[12px] font-bold tracking-wide whitespace-nowrap text-white uppercase transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Scan</span>
              <span className="sm:hidden">Scan</span>
            </Link>
            <div className="group flex cursor-pointer items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="mb-1 text-[13px] leading-none font-bold text-zinc-800">
                  {session.user.name}
                </p>
                <p className="font-mono text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
                  Founder
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-[#ff4500]/10 text-[#ff4500] transition-transform group-hover:scale-105">
                <span className="text-sm font-black">
                  {session.user.name?.charAt(0) || "U"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Global System Alerts (Used for Runbook Notifications) */}
        <SystemBanner
          isVisible={
            process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" || false
          }
          message={
            process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE ||
            "System degraded - using backup sources."
          }
        />

        {/* Dynamic Content */}
        <div className="relative flex-1">{children}</div>
      </main>
    </div>
  );
}
