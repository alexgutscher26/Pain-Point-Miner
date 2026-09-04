import React from "react";
import {
  Search,
  FileText,
  LayoutDashboard,
  ArrowRight,
  Bookmark,
  Sparkles,
  Filter,
  Plus,
} from "lucide-react";
import Link from "next/link";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  secondaryActionOnClick?: () => void;
  icon?:
    | "dashboard"
    | "reports"
    | "analysis"
    | "search"
    | "bookmarks"
    | "sparkles"
    | "filter";
  iconElement?: React.ReactNode;
  variant?: "hero" | "card" | "inline" | "glass";
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionHref,
  secondaryActionOnClick,
  icon = "dashboard",
  iconElement,
  variant = "hero",
  className = "",
}: EmptyStateProps) {
  const IconComponent = {
    dashboard: LayoutDashboard,
    reports: FileText,
    analysis: Search,
    search: Search,
    bookmarks: Bookmark,
    sparkles: Sparkles,
    filter: Filter,
  }[icon];

  const renderActionButton = (
    label?: string,
    href?: string,
    onClick?: () => void,
    isPrimary = true,
  ) => {
    if (!label) return null;

    const baseClasses = isPrimary
      ? "group flex items-center gap-2 rounded-xl border border-[#ff8a57] bg-[#ff4500] px-6 py-3 font-mono text-[12px] font-black tracking-wider text-white uppercase transition-all shadow-sm hover:shadow-md hover:bg-[#ff571a] active:scale-95"
      : "group flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/60 px-5 py-2.5 font-mono text-[12px] font-bold tracking-wider text-zinc-700 uppercase transition-all hover:bg-white hover:text-zinc-900 active:scale-95";

    if (href) {
      return (
        <Link href={href} className={baseClasses}>
          {isPrimary && (
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          )}
          <span>{label}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      );
    }

    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={baseClasses}>
          {isPrimary && (
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          )}
          <span>{label}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      );
    }

    return null;
  };

  if (variant === "hero") {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/80 p-10 text-center shadow-xs backdrop-blur-md ${className}`}
      >
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-[#ff4500]/20 bg-[#ff4500]/10 text-[#ff4500] shadow-xs">
              {iconElement ? (
                iconElement
              ) : (
                <IconComponent className="h-10 w-10 animate-pulse" />
              )}
            </div>
          </div>

          <h3 className="mb-3 text-2xl font-black tracking-tight text-zinc-900 uppercase sm:text-3xl">
            {title}
          </h3>
          <p className="mx-auto mb-8 max-w-lg text-[15px] leading-relaxed font-medium text-zinc-500">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {renderActionButton(actionLabel, actionHref, actionOnClick, true)}
            {renderActionButton(
              secondaryActionLabel,
              secondaryActionHref,
              secondaryActionOnClick,
              false,
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "glass" || variant === "card") {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-zinc-200/50 bg-white/60 p-12 text-center shadow-xs backdrop-blur-md ${className}`}
      >
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[#ff4500]">
          {iconElement ? iconElement : <IconComponent className="h-7 w-7" />}
        </div>
        <h4 className="mb-2 text-lg font-black tracking-tight text-zinc-900 uppercase">
          {title}
        </h4>
        <p className="mx-auto mb-6 max-w-[360px] text-sm font-medium text-zinc-500">
          {description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {renderActionButton(actionLabel, actionHref, actionOnClick, true)}
          {renderActionButton(
            secondaryActionLabel,
            secondaryActionHref,
            secondaryActionOnClick,
            false,
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/40 p-8 text-center ${className}`}
    >
      <div className="mb-3 text-zinc-400">
        {iconElement ? iconElement : <IconComponent className="h-6 w-6" />}
      </div>
      <p className="font-mono text-[12px] font-black tracking-widest text-zinc-700 uppercase">
        {title}
      </p>
      <p className="mt-1 max-w-md text-xs font-medium text-zinc-500">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {renderActionButton(actionLabel, actionHref, actionOnClick, true)}
          {renderActionButton(
            secondaryActionLabel,
            secondaryActionHref,
            secondaryActionOnClick,
            false,
          )}
        </div>
      )}
    </div>
  );
}
