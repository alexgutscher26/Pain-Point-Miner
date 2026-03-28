import { ScraperHealthDashboard } from "@/components/dashboard/scraper-health-dashboard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ScraperHealthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-[#ff4500]"></div>
            <p className="font-mono text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">
              Operational Intelligence
            </p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
             System Health
          </h2>
          <p className="text-zinc-400 font-medium text-sm">
            Monitor the throughput and reliability of your automated market research systems.
          </p>
        </div>
      </div>

      <ScraperHealthDashboard />
    </div>
  );
}
