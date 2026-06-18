import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-[#ff4500]/60"></div>
            <Skeleton className="h-3 w-36 rounded-md bg-black/[0.06]" />
          </div>
          <Skeleton className="h-10 w-64 rounded-lg bg-black/[0.08]" />
          <Skeleton className="h-4 w-72 rounded-md bg-black/[0.05]" />
        </div>
        <div className="hidden items-center gap-1.5 border border-black/[0.06] bg-white/50 p-1 rounded-full lg:flex shadow-xs backdrop-blur-md">
          <Skeleton className="h-10 w-28 rounded-full bg-black/[0.05]" />
          <Skeleton className="h-10 w-32 rounded-full bg-black/[0.03]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton showProgress />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton highlight showBadge />
      </div>

      <section className="glass-card p-6 rounded-3xl">
        <div className="space-y-5">
          <div className="space-y-3">
            <Skeleton className="h-3 w-28 rounded-full bg-[#ff4500]/10" />
            <Skeleton className="h-10 w-80 rounded-lg bg-black/[0.08]" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-md bg-black/[0.05]" />
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.4fr,0.8fr]">
            <Skeleton className="h-12 w-full rounded-full bg-black/[0.05]" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-12 w-full rounded-full bg-black/[0.05]" />
              <Skeleton className="h-12 w-full rounded-full bg-black/[0.05]" />
              <Skeleton className="h-12 w-full rounded-full bg-black/[0.05]" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/60 backdrop-blur-md shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-[#ff4500]/60"></div>
              <Skeleton className="h-6 w-48 rounded-lg bg-black/[0.08]" />
            </div>
            <Skeleton className="h-4 w-16 rounded-md bg-black/[0.05]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-black/[0.01] text-zinc-400 border-b border-black/[0.04]">
                  {["h-sk1", "h-sk2", "h-sk3", "h-sk4"].map((key) => (
                    <th key={key} className="px-8 py-4">
                      <Skeleton className="h-3 w-24 rounded-md bg-black/[0.05]" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {["r-sk1", "r-sk2", "r-sk3"].map((key) => (
                  <tr key={key}>
                    <td className="px-8 py-6">
                      <Skeleton className="mb-3 h-5 w-40 rounded-lg bg-black/[0.08]" />
                      <Skeleton className="h-3 w-16 rounded-md bg-black/[0.05]" />
                    </td>
                    <td className="px-8 py-6">
                      <Skeleton className="h-4 w-full max-w-[240px] rounded-md bg-black/[0.05]" />
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Skeleton className="mx-auto h-10 w-14 rounded-lg bg-black/[0.05]" />
                    </td>
                    <td className="px-8 py-6">
                      <Skeleton className="h-8 w-24 rounded-full bg-black/[0.05]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="glass-card relative overflow-hidden p-8 rounded-2xl shadow-xs">
            <div className="mb-8 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-xl bg-[#ff4500]/10" />
              <Skeleton className="h-6 w-36 rounded-lg bg-black/[0.08]" />
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-3 w-28 rounded-md bg-black/[0.05]" />
                <div className="border border-black/[0.06] bg-white/40 p-4 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl bg-[#ff4500]/10" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 rounded-lg bg-black/[0.08]" />
                      <Skeleton className="h-3 w-40 rounded-md bg-black/[0.05]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-black/[0.06] pt-6">
                <Skeleton className="mb-4 h-3 w-32 rounded-md bg-black/[0.05]" />
                <div className="border-y border-r border-l-4 border-l-[#ff4500] border-black/[0.06] bg-white/40 p-5 rounded-r-xl">
                  <Skeleton className="mb-3 h-4 w-full rounded-md bg-black/[0.08]" />
                  <Skeleton className="h-4 w-5/6 rounded-md bg-black/[0.05]" />
                </div>
                <Skeleton className="mt-4 h-3 w-36 rounded-md bg-black/[0.05]" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCardSkeleton({
  showProgress = false,
  showBadge = false,
  highlight = false,
}: {
  showProgress?: boolean;
  showBadge?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-2xl transition-all duration-300 ${
        highlight
          ? "border border-[#ff4500]/20 bg-white/80 shadow-xs relative overflow-hidden"
          : "glass-card bg-white/50 relative overflow-hidden"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <Skeleton className="h-10 w-10 border border-black/[0.05] bg-black/[0.04] rounded-xl" />
        {showBadge ? (
          <Skeleton className="h-5 w-14 rounded-full bg-[#ff4500]/10" />
        ) : (
          <div className="h-5 w-14" />
        )}
      </div>
      <Skeleton className="mb-3 h-3 w-24 rounded-md bg-black/[0.05]" />
      <div className="flex items-end gap-2">
        <Skeleton
          className={`h-9 w-24 rounded-lg ${highlight ? "bg-[#ff4500]/10" : "bg-black/[0.08]"}`}
        />
        <Skeleton className="h-4 w-12 rounded-md bg-black/[0.05]" />
      </div>
      {showProgress ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-2 w-full rounded-full bg-black/[0.05]" />
          <Skeleton className="h-3 w-40 rounded-md bg-black/[0.05]" />
        </div>
      ) : (
        <Skeleton className="mt-3 h-3 w-28 rounded-md bg-black/[0.05]" />
      )}
    </div>
  );
}
