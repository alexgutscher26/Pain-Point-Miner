import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-[#1a1a1a] px-4 pb-8 pt-16 sm:px-6">
      <div className="mx-auto mb-20 flex max-w-[1240px] flex-col justify-between gap-12 md:flex-row md:gap-8">
        {/* Left Col: Brand & Theme Toggle */}
        <div className="flex flex-col items-start max-w-[280px]">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
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
            <span className="font-extrabold text-[15px] text-white tracking-wide">
              ThreddIQ
            </span>
          </Link>
          <p className="text-[14px] text-zinc-400 leading-relaxed font-medium mb-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          <div className="flex flex-col gap-5">
            <p className="font-bold text-white text-[15px] mb-2">Features</p>
            <Link
              href="/features/pain-point-mining"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Pain Point Mining
            </Link>
            <Link
              href="/features/idea-validation"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Idea Validation
            </Link>
            <Link
              href="/features/market-discovery"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Market Discovery
            </Link>
            <Link
              href="/features/keyword-monitoring"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Keyword Monitoring
            </Link>
            <Link
              href="/features/sentiment-analysis"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Sentiment Analysis
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <p className="font-bold text-white text-[15px] mb-2">Product</p>
            <Link
              href="/#faq"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/case-studies"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Case Studies
            </Link>
            <Link
              href="/docs"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Documentation -- Coming Soon
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <p className="font-bold text-white text-[15px] mb-2">Free Tools</p>
            <Link
              href="/free-tools/pain-point-miner"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors flex items-center gap-2"
            >
              Pain Point Miner{" "}
              <span className="text-[10px] bg-[#ff4500]/20 text-[#ff4500] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                Free
              </span>
            </Link>
            <Link
              href="/free-tools/opportunity-scoreboard"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Opportunity Scoreboard
            </Link>
            <Link
              href="/free-tools/sentiment-context-map"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Sentiment Context Map
            </Link>
            <Link
              href="/free-tools/reddit-lead-generator"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Reddit Lead Generator
            </Link>
          </div>
          <div className="flex flex-col gap-5">
            <p className="font-bold text-white text-[15px] mb-2">Resources</p>
            <Link
              href="/resources/best-subreddits-by-industry"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Best Subreddits by Industry
            </Link>
            <Link
              href="/resources/monitor-reddit-by-industry"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Monitor Reddit by Industry
            </Link>
            <Link
              href="/resources/reddit-monitoring-use-cases"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Reddit Monitoring Use Cases
            </Link>
            <Link
              href="/resources/reddit-marketing-glossary"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Reddit Marketing Glossary
            </Link>
            <Link
              href="/resources/reddit-marketing-by-industry"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Reddit Marketing by Industry
            </Link>
            <Link
              href="/resources/tool-comparisons"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Tool Comparisons
            </Link>
            <Link
              href="/resources/reddit-tools"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
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
      <div className="max-w-[1240px] mx-auto flex flex-col gap-2 md:flex-row justify-between items-center text-[12px] text-zinc-400 border-t border-zinc-800 pt-8 pb-4 text-center md:text-left">
        <p>© 2026 ThreddIQ. All rights reserved.</p>
        <div className="flex items-center gap-1.5">
          Built with <span className="text-[#a8a8a8]">☕</span> by{" "}
          <span className="text-white font-bold ml-1">Alex</span>
        </div>
      </div>
    </footer>
  );
}
