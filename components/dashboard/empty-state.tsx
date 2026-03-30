import { Search, FileText, LayoutDashboard, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: "dashboard" | "reports" | "analysis" | "search";
  variant?: "hero" | "card" | "inline";
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon = "dashboard",
  variant = "hero",
  className = "",
}: EmptyStateProps) {
  const IconComponent = {
    dashboard: LayoutDashboard,
    reports: FileText,
    analysis: Search,
    search: Search,
  }[icon];

  if (variant === "hero") {
    return (
      <div className={`relative overflow-hidden border-2 border-white/10 bg-[#0c0c0c] p-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.65)] ${className}`}>
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 h-full w-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 animate-pulse rounded-full bg-[#ff4500]/10 blur-[80px]"></div>
          <div className="absolute -bottom-24 -right-24 h-64 w-64 animate-pulse rounded-full bg-[#ff4500]/10 blur-[80px]" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="relative flex h-24 w-24 items-center justify-center border-2 border-[#ff4500]/50 bg-[#111] text-[#ff4500] shadow-[4px_4px_0px_0px_rgba(255,69,0,0.3)]">
              <IconComponent className="h-12 w-12 animate-pulse" />
              {/* Decorative particles */}
              <div className="absolute -top-2 -right-2 h-3 w-3 animate-ping bg-[#ff4500]/40"></div>
              <div className="absolute -bottom-1 -left-1 h-2 w-2 animate-ping bg-[#ff4500]/20" style={{ animationDelay: "0.5s" }}></div>
            </div>
          </div>

          <h3 className="mb-4 text-3xl font-black tracking-tighter text-white uppercase sm:text-4xl">
            {title}
          </h3>
          <p className="mx-auto mb-10 max-w-lg text-[16px] leading-relaxed font-medium text-zinc-500">
            {description}
          </p>

          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="group flex items-center gap-3 border-2 border-[#ff8a57] bg-[#ff4500] px-10 py-4 font-mono text-[14px] font-black tracking-widest text-white uppercase transition-all hover:bg-[#ff571a] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(255,138,87,0.4)] active:scale-95"
            >
              {actionLabel}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`flex flex-col items-center justify-center border-2 border-white/5 bg-[#0c0c0c] p-12 text-center ${className}`}>
        <div className="mb-6 flex h-16 w-16 items-center justify-center border border-white/10 bg-zinc-900 text-zinc-600">
          <IconComponent className="h-8 w-8" />
        </div>
        <h4 className="mb-2 text-xl font-black tracking-tight text-white uppercase">
          {title}
        </h4>
        <p className="mx-auto mb-8 max-w-[320px] text-sm font-medium text-zinc-500">
          {description}
        </p>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="border border-[#ff4500]/40 px-6 py-2.5 font-mono text-[12px] font-black tracking-widest text-[#ff4500] uppercase transition-colors hover:bg-[#ff4500]/10"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`border-2 border-white/5 bg-zinc-900/40 p-10 text-center ${className}`}>
      <p className="font-mono text-[13px] font-black tracking-[0.2em] text-zinc-500 uppercase">
        {title}
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-600">
        {description}
      </p>
    </div>
  );
}
