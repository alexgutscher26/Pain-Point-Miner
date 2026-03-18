import Link from "next/link";
import { Sun, Moon } from "lucide-react";

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
          <div className="flex items-center p-1 border border-zinc-800 rounded-lg bg-[#141414]">
            <button className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
              <Sun className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white">
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12">
          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-[15px] mb-2">Features</h4>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Reddit Monitoring
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              AI Reply Generator
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              SEO Opportunities
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Post Monitoring
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Comment Monitoring
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-[15px] mb-2">Product</h4>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Blog
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Case Studies
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors break-words"
            >
              Affiliate Program (30%)
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Documentation
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-[15px] mb-2">
              Alternatives
            </h4>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs F5Bot
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs GummySearch
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs MediaFast
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs ReplyGuy
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs Redreach
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs OctoLens
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs Syften
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs Brand24
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              vs KWatch.io
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-[15px] mb-2">
              Free Tools
            </h4>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Subreddit Finder
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Website to Subreddits
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors break-words"
            >
              Reddit Opportunity Finder
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Post Title Generator
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Best Time to Post
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Subreddit Rules Checker
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Shadowban Checker
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Brand Analyzer
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Username Checker
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Account Analyzer
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors"
            >
              Subreddit Comparison
            </Link>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="font-bold text-white text-[15px] mb-2">Resources</h4>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Best Subreddits by Industry
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Monitor Reddit by Industry
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Reddit Monitoring Use Cases
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Reddit Marketing Glossary
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Reddit Marketing by Industry
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Tool Comparisons
            </Link>
            <Link
              href="#"
              className="text-[13px] text-zinc-400 font-medium hover:text-white transition-colors leading-relaxed"
            >
              Reddit Tools
            </Link>
          </div>
        </div>
      </div>

      {/* From the Maker Banner */}
      <div className="max-w-[1240px] mx-auto border-t border-zinc-800 py-10 flex flex-col items-center gap-4">
        <h5 className="text-[14px] font-bold text-white tracking-wide">
          From the makers of ThreddIQ
        </h5>
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
      </div>

      {/* Copyright Base */}
      <div className="max-w-[1240px] mx-auto flex flex-col gap-2 md:flex-row justify-between items-center text-[12px] text-zinc-500 border-t border-zinc-800 pt-8 pb-4 text-center md:text-left">
        <p>© 2026 ThreddIQ. All rights reserved.</p>
        <div className="flex items-center gap-1.5">
          Built with <span className="text-[#a8a8a8]">☕</span> by{" "}
          <span className="text-white font-bold ml-1">Axel Schapmann</span>
        </div>
      </div>
    </footer>
  );
}
