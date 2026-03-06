import { Target } from "lucide-react";

export function Steps() {
  return (
    <section className="w-full py-32 px-6 flex flex-col items-center bg-[#000]">
      <div className="text-center max-w-2xl mb-20">
        <h2 className="text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase mb-6">HOW IT WORKS</h2>
        <h3 className="text-[40px] md:text-[56px] font-extrabold tracking-tight text-white mb-6 leading-tight">
          Validate your <span className="text-[#ff4500]">SaaS ideas</span><br/> in 3 simple steps
        </h3>
        <p className="text-[18px] text-zinc-400 font-medium">
          Enter a niche, and we'll do the deep research to extract the real problems your potential users are actively trying to solve.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Step 1 */}
        <div className="flex flex-col items-start p-8 bg-[#0f0f0f] rounded-[24px] border border-white/[0.03] shadow-xl hover:border-white/[0.08] transition-colors group">
          <div className="bg-[#ff4500] text-[13px] font-bold text-white w-7 h-7 rounded flex items-center justify-center mb-8 shadow-[0_4px_15px_rgba(255,69,0,0.5)]">1</div>
          
          <div className="w-full h-40 bg-black rounded-xl border border-white/[0.03] mb-8 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
               {/* Search text box mockup */}
               <div className="bg-[#1a1a1a] border border-white/[0.05] px-5 py-3 rounded-full flex items-center gap-2 shadow-lg w-[80%]">
                 <span className="text-[#ff4500] font-bold text-[15px]">#</span>
                 <span className="text-[15px] text-white border-r-2 border-[#ff4500] pr-1.5 animate-pulse font-medium tracking-wide">SaaS marketing</span>
               </div>
          </div>
          <h4 className="text-[22px] font-extrabold text-white mb-3 tracking-tight">1. Define your niche</h4>
          <p className="text-[15px] text-zinc-400 leading-relaxed font-medium">Enter a keyword like 'SEO tools' or 'property management' to target the exact subreddits relevant to your SaaS.</p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-start p-8 bg-[#0f0f0f] rounded-[24px] border border-white/[0.03] shadow-xl hover:border-white/[0.08] transition-colors group">
          <div className="bg-[#ff4500] text-[13px] font-bold text-white w-7 h-7 rounded flex items-center justify-center mb-8 shadow-[0_4px_15px_rgba(255,69,0,0.5)]">2</div>
          
          <div className="w-full h-40 bg-black rounded-xl border border-white/[0.03] mb-8 flex flex-col items-center justify-center gap-3 overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-500 relative">
             <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#ff4500]/5 pointer-events-none"></div>
             {/* Feed mockup */}
             <div className="bg-[#1a1a1a] border border-white/[0.05] w-[75%] rounded-lg p-3 shadow-lg translate-x-4">
                 <div className="h-1.5 bg-zinc-700 w-[60%] rounded mb-1.5"></div>
                 <div className="h-1.5 bg-zinc-800 w-full rounded"></div>
             </div>
             <div className="bg-[#1a1a1a] border border-white/[0.05] w-[75%] rounded-lg p-3 shadow-lg opacity-60 -translate-x-4">
                 <div className="h-1.5 bg-zinc-700 w-[40%] rounded mb-1.5"></div>
                 <div className="h-1.5 bg-zinc-800 w-[90%] rounded"></div>
             </div>
          </div>
          <h4 className="text-[22px] font-extrabold text-white mb-3 tracking-tight">2. We analyze discussions</h4>
          <p className="text-[15px] text-zinc-400 leading-relaxed font-medium">Our system scans recent discussions, identifies repeated frustrations, and clusters similar complaints automatically.</p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-start p-8 bg-[#0f0f0f] rounded-[24px] border border-white/[0.03] shadow-xl hover:border-white/[0.08] transition-colors group">
          <div className="bg-[#ff4500] text-[13px] font-bold text-white w-7 h-7 rounded flex items-center justify-center mb-8 shadow-[0_4px_15px_rgba(255,69,0,0.5)]">3</div>
          
          <div className="w-full h-40 bg-black rounded-xl border border-white/[0.03] mb-8 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-500 relative">
             <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#ff4500]/10 pointer-events-none"></div>
             {/* Ping mockup */}
             <div className="w-20 h-20 bg-black border-2 border-[#ff4500]/30 rounded-full flex items-center justify-center relative shadow-[0_0_30px_rgba(255,69,0,0.2)]">
                 <Target className="w-8 h-8 text-[#ff4500]"/>
                 <div className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse"></div>
             </div>
          </div>
          <h4 className="text-[22px] font-extrabold text-white mb-3 tracking-tight">3. Review Pain Points</h4>
          <p className="text-[15px] text-zinc-400 leading-relaxed font-medium">Get structured reports detailing common pain points, demand signals, and user language to validate your next feature.</p>
        </div>
      </div>
    </section>
  );
}
