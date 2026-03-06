"use client";

import { Bot, Shield, Bell, Target, Activity, MessageSquare } from "lucide-react";

export function Toolkit() {
  return (
    <section className="w-full py-32 px-6 flex flex-col items-center bg-[#000]">
      <div className="text-center max-w-2xl mb-24">
        <h2 className="text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase mb-6">FEATURES</h2>
        <h3 className="text-[40px] md:text-[56px] font-extrabold tracking-tight text-white mb-6 leading-tight">
          Your complete <span className="text-[#ff4500]">Reddit research</span> toolkit
        </h3>
        <p className="text-[18px] text-zinc-400 font-medium leading-relaxed">
          Everything you need to validate SaaS ideas by analyzing data from Reddit.
        </p>
      </div>

      <div className="max-w-[1200px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-32">
        {/* Left Column (Feature list) - taking up 5 columns */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-x-8 gap-y-10">
          {[
            { icon: <Target className="w-5 h-5 text-indigo-400"/>, title: "Keyword Targeting", desc: "Monitor specific niche terms" },
            { icon: <Bot className="w-5 h-5 text-amber-500"/>, title: "AI Problem Extraction", desc: "Find underlying frustrations" },
            { icon: <Shield className="w-5 h-5 text-emerald-400"/>, title: "Demand Signals", desc: "Validate by upvotes & volume" },
            { icon: <MessageSquare className="w-5 h-5 text-sky-400"/>, title: "Language Analysis", desc: "See exact user phrasing" },
            { icon: <Bell className="w-5 h-5 text-[#ff4500]"/>, title: "Niche Discovery", desc: "Uncover underserved topics" },
            { icon: <Activity className="w-5 h-5 text-fuchsia-400"/>, title: "Trend Analytics", desc: "Track complaint frequencies" },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-start gap-4">
              <div className="bg-[#0f0f0f] rounded-lg p-2.5 border border-white/[0.05] shadow-inner">{feature.icon}</div>
              <div>
                 <h4 className="text-[17px] font-extrabold text-white mb-1.5">{feature.title}</h4>
                 <p className="text-[14px] text-zinc-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column (Placeholder Image Box) - taking up 7 columns */}
        <div className="lg:col-span-7">
          <div className="w-full aspect-[16/10] bg-[#0a0a0a] border-2 border-white/[0.03] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden relative group">
             {/* Subltle glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#ff4500]/10 blur-[120px] rounded-full pointer-events-none" />
             <div className="absolute inset-x-8 bottom-0 h-[80%] bg-[#0f0f0f] rounded-t-[20px] border-t-2 border-x-2 border-white/[0.05] shadow-2xl flex flex-col group-hover:translate-y-2 transition-transform duration-700">
                <div className="h-12 w-full border-b border-white/[0.05] px-6 flex items-center gap-3">
                    <div className="flex gap-1.5">
                       <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                       <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                    </div>
                </div>
                <div className="p-6 flex-1 flex gap-6">
                   <div className="w-1/4 h-full hidden sm:flex flex-col gap-4">
                      <div className="w-full h-8 bg-white/[0.03] rounded-md"></div>
                      <div className="w-full h-8 bg-[#ff4500]/20 border border-[#ff4500]/50 rounded-md"></div>
                      <div className="w-full h-8 bg-white/[0.03] rounded-md"></div>
                   </div>
                   <div className="w-full sm:w-3/4 flex flex-col gap-4">
                      <div className="w-1/3 h-5 bg-white/[0.1] rounded-full"></div>
                      <div className="w-full h-24 bg-white/[0.03] rounded-lg"></div>
                      <div className="w-full flex-1 bg-white/[0.03] rounded-lg"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Second part of toolkit */}
      <div className="text-center max-w-2xl mb-24 mt-16">
        <h2 className="text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase mb-6">MORE APPS</h2>
        <h3 className="text-[40px] md:text-[56px] font-extrabold tracking-tight text-white mb-6 leading-tight">
          Everything you need to <span className="text-[#ff4500]">validate ideas</span>
        </h3>
        <p className="text-[18px] text-zinc-400 font-medium leading-relaxed">
          Understand real user problems, find niches, and make data-driven product decisions effortlessly.
        </p>
      </div>

      <div className="max-w-[1100px] w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: Integrations */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 relative flex flex-col h-80 group hover:border-white/[0.08] transition-colors shadow-2xl overflow-hidden">
           <div className="flex gap-2 items-center mb-8 absolute bottom-4 left-8 group-hover:scale-110 transition-transform origin-bottom-left z-10">
              <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] flex items-center justify-center shadow-lg border border-white/5 z-30">
                 <span className="font-black text-[#ff4500] text-sm tracking-wider">slack</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#0a0a0a] flex items-center justify-center shadow-lg border border-white/5 -ml-4 z-20">
                 <span className="font-black text-amber-500 text-sm tracking-wider">zap</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#ff4500] flex items-center justify-center shadow-lg border border-white/5 -ml-4 z-10">
                 <span className="font-extrabold text-white text-[10px] tracking-wider">hub</span>
              </div>
           </div>
           
           <h4 className="text-[20px] font-extrabold text-white mb-3">Structured Reports</h4>
           <p className="text-[15px] font-medium text-zinc-400 flex-1">Export insights into Notion, Docs, or Slack to share precisely what to build next.</p>
        </div>

        {/* Card 2: Alerts */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 relative flex flex-col h-80 group hover:border-[#ff4500]/30 transition-colors shadow-2xl overflow-hidden">
           <div className="absolute inset-0 bg-linear-to-t from-[#ff4500]/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
           
           <h4 className="text-[20px] font-extrabold text-[#ff4500] mb-3">Weekly digests</h4>
           <p className="text-[15px] font-medium text-zinc-400 flex-1">Wake up to a fresh list of structured pain points and validation signals straight to your inbox.</p>
           
           <div className="w-[120%] h-32 bg-[#000] border border-white/5 rounded-t-xl absolute -bottom-4 -left-4 px-6 py-4 shadow-[0_-10px_30px_rgba(255,69,0,0.1)] group-hover:-translate-y-2 transition-transform duration-500">
              <div className="flex items-center justify-between mb-4 mt-2">
                 <span className="text-[13px] font-bold text-white tracking-widest uppercase">Trend Report</span>
                 <span className="text-[11px] font-bold bg-[#ff4500] text-white px-2.5 py-1 rounded">HOT</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                 <div className="h-full bg-[#ff4500] w-[75%] rounded-full relative"></div>
              </div>
           </div>
        </div>

        {/* Card 3: Sentiment Tracker */}
        <div className="bg-[#0f0f0f] border-2 border-white/[0.03] rounded-[24px] p-8 relative flex flex-col h-80 group hover:border-white/[0.08] transition-colors shadow-2xl overflow-hidden">
           
           <div className="flex items-end gap-[3px] absolute bottom-8 left-8 right-8 h-24 group-hover:-translate-y-2 transition-transform duration-500">
               {[3, 5, 4, 7, 5, 8, 4, 9, 7].map((h, i) => (
                  <div key={i} className="flex-1 bg-red-500 rounded-t-[2px] opacity-20" style={{ height: `${h * 10}%` }}></div>
               ))}
               <div className="absolute bottom-0 right-0 w-[40px] flex gap-1 h-24 items-end">
                 <div className="flex-1 bg-[#ff4500] rounded-t-[2px]" style={{ height: '70%' }}></div>
                 <div className="flex-1 bg-[#ff4500] rounded-t-[2px]" style={{ height: '100%' }}></div>
               </div>
           </div>

           <h4 className="text-[20px] font-extrabold text-white mb-3">Pain Point Tracker</h4>
           <p className="text-[15px] font-medium text-zinc-400 flex-1">Track the volume of specific complaints over time to prioritize features by demand.</p>
        </div>
      </div>
    </section>
  );
}
