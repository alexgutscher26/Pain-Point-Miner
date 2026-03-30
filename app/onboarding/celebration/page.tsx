"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { 
  Trophy, 
  ArrowRight, 
  Sparkles,
  Zap,
  Globe
} from "lucide-react";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function OnboardingCelebration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const count = searchParams.get("count") || "12";
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="relative space-y-12 text-center">
      {/* Celebration animation space holder */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {showConfetti && <ConfettiOverlay />}
      </div>

      <div className="relative z-10 space-y-6">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#ff4500] bg-[#ff4500]/10 text-[#ff4500] shadow-[0_0_50px_rgba(255,69,0,0.3)] animate-bounce">
          <Trophy className="h-12 w-12" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
            Success! You found <span className="text-[#ff4500]">{count}</span> pain points!
          </h2>
          <p className="mx-auto max-w-lg text-lg text-zinc-400">
            Your first reconnaissance mission is complete. These insights are now waiting for you in your dashboard.
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <BenefitCard 
          icon={Zap} 
          title="Monetization" 
          description="We've scored each point based on how likely users are to pay for a solution."
        />
        <BenefitCard 
          icon={Sparkles} 
          title="AI Insights" 
          description="Our agent has interpreted the raw complaints into actionable SaaS ideas."
        />
        <BenefitCard 
          icon={Globe} 
          title="Market Fit" 
          description="You've successfully validated your niche with real human problems."
        />
      </div>

      <div className="relative z-10 pt-6">
        <button
          onClick={goToDashboard}
          className="group relative inline-flex items-center justify-center gap-3 border-[#ff8a57] bg-[#ff4500] px-12 py-4 text-white shadow-[0_0_30px_rgba(255,69,0,0.4)] transition-all hover:bg-[#e63e00] hover:scale-105 active:scale-95"
        >
          <span className="font-mono text-sm font-black tracking-[0.2em] uppercase">
            Enter Dashboard
          </span>
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="border border-white/10 bg-[#161616] p-6 text-center transition-all hover:border-[#ff4500]/30 hover:bg-[#1a1a1a]">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4500]/10 text-[#ff4500]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-2 font-bold text-white">{title}</h3>
      <p className="text-[13px] leading-relaxed text-zinc-500">{description}</p>
    </div>
  );
}

function ConfettiOverlay() {
    return (
        <div className="fixed inset-0 pointer-events-none z-50">
           {/* Simple CSS-based confetti simulation */}
           {[...Array(50)].map((_, i) => (
               <div 
                key={i}
                className="absolute top-[-20px] animate-fall"
                style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ["#ff4500", "#ffffff", "#ff8a57", "#ffd700"][Math.floor(Math.random() * 4)],
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                }}
               />
           ))}
        </div>
    )
}
