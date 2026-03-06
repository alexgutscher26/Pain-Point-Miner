"use client";

import { useState } from "react";
import { ArrowRight, Globe, Search, TrendingUp, Activity, Bell, Zap, Send, Magnet, RotateCw } from "lucide-react";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="w-full py-32 px-6 flex flex-col items-center bg-[#111] border-y-2 border-white/[0.03]">
      <div className="text-center max-w-2xl mb-12">
        <h2 className="text-[11px] font-extrabold tracking-widest text-[#ff4500] uppercase mb-4">
          PRICING
        </h2>
        <h3 className="text-[40px] md:text-[56px] font-extrabold tracking-[-0.02em] text-[#f4f4f5] mb-6 leading-[1.1]">
          Start validating <br className="hidden md:block"/>
          <span className="text-[#ff4500]">SaaS ideas</span> on Reddit
        </h3>
        <p className="text-[17px] text-zinc-400 font-medium mb-10">
          Analyze the exact conversations where people are asking for solutions like yours.
        </p>
        
        <div className="inline-flex items-center p-1.5 bg-[#1a1a1a] rounded-full shadow-inner mb-6 border border-white/5">
          <button 
            onClick={() => setIsYearly(false)}
            className={`px-8 py-2.5 rounded-full text-[14px] font-extrabold shadow-sm transition-all ${!isYearly ? 'bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20' : 'text-zinc-400 hover:text-white border border-transparent'}`}
          >
             Monthly
          </button>
          <button 
            onClick={() => setIsYearly(true)}
            className={`px-8 py-2.5 rounded-full text-[14px] font-extrabold shadow-sm transition-all flex items-center gap-2 ${isYearly ? 'bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20' : 'text-zinc-400 hover:text-white border border-transparent'}`}
          >
             Yearly <span className="text-[#ff4500] text-[10px] tracking-wider uppercase font-black">Save 2 months</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1100px] w-full mb-12">
        {/* Starter Plan */}
        <div className="bg-[#141414] border-2 border-[#ff4500]/20 rounded-2xl flex flex-col hover:border-[#ff4500]/40 transition-colors shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff4500]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="p-8 pb-0 relative z-10">
            <h3 className="text-[19px] font-extrabold text-white mb-4">Starter</h3>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] font-extrabold text-white leading-none tracking-tight">${isYearly ? "15" : "19"}</span>
              <span className="text-zinc-400 text-[14px] font-semibold">/month</span>
            </div>
              Perfect for validating your first SaaS idea
          </div>
          
          <div className="flex-1 px-8 relative z-10 w-full">
            {/* Inbound Section */}
            <div className="flex items-center gap-3 w-full mb-6">
               <Magnet className="w-3.5 h-3.5 text-zinc-500" />
               <h4 className="text-[11px] font-extrabold tracking-widest text-zinc-500 uppercase">INBOUND</h4>
               <div className="flex-1 border-t border-zinc-800"></div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-4">
                 <Globe className="w-[18px] h-[18px] text-[#ff4500] shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   1 niche tracked
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Search className="w-[18px] h-[18px] text-[#ff4500] shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   10 problem keywords
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <TrendingUp className="w-[18px] h-[18px] text-[#ff4500] shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   Daily validation reports
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Activity className="w-[18px] h-[18px] text-[#ff4500] shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   Live problem monitoring
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Bell className="w-[18px] h-[18px] text-[#ff4500] shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold pb-1 flex-1 leading-snug">
                   Mention alerts (Email & Slack)
                 </span>
              </li>
            </ul>

            {/* Engage Section */}
            <div className="flex items-center gap-3 w-full mb-6 mt-10">
               <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
               <h4 className="text-[11px] font-extrabold tracking-widest text-zinc-500 uppercase">ANALYSIS</h4>
               <div className="flex-1 border-t border-zinc-800"></div>
            </div>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4">
                 <Zap className="w-[18px] h-[18px] text-[#ff4500] shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold flex-1 leading-snug">
                   Unlimited AI extractions
                 </span>
              </li>
              <li className="flex items-start gap-4 opacity-50">
                 <Send className="w-[18px] h-[18px] text-zinc-500 shrink-0 mt-0.5" />
                 <div className="text-[13px] text-zinc-400 font-extrabold flex-1 leading-snug flex items-center gap-2">
                   50 daily insights reports <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">soon</span>
                 </div>
              </li>
            </ul>
          </div>
          
          <div className="p-8 pt-0 relative z-10 w-full mt-auto">
             <button className="w-full h-12 rounded-lg bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-400 text-white font-extrabold text-[15px] transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2">
               Start 3-day free trial <ArrowRight className="w-4 h-4" />
             </button>
             <p className="text-center text-[12px] font-bold text-zinc-500 mt-4 tracking-wide">
               Cancel anytime
             </p>
          </div>
        </div>

        {/* Growth Plan */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl flex flex-col hover:border-white/10 transition-colors shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="p-8 pb-0 relative z-10">
            <h3 className="text-[19px] font-extrabold text-white mb-4">Growth</h3>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] font-extrabold text-white leading-none tracking-tight">${isYearly ? "29" : "39"}</span>
              <span className="text-zinc-400 text-[14px] font-semibold">/month</span>
            </div>
              For startups researching multiple niches or features
          </div>
          
          <div className="flex-1 px-8 relative z-10 w-full">
            {/* Inbound Section */}
            <div className="flex items-center gap-3 w-full mb-6">
               <Magnet className="w-3.5 h-3.5 text-zinc-500" />
               <h4 className="text-[11px] font-extrabold tracking-widest text-zinc-500 uppercase">INBOUND</h4>
               <div className="flex-1 border-t border-zinc-800"></div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-4">
                 <Globe className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   3 niches tracked
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Search className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   30 problem keywords
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <TrendingUp className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   Daily validation reports
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Activity className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   Live problem monitoring
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Bell className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold pb-1 flex-1 leading-snug">
                   Mention alerts (Email, Slack, Webhooks)
                 </span>
              </li>
            </ul>

            {/* Engage Section */}
            <div className="flex items-center gap-3 w-full mb-6 mt-10">
               <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
               <h4 className="text-[11px] font-extrabold tracking-widest text-zinc-500 uppercase">ENGAGE</h4>
               <div className="flex-1 border-t border-zinc-800"></div>
            </div>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4">
                 <Zap className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold flex-1 leading-snug">
                   Unlimited AI replies
                 </span>
              </li>
              <li className="flex items-start gap-4 opacity-50">
                 <Send className="w-[18px] h-[18px] text-zinc-500 shrink-0 mt-0.5" />
                 <div className="text-[13px] text-zinc-400 font-extrabold flex-1 leading-snug flex items-center gap-2">
                   100 daily insights reports <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">soon</span>
                 </div>
              </li>
            </ul>
          </div>
          
          <div className="p-8 pt-0 relative z-10 w-full mt-auto">
             <button className="w-full h-12 rounded-lg bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-400 text-white font-extrabold text-[15px] transition-all flex items-center justify-center gap-2">
               Start 3-day free trial <ArrowRight className="w-4 h-4" />
             </button>
             <p className="text-center text-[12px] font-bold text-zinc-500 mt-4 tracking-wide">
               Cancel anytime
             </p>
          </div>
        </div>

        {/* Professional Plan */}
        <div className="bg-[#141414] border border-white/5 rounded-2xl flex flex-col hover:border-white/10 transition-colors shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="p-8 pb-0 relative z-10">
            <h3 className="text-[19px] font-extrabold text-white mb-4">Professional</h3>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] font-extrabold text-white leading-none tracking-tight">${isYearly ? "69" : "89"}</span>
              <span className="text-zinc-400 text-[14px] font-semibold">/month</span>
            </div>
              For product teams managing extensive market research
          </div>
          
          <div className="flex-1 px-8 relative z-10 w-full">
            {/* Inbound Section */}
            <div className="flex items-center gap-3 w-full mb-6">
               <Magnet className="w-3.5 h-3.5 text-zinc-500" />
               <h4 className="text-[11px] font-extrabold tracking-widest text-zinc-500 uppercase">INBOUND</h4>
               <div className="flex-1 border-t border-zinc-800"></div>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-4">
                 <Globe className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   Unlimited niches tracked
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Search className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   80 problem keywords
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <TrendingUp className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   Daily validation reports
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Activity className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold border-b border-dotted border-zinc-700 pb-1 flex-1 leading-snug">
                   Live problem monitoring
                 </span>
              </li>
              <li className="flex items-start gap-4">
                 <Bell className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold pb-1 flex-1 leading-snug">
                   Mention alerts (Email, Slack, Webhooks)
                 </span>
              </li>
            </ul>

            {/* Engage Section */}
            <div className="flex items-center gap-3 w-full mb-6 mt-10">
               <RotateCw className="w-3.5 h-3.5 text-zinc-500" />
               <h4 className="text-[11px] font-extrabold tracking-widest text-zinc-500 uppercase">ENGAGE</h4>
               <div className="flex-1 border-t border-zinc-800"></div>
            </div>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4">
                 <Zap className="w-[18px] h-[18px] text-red-500/80 shrink-0 mt-0.5" />
                 <span className="text-[13px] text-zinc-200 font-extrabold flex-1 leading-snug">
                   Unlimited AI replies
                 </span>
              </li>
              <li className="flex items-start gap-4 opacity-50">
                 <Send className="w-[18px] h-[18px] text-zinc-500 shrink-0 mt-0.5" />
                 <div className="text-[13px] text-zinc-400 font-extrabold flex-1 leading-snug flex items-center gap-2">
                   300 daily insights reports <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">soon</span>
                 </div>
              </li>
            </ul>
          </div>
          
          <div className="p-8 pt-0 relative z-10 w-full mt-auto">
             <button className="w-full h-12 rounded-lg bg-red-500 hover:bg-red-600 border border-red-500 hover:border-red-400 text-white font-extrabold text-[15px] transition-all flex items-center justify-center gap-2">
               Start 3-day free trial <ArrowRight className="w-4 h-4" />
             </button>
             <p className="text-center text-[12px] font-bold text-zinc-500 mt-4 tracking-wide">
               Cancel anytime
             </p>
          </div>
        </div>

      </div>

      <div className="border border-[#7a281c] bg-[#140a08] rounded-xl px-12 py-8 max-w-[700px] w-full flex flex-col items-center justify-center shadow-lg text-center mt-6 mx-4 relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          
          <h4 className="text-[18px] font-extrabold text-white tracking-tight mb-2">Start with a 3-day free trial</h4>
          <p className="text-[13px] text-zinc-400 font-medium leading-relaxed max-w-[500px]">
            We scan thousands of Reddit posts daily to find your opportunities — that&apos;s not cheap, so we keep trials short. But 3 days is enough to see the value.
          </p>
      </div>
    </section>
  );
}
