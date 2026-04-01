import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import { 
  BookOpen, 
  Map, 
  Users, 
  Layout, 
  Zap, 
  BarChart3, 
  ListChecks, 
  ArrowRight,
  TrendingDown
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Resources & Insights - ${siteConfig.name}`,
  description: "Guides, tools, and research to help SaaS founders find and validate market opportunities.",
};

const resourceCards = [
  {
    title: "Why SaaS Founders Can't Stop Bleeding Users",
    description: "A deep dive into 737 customer signals to uncover the top five reasons for SaaS churn.",
    href: "/blog/why-saas-founders-cant-stop-bleeding-users",
    icon: <TrendingDown className="h-6 w-6 text-red-500" />,
    badge: "New Analysis"
  },
  {
    title: "Best Subreddits by Industry",
    description: "A comprehensive guide to the most active subreddits for every business sector.",
    href: "/resources/best-subreddits-by-industry",
    icon: <Users className="h-6 w-6 text-blue-500" />,
  },
  {
    title: "Reddit Tool Comparisons",
    description: "How ThreddIQ compares against manual searching and traditional social listening.",
    href: "/resources/tool-comparisons",
    icon: <Layout className="h-6 w-6 text-zinc-400" />,
  },
  {
    title: "Essential Reddit Tools",
    description: "The definitive browser extensions and analytics platforms for every Reddit professional.",
    href: "/resources/reddit-tools",
    icon: <ListChecks className="h-6 w-6 text-blue-400" />,
  },
  {
    title: "Reddit Marketing Glossary",
    description: "Master the unique terminology used in the Reddit marketing ecosystem.",
    href: "/resources/reddit-marketing-glossary",
    icon: <BookOpen className="h-6 w-6 text-emerald-500" />,
  },
  {
    title: "Monitor Reddit by Industry",
    description: "Learn the specific keywords and patterns to monitor within your niche.",
    href: "/resources/monitor-reddit-by-industry",
    icon: <BarChart3 className="h-6 w-6 text-[#ff4500]" />,
  },
  {
    title: "Reddit Monitoring Use Cases",
    description: "Discover how founders use Reddit data for validation and competitor analysis.",
    href: "/resources/reddit-monitoring-use-cases",
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
  },
  {
    title: "Reddit Marketing by Industry",
    description: "Strategic advice on how to market authentically in specific communities.",
    href: "/resources/reddit-marketing-by-industry",
    icon: <Map className="h-6 w-6 text-purple-500" />,
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-300 selection:bg-[#ff4500]/30">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col px-6 pt-32 pb-24">
        <header className="mb-20 text-center">
          <h1 className="mb-6 text-[48px] leading-tight font-black tracking-tight text-white md:text-[64px]">
            Founder <span className="text-[#ff4500]">Resources</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-400">
            Guides, research, and analysis to help you cut through the noise and find what customers are actually begging for.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resourceCards.map((card) => (
            <Link 
              key={card.href} 
              href={card.href}
              className="group relative flex flex-col overflow-hidden rounded-[32px] border border-white/5 bg-[#0f0f0f] p-8 transition-all hover:border-white/10 hover:bg-white/2"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#ff4500]/5 opacity-0 blur-[80px] transition-opacity group-hover:opacity-100" />
              
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-transform duration-500 group-hover:scale-110">
                  {card.icon}
                </div>
                {card.badge && (
                  <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black text-[#ff4500] uppercase tracking-widest">
                    {card.badge}
                  </span>
                )}
              </div>

              <h3 className="mb-4 text-xl font-black text-white transition-colors group-hover:text-[#ff4500]">
                {card.title}
              </h3>
              
              <p className="mb-8 flex-1 text-sm font-medium leading-relaxed text-zinc-500">
                {card.description}
              </p>

              <div className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest transition-colors group-hover:text-white">
                Read Resource <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
