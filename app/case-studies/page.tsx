import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import { CheckCircle2, TrendingUp, Users, Target } from "lucide-react";

const caseStudies = [
  {
    company: "SaaS Rocket",
    domain: "Project Management",
    title: "How SaaS Rocket reduced customer churn by 40% with Reddit mining",
    results: "40% reduction in churn",
    impact: "Used ThreddIQ to identify a specific missing feature that was frustrating users. We implemented it in a week.",
    date: "Jan 2026",
    slug: "saas-rocket-churn-reduction"
  },
  {
    company: "DevDash",
    domain: "Developer Tools",
    title: "DevDash validated a $50k/month niche in just 48 hours",
    results: "$50k/month niche identified",
    impact: "Mined r/rust to find a common developer networking problem. Validated with 50+ prospective users found via ThreddIQ.",
    date: "Dec 2025",
    slug: "devdash-validation-niche"
  },
  {
    company: "ContentKing",
    domain: "AI Marketing",
    title: "ContentKing's story of pivoting from a failed product to a market leader",
    results: "Saved 6 months of development",
    impact: "Stopped a failing product pivot by discovering that the intended market didn't have the problem we thought they had. ThreddIQ saved us 6 months of development time.",
    date: "Feb 2026",
    slug: "content-king-pivot"
  }
];

export const metadata: Metadata = {
  title: `Case Studies - ${siteConfig.name}`,
  description: "Real stories of SaaS founders using Reddit mining to build high-growth products.",
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#ff4500]/30 overflow-x-hidden">
      <Header />
      
      <main className="pt-32 pb-24 px-6 flex flex-col items-center">
        <div className="max-w-5xl w-full">
          <header className="mb-20 text-center">
             <h1 className="text-[48px] md:text-[64px] font-extrabold text-white mb-6 leading-tight">Proof that validation <span className="text-[#ff4500]">works</span></h1>
             <p className="text-xl text-zinc-400 font-medium">Stories from the frontlines of product discovery and market mining.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((cs, i) => (
              <div key={i} className="bg-[#0f0f0f] border border-white/5 rounded-[32px] p-10 transition-all hover:bg-white/2 hover:border-white/10 group shadow-2xl flex flex-col items-start text-left relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4500]/10 blur-[80px] pointer-events-none opacity-50 transition-opacity" />
                
                <div className="flex items-center gap-2 mb-8">
                  <div className="p-2 bg-white/5 border border-white/10 rounded-lg group-hover:scale-110 transition-transform duration-500">
                    <CheckCircle2 className="w-5 h-5 text-green-500" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-black text-white uppercase tracking-widest">{cs.company}</span>
                </div>
                
                <h3 className="text-2xl font-extrabold text-[#f4f4f5] mb-6 leading-snug group-hover:text-[#ff4500] transition-colors">{cs.title}</h3>
                
                <p className="text-lg text-zinc-400 font-medium leading-relaxed mb-10 flex-1">{cs.impact}</p>
                
                <div className="w-full pt-8 border-t border-white/5 mt-auto">
                   <div className="flex items-center gap-2 mb-2">
                     <TrendingUp className="w-4 h-4 text-[#ff4500]" />
                     <span className="text-white font-black text-sm uppercase tracking-widest">Key Result</span>
                   </div>
                   <div className="text-xl font-black text-white">{cs.results}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-32 p-16 bg-[#0c0c0c] border-2 border-white/5 rounded-[48px] shadow-2xl relative overflow-hidden flex flex-col items-center">
             <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
             <div className="w-16 h-16 bg-[#ff4500]/10 border border-[#ff4500]/30 rounded-2xl flex items-center justify-center mb-10">
                <Users className="w-8 h-8 text-[#ff4500]" />
             </div>
             <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 text-center">Be our next success <span className="text-[#ff4500]">story</span></h2>
             <p className="text-xl text-zinc-500 font-medium mb-12 max-w-2xl text-center leading-relaxed">Join 100+ startups getting organic leads and making data-driven product decisions every day.</p>
             <button className="bg-linear-to-b from-[#ff5100] to-[#e63e00] hover:from-[#ff621a] hover:to-[#ff4500] text-white px-12 py-5 rounded-2xl font-black text-xl transition-all shadow-xl shadow-[#ff4500]/20 flex items-center gap-3">Start Mining Insights <Target className="w-6 h-6" /></button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
