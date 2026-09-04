"use client";

import { useState } from "react";
import { MessageSquare, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SocialMockPost {
  platform: "reddit" | "twitter";
  source: string;
  user: string;
  handle: string;
  time: string;
  title?: string;
  content: string;
  stats: string;
}

const redditPosts: SocialMockPost[] = [
  {
    platform: "reddit",
    source: "r/SaaS",
    user: "Marcus Vance",
    handle: "u/marcus_vance",
    time: "3 hours ago",
    title: "How do you automate enterprise custom billing?",
    content:
      "We spend 8 hours every month reconciling custom enterprise contracts that Stripe Billing does not handle natively. A simple contract sync tool would save us massive developer time. I would pay $99 monthly just to automate this.",
    stats: "48 upvotes",
  },
  {
    platform: "reddit",
    source: "r/marketing",
    user: "Sarah Chen",
    handle: "u/sarah_growth",
    time: "5 hours ago",
    title: "Looking for an automated cold outreach list scrubber",
    content:
      "Our team sends cold outreach weekly. Tracking bounce events and cleaning deliverability hygiene takes forever across custom mailboxes. I need an automated webhook that scrubs bouncing contacts instantly.",
    stats: "32 upvotes",
  },
  {
    platform: "reddit",
    source: "r/productivity",
    user: "Elena Rostova",
    handle: "u/elena_ops",
    time: "1 day ago",
    title: "Is there a tool to generate weekly client PDF metrics?",
    content:
      "Every Friday I copy screenshots from five different platforms into slide decks for client deliverables. It takes 4 hours. If a tool compiled these metrics automatically and formatted a branded PDF, I would buy it today.",
    stats: "76 upvotes",
  },
];

const twitterPosts: SocialMockPost[] = [
  {
    platform: "twitter",
    source: "Twitter (X)",
    user: "Alex Rivera",
    handle: "@alex_rivera",
    time: "4 hours ago",
    content:
      "I spend 4 hours every Friday manually pulling client analytics from Sheets to PDF. Someone build a tool to auto email PDF summaries directly to client lists. I will pay $49 monthly gladly.",
    stats: "142 likes",
  },
  {
    platform: "twitter",
    source: "Twitter (X)",
    user: "Devon Bailey",
    handle: "@devon_saas",
    time: "7 hours ago",
    content:
      "Pricing tier changes at competitor suites is a massive bottleneck. Everyone in my community is complaining about custom contracts mapping. Huge opportunity for a specialized syncer.",
    stats: "94 likes",
  },
  {
    platform: "twitter",
    source: "Twitter (X)",
    user: "Maya Patel",
    handle: "@maya_outreach",
    time: "1 day ago",
    content:
      "Cold outreach bounce lists are a nightmare to manage. We need automated list cleaning linked directly to custom SMTP providers. Ready to subscribe tomorrow.",
    stats: "68 likes",
  },
];

export function Opportunities() {
  const [activeTab, setActiveTab] = useState<"reddit" | "twitter">("reddit");
  const posts = activeTab === "reddit" ? redditPosts : twitterPosts;

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-20 sm:px-6 sm:py-28">
      {/* Header */}
      <div className="mb-14 flex max-w-[680px] flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-[#ff4500] dark:border-white/10 dark:bg-zinc-900/60">
          Verified buyer signals
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-balance text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          Real people asking for solutions right now
        </h2>
        <p className="text-base leading-relaxed font-normal text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
          Every card below represents an authentic customer with an unaddressed
          workflow pain point and an active willingness to pay.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-10 inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white/70 p-1.5 shadow-xs backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70">
        <button
          type="button"
          onClick={() => setActiveTab("reddit")}
          className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            activeTab === "reddit"
              ? "bg-[#ff4500] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Reddit Discussions
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("twitter")}
          className={`cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            activeTab === "twitter"
              ? "bg-[#ff4500] text-white shadow-sm"
              : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          Twitter (X) Signals
        </button>
      </div>

      {/* Grid of Posts */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-3xl border border-black/10 bg-white/70 p-6 shadow-xs backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-zinc-900/70"
          >
            <div>
              <div className="mb-3 flex items-center justify-between border-b border-black/5 pb-3 dark:border-white/5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-zinc-950 dark:text-white">
                    {post.user}
                  </span>
                  <span className="text-xs text-zinc-400">{post.handle}</span>
                </div>
                <span className="text-xs font-medium text-zinc-400">
                  {post.time}
                </span>
              </div>

              {post.title && (
                <h3 className="mb-2 text-base leading-snug font-bold text-zinc-900 dark:text-white">
                  {post.title}
                </h3>
              )}

              <p className="mb-4 text-sm leading-relaxed font-normal text-zinc-700 italic dark:text-zinc-300">
                &ldquo;{post.content}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-black/5 pt-3 text-xs font-semibold text-zinc-500 dark:border-white/5">
              <span className="font-bold text-[#ff4500]">{post.source}</span>
              <span className="flex items-center gap-1">
                {activeTab === "reddit" ? (
                  <MessageSquare className="h-3.5 w-3.5" />
                ) : (
                  <Heart className="h-3.5 w-3.5" />
                )}
                {post.stats}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
