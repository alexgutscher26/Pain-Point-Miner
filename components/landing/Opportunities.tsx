"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface SocialMockPost {
  platform: "reddit" | "twitter";
  source: string;
  user: string;
  handle: string;
  time: string;
  title?: string;
  content: string;
  budget: string;
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
    budget: "$99/mo committed",
    stats: "48 upvotes • 22 comments",
  },
  {
    platform: "reddit",
    source: "r/sales",
    user: "Dan Miller",
    handle: "u/dan_sales_ops",
    time: "5 hours ago",
    title: "HubSpot pricing jump for small outbound sequences is ridiculous",
    content:
      "Just got told we need the Pro tier ($600/mo) for basic email sequences. We just need a lightweight pipeline and 3 sequence steps. Would switch our 8-person team in a heartbeat.",
    budget: "$79/mo ready",
    stats: "112 upvotes • 45 comments",
  },
  {
    platform: "reddit",
    source: "r/productivity",
    user: "Elena Rostova",
    handle: "u/elena_ops",
    time: "1 day ago",
    title: "Is there a tool to generate weekly client PDF metrics automatically?",
    content:
      "Every Friday I copy screenshots from five different platforms into slide decks for client deliverables. It takes 4 hours. If a tool compiled these metrics automatically and formatted a branded PDF, I would buy it today.",
    budget: "$49/mo ready",
    stats: "76 upvotes • 31 comments",
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
    budget: "$49/mo committed",
    stats: "142 likes • 18 reposts",
  },
  {
    platform: "twitter",
    source: "Twitter (X)",
    user: "Devon Bailey",
    handle: "@devon_saas",
    time: "7 hours ago",
    content:
      "Pricing tier changes at competitor suites is a massive bottleneck. Everyone in my community is complaining about custom contracts mapping. Huge opportunity for a specialized syncer.",
    budget: "High urgency",
    stats: "94 likes • 12 reposts",
  },
  {
    platform: "twitter",
    source: "Twitter (X)",
    user: "Maya Patel",
    handle: "@maya_outreach",
    time: "1 day ago",
    content:
      "Cold outreach bounce lists are a nightmare to manage. We need automated list cleaning linked directly to custom SMTP providers. Ready to subscribe tomorrow.",
    budget: "$39/mo ready",
    stats: "68 likes • 9 reposts",
  },
];

export function Opportunities() {
  const [activeTab, setActiveTab] = useState<"reddit" | "twitter">("reddit");
  const posts = activeTab === "reddit" ? redditPosts : twitterPosts;

  return (
    <section className="mx-auto flex w-full max-w-[1240px] flex-col items-center px-4 py-16 sm:px-6 sm:py-24">
      {/* Header */}
      <div className="mb-14 flex max-w-[720px] flex-col items-center text-center">
        <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#ff4500] shadow-2xs backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Verified Buyer Intent</span>
        </div>
        <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl md:text-5xl dark:text-white">
          Real buyers asking for solutions right now
        </h2>
        <p className="text-base leading-relaxed font-normal text-zinc-600 sm:text-lg dark:text-zinc-300">
          See live quotes from founders, operators, and marketing teams publicly
          declaring what software they want and how much they are ready to pay.
        </p>

        {/* Tab Selector */}
        <div className="mt-8 inline-flex rounded-2xl border border-zinc-200 bg-zinc-100/90 p-1 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <button
            type="button"
            onClick={() => setActiveTab("reddit")}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all sm:text-sm ${
              activeTab === "reddit"
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4500] text-[9px] font-black text-white">
              r/
            </div>
            <span>Reddit Discussions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("twitter")}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold transition-all sm:text-sm ${
              activeTab === "twitter"
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            <span className="text-zinc-900 dark:text-white font-bold">𝕏</span>
            <span>Twitter (X) Posts</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {posts.map((post, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#ff4500]/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                    {post.source}
                  </span>
                  <span className="text-[11px] text-zinc-400">• {post.time}</span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {post.budget}
                </span>
              </div>

              {post.title && (
                <h4 className="mb-2 text-sm font-bold text-zinc-950 dark:text-white">
                  {post.title}
                </h4>
              )}

              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
                "{post.content}"
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800">
              <span className="font-mono">{post.handle}</span>
              <span>{post.stats}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
