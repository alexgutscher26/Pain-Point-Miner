"use client";

import { useState } from "react";
import { ArrowRight, Check, Magnet, RotateCw } from "lucide-react";

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const calculatePrice = (monthly: number) => {
    return isYearly ? Math.floor(monthly * 0.8) : monthly;
  };

  return (
    <section className="w-full py-32 px-6 flex flex-col items-center bg-[#111] border-y-2 border-white/[0.03]" id="pricing">
      <div className="text-center max-w-2xl mb-12">
        <h2 className="text-[11px] font-extrabold tracking-widest text-[#ff4500] uppercase mb-4">
          PRICING
        </h2>
        <h3 className="text-[40px] md:text-[56px] font-extrabold tracking-[-0.02em] text-[#f4f4f5] mb-6 leading-[1.1]">
          Pricing Plans
        </h3>
        <p className="text-[17px] text-zinc-400 font-medium mb-10">
          Scale your market research as you grow from idea to product.
        </p>
        
        <div className="inline-flex items-center p-1.5 bg-[#1a1a1a] rounded-full shadow-inner mb-6 border border-white/5">
          <button 
            type="button"
            onClick={() => setIsYearly(false)}
            className={`px-8 py-2.5 rounded-full text-[14px] font-extrabold shadow-sm transition-all ${!isYearly ? 'bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20' : 'text-zinc-400 hover:text-white border border-transparent'}`}
          >
             Monthly
          </button>
          <button 
            type="button"
            onClick={() => setIsYearly(true)}
            className={`px-8 py-2.5 rounded-full text-[14px] font-extrabold shadow-sm transition-all flex items-center gap-2 ${isYearly ? 'bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20' : 'text-zinc-400 hover:text-white border border-transparent'}`}
          >
             Yearly <span className="text-[#ff4500] text-[10px] tracking-wider uppercase font-black">Save 2 months</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1100px] w-full mb-12 items-stretch">
        {/* Starter Plan */}
        <div className="bg-[#141414] border-2 border-white/5 rounded-2xl flex flex-col hover:border-[#ff4500]/20 transition-all shadow-2xl relative overflow-hidden group">
          <div className="p-8 pb-6 relative z-10">
            <h3 className="text-[19px] font-extrabold text-white mb-2">Starter</h3>
            <p className="text-zinc-500 text-[13px] font-medium mb-6">Perfect for founders exploring early ideas.</p>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] font-extrabold text-white leading-none tracking-tight">${calculatePrice(15)}</span>
              <span className="text-zinc-400 text-[14px] font-semibold">/month</span>
            </div>
          </div>
          
          <div className="flex-1 px-8 relative z-10 w-full mb-8">
            <SectionHeader icon={<Magnet className="w-3.5 h-3.5" />} label="INBOUND" />
            <ul className="space-y-4 mb-8">
              <FeatureItem label="10 Reddit scans per month" />
              <FeatureItem label="Up to 3 subreddits per search" />
              <FeatureItem label="Access to top Reddit posts" />
            </ul>

            <SectionHeader icon={<RotateCw className="w-3.5 h-3.5" />} label="ENGAGE" />
            <ul className="space-y-4">
              <FeatureItem label="Basic pain-point extraction" />
              <FeatureItem label="Mention count insights" />
              <FeatureItem label="Export basic report" />
              <FeatureItem label="Email support" />
            </ul>
          </div>

          <div className="p-8 pt-6 relative z-10 w-full mt-auto border-t border-white/5 bg-white/[0.01]">
             <button className="w-full h-11 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-[14px] transition-all flex items-center justify-center gap-2 mb-4">
               Get Started
             </button>
             <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Best for:</p>
             <p className="text-[13px] text-zinc-400 font-medium leading-tight">Early-stage founders validating first ideas.</p>
          </div>
        </div>

        {/* Growth Plan - Featured */}
        <div className="bg-[#141414] border-2 border-[#ff4500]/40 rounded-2xl flex flex-col shadow-[0_0_40px_rgba(255,69,0,0.1)] relative overflow-hidden group scale-105 z-20">
          <div className="absolute top-0 right-0 bg-linear-to-r from-[#ff4500] to-[#ff571a] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-lg flex items-center gap-1.5 shadow-lg border-b border-l border-white/20">
            <span className="text-[12px]">⭐</span> Most Popular
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff4500]/5 to-transparent"></div>
          
          <div className="p-8 pb-6 relative z-10">
            <h3 className="text-[19px] font-extrabold text-white mb-2">Growth</h3>
            <p className="text-zinc-500 text-[13px] font-medium mb-6">For builders actively researching markets.</p>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] font-extrabold text-white leading-none tracking-tight">${calculatePrice(29)}</span>
              <span className="text-zinc-400 text-[14px] font-semibold">/month</span>
            </div>
          </div>
          
          <div className="flex-1 px-8 relative z-10 w-full mb-8">
            <SectionHeader icon={<Magnet className="w-3.5 h-3.5" />} label="INBOUND" spotlight />
            <ul className="space-y-4 mb-8">
              <FeatureItem label="50 Reddit scans per month" />
              <FeatureItem label="Up to 10 subreddits per search" />
              <FeatureItem label="Everything in Starter" />
            </ul>

            <SectionHeader icon={<RotateCw className="w-3.5 h-3.5" />} label="ENGAGE" spotlight />
            <ul className="space-y-4">
              <FeatureItem label="Advanced pain-point clustering" />
              <FeatureItem label="Opportunity scoring" />
              <FeatureItem label="Sentiment analysis" />
              <FeatureItem label="Save and organize reports" />
              <FeatureItem label="Export full insights" />
              <FeatureItem label="Priority processing" />
            </ul>
          </div>

          <div className="p-8 pt-6 relative z-10 w-full mt-auto border-t border-white/5 bg-[#ff4500]/5">
             <button className="w-full h-11 rounded-lg bg-[#ff4500] hover:bg-[#ff571a] border border-[#ff4500] text-white font-extrabold text-[14px] transition-all shadow-lg shadow-[#ff4500]/20 flex items-center justify-center gap-2 mb-4">
               Get Started <ArrowRight className="w-4 h-4" />
             </button>
             <p className="text-[11px] font-bold text-[#ff4500] uppercase tracking-widest mb-1">Best for:</p>
             <p className="text-[13px] text-zinc-300 font-semibold leading-tight">Indie hackers and SaaS founders building products.</p>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-[#141414] border-2 border-white/5 rounded-2xl flex flex-col hover:border-[#ff4500]/20 transition-all shadow-2xl relative overflow-hidden group">
          <div className="p-8 pb-6 relative z-10">
            <h3 className="text-[19px] font-extrabold text-white mb-2">Pro</h3>
            <p className="text-zinc-500 text-[13px] font-medium mb-6">For teams doing serious market research.</p>
            <div className="mb-6 flex items-baseline gap-1.5">
              <span className="text-[44px] font-extrabold text-white leading-none tracking-tight">${calculatePrice(69)}</span>
              <span className="text-zinc-400 text-[14px] font-semibold">/month</span>
            </div>
          </div>
          
          <div className="flex-1 px-8 relative z-10 w-full mb-8">
            <SectionHeader icon={<Magnet className="w-3.5 h-3.5" />} label="INBOUND" />
            <ul className="space-y-4 mb-8">
              <FeatureItem label="Unlimited Reddit scans" />
              <FeatureItem label="Analyze unlimited subreddits" />
              <FeatureItem label="Everything in Growth" />
            </ul>

            <SectionHeader icon={<RotateCw className="w-3.5 h-3.5" />} label="ENGAGE" />
            <ul className="space-y-4">
              <FeatureItem label="Deep Reddit thread analysis" />
              <FeatureItem label="AI-generated SaaS opportunities" />
              <FeatureItem label="Trend detection & tracking" />
              <FeatureItem label="Team workspace (coming soon)" />
              <FeatureItem label="API access (coming soon)" />
              <FeatureItem label="Priority support" />
            </ul>
          </div>

          <div className="p-8 pt-6 relative z-10 w-full mt-auto border-t border-white/5 bg-white/[0.01]">
             <button className="w-full h-11 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold text-[14px] transition-all flex items-center justify-center gap-2 mb-4">
               Get Started
             </button>
             <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Best for:</p>
             <p className="text-[13px] text-zinc-400 font-medium leading-tight">Startup teams, agencies, and product researchers.</p>
          </div>
        </div>
      </div>

      <div className="border border-[#7a281c] bg-[#140a08] rounded-xl px-12 py-8 max-w-[700px] w-full flex flex-col items-center justify-center shadow-lg text-center mt-6 mx-4 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          <h4 className="text-[18px] font-extrabold text-white tracking-tight mb-2">Start with a 3-day free trial</h4>
          <p className="text-[13px] text-zinc-400 font-medium leading-relaxed max-w-[500px]">
            We scan thousands of Reddit posts daily to find your opportunities — that&apos;s not cheap, so we keep trials short. But 3 days is enough to see the value.
          </p>
      </div>
    </section>
  );
}

function SectionHeader({ icon, label, spotlight = false }: { icon: React.ReactNode, label: string, spotlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 w-full mb-6 mt-2">
      <div className={`${spotlight ? "text-[#ff4500]" : "text-zinc-500"}`}>{icon}</div>
      <h4 className={`text-[11px] font-extrabold tracking-[0.2em] uppercase ${spotlight ? "text-[#ff4500]" : "text-zinc-500"}`}>{label}</h4>
      <div className={`flex-1 border-t ${spotlight ? "border-[#ff4500]/20" : "border-white/5"}`}></div>
    </div>
  );
}

function FeatureItem({ label, spotlight = false }: { label: string, spotlight?: boolean }) {
  return (
    <li className="flex items-start gap-4">
      <div className={`mt-1 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${spotlight ? 'bg-[#ff4500] text-white' : 'bg-[#ff4500]/10 text-[#ff4500]'}`}>
        <Check className="w-2.5 h-2.5" strokeWidth={4} />
      </div>
      <span className={`text-[13px] font-extrabold flex-1 leading-snug ${spotlight ? 'text-white' : 'text-zinc-200'}`}>
        {label}
      </span>
    </li>
  );
}
