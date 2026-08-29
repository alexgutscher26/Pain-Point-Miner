"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-200/60 bg-transparent px-4 pt-16 pb-8 sm:px-6">
      <div className="mx-auto mb-20 grid max-w-[1240px] flex-col justify-between gap-12 md:flex-row md:gap-8 lg:grid-cols-12">
        
        {/* Left Col: Brand & Socials (col-span-4) */}
        <div className="flex flex-col items-start lg:col-span-4">
          <Link href="/" className="group mb-4 flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#ff4500]"
            >
              <path d="M12 2L2 22h20L12 2z" fill="currentColor" />
              <circle cx="12" cy="15" r="3" fill="#ffffff" />
            </svg>
            <span className="text-[15px] font-extrabold tracking-wide text-zinc-900">
              ThreddIQ
            </span>
          </Link>
          <p className="mb-6 text-[14px] leading-relaxed font-medium text-zinc-650 max-w-[280px]">
            Find validated SaaS opportunities on Reddit with automated monitoring.
          </p>
        </div>

        {/* Center Cols: Navigation Links (col-span-8) */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3 lg:col-span-8">
          <div className="flex flex-col gap-4">
            <p className="text-[12px] font-extrabold text-zinc-850 uppercase tracking-widest">Features</p>
            <Link
              href="/features/pain-point-mining"
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Pain Point Mining
            </Link>
            <Link
              href="/features/idea-validation"
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Idea Validation
            </Link>
            <Link
              href="/features/market-discovery"
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Market Discovery
            </Link>
            <Link
              href="/features/keyword-monitoring"
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Keyword Monitoring
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[12px] font-extrabold text-zinc-850 uppercase tracking-widest">Tools</p>
            <Link
              href="/#faq"
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              FAQ
            </Link>
            <Link
              href="/free-tools/pain-point-miner"
              className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Scanner{" "}
              <span className="rounded bg-[#ff4500]/10 px-1.5 py-0.5 text-[8px] font-black tracking-tighter text-[#ff4500] uppercase">
                Free
              </span>
            </Link>
            <Link
              href="/free-tools/opportunity-scoreboard"
              className="text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Scoreboard
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-[12px] font-extrabold text-zinc-850 uppercase tracking-widest">Resources</p>
            <Link
              href="/blog"
              className="text-[13px] leading-relaxed font-bold text-[#ff4500] transition-colors hover:text-[#e03d00]"
            >
              Blog & Articles
            </Link>
            <Link
              href="/blog/why-saas-founders-cant-stop-bleeding-users"
              className="text-[13px] leading-relaxed font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              SaaS Retention Study
            </Link>
            <Link
              href="/resources/best-subreddits-by-industry"
              className="text-[13px] leading-relaxed font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Best Subreddits
            </Link>
            <Link
              href="/resources/reddit-tools"
              className="text-[13px] leading-relaxed font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Reddit Tools
            </Link>
          </div>
        </div>

      </div>

      {/* Copyright Base */}
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-2 border-t border-zinc-200/60 pt-8 pb-4 text-center text-[12px] text-zinc-500 md:flex-row md:text-left">
        <p>© 2026 ThreddIQ. All rights reserved.</p>
        <div className="flex items-center gap-1.5">
          Built with <span className="text-[#a8a8a8]">☕</span> by{" "}
          <span className="ml-1 font-bold text-zinc-800">Alex</span>
        </div>
      </div>
    </footer>
  );
}
