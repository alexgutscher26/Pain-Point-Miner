import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-[#ff4500]/60"></div>
            <Skeleton className="h-3 w-36 rounded-none bg-white/10" />
          </div>
          <Skeleton className="h-10 w-64 rounded-none bg-white/10" />
          <Skeleton className="h-4 w-72 rounded-none bg-white/8" />
        </div>
        <div className="hidden items-center gap-3 border border-white/15 bg-[#161616] p-1.5 lg:flex">
          <Skeleton className="h-10 w-28 rounded-none bg-white/10" />
          <Skeleton className="h-10 w-32 rounded-none bg-white/8" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton showProgress />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton highlight showBadge />
      </div>

      <section className="border-2 border-white/12 bg-[#111] p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="space-y-5">
          <div className="space-y-3">
            <Skeleton className="h-3 w-28 rounded-none bg-[#ff4500]/15" />
            <Skeleton className="h-10 w-80 rounded-none bg-white/10" />
            <Skeleton className="h-4 w-full max-w-2xl rounded-none bg-white/8" />
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.4fr,0.8fr]">
            <Skeleton className="h-12 w-full rounded-none bg-white/8" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-12 w-full rounded-none bg-white/8" />
              <Skeleton className="h-12 w-full rounded-none bg-white/8" />
              <Skeleton className="h-12 w-full rounded-none bg-white/8" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-2 border-white/10 bg-[#111] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32 rounded-none bg-[#ff4500]/15" />
            <Skeleton className="h-8 w-64 rounded-none bg-white/10" />
          </div>
          <Skeleton className="h-9 w-28 rounded-none bg-white/8" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {["sk-c1", "sk-c2", "sk-c3", "sk-c4", "sk-c5", "sk-c6"].map((key) => (
            <div
              key={key}
              className="border border-white/10 bg-white/2 p-4"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <Skeleton className="h-4 w-24 rounded-none bg-white/10" />
                <Skeleton className="h-6 w-12 rounded-none bg-[#ff4500]/15" />
              </div>
              <Skeleton className="mb-3 h-5 w-full rounded-none bg-white/8" />
              <Skeleton className="h-3 w-2/3 rounded-none bg-white/8" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <section className="overflow-hidden border-2 border-white/10 bg-[#111] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-[#ff4500]/60"></div>
              <Skeleton className="h-6 w-48 rounded-none bg-white/10" />
            </div>
            <Skeleton className="h-4 w-16 rounded-none bg-white/8" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-white/2 text-zinc-500">
                  {["h-sk1", "h-sk2", "h-sk3", "h-sk4"].map((key) => (
                    <th key={key} className="px-8 py-4">
                      <Skeleton className="h-3 w-24 rounded-none bg-white/8" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {["r-sk1", "r-sk2", "r-sk3"].map((key) => (
                  <tr key={key}>
                    <td className="px-8 py-6">
                      <Skeleton className="mb-3 h-5 w-40 rounded-none bg-white/10" />
                      <Skeleton className="h-3 w-16 rounded-none bg-white/8" />
                    </td>
                    <td className="px-8 py-6">
                      <Skeleton className="h-4 w-full max-w-[240px] rounded-none bg-white/8" />
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Skeleton className="mx-auto h-10 w-14 rounded-none bg-white/8" />
                    </td>
                    <td className="px-8 py-6">
                      <Skeleton className="h-8 w-24 rounded-none bg-white/8" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-8">
          <div className="overflow-hidden border-2 border-white/10 bg-[#111] p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.65)]">
            <div className="mb-8 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-none bg-[#ff4500]/15" />
              <Skeleton className="h-6 w-36 rounded-none bg-white/10" />
            </div>
            <div className="space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-3 w-28 rounded-none bg-white/8" />
                <div className="border border-white/15 bg-white/3 p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-none bg-[#ff4500]/12" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 rounded-none bg-white/10" />
                      <Skeleton className="h-3 w-40 rounded-none bg-white/8" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/10 pt-6">
                <Skeleton className="mb-4 h-3 w-32 rounded-none bg-white/8" />
                <div className="border-y border-r border-l-4 border-white/10 border-l-[#ff4500]/50 bg-zinc-900 p-5">
                  <Skeleton className="mb-3 h-4 w-full rounded-none bg-white/10" />
                  <Skeleton className="h-4 w-5/6 rounded-none bg-white/8" />
                </div>
                <Skeleton className="mt-4 h-3 w-36 rounded-none bg-white/8" />
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
      className={`relative overflow-hidden border-2 bg-[#111] p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.65)] ${
        highlight ? "border-[#ff4500]/40" : "border-white/12"
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-none border border-white/15 bg-white/8" />
        {showBadge ? (
          <Skeleton className="h-5 w-14 rounded-none bg-[#ff4500]/15" />
        ) : (
          <div className="h-5 w-14" />
        )}
      </div>
      <Skeleton className="mb-3 h-3 w-24 rounded-none bg-white/8" />
      <div className="flex items-end gap-2">
        <Skeleton
          className={`h-9 w-24 rounded-none ${highlight ? "bg-[#ff4500]/15" : "bg-white/10"}`}
        />
        <Skeleton className="h-4 w-12 rounded-none bg-white/8" />
      </div>
      {showProgress ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-2 w-full rounded-none bg-white/8" />
          <Skeleton className="h-3 w-40 rounded-none bg-white/8" />
        </div>
      ) : (
        <Skeleton className="mt-3 h-3 w-28 rounded-none bg-white/8" />
      )}
    </div>
  );
}
