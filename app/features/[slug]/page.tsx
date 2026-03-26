import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import { Target, Bot, Shield, MessageSquare, Bell, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = {
  "pain-point-mining": {
    title: "AI Pain Point Mining",
    subtitle: "Identify root frustrations automatically",
    description: "Our AI engine scans thousands of Reddit conversations to extract the underlying problems, recurring complaints, and unmet needs of your target audience.",
    icon: <Bot className="w-12 h-12 text-[#ff4500]" />,
    benefits: [
      "Semantic clustering of similar complaints",
      "Automatic root cause identification",
      "Sentiment-weighted problem priority",
      "Direct quote extraction for user research"
    ],
    details: "ThreddIQ doesn't just look for keywords. It understands context. Using deep semantic search, we group thousands of posts into structured problem clusters, showing you exactly what keeps your potential customers awake at night.",
    gradient: "from-orange-500/20 to-transparent"
  },
  "idea-validation": {
    title: "SaaS Idea Validation",
    subtitle: "Validate with real-world demand",
    description: "Stop guessing if your idea will work. Use upvotes, comment volume, and discussion frequency to measure hard validation signals from real communities.",
    icon: <Shield className="w-12 h-12 text-[#ff4500]" />,
    benefits: [
      "Upvote-weighted demand signals",
      "Historical sentiment tracking",
      "Competitor mention analysis",
      "Market saturation indicators"
    ],
    details: "We provide an Opportunity Score for every pain point found. This score aggregates upvotes, comment volume, and the frequency of mentions to give you a data-backed validation signal you can trust before writing a single line of code.",
    gradient: "from-blue-500/20 to-transparent"
  },
  "market-discovery": {
    title: "Market Discovery",
    subtitle: "Uncover underserved niches",
    description: "Find high-opportunity markets that everyone else is missing by analyzing community growth and problem density across 100k+ subreddits.",
    icon: <Bell className="w-12 h-12 text-[#ff4500]" />,
    benefits: [
      "Niche growth velocity tracking",
      "Cross-community trend detection",
      "Under-served subreddit identification",
      "Emerging problem alerts"
    ],
    details: "ThreddIQ maps out 'Problem Density' across different industries. We help you find the 'Goldilocks' subreddits: active enough to have volume, but underserved enough that users are still desperately asking for solutions.",
    gradient: "from-emerald-500/20 to-transparent"
  },
  "keyword-monitoring": {
    title: "Keyword Monitoring",
    subtitle: "Real-time niche surveillance",
    description: "Monitor specific technical terms, brand names, or competitor mentions across all of Reddit to stay on top of every high-intent conversation.",
    icon: <Target className="w-12 h-12 text-[#ff4500]" />,
    benefits: [
      "Real-time keyword alerts",
      "Regex-powered advanced filters",
      "Specific subreddit white-listing",
      "Automated mention reporting"
    ],
    details: "Stay ahead of the curve. Whether it's tracking mentions of a competitor's bugs or watching for people asking 'what is a good tool for...', ThreddIQ keeps you in the loop with real-time analytics and digests.",
    gradient: "from-indigo-500/20 to-transparent"
  },
  "sentiment-analysis": {
    title: "Sentiment Analysis",
    subtitle: "Measure the intensity of pain",
    description: "Go beyond 'positive' and 'negative'. Understand frustration levels, desperation, and willingness to pay through our proprietary AI sentiment engine.",
    icon: <MessageSquare className="w-12 h-12 text-[#ff4500]" />,
    benefits: [
      "Desperation index extraction",
      "Emotional intensity mapping",
      "Budget signal detection",
      "Context-aware mood tracking"
    ],
    details: "Not all complaints are equal. ThreddIQ detects the 'Desperation Index' — spotting users who explicitly mention budgets, timeline urgency, or the failures of existing expensive enterprise tools.",
    gradient: "from-fuchsia-500/20 to-transparent"
  }
};

export async function generateStaticParams() {
  return Object.keys(features).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const feature = features[slug as keyof typeof features];
  if (!feature) return {};

  return {
    title: `${feature.title} - ${siteConfig.name}`,
    description: feature.description,
  };
}

export default async function FeaturePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const feature = features[slug as keyof typeof features];

  if (!feature) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#ff4500]/30 overflow-x-hidden">
      <Header />
      
      <main className="pt-32 pb-24 px-6 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mb-24 relative">
          <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial ${feature.gradient} blur-[100px] pointer-events-none opacity-50`} />
          
          <div className="text-center relative z-10">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl shadow-2xl">
                {feature.icon}
              </div>
            </div>
            <h1 className="text-[48px] md:text-[64px] font-extrabold tracking-tight text-white mb-6 leading-tight">
              {feature.title}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-3xl mx-auto leading-relaxed">
              {feature.subtitle}
            </p>
          </div>
        </section>

        {/* Feature Overview */}
        <section className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-white">The Power of Contextual Mining</h2>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              {feature.details}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feature.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-zinc-200 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#0f0f0f] border-2 border-white/3 rounded-[32px] p-8 aspect-square flex items-center justify-center relative overflow-hidden group shadow-2xl">
             <div className="absolute inset-0 bg-[#ff4500]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="w-full h-full border border-white/5 rounded-2xl bg-black/40 backdrop-blur-sm relative z-10 flex flex-col items-center justify-center p-12 text-center">
                <Sparkles className="w-16 h-16 text-[#ff4500] mb-6 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                <h4 className="text-xl font-bold text-white mb-2">Automated Discovery</h4>
                <p className="text-zinc-500 text-sm font-medium">Built with advanced NLP to find what generic scrapers miss.</p>
             </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full max-w-4xl text-center bg-linear-to-b from-[#1c0c0a] to-[#0f0504] border border-[#ff4500]/10 p-12 md:p-16 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4500]/10 blur-[80px] pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 relative z-10">Ready to find your next SaaS idea?</h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto relative z-10">Join 1,000+ founders using ThreddIQ to build products people actually want.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Button asChild size="lg" className="bg-[#ff4500] hover:bg-[#ff5a1a] text-white font-extrabold px-10 py-6 rounded-xl text-lg shadow-xl shadow-[#ff4500]/20">
              <Link href="/sign-up">Start Mining Now <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent hover:bg-white/10 text-white font-extrabold px-10 py-6 rounded-xl text-lg transition-colors">
              <Link href="/#pricing">View Pricing</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
