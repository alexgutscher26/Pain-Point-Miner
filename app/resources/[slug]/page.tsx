import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import { BookOpen, Map, Users, Layout, Zap, BarChart3, ListChecks } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

const resources = {
  "best-subreddits-by-industry": {
    title: "Best Subreddits by Industry",
    description: "A comprehensive guide to the most active subreddits for every business sector. Find where your target audience hangs out.",
    content: [
      {
        heading: "Technology & SaaS",
        text: "r/SaaS, r/startups, r/webdev, r/ProductManagement"
      },
      {
        heading: "Marketing & E-commerce",
        text: "r/marketing, r/ecommerce, r/socialmedia, r/SEO"
      },
      {
        heading: "Finance & Fintech",
        text: "r/finance, r/fintech, r/personalfinance"
      }
    ],
    icon: <Users className="w-10 h-10 text-blue-500" />
  },
  "monitor-reddit-by-industry": {
    title: "Monitor Reddit by Industry",
    description: "Learn the specific keywords and patterns to monitor within your specific business vertical.",
    content: [
      {
        heading: "The Monitoring Strategy",
        text: "Every industry has its own language. We've mapped out the key phrases for 20+ industries to help you find leads faster."
      }
    ],
    icon: <BarChart3 className="w-10 h-10 text-[#ff4500]" />
  },
  "reddit-monitoring-use-cases": {
    title: "Reddit Monitoring Use Cases",
    description: "Discover the different ways founders and marketers use Reddit data to grow their business.",
    content: [
      {
        heading: "Product Validation",
        text: "Using Reddit to see if people are actually complaining about the problem you want to solve."
      },
      {
        heading: "Competitor Analysis",
        text: "Monitoring mentions of your competitors to understand their weaknesses."
      }
    ],
    icon: <Zap className="w-10 h-10 text-yellow-500" />
  },
  "reddit-marketing-glossary": {
    title: "Reddit Marketing Glossary",
    description: "Master the unique terminology used in the Reddit marketing ecosystem.",
    content: [
      {
        heading: "What is a 'Subreddit'?",
        text: "A specific community centered around a topic."
      },
      {
        heading: "Shadowbanning",
        text: "When your posts are hidden from others without you knowing. Essential for marketers to understand."
      }
    ],
    icon: <BookOpen className="w-10 h-10 text-emerald-500" />
  },
  "reddit-marketing-by-industry": {
    title: "Reddit Marketing by Industry",
    description: "Strategic advice on how to market authentically within specific industry-focused communities.",
    content: [
      {
        heading: "Authenticity First",
        text: "Reddit hates traditional ads. Learn how to provide value in your specific industry niche."
      }
    ],
    icon: <Map className="w-10 h-10 text-purple-500" />
  },
  "tool-comparisons": {
    title: "Reddit Tool Comparisons",
    description: "Honest comparisons between ThreddIQ and other Reddit monitoring or marketing tools.",
    content: [
      {
        heading: "ThreddIQ vs Manual Search",
        text: "Why manual searching is losing you hours of valuable time every single week."
      }
    ],
    icon: <Layout className="w-10 h-10 text-zinc-400" />
  },
  "reddit-tools": {
    title: "Essential Reddit Tools",
    description: "A list of the best browser extensions, analytics platforms, and automation tools for Reddit professionals.",
    content: [
      {
        heading: "Analytics Tools",
        text: "Tools that help you track subreddit growth and post performance."
      }
    ],
    icon: <ListChecks className="w-10 h-10 text-blue-400" />
  }
};

export async function generateStaticParams() {
  return Object.keys(resources).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = await params;
  const res = resources[slug as keyof typeof resources];
  if (!res) return {};

  return {
    title: `${res.title} - Resources | ${siteConfig.name}`,
    description: res.description,
  };
}

export default async function ResourcePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const res = resources[slug as keyof typeof resources];

  if (!res) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-[#ff4500]/30">
      <Header />
      
      <main className="pt-32 pb-24 px-6 flex flex-col items-center">
        <div className="max-w-[1000px] w-full">
           <div className="inline-flex items-center gap-3 mb-10 text-zinc-500 font-bold uppercase tracking-widest text-xs">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-zinc-300">Resources</span>
           </div>

           <div className="mb-20">
              <div className="mb-8">
                 {res.icon}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                {res.title}
              </h1>
              <p className="text-xl md:text-2xl text-zinc-400 font-medium leading-relaxed max-w-3xl">
                {res.description}
              </p>
           </div>

           <div className="grid gap-16">
              {res.content.map((item, i) => (
                 <section key={i} className="border-t border-white/5 pt-12 first:border-0 first:pt-0">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                       {item.heading}
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-medium">
                       {item.text}
                    </p>
                 </section>
              ))}
           </div>

           {/* Call to Action */}
           <div className="mt-24 p-12 bg-linear-to-b from-[#1c0c0a] to-[#0a0a0a] border border-white/5 rounded-[40px] text-center">
              <h3 className="text-3xl font-black text-white mb-6">Ready to find your next idea?</h3>
              <p className="text-lg text-zinc-500 mb-10 font-medium max-w-xl mx-auto">Stop guessing and start mining. Join 600+ founders using ThreddIQ to build products people actually want.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button asChild size="lg" className="bg-[#ff4500] hover:bg-[#ff5a1a] text-white font-black px-10 py-7 rounded-2xl text-xl w-full sm:w-auto">
                    <Link href="/sign-up">Start Free Trial</Link>
                 </Button>
                 <Button asChild variant="outline" size="lg" className="border-white/10 text-white font-black px-10 py-7 rounded-2xl text-xl w-full sm:w-auto bg-transparent hover:bg-white/5 transition-colors">
                    <Link href="/#pricing">View Pricing</Link>
                 </Button>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
