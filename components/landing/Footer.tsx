import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#1a1a1a] px-4 pt-16 pb-8 sm:px-6">
      <div className="mx-auto mb-20 flex max-w-[1240px] flex-col justify-between gap-12 md:flex-row md:gap-8">
        {/* Left Col: Brand & Theme Toggle */}
        <div className="flex max-w-[280px] flex-col items-start">
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
              <circle cx="12" cy="15" r="3" fill="#1a1a1a" />
            </svg>
            <span className="text-[15px] font-extrabold tracking-wide text-white">
              ThreddIQ
            </span>
          </Link>
          <p className="mb-6 text-[14px] leading-relaxed font-medium text-zinc-400">
            Find perfect opportunities on Reddit with AI-powered monitoring
          </p>
          {/* 
          <div className="flex items-center p-1 border border-zinc-800 rounded-lg bg-[#141414]">
            <button
              aria-label="Light mode"
              className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <Sun className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              aria-label="Dark mode"
              className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
              <Moon className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          */}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5">
            <p className="mb-2 text-[15px] font-bold text-white">Features</p>
            <Link
              href="/features/pain-point-mining"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Pain Point Mining
            </Link>
            <Link
              href="/features/idea-validation"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Idea Validation
            </Link>
            <Link
              href="/features/market-discovery"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Market Discovery
            </Link>
            <Link
              href="/features/keyword-monitoring"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Keyword Monitoring
            </Link>
            <Link
              href="/features/sentiment-analysis"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Sentiment Analysis
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <p className="mb-2 text-[15px] font-bold text-white">Product</p>
            <Link
              href="/#faq"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              FAQ
            </Link>
            <Link
              href="/case-studies"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Case Studies
            </Link>
            <Link
              href="/docs"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Documentation -- Coming Soon
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <p className="mb-2 text-[15px] font-bold text-white">Free Tools</p>
            <Link
              href="/free-tools/pain-point-miner"
              className="flex items-center gap-2 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Pain Point Miner{" "}
              <span className="rounded bg-[#ff4500]/20 px-1.5 py-0.5 text-[10px] font-black tracking-tighter text-[#ff4500] uppercase">
                Free
              </span>
            </Link>
            <Link
              href="/free-tools/opportunity-scoreboard"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Opportunity Scoreboard
            </Link>
            <Link
              href="/free-tools/sentiment-context-map"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Sentiment Context Map
            </Link>
            <Link
              href="/free-tools/reddit-lead-generator"
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Reddit Lead Generator
            </Link>
          </div>
          <div className="flex flex-col gap-5">
            <p className="mb-2 text-[15px] font-bold text-white">Resources</p>
            <Link
              href="/resources/best-subreddits-by-industry"
              className="text-[13px] leading-relaxed font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Best Subreddits by Industry
            </Link>
            <Link
              href="/resources/monitor-reddit-by-industry"
              className="text-[13px] leading-relaxed font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Monitor Reddit by Industry
            </Link>
            <Link
              href="/resources/reddit-monitoring-use-cases"
              className="text-[13px] leading-relaxed font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Reddit Monitoring Use Cases
            </Link>
            <Link
              href="/resources/reddit-marketing-glossary"
              className="text-[13px] leading-relaxed font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Reddit Marketing Glossary
            </Link>
            <Link
              href="/resources/reddit-marketing-by-industry"
              className="text-[13px] leading-relaxed font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Reddit Marketing by Industry
            </Link>
            <Link
              href="/resources/tool-comparisons"
              className="text-[13px] leading-relaxed font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Tool Comparisons
            </Link>
            <Link
              href="/resources/reddit-tools"
              className="text-[13px] leading-relaxed font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Reddit Tools
            </Link>
          </div>
        </div>
      </div>

      {/* From the Maker Banner */}
      {/* <div className="max-w-[1240px] mx-auto border-t border-zinc-800 py-10 flex flex-col items-center gap-4">
        <p className="text-[14px] font-bold text-white tracking-wide">
          From the makers of ThreddIQ
        </p>
        <div className="flex items-center gap-6 text-[13px] font-medium text-zinc-400 flex-wrap justify-center">
          <Link href="#" className="hover:text-white transition-colors">
            FreeToolsLand
          </Link>
          <Link
            href="#"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span className="text-[14px]">📦</span> FreelanceKit
          </Link>
          <Link
            href="#"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span className="text-blue-500 font-mono text-[11px] bg-blue-500/10 px-1 rounded rounded-sm">
              ☑
            </span>{" "}
            IsMyWebsiteReady
          </Link>
          <Link
            href="#"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <div className="w-3.5 h-3.5 bg-purple-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>{" "}
            MyFeedIn
          </Link>
        </div>
      </div> */}

      {/* Copyright Base */}
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-2 border-t border-zinc-800 pt-8 pb-4 text-center text-[12px] text-zinc-400 md:flex-row md:text-left">
        <p>© 2026 ThreddIQ. All rights reserved.</p>
        <div className="flex items-center gap-1.5">
          Built with <span className="text-[#a8a8a8]">☕</span> by{" "}
          <span className="ml-1 font-bold text-white">Alex</span>
        </div>
      </div>
    </footer>
  );
}
