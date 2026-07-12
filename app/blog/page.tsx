import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import {
  TrendingDown,
  Search,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Blog - ${siteConfig.name}`,
  description: "Research, analysis, and guides for SaaS founders validating ideas with Reddit intelligence.",
};

const blogPosts = [
  {
    title: "How to Validate a SaaS Idea Using Reddit",
    subtitle: "Before you write a single line of code",
    description: "Learn how to mine Reddit for real pain points, budget signals, and market demand — a step-by-step guide to systematic customer research.",
    href: "/blog/how-to-validate-saas-idea-reddit",
    icon: <Search className="h-6 w-6 text-[#ff4500]" />,
    badge: "Foundational",
    date: "July 2026",
  },
  {
    title: "Why SaaS Founders Can't Stop Bleeding Users",
    subtitle: "737 signals, 5 frustrations, 1 conclusion",
    description: "A deep dive into 737 customer signals to uncover the top five reasons SaaS users actually leave — and what to do about it.",
    href: "/blog/why-saas-founders-cant-stop-bleeding-users",
    icon: <TrendingDown className="h-6 w-6 text-red-500" />,
    badge: "Research",
    date: "June 2026",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-300 selection:bg-[#ff4500]/30">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col px-6 pt-32 pb-24">
        <header className="mb-20 text-center">
          <h1 className="mb-6 text-[48px] leading-tight font-black tracking-tight text-white md:text-[64px]">
            <span className="text-[#ff4500]">Blog</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-400">
            Research-backed insights and practical guides for founders who want to build what people actually need.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="group relative flex flex-col overflow-hidden rounded-[32px] border border-white/5 bg-[#0f0f0f] p-8 transition-all hover:border-white/10 hover:bg-white/2"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#ff4500]/5 opacity-0 blur-[80px] transition-opacity group-hover:opacity-100" />

              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-transform duration-500 group-hover:scale-110">
                  {post.icon}
                </div>
                {post.badge && (
                  <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black text-[#ff4500] uppercase tracking-widest">
                    {post.badge}
                  </span>
                )}
              </div>

              <h3 className="mb-1 text-xl font-black text-white transition-colors group-hover:text-[#ff4500]">
                {post.title}
              </h3>
              {post.subtitle && (
                <p className="mb-4 text-sm font-bold text-zinc-500 italic">
                  {post.subtitle}
                </p>
              )}

              <p className="mb-8 flex-1 text-sm font-medium leading-relaxed text-zinc-500">
                {post.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-widest">
                  {post.date}
                </span>
                <div className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest transition-colors group-hover:text-white">
                  Read Post <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
