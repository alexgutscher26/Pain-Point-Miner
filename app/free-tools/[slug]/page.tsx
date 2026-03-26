import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import { Search, Sparkles, TrendingUp, Filter, MessageSquare, Target, ArrowRight, Zap, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

const freeTools = {
  "pain-point-miner": {
    title: "Free Reddit Pain Point Miner",
    tagline: "Instantly extract root frustrations from any subreddit.",
    description: "Our AI-powered engine scans the top 100 threads in any subreddit to find the 'Desperation Index'. This tool helps you validate SaaS ideas before writing a single line of code.",
    icon: <Search className="w-12 h-12 text-[#ff4500]" />,
    placeholder: "e.g. r/startups or r/SaaS",
    buttonText: "Mine Insights",
    seoKeywords: ["reddit pain points", "validation tool", "market research free", "saas idea finder"],
    demoResult: {
       label: "Top Pain Point",
       value: "High churn in PLG tools",
       confidence: "94%"
    }
  },
  "opportunity-scoreboard": {
    title: "Reddit Opportunity Scoreboard",
    tagline: "Score any market niche based on Reddit activity and sentiment.",
    description: "Enter a keyword, and we'll scan its ecosystem on Reddit. We calculate the Opportunity Score based on thread volume, upvote velocity, and comment density.",
    icon: <TrendingUp className="w-12 h-12 text-emerald-500" />,
    placeholder: "e.g. 'Project Management' or 'Next.js'",
    buttonText: "Check Score",
    seoKeywords: ["reddit opportunity", "market score", "keyword research reddit", "niche validation"],
    demoResult: {
       label: "Niche Score",
       value: "8.4 / 10",
       confidence: "High Demand"
    }
  },
  "sentiment-context-map": {
    title: "Sentiment Context Map",
    tagline: "Map the emotional tone of any Reddit conversation.",
    description: "Upload a Reddit thread URL to see a sentiment map. We categorize comments into 'Desperate', 'Frustrated', 'Indifferent', and 'Happy' using advanced NLP.",
    icon: <Filter className="w-12 h-12 text-blue-500" />,
    placeholder: "Paste Reddit Thread URL...",
    buttonText: "Map Sentiment",
    seoKeywords: ["reddit sentiment analysis", "thread tone checker", "reddit nlp", "customer sentiment tool"],
    demoResult: {
       label: "Emotional Tone",
       value: "Predominantly Frustrated",
       confidence: "72% Desperation"
    }
  },
  "reddit-lead-generator": {
    title: "Reddit Lead Generator (Lite)",
    tagline: "Find the exact users who need your solution right now.",
    description: "Scan for users asking 'How do I X?' or 'Alternatives to Y'. This tool gives you a list of prospective customers who are actively looking for a solution.",
    icon: <MessageSquare className="w-12 h-12 text-purple-500" />,
    placeholder: "e.g. 'Looking for a CRM'",
    buttonText: "Generate Leads",
    seoKeywords: ["reddit lead generation", "find customers on reddit", "outreach tool", "market intelligence"],
    demoResult: {
       label: "Leads Found",
       value: "42 Qualified Users",
       confidence: "Real Intent"
    }
  }
};

export async function generateStaticParams() {
  return Object.keys(freeTools).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const tool = freeTools[slug as keyof typeof freeTools];
  if (!tool) return {};

  return {
    title: `${tool.title} - Free Tools | ${siteConfig.name}`,
    description: tool.description,
    keywords: tool.seoKeywords.join(", "),
  };
}

export default async function FreeToolPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const tool = freeTools[slug as keyof typeof freeTools];

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#ff4500]/30 overflow-x-hidden">
      <Header />
      
      <main className="pt-32 pb-24 px-6 flex flex-col items-center">
        <div className="max-w-[1240px] w-full">
           {/* Section Header */}
           <header className="mb-20 text-center">
             <div className="inline-flex items-center gap-2 mb-8 bg-[#ff4500]/10 border border-[#ff4500]/20 rounded-full py-1.5 px-4">
               <Sparkles className="w-4 h-4 text-[#ff4500]" />
               <span className="text-xs font-black text-white uppercase tracking-widest">Free SEO Tool</span>
             </div>
             <h1 className="text-[48px] md:text-[80px] font-extrabold text-white mb-6 leading-tight tracking-tight">
               {tool.title}
             </h1>
             <p className="text-xl md:text-2xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
               {tool.tagline}
             </p>
           </header>

           {/* Interactive Tool UI */}
           <section className="bg-[#0f0f0f] border-2 border-white/5 rounded-[48px] p-8 md:p-16 mb-24 relative group shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4500]/10 blur-[100px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] opacity-10 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto">
                 <div className="p-6 bg-white/5 border border-white/10 rounded-3xl mb-10 group-hover:scale-110 transition-transform duration-500">
                    {tool.icon}
                 </div>
                 
                 <div className="w-full relative mb-8">
                    <input 
                      type="text" 
                      placeholder={tool.placeholder}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl md:rounded-3xl px-8 py-6 text-lg md:text-xl text-white font-bold outline-hidden focus:border-[#ff4500]/50 transition-all shadow-2xl"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
                       <Database className="w-6 h-6 text-zinc-700" />
                    </div>
                 </div>
                 
                 <Button size="lg" className="bg-[#ff4500] hover:bg-[#ff5a1a] text-white font-black px-12 py-7 rounded-2xl text-xl shadow-xl shadow-[#ff4500]/20 w-full mb-12">
                   {tool.buttonText} <ArrowRight className="ml-2 w-6 h-6" />
                 </Button>

                 {/* Demo Result Visualizer */}
                 <div className="w-full bg-black/30 border border-white/5 rounded-3xl p-8 backdrop-blur-md opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all animate-pulse group-hover:animate-none">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                       <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                          <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">{tool.demoResult.label}</span>
                          <span className="text-2xl font-black text-white">{tool.demoResult.value}</span>
                       </div>
                       <div className="flex flex-col items-center sm:items-end text-center sm:text-right gap-1">
                          <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Reliability Score</span>
                          <span className="text-2xl font-black text-emerald-500">{tool.demoResult.confidence}</span>
                       </div>
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-1">
                    </div>
                 </div>
              </div>
           </section>

           {/* Features / SEO Content */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                 <h2 className="text-4xl font-extrabold text-white mb-8 tracking-tight">How our {tool.title} helps you build better products.</h2>
                 <p className="text-xl text-zinc-400 leading-relaxed font-medium mb-10">
                    {tool.description} Unlike manual research, our AI doesn&apos;t just look for words—it looks for intent, desperation, and willingness to pay.
                 </p>
                 <ul className="space-y-6">
                    {[
                       "Scan unlimited threads with semantic grouping.",
                       "Filter by specific sentiment markers (e.g. 'I hate that...').",
                       "Export your research as high-quality validation data.",
                       "Use it for programmatic SEO and market targeting."
                    ].map((feature, i) => (
                       <li key={i} className="flex items-start gap-4">
                          <Zap className="w-6 h-6 text-[#ff4500] shrink-0 mt-0.5" />
                          <span className="text-lg text-zinc-300 font-bold">{feature}</span>
                       </li>
                    ))}
                 </ul>
              </div>

              <div className="bg-linear-to-b from-[#1c0c0a] to-[#0a0a0a] border border-white/5 rounded-[40px] p-12 text-center group">
                 <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-10 group-hover:rotate-12 transition-transform duration-500">
                    <Target className="w-10 h-10 text-[#ff4500]" />
                 </div>
                 <h3 className="text-3xl font-extrabold text-white mb-6">Want to unlock full power?</h3>
                 <p className="text-xl text-zinc-500 mb-10 font-medium">Get pro monitoring, unlimited scans, and advanced AI reporting with a premium ThreddIQ account.</p>
                 <Button asChild size="lg" className="w-full bg-[#ff4500] hover:bg-[#ff5a1a] text-white font-black py-7 rounded-2xl text-xl">
                    <Link href="/sign-up">Start 3-Day Free Trial</Link>
                 </Button>
                 <p className="mt-6 text-[11px] text-zinc-600 font-bold uppercase tracking-widest">Cancel anytime • No credit card required</p>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
