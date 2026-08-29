import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import {
  TrendingDown,
  Search,
  ArrowRight,
  DollarSign,
  BarChart3,
  Swords,
  Bell,
  Gauge,
  Crosshair,
  Zap,
  Users,
  Target,
  CreditCard,
  Briefcase,
  PieChart,
  Repeat,
  MessageSquareQuote,
  Code,
  Brain,
  Compass,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Blog - ${siteConfig.name}`,
  description: "Research, analysis, and guides for SaaS founders validating ideas with Reddit intelligence.",
};

const blogPosts = [
  {
    title: "Reddit vs. Customer Interviews vs. Surveys",
    subtitle: "Which validation method actually predicts revenue?",
    description: "A data-backed comparison of three validation methods — and why Reddit is the most underrated signal source for predicting revenue.",
    href: "/blog/reddit-vs-interviews-vs-surveys",
    icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
    badge: "Comparison",
    date: "July 2026",
  },
  {
    title: 'The "I\'d Pay For This" Test',
    subtitle: "Spotting a real buying signal vs. someone just venting",
    description: "Learn how to distinguish genuine willingness-to-pay signals from casual complaints — the exact skill ThreddIQ automates across 1,400+ subreddits.",
    href: "/blog/id-pay-for-this-test",
    icon: <DollarSign className="h-6 w-6 text-green-500" />,
    badge: "Signal Deep Dive",
    date: "July 2026",
  },
  {
    title: 'Why Most "Validated" Ideas Still Fail',
    subtitle: "Validation tells you demand exists — not that you can win",
    description: "The contrarian take: most founders confuse market demand with competitive readiness. Here's why validated ideas fail and how to spot the difference.",
    href: "/blog/why-validated-ideas-still-fail",
    icon: <Swords className="h-6 w-6 text-red-500" />,
    badge: "Strategy",
    date: "July 2026",
  },
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
    title: "We Analyzed 10,000 Reddit Complaints — Here's What SaaS Founders Are Actually Building",
    subtitle: "Data across 200+ subreddits",
    description: "After parsing 10,000 complaints, we found the five categories where founder attention clusters — and the one nobody's building for.",
    href: "/blog/analyzed-10000-reddit-complaints",
    icon: <PieChart className="h-6 w-6 text-purple-500" />,
    badge: "Data Study",
    date: "August 2026",
  },
  {
    title: "The Most Repeated SaaS Complaint on Reddit This Month",
    subtitle: "Real-time trends in user frustration",
    description: "A monthly breakdown of the single most frequently voiced software problem across founder and operator communities.",
    href: "/blog/most-repeated-saas-complaint-this-month",
    icon: <Repeat className="h-6 w-6 text-orange-500" />,
    badge: "Monthly Signal",
    date: "August 2026",
  },
  {
    title: "7 Subtle Phrases People Say on Reddit Right Before 'I'd Pay For This'",
    subtitle: "Hidden intent markers in everyday discussions",
    description: "The verbal patterns that indicate extreme buyer frustration and readiness to switch software before explicit budget talk happens.",
    href: "/blog/phrases-before-id-pay-for-this",
    icon: <MessageSquareQuote className="h-6 w-6 text-emerald-500" />,
    badge: "Linguistics",
    date: "August 2026",
  },
  {
    title: "The 4 Hidden Churn Patterns in Developer Tools",
    subtitle: "Based on 450+ developer threads",
    description: "Why engineers abandon infrastructure tools and the product and pricing mistakes that drive technical churn.",
    href: "/blog/churn-patterns-in-developer-tools",
    icon: <Code className="h-6 w-6 text-blue-600" />,
    badge: "DevTools",
    date: "August 2026",
  },
  {
    title: "AI Wrapper Fatigue: How Reddit Sentiment Shifted in 2026",
    subtitle: "What users actually want from AI products now",
    description: "How community perception of simple wrappers plummeted and what differentiated AI architectures users willingly pay $50+/mo for.",
    href: "/blog/ai-wrapper-fatigue-reddit-sentiment",
    icon: <Brain className="h-6 w-6 text-pink-600" />,
    badge: "Market Trends",
    date: "August 2026",
  },
  {
    title: "How to Spot $10k/mo Micro-SaaS Niches Hiding in Plain Sight",
    subtitle: "Boring B2B verticals with low churn",
    description: "A playbook for finding niche business software ideas in professional subreddits with low maintenance and zero VC competition.",
    href: "/blog/finding-high-intent-b2b-micro-saas-niches",
    icon: <Compass className="h-6 w-6 text-amber-600" />,
    badge: "Micro-SaaS",
    date: "August 2026",
  },
  {
    title: "Automating User Research: From 20 Hours of Calls to 2 Minutes of AI Mining",
    subtitle: "Continuous discovery without calendar friction",
    description: "Why product teams are augmenting customer discovery calls with automated semantic mining across developer and founder communities.",
    href: "/blog/automating-user-research-with-ai-scrapers",
    icon: <Sparkles className="h-6 w-6 text-teal-600" />,
    badge: "Discovery",
    date: "August 2026",
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
  {
    title: "How to Set Up Real-Time Slack Alerts So You Never Miss a Hot Pain Point",
    subtitle: "Real-time Reddit monitoring for your ICP",
    description: "A step-by-step guide to configuring real-time Slack alerts so you never miss a high-signal complaint the moment it drops.",
    href: "/blog/slack-alerts-hot-pain-points",
    icon: <Bell className="h-6 w-6 text-purple-500" />,
    badge: "Tutorial",
    date: "July 2026",
  },
  {
    title: "Reading a Desperation Score: What Actually Makes a Complaint 'Validated'",
    subtitle: "Venting vs. validated demand — a scoring framework",
    description: "A repeatable framework for scoring Reddit complaints by urgency, specificity, and budget intent — the methodology behind ThreddIQ's Desperation Score.",
    href: "/blog/desperation-score-explained",
    icon: <Gauge className="h-6 w-6 text-amber-500" />,
    badge: "Methodology",
    date: "July 2026",
  },
  {
    title: "How to Track a Competitor's Complaints on Reddit and Turn Them Into Your Roadmap",
    subtitle: "Competitor intelligence from organic Reddit data",
    description: "Learn how to monitor competitor criticism on Reddit and turn customer frustration into your product roadmap — without scraping or manual searching.",
    href: "/blog/track-competitor-complaints-reddit",
    icon: <Crosshair className="h-6 w-6 text-cyan-500" />,
    badge: "Guide",
    date: "July 2026",
  },
  {
    title: "From Reddit Thread to Notion Doc in 10 Minutes",
    subtitle: "A workflow for turning signals into specs",
    description: "A repeatable workflow that takes you from a raw Reddit thread to a structured Notion doc — capturing the pain point, quote, context, and market signal in under 10 minutes.",
    href: "/blog/reddit-to-notion-10-minutes",
    icon: <Zap className="h-6 w-6 text-indigo-500" />,
    badge: "Workflow",
    date: "July 2026",
  },
  {
    title: "Best Subreddits for Finding B2B SaaS Ideas in 2026",
    subtitle: "The highest-signal communities for idea validation",
    description: "A ranked guide to the six best subreddits for B2B SaaS idea validation — scored by desperation signal density, budget mention frequency, and purchase intent.",
    href: "/blog/best-subreddits-b2b-saas-ideas-2026",
    icon: <Users className="h-6 w-6 text-blue-500" />,
    badge: "Guide",
    date: "July 2026",
  },
  {
    title: "Where Marketers Complain Online, and What It Means If You're Building for Them",
    subtitle: "Top subreddits for marketing tool pain points",
    description: "The six highest-signal subreddits for marketing tool complaints — and the three complaint archetypes that reveal exactly what to build next.",
    href: "/blog/where-marketers-complain-online",
    icon: <Target className="h-6 w-6 text-pink-500" />,
    badge: "Deep-Dive",
    date: "July 2026",
  },
  {
    title: "Best Subreddits for Validating a Fintech or Billing Tool Idea",
    subtitle: "Where finance and billing pain points surface",
    description: "The top subreddits for fintech and billing tool validation — ranked by signal quality, with the five most common billing pain points showing up right now.",
    href: "/blog/best-subreddits-fintech-billing-tool",
    icon: <CreditCard className="h-6 w-6 text-emerald-500" />,
    badge: "Deep-Dive",
    date: "July 2026",
  },
  {
    title: "Where Freelancers and Agencies Vent About Their Tools",
    subtitle: "Tool complaints from the people who spend their own money",
    description: "The top subreddits where freelancers and agencies complain about project management, CRM, invoicing, and collaboration tools — and why they're your best early customers.",
    href: "/blog/where-freelancers-agencies-vent-tools",
    icon: <Briefcase className="h-6 w-6 text-amber-500" />,
    badge: "Deep-Dive",
    date: "July 2026",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen overflow-x-hidden landing-gradient font-sans text-zinc-800 selection:bg-[#ff4500]/10 selection:text-[#ff4500]">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-col px-6 pt-32 pb-24">
        <header className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff4500]/20 bg-[#ff4500]/5 px-4 py-1.5 font-mono text-[11px] font-black tracking-widest text-[#ff4500] uppercase shadow-xs">
            ThreddIQ Articles & Research
          </div>
          <h1 className="mb-6 text-[48px] leading-tight font-black tracking-tight text-zinc-900 md:text-[64px]">
            The <span className="text-[#ff4500]">Blog</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-600">
            Research-backed insights, data studies, and practical guides for founders who want to build software with validated market demand.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="group relative flex flex-col overflow-hidden rounded-[32px] glass-card p-8 transition-all hover:border-[#ff4500]/30 hover:shadow-lg"
            >
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#ff4500]/5 opacity-0 blur-[80px] transition-opacity group-hover:opacity-100" />

              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-black/5 transition-transform duration-500 group-hover:scale-110">
                  {post.icon}
                </div>
                {post.badge && (
                  <span className="rounded-full bg-[#ff4500]/10 px-3 py-1 text-[10px] font-black text-[#ff4500] uppercase tracking-widest">
                    {post.badge}
                  </span>
                )}
              </div>

              <h3 className="mb-1 text-xl font-black text-zinc-900 transition-colors group-hover:text-[#ff4500]">
                {post.title}
              </h3>
              {post.subtitle && (
                <p className="mb-4 text-sm font-bold text-zinc-600 italic">
                  {post.subtitle}
                </p>
              )}

              <p className="mb-8 flex-1 text-sm font-medium leading-relaxed text-zinc-600">
                {post.description}
              </p>

              <div className="flex items-center justify-between border-t border-black/5 pt-4">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
                  {post.date}
                </span>
                <div className="flex items-center gap-2 text-xs font-black text-zinc-600 uppercase tracking-widest transition-colors group-hover:text-zinc-900">
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
