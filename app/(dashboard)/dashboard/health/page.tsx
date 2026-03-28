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
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px w-8 bg-[#ff4500]"></div>
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
              Operational Intelligence
            </p>
          </div>
          <h2 className="mb-3 text-3xl leading-none font-black tracking-tight text-white">
            System Health
          </h2>
          <p className="text-sm font-medium text-zinc-400">
            Monitor the throughput and reliability of your automated market
            research systems.
          </p>
        </div>
      </div>

      <ScraperHealthDashboard />
    </div>
  );
}
