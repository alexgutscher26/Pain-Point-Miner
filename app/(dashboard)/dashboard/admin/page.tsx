import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { painPoint, painPointFeedback } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { BarChart3, ThumbsUp, ThumbsDown, AlertTriangle, ShieldCheck } from "lucide-react";

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
  const overallAccuracy = stats.length > 0 
    ? stats.reduce((acc, s) => acc + s.accuracy, 0) / stats.length 
    : 100;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-700">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#ff4500]" />
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
              Admin <span className="text-[#ff4500]">Control</span>
            </h1>
          </div>
          <p className="text-zinc-500 font-medium font-mono text-xs uppercase tracking-[0.2em]">
            System Oversight & Feedback Accuracy
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-zinc-900 border border-white/10 px-6 py-4 rounded-2xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            <p className="text-2xl font-black text-white">{overallAccuracy.toFixed(1)}%</p>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Accuracy</p>
          </div>
          <div className="bg-zinc-900 border border-white/10 px-6 py-4 rounded-2xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
            <p className="text-2xl font-black text-rose-500">{flagged.length}</p>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Flagged Items</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Flagged Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Requires Review</h2>
          </div>
          
          <div className="space-y-4">
            {flagged.length === 0 ? (
              <div className="bg-zinc-900/50 border border-white/5 p-12 text-center rounded-3xl">
                <p className="text-zinc-600 font-black uppercase tracking-widest text-xs italic">
                  No pain points currently flagged for review
                </p>
              </div>
            ) : (
              flagged.map((item) => (
                <div key={item.painPointId} className="bg-zinc-900 border border-white/10 p-6 rounded-3xl hover:border-rose-500/40 transition-all group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white group-hover:text-rose-500 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-emerald-500" /> {item.upvotes}</span>
                        <span className="flex items-center gap-1 text-rose-500"><ThumbsDown className="w-3 h-3" /> {item.downvotes}</span>
                        <span>Total: {item.total}</span>
                      </div>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl text-center">
                      <p className="text-lg font-black text-rose-500">{item.accuracy.toFixed(0)}%</p>
                      <p className="text-[8px] font-black text-rose-500/60 uppercase">Accuracy</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: General Stats */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#ff4500]" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Recent Feedback</h2>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              {stats.slice(0, 10).map((s) => (
                <div key={s.painPointId} className="space-y-2 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center gap-4">
                    <p className="text-xs font-bold text-zinc-300 truncate max-w-[150px]">{s.title}</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${s.accuracy > 70 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                      {s.accuracy.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
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
