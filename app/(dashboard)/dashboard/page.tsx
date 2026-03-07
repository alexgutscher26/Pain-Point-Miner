import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { 
  TrendingUp, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Database,
  BarChart3,
  AlertCircle,
  Zap
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const userFirstName = session.user.name?.split(" ")[0] || "Founder";

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-px w-8 bg-[#ff4500]"></div>
             <p className="text-[11px] font-bold text-[#ff4500] uppercase tracking-[0.2em]">Dashboard Overview</p>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
            Welcome, {userFirstName}
          </h2>
          <p className="text-zinc-500 font-medium text-sm">
            Your market research engine is currently monitoring <span className="text-white font-bold">12 subreddits</span>.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-3 bg-[#161616] p-1.5 rounded-2xl border border-white/5">
           <button className="px-4 py-2 bg-[#ff4500] text-white text-[12px] font-bold rounded-xl shadow-lg">Realtime</button>
           <button className="px-4 py-2 text-zinc-500 text-[12px] font-bold">Past 30 Days</button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Searches Remaining"
          value="2/3"
          icon={<Search className="w-4 h-4 text-white" />}
          progress={66}
          subtext="Resets in 12 days"
        />
        <MetricCard
          title="Reports Saved"
          value="12"
          icon={<BarChart3 className="w-4 h-4 text-white" />}
          trend="+2"
          trendSub="from last week"
        />
        <MetricCard
          title="Pain Points Found"
          value="142"
          icon={<AlertCircle className="w-4 h-4 text-white" />}
          trend="24"
          trendSub="new discoveries"
        />
        <MetricCard
          title="Market Score"
          value="92"
          icon={<Zap className="w-4 h-4 text-[#ff4500]" />}
          badge="High Potential"
          isHighlight
        />
      </div>

      {/* Main Action Block */}
      <div className="relative group">
        {/* Glow & Mesh Background */}
        <div className="absolute inset-0 bg-linear-to-b from-[#ff4500]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-[32px] blur-3xl -z-10"></div>
        <div className="relative overflow-hidden rounded-[32px] bg-[#0c0c0c] border border-white/5 p-12 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Subtle Grid / Mesh overlay could go here */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/15 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff4500]/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-[#ff4500]/10 transition-colors duration-1000"></div>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#ff4500] blur-2xl opacity-20 scale-150 animate-pulse"></div>
            <div className="relative w-14 h-14 bg-[#0a0a0a] rounded-2xl flex items-center justify-center text-[#ff4500] border border-[#ff4500]/30 shadow-[0_0_20px_rgba(255,69,0,0.15)] group-hover:border-[#ff4500] transition-colors duration-500">
               <Sparkles className="w-7 h-7" />
            </div>
          </div>
          
          <h3 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">
            Scale your validation with <span className="bg-linear-to-r from-[#ff4500] to-[#ff8c00] bg-clip-text text-transparent italic">Reddit Intel</span>
          </h3>
          <p className="text-zinc-500 max-w-lg mb-10 text-[15px] font-medium leading-relaxed">
            Uncover high-intent pain points and &quot;workarounds&quot; that signal 
            profitable SaaS opportunities in minutes, not weeks.
          </p>
          
          <div className="w-full max-w-xl relative group/search">
            <div className="absolute -inset-0.5 bg-linear-to-r from-[#ff4500] to-[#ff8c00] rounded-2xl opacity-0 group-focus-within/search:opacity-10 blur-md transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-[#111] border border-white/10 rounded-2xl p-1.5 focus-within:border-[#ff4500]/30 transition-all shadow-2xl">
              <span className="pl-4 pr-2 text-zinc-500 shrink-0">
                <Search className="w-5 h-5 group-focus-within/search:text-[#ff4500] transition-colors" />
              </span>
              <input
                className="w-full bg-transparent border-none text-white px-2 py-3.5 focus:ring-0 outline-none text-base font-medium placeholder-zinc-700"
                placeholder="Search niche, e.g. 'cold email deliverability'..."
                type="text"
              />
              <button className="shrink-0 whitespace-nowrap bg-[#ff4500] hover:bg-[#ff571a] active:scale-[0.98] text-white px-7 py-3.5 rounded-xl font-black text-[13px] uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-lg shadow-[#ff4500]/20">
                Begin Analysis <ArrowRight className="w-4 h-4 group-hover/search:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Quick tags */}
            <div className="flex items-center justify-center gap-4 mt-6">
               <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Trending:</p>
               {['#saas', '#marketing', '#devops'].map((tag) => (
                 <button key={tag} className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
                   {tag}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Reports Table */}
        <div className="lg:col-span-2 bg-[#111] rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-[#ff4500]"></div>
               <h4 className="font-black text-white text-lg tracking-tight">Recent Investigations</h4>
            </div>
            <a className="text-[12px] font-bold text-zinc-500 hover:text-[#ff4500] transition-colors uppercase tracking-widest" href="#">
              View All
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/2 text-zinc-500">
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em]">Investigation</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em]">Key Insight</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-center">Score</th>
                  <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <ReportRow
                  keyword="Cold Email"
                  date="2 hours ago"
                  painPoint="Deliverability with new domains"
                  score={88}
                  status="Live"
                />
                <ReportRow
                  keyword="SaaS Billing"
                  date="Yesteerday"
                  painPoint="Pricing complexity for SMBs"
                  score={92}
                  status="Ready"
                />
                <ReportRow
                  keyword="SEO Audit"
                  date="2 days ago"
                  painPoint="AI content detection noise"
                  score={74}
                  status="Ready"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* Insight Panel */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#111] rounded-[32px] border border-white/5 shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4500]/5 blur-3xl rounded-full"></div>
            <h4 className="font-black text-white text-lg mb-8 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-[#ff4500]" />
              Market Pulse
            </h4>
            <div className="space-y-8">
              <div>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Trending Niche</p>
                <div className="flex items-center gap-4 bg-white/3 p-4 rounded-2xl border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-[#ff4500]/10 flex items-center justify-center text-[#ff4500]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-white">AI-driven SEO</p>
                    <p className="text-[12px] text-zinc-500">+124% mention volume</p>
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Urgent Pain Point</p>
                <div className="bg-zinc-900 p-5 rounded-2xl border-l-4 border-[#ff4500]">
                  <p className="text-[14px] text-zinc-200 font-medium italic leading-relaxed">
                    &quot;Pricing is too complex for small teams - we just want a flat rate.&quot;
                  </p>
                </div>
                <p className="text-[11px] text-zinc-500 mt-4 font-bold flex items-center gap-2">
                   <Database className="w-3.5 h-3.5" /> Found in 4 independent subreddits
                </p>
              </div>
            </div>
          </div>
          <div className="bg-linear-to-br from-[#ff4500] to-[#b33100] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Zap className="w-8 h-8 text-white/50 mb-6" />
            <h4 className="font-black text-xl mb-3 tracking-tight">Pro Insight</h4>
            <p className="text-[15px] text-white/80 leading-relaxed mb-6 font-medium">
              &quot;Workarounds&quot; often reveal high-value pain points that users are currently paying to solve inefficiently.
            </p>
            <button className="text-[12px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
              Try workaround filter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  progress,
  subtext,
  trend,
  trendSub,
  badge,
  isHighlight
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  progress?: number;
  subtext?: string;
  trend?: string;
  trendSub?: string;
  badge?: string;
  isHighlight?: boolean;
}) {
  return (
    <div className={`bg-[#111] p-5 rounded-2xl border ${isHighlight ? "border-[#ff4500]/50" : "border-white/5"} shadow-2xl relative overflow-hidden group`}>
      {isHighlight && (
         <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff4500]/10 blur-3xl rounded-full -mr-12 -mt-12"></div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        {badge && (
          <span className="text-[9px] font-black px-2 py-0.5 bg-[#ff4500]/10 text-[#ff4500] rounded-full uppercase tracking-widest border border-[#ff4500]/20">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-black ${isHighlight ? "text-[#ff4500]" : "text-white"} tracking-tight`}>
            {value}
          </p>
          {trend && (
            <p className="text-emerald-500 text-[12px] font-black flex items-center gap-0.5">
               <TrendingUp className="w-3 h-3" /> {trend}
            </p>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-[#ff4500] rounded-full shadow-[0_0_8px_rgba(255,69,0,0.5)]" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-[9px] text-zinc-600 mt-2 font-bold uppercase tracking-widest">{subtext}</p>
          </div>
        )}
        {trendSub && (
          <p className="text-[9px] text-zinc-600 mt-0.5 font-bold uppercase tracking-widest">{trendSub}</p>
        )}
      </div>
    </div>
  );
}

function ReportRow({
  keyword,
  date,
  painPoint,
  score,
  status,
}: {
  keyword: string;
  date: string;
  painPoint: string;
  score: number;
  status: string;
}) {
  return (
    <tr className="hover:bg-white/2 transition-colors cursor-pointer group">
      <td className="px-8 py-6">
        <p className="text-[15px] font-bold text-white mb-1 group-hover:text-[#ff4500] transition-colors">{keyword}</p>
        <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-wider">{date}</p>
      </td>
      <td className="px-8 py-6">
        <p className="text-[14px] text-zinc-400 font-medium truncate max-w-[250px]">
          {painPoint}
        </p>
      </td>
      <td className="px-8 py-6 text-center">
        <span className="text-lg font-black text-white px-3 py-1 bg-white/5 rounded-lg border border-white/5">
          {score}
        </span>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${status === 'Live' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
          <span className="text-[11px] font-black text-white uppercase tracking-widest">
            {status}
          </span>
        </div>
      </td>
    </tr>
  );
}
