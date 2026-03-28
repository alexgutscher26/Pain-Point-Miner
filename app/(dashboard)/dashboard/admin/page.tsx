import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { painPoint, painPointFeedback } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import {
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  // Aggregate feedback stats
  const stats = await db
    .select({
      painPointId: painPointFeedback.painPointId,
      title: painPoint.title,
      upvotes: sql<number>`count(case when ${painPointFeedback.vote} = 1 then 1 end)::int`,
      downvotes: sql<number>`count(case when ${painPointFeedback.vote} = -1 then 1 end)::int`,
      total: sql<number>`count(*)::int`,
      accuracy: sql<number>`(count(case when ${painPointFeedback.vote} = 1 then 1 end) * 100.0 / count(*))::float`,
    })
    .from(painPointFeedback)
    .innerJoin(painPoint, eq(painPointFeedback.painPointId, painPoint.id))
    .groupBy(painPointFeedback.painPointId, painPoint.id)
    .orderBy(desc(sql`count(*)`))
    .limit(50);

  const flagged = stats.filter((s) => s.accuracy < 30 && s.total >= 3);
  const overallAccuracy =
    stats.length > 0
      ? stats.reduce((acc, s) => acc + s.accuracy, 0) / stats.length
      : 100;

  return (
    <div className="animate-in fade-in mx-auto w-full max-w-7xl space-y-8 p-8 duration-700">
      {/* Admin Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#ff4500]" />
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
              Admin <span className="text-[#ff4500]">Control</span>
            </h1>
          </div>
          <p className="font-mono text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            System Oversight & Feedback Accuracy
          </p>
        </div>

        <div className="flex gap-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 px-6 py-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            <p className="text-2xl font-black text-white">
              {overallAccuracy.toFixed(1)}%
            </p>
            <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
              Global Accuracy
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-zinc-900 px-6 py-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            <p className="text-2xl font-black text-rose-500">
              {flagged.length}
            </p>
            <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">
              Flagged Items
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Flagged Items */}
        <div className="space-y-6 lg:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <h2 className="text-lg font-black tracking-tight text-white uppercase">
              Requires Review
            </h2>
          </div>

          <div className="space-y-4">
            {flagged.length === 0 ? (
              <div className="rounded-3xl border border-white/5 bg-zinc-900/50 p-12 text-center">
                <p className="text-xs font-black tracking-widest text-zinc-600 uppercase italic">
                  No pain points currently flagged for review
                </p>
              </div>
            ) : (
              flagged.map((item) => (
                <div
                  key={item.painPointId}
                  className="group rounded-3xl border border-white/10 bg-zinc-900 p-6 transition-all hover:border-rose-500/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white transition-colors group-hover:text-rose-500">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-emerald-500" />{" "}
                          {item.upvotes}
                        </span>
                        <span className="flex items-center gap-1 text-rose-500">
                          <ThumbsDown className="h-3 w-3" /> {item.downvotes}
                        </span>
                        <span>Total: {item.total}</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-center">
                      <p className="text-lg font-black text-rose-500">
                        {item.accuracy.toFixed(0)}%
                      </p>
                      <p className="text-[8px] font-black text-rose-500/60 uppercase">
                        Accuracy
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: General Stats */}
        <div className="space-y-6">
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#ff4500]" />
            <h2 className="text-lg font-black tracking-tight text-white uppercase">
              Recent Feedback
            </h2>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl">
            <div className="space-y-4 p-6">
              {stats.slice(0, 10).map((s) => (
                <div
                  key={s.painPointId}
                  className="space-y-2 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="max-w-[150px] truncate text-xs font-bold text-zinc-300">
                      {s.title}
                    </p>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-black ${s.accuracy > 70 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                    >
                      {s.accuracy.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full ${s.accuracy > 70 ? "bg-emerald-500" : s.accuracy > 40 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
