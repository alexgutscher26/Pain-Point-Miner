import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { SidebarLinks } from "@/components/dashboard/sidebar-links";
import { resolveCurrentPlan } from "@/lib/plan-resolver";
import { 
  HelpCircle,
  Plus,
  Bell,
  Crown
} from "lucide-react";

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

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-[#ff4500]/30 antialiased">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/10 bg-[#0d0d0d] flex flex-col h-full">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#ff4500] rounded-xl p-2 text-white shadow-[0_0_20px_rgba(255,69,0,0.3)]">
              <span className="material-symbols-outlined block text-2xl font-bold">query_stats</span>
            </div>
            <div>
              <h1 className="text-[17px] font-black leading-tight tracking-tight">Pain Miner</h1>
              <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500 font-bold">Market Analysis</p>
            </div>
          </div>
          <SidebarLinks />
        </div>
        
        <div className="mt-auto p-5">
          <div className="bg-[#161616] rounded-2xl p-4 border border-white/5 mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-[#ff4500]/10 blur-2xl rounded-full -mr-10 -mt-10"></div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Crown className="w-4 h-4 text-[#ff4500]" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#ff4500]">{planLabel}</p>
            </div>
            <p className="text-[12px] text-zinc-400 mb-4 leading-relaxed relative z-10">{upgradeMessage}</p>
            <button className="w-full bg-[#ff4500] hover:bg-[#e63e00] text-white text-[11px] font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-[#ff4500]/20 uppercase tracking-widest relative z-10">
              Upgrade Now
            </button>
          </div>
          <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
            <button className="flex items-center gap-3 px-3 py-2 text-zinc-500 hover:text-white transition-colors w-full text-left font-medium text-sm">
              <HelpCircle className="w-[18px] h-[18px]" />
              Help & Support
            </button>
            <SignOutButton />
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff4500]/5 blur-[120px] rounded-full -mr-[250px] -mt-[250px] pointer-events-none"></div>

        {/* Topbar */}
        <header className="h-16 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/5 text-[11px] text-zinc-400 font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
              System Active
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard/search" className="bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded-full text-[13px] font-bold flex items-center gap-2 transition-all shadow-lg">
              <Plus className="w-4 h-4" />
              New Scan
            </Link>
            <button className="p-2.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all relative border border-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff4500] rounded-full border-2 border-[#0a0a0a]"></span>
            </button>
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-white leading-none mb-1">{session.user.name}</p>
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Founder</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-[#ff4500] flex items-center justify-center text-white border border-white/10 shadow-lg shadow-[#ff4500]/20 overflow-hidden group-hover:scale-105 transition-transform">
                <span className="text-sm font-black">{session.user.name?.charAt(0) || "U"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 relative">
           {children}
        </div>
      </main>
    </div>
  );
}
