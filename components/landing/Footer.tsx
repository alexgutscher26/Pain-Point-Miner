"use client";

import Link from "next/link";
import { LogoIcon } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-black/10 bg-white/40 px-4 pt-16 pb-12 backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-zinc-950/40">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-16 grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Col */}
          <div className="flex flex-col items-start md:col-span-4">
            <Link href="/" className="group mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4500] text-white">
                <LogoIcon className="h-3.5 w-3.5" />
              </div>
              <span className="text-base font-bold text-zinc-950 dark:text-white">
                ThreddIQ
              </span>
            </Link>
            <p className="mb-6 max-w-[300px] text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              AI powered Reddit market research engine. Uncover validated
              customer complaints and buyer demand before writing software.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>All extraction workers operational</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold tracking-wider text-zinc-950 uppercase dark:text-white">
                Product
              </p>
              <Link
                href="/#features"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Semantic Mining
              </Link>
              <Link
                href="/niches"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Pre Mined Niches
              </Link>
              <Link
                href="/#pricing"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Pricing Plans
              </Link>
              <Link
                href="/#faq"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                FAQ & Support
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold tracking-wider text-zinc-950 uppercase dark:text-white">
                Free Tools
              </p>
              <Link
                href="/free-tools/pain-point-miner"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Reddit Niche Scanner
              </Link>
              <Link
                href="/free-tools/opportunity-scoreboard"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Opportunity Scoreboard
              </Link>
              <Link
                href="/blog"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Research Blog
              </Link>
              <Link
                href="/resources"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Founder Guides
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold tracking-wider text-zinc-950 uppercase dark:text-white">
                Legal & Trust
              </p>
              <Link
                href="/privacy"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                href="/sitemap.xml"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-black/5 pt-8 text-xs text-zinc-500 sm:flex-row dark:border-white/5">
          <p>© {new Date().getFullYear()} ThreddIQ. All rights reserved.</p>
          <p className="flex items-center gap-1 text-zinc-400">
            Validated intelligence for high growth SaaS builders
          </p>
        </div>
      </div>
    </footer>
  );
}
