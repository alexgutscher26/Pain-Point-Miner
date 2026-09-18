import type { Metadata } from "next";
import { auth, getServerSession } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SidebarLinks } from "@/components/dashboard/sidebar-links";
import { DashboardMobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardFooterLinks } from "@/components/dashboard/dashboard-footer-links";
import { resolveCurrentPlan } from "@/lib/plan-resolver";
import { Plus, Crown, LayoutDashboard, Zap, Sparkles } from "lucide-react";
import { getMonthlyScanUsage, getMonthlyUsageSummary } from "@/lib/plan-gating";
import { SystemBanner } from "@/components/dashboard/system-banner";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { LogoIcon } from "@/components/Logo";
import { ProductTour } from "@/components/dashboard/product-tour";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";

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
  const planLabel =
    plan === "pro"
      ? "Professional LTD"
      : plan === "growth"
        ? "Founder LTD"
        : "Starter Plan";

  const monthlyScansUsed = await getMonthlyScanUsage(session.user.id);
  const { monthlyScansLimit } = getMonthlyUsageSummary(plan, monthlyScansUsed);

  return (
    <div className="landing-gradient flex min-h-screen font-sans text-zinc-900 antialiased selection:bg-[#ff4500]/10 selection:text-[#ff4500] dark:bg-zinc-950 dark:text-zinc-100">
      {/* Command Palette */}
      <CommandPalette />

      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 self-start border-r border-zinc-200/90 bg-white/70 backdrop-blur-xl lg:flex lg:flex-col dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="p-5">
          {/* Logo Brand Header */}
          <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff4500] text-white shadow-xs transition-transform group-hover:scale-105">
                <LogoIcon className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-zinc-950 dark:text-white">
                  ThreddIQ
                </h1>
                <p className="font-mono text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                  Market Radar
                </p>
              </div>
            </Link>
          </div>

          <SidebarLinks />
        </div>

        {/* Bottom Quota Card & Footer */}
        <div className="mt-auto p-4">
          <div className="relative mb-4 overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-50/90 p-4 shadow-2xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/70">
            <div className="relative z-10 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <p className="font-mono text-[10px] font-bold tracking-wider text-zinc-900 uppercase dark:text-white">
                  {planLabel}
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Active
              </span>
            </div>

            {/* Usage Meter */}
            <div className="relative z-10 mb-3">
              <div className="mb-1 flex items-end justify-between font-mono">
                <p className="text-[10px] font-medium text-zinc-400">
                  Monthly Scans
                </p>
                <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
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
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[#ff4500]"
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

            <Link
              href="/dashboard/billing"
              className="relative z-10 block w-full rounded-xl border border-zinc-200/80 bg-white py-1.5 text-center font-mono text-[10px] font-bold tracking-wider text-zinc-800 uppercase shadow-2xs transition-all hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              Manage Allocation
            </Link>
          </div>
          <DashboardFooterLinks />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative flex min-h-screen flex-1 flex-col overflow-x-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200/90 bg-white/70 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex items-center gap-4">
            <DashboardMobileNav
              userName={session.user.name ?? "Founder"}
              planLabel={planLabel}
            />
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wide text-emerald-700 uppercase max-sm:hidden dark:text-emerald-400">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>Engine Online</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-zinc-500 uppercase sm:hidden">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Workspace</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard/search"
              className="flex items-center gap-1.5 rounded-xl bg-[#ff4500] px-3.5 py-1.5 font-mono text-[11px] font-bold tracking-wide whitespace-nowrap text-white uppercase shadow-sm transition-all hover:bg-[#e03d00]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Scan</span>
              <span className="sm:hidden">Scan</span>
            </Link>

            <div className="group flex cursor-pointer items-center gap-2.5">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  {session.user.name}
                </p>
                <p className="font-mono text-[9px] font-medium tracking-wider text-zinc-400 uppercase">
                  {planLabel}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-[#ff4500]/10 text-xs font-bold text-[#ff4500] dark:border-zinc-700">
                <span>{session.user.name?.charAt(0) || "U"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global System Alerts */}
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
        <div className="relative flex-1 pb-20 lg:pb-0">{children}</div>

        {/* Interactive Product Tour */}
        <ProductTour />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </main>
    </div>
  );
}
