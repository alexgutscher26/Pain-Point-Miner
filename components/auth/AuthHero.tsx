import Link from "next/link";
import { AuthLogo } from "./AuthLogo";
import { InsightCard } from "./InsightCard";

interface AuthHeroProps {
  badge: string;
  title: React.ReactNode;
  subtitle: string;
  insightProps: React.ComponentProps<typeof InsightCard>;
}

export function AuthHero({
  badge,
  title,
  subtitle,
  insightProps,
}: AuthHeroProps) {
  return (
    <div className="relative hidden w-1/2 flex-col overflow-hidden border-r border-white/5 bg-[#0a0a0a] p-12 lg:flex">
      {/* Glow effects */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-[#ff4500]/10 blur-[120px]"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-[#ff4500]/5 blur-[100px]"></div>

      <AuthLogo className="relative z-10" />

      {/* Content */}
      <div className="relative z-10 mt-16 max-w-lg flex-1">
        <div className="mb-12">
          <p className="mb-4 text-[12px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
            {badge}
          </p>
          <h1 className="mb-6 text-[40px] leading-tight font-extrabold tracking-tight text-white">
            {title}
          </h1>
          <p className="text-[17px] leading-relaxed font-medium text-zinc-400">
            {subtitle}
          </p>
        </div>

        <InsightCard {...insightProps} />
      </div>

      <div className="relative z-10 mt-auto flex gap-8 text-sm text-zinc-600">
        <span>© 2026 ThreddIQ</span>
      </div>
    </div>
  );
}
