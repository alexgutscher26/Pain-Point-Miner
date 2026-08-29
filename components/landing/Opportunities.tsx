"use client";

import { useState } from "react";
import { MessageSquare, Heart, RefreshCw, MessageCircle } from "lucide-react";

interface SocialMockPost {
  platform: "reddit" | "twitter";
  source: string;
  user: string;
  avatarInitials: string;
  handle: string;
  time: string;
  title?: string;
  content: string;
  stats: string;
  metricIcon: "upvotes" | "likes";
}

const redditPosts: SocialMockPost[] = [
  {
    platform: "reddit",
    source: "r/SaaS",
    user: "u/saas_builder_99",
    avatarInitials: "SB",
    handle: "saas_builder_99",
    time: "2 hrs ago",
    title: "How do you guys automate enterprise custom billing?",
    content: "We spend hours every month reconciling custom contracts that Stripe Billing doesn't handle natively. A simple contract-to-Stripe sync app would save so much developer time. I would pay $100/mo just to automate this.",
    stats: "48 upvotes",
    metricIcon: "upvotes",
  },
  {
    platform: "reddit",
    source: "r/marketing",
    user: "u/growth_lead_xyz",
    avatarInitials: "GL",
    handle: "growth_lead_xyz",
    time: "5 hrs ago",
    title: "Looking for an active cold outreach list scrubber",
    content: "Our team sends 2k emails a week. Tracking bounce rates and cleaning custom databases manually is taking hours. Instantly is ok but missing auto-cleanup rules for SMTP list hygiene. I'd pay for a webhook cleaner.",
    stats: "32 upvotes",
    metricIcon: "upvotes",
  },
  {
    platform: "reddit",
    source: "r/productivity",
    user: "u/busy_manager_pro",
    avatarInitials: "BM",
    handle: "busy_manager_pro",
    time: "1 day ago",
    title: "Is there a tool to generate weekly client PDF metrics?",
    content: "Every Friday I manually copy-paste screenshots and statistics from 5 dashboards into a PDF report for clients. It takes 4 hours. If there was a tool to auto-generate and email this, I'd pay $50/mo instantly.",
    stats: "76 upvotes",
    metricIcon: "upvotes",
  },
];

const twitterPosts: SocialMockPost[] = [
  {
    platform: "twitter",
    source: "Twitter (X)",
    user: "Alex | Indie Hacker",
    avatarInitials: "AI",
    handle: "@indie_alex",
    time: "4 hrs ago",
    content: "I spend 4 hours every Friday manually pulling client analytics from Sheets to PDF. Someone build a tool to auto-email PDF summaries directly to client lists. I'll pay $50/mo. Please.",
    stats: "142 likes",
    metricIcon: "likes",
  },
  {
    platform: "twitter",
    source: "Twitter (X)",
    user: "SaaS Founder",
    avatarInitials: "SF",
    handle: "@saas_founder",
    time: "7 hrs ago",
    content: "Pricing tier changes at competitor X is a massive bottleneck. Everyone in my community is complaining about custom contracts mapping. Huge opportunity for a Stripe Syncer.",
    stats: "94 likes",
    metricIcon: "likes",
  },
  {
    platform: "twitter",
    source: "Twitter (X)",
    user: "Growth Marketer",
    avatarInitials: "GM",
    handle: "@growth_mark",
    time: "1 day ago",
    content: "Cold outreach bounce lists are a nightmare to manage. We need automated list cleaning linked directly to custom SMTP providers. Ready to subscribe tomorrow.",
    stats: "68 likes",
    metricIcon: "likes",
  },
];

export function Opportunities() {
  const [activeTab, setActiveTab] = useState<"reddit" | "twitter">("reddit");
  const posts = activeTab === "reddit" ? redditPosts : twitterPosts;

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center border-t border-black/[0.04] px-4 py-24 sm:px-6 sm:py-32">
      {/* Header */}
      <div className="mb-16 max-w-2xl text-center">
        <span className="mb-4 inline-block text-[11px] font-extrabold tracking-widest text-[#ff4500] uppercase">
          UNDERSTAND YOUR MARKET
        </span>
        <h2 className="mb-6 text-[36px] leading-[1.08] font-extrabold tracking-[-0.03em] text-zinc-950 sm:text-[48px]">
          Find <span className="text-[#ff4500]">real user problems</span>
        </h2>
        <p className="text-[16px] font-medium text-zinc-500 leading-relaxed">
          Discover underlying frustrations, competitor complaints, and active requests for software in target markets.
        </p>
      </div>

      {/* Social Tab Selector */}
      <div className="mb-12 inline-flex items-center justify-center gap-1.5 rounded-full border border-black/5 bg-zinc-100 p-1 shadow-inner">
        <button
          onClick={() => setActiveTab("reddit")}
          className={`rounded-full px-6 py-2 text-[12px] font-extrabold transition-all ${
            activeTab === "reddit"
              ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/50"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          👽 Reddit Discussions
        </button>
        <button
          onClick={() => setActiveTab("twitter")}
          className={`rounded-full px-6 py-2 text-[12px] font-extrabold transition-all ${
            activeTab === "twitter"
              ? "bg-white text-zinc-900 shadow-xs border border-zinc-200/50"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          🐦 Twitter Threads
        </button>
      </div>

      {/* Feed Cards Grid */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col justify-between rounded-2xl border border-black/[0.05] bg-white/60 p-6 shadow-xs transition-all hover:bg-white hover:border-[#ff4500]/15 hover:shadow-md animate-in fade-in duration-300"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between border-b border-black/[0.03] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
                  {post.avatarInitials}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold text-zinc-900 leading-none">{post.user}</span>
                  <span className="text-[9px] text-zinc-400 mt-0.5">{post.handle}</span>
                </div>
              </div>
              <span className="text-[9px] font-semibold text-zinc-400">{post.time}</span>
            </div>

            {/* Post Body */}
            <div className="flex-1 mb-6">
              {post.title && (
                <h3 className="mb-2 text-[13px] font-black tracking-tight text-zinc-900 leading-snug">
                  {post.title}
                </h3>
              )}
              <p className="text-[12px] font-medium text-zinc-650 leading-relaxed italic">
                &ldquo;{post.content}&rdquo;
              </p>
            </div>

            {/* Post Footer/Stats */}
            <div className="flex items-center justify-between border-t border-black/[0.03] pt-3 text-[10px] font-bold text-zinc-400">
              <div className="flex items-center gap-1.5">
                {post.metricIcon === "upvotes" ? (
                  <MessageSquare className="h-3.5 w-3.5 text-[#ff4500] fill-current opacity-70" />
                ) : (
                  <Heart className="h-3.5 w-3.5 text-[#ff4500] fill-current opacity-70" />
                )}
                <span>{post.stats}</span>
              </div>
              <div className="flex items-center gap-3">
                {post.platform === "twitter" && (
                  <>
                    <MessageCircle className="h-3.5 w-3.5 text-zinc-300" />
                    <RefreshCw className="h-3.5 w-3.5 text-zinc-300" />
                  </>
                )}
                <span className="text-[#ff4500] tracking-wider text-[8px] uppercase">
                  Mined Signal
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href="/niches"
          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-6 py-3 text-xs font-extrabold text-[#ff4500] shadow-xs hover:bg-orange-100 transition-colors"
        >
          Explore All 20+ Pre-Mined SaaS Niches & Teardowns →
        </a>
      </div>
    </section>
  );
}
