import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import { Search, Zap, Code, Key, LayoutDashboard, Database, Terminal } from "lucide-react";
import Link from "next/link";

const docSections = [
  {
    title: "Getting Started",
    icon: <Zap className="w-6 h-6 text-yellow-500" />,
    items: ["Quickstart Guide", "Setting up your first scan", "Interpreting mining reports", "Validating pain points"]
  },
  {
    title: "Mining Engine",
    icon: <Database className="w-6 h-6 text-emerald-500" />,
    items: ["How semantic clustering works", "Custom problem patterns", "Subreddit filtering rules", "Depth vs Speed"]
  },
  {
    title: "Intelligence & Scoring",
    icon: <Search className="w-6 h-6 text-[#ff4500]" />,
    items: ["Opportunity scoring explained", "Validation signals deep dive", "Desperation index tracking", "Willingness to pay analysis"]
  },
  {
    title: "Developer Tools",
    icon: <Terminal className="w-6 h-6 text-indigo-500" />,
    items: ["API Documentation", "Integrations overview", "Custom webhooks", "Exporting raw JSON"]
  },
  {
    title: "Account & Billing",
    icon: <Key className="w-6 h-6 text-amber-500" />,
    items: ["Subscription plans", "Usage limits per month", "Managing team workspaces", "Trial entitlements"]
  },
  {
    title: "Dashboard Guide",
    icon: <LayoutDashboard className="w-6 h-6 text-sky-500" />,
    items: ["Project organization", "Mission control overview", "Saving and sharing reports", "Subreddit heatmap visualization"]
  }
];

export const metadata: Metadata = {
  title: `Documentation - ${siteConfig.name}`,
  description: "Learn how to use ThreddIQ to find, validate, and build successful SaaS ideas using Reddit data.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#ff4500]/30 overflow-x-hidden">
      <Header />
      
      <main className="pt-32 pb-24 px-6 flex flex-col items-center">
        <div className="max-w-6xl w-full">
           <header className="mb-20 text-center">
             <h1 className="text-[48px] md:text-[64px] font-extrabold text-white mb-6 tracking-tight">ThreddIQ <span className="text-[#ff4500]">Docs</span></h1>
             <p className="text-xl text-zinc-400 font-medium">Everything you need to master Reddit-driven product discovery.</p>
             <div className="mt-12 max-w-2xl mx-auto relative group">
                <div className="absolute inset-0 bg-[#ff4500]/10 blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute left-4 top-1/2 -translate-y-1/2"><Search className="w-5 h-5 text-zinc-500" /></div>
                <input type="text" placeholder="Search documentation..." className="w-full bg-[#0f0f0f] border border-white/10 rounded-2xl px-12 py-5 text-white text-lg font-bold outline-hidden focus:border-[#ff4500]/50 transition-colors shadow-2xl relative z-10" />
             </div>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {docSections.map((section, i) => (
               <div key={i} className="bg-[#0f0f0f] border border-white/5 rounded-[32px] p-8 transition-all hover:bg-white/2 hover:border-white/10 group shadow-2xl flex flex-col items-start relative overflow-hidden backdrop-blur-sm">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                       {section.icon}
                    </div>
                    <h3 className="text-xl font-extrabold text-[#f4f4f5] tracking-tight">{section.title}</h3>
                 </div>
                 
                 <ul className="space-y-4 w-full flex-1">
                   {section.items.map((item, j) => (
                     <li key={j} className="group/item">
                       <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group/link">
                         <span className="text-sm font-bold text-zinc-400 group-hover/link:text-white transition-colors">{item}</span>
                         <Zap className="w-3.5 h-3.5 text-zinc-600 group-hover/link:text-[#ff4500] transition-colors opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 duration-300" />
                       </Link>
                     </li>
                   ))}
                 </ul>
                 
                 <button className="w-full mt-8 py-3 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/10 transition-all">View All</button>
               </div>
             ))}
           </div>

           <div className="mt-20 flex flex-col sm:flex-row items-center justify-between p-12 bg-linear-to-r from-[#1c0c0a] to-[#0f0504] border border-[#ff4500]/10 rounded-[32px] gap-8 shadow-2xl">
              <div className="flex flex-col items-start gap-2">
                 <h4 className="text-2xl font-black text-white">Need more help?</h4>
                 <p className="text-zinc-500 font-medium tracking-tight">Our support team is ready to help you with any questions.</p>
              </div>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2">Contact Support <Code className="w-4 h-4" /></button>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
