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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

const resources = {
  "best-subreddits-by-industry": {
    title: "Best Subreddits by Industry",
    description:
      "A comprehensive guide to the most active subreddits for every business sector. Find where your target audience hangs out.",
    content: [
      {
        heading: "Technology & SaaS",
        text: "r/SaaS, r/startups, r/webdev, r/ProductManagement",
      },
      {
        heading: "Marketing & E-commerce",
        text: "r/marketing, r/ecommerce, r/socialmedia, r/SEO",
      },
      {
        heading: "Finance & Fintech",
        text: "r/finance, r/fintech, r/personalfinance",
      },
    ],
    icon: <Users className="h-10 w-10 text-blue-500" />,
  },
  "monitor-reddit-by-industry": {
    title: "Monitor Reddit by Industry",
    description:
      "Learn the specific keywords and patterns to monitor within your specific business vertical.",
    content: [
      {
        heading: "The Monitoring Strategy",
        text: "Every industry has its own language. We've mapped out the key phrases for 20+ industries to help you find leads faster.",
      },
    ],
    icon: <BarChart3 className="h-10 w-10 text-[#ff4500]" />,
  },
  "reddit-monitoring-use-cases": {
    title: "Reddit Monitoring Use Cases",
    description:
      "Discover the different ways founders and marketers use Reddit data to grow their business.",
    content: [
      {
        heading: "Product Validation",
        text: "Using Reddit to see if people are actually complaining about the problem you want to solve.",
      },
      {
        heading: "Competitor Analysis",
        text: "Monitoring mentions of your competitors to understand their weaknesses.",
      },
    ],
    icon: <Zap className="h-10 w-10 text-yellow-500" />,
  },
  "reddit-marketing-glossary": {
    title: "Reddit Marketing Glossary",
    description:
      "Master the unique terminology used in the Reddit marketing ecosystem.",
    content: [
      {
        heading: "What is a 'Subreddit'?",
        text: "A specific community centered around a topic.",
      },
      {
        heading: "Shadowbanning",
        text: "When your posts are hidden from others without you knowing. Essential for marketers to understand.",
      },
    ],
    icon: <BookOpen className="h-10 w-10 text-emerald-500" />,
  },
  "reddit-marketing-by-industry": {
    title: "Reddit Marketing by Industry",
    description:
      "Strategic advice on how to market authentically within specific industry-focused communities.",
    content: [
      {
        heading: "Authenticity First",
        text: "Reddit hates traditional ads. Learn how to provide value in your specific industry niche.",
      },
    ],
    icon: <Map className="h-10 w-10 text-purple-500" />,
  },
  "tool-comparisons": {
    title: "Reddit Tool Comparisons",
    description:
      "Honest comparisons between ThreddIQ and other Reddit monitoring or marketing tools.",
    content: [
      {
        heading: "ThreddIQ vs Manual Search",
        text: "Why manual searching is losing you hours of valuable time every single week.",
      },
    ],
    icon: <Layout className="h-10 w-10 text-zinc-400" />,
  },
  "reddit-tools": {
    title: "Essential Reddit Tools",
    description:
      "A list of the best browser extensions, analytics platforms, and automation tools for Reddit professionals.",
    content: [
      {
        heading: "Analytics Tools",
        text: "Tools that help you track subreddit growth and post performance.",
      },
    ],
    icon: <ListChecks className="h-10 w-10 text-blue-400" />,
  },
};

export function generateStaticParams() {
  return Object.keys(resources).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await params;
  const res = resources[slug as keyof typeof resources];
  if (!res) return {};

  return {
    title: `${res.title} - Resources | ${siteConfig.name}`,
    description: res.description,
  };
}

export default async function ResourcePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const res = resources[slug as keyof typeof resources];

  if (!res) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-300 selection:bg-[#ff4500]/30">
      <Header />

      <main className="flex flex-col items-center px-6 pt-32 pb-24">
        <div className="w-full max-w-[1000px]">
          <div className="mb-10 inline-flex items-center gap-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-300">Resources</span>
          </div>

          <div className="mb-20">
            <div className="mb-8">{res.icon}</div>
            <h1 className="mb-6 text-4xl leading-tight font-black tracking-tight text-white md:text-6xl">
              {res.title}
            </h1>
            <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-400 md:text-2xl">
              {res.description}
            </p>
          </div>

          <div className="grid gap-16">
            {res.content.map((item) => (
              <section
                key={item.heading}
                className="border-t border-white/5 pt-12 first:border-0 first:pt-0"
              >
                <h2 className="mb-6 text-2xl font-bold text-white md:text-3xl">
                  {item.heading}
                </h2>
                <p className="text-lg leading-relaxed font-medium text-zinc-400 md:text-xl">
                  {item.text}
                </p>
              </section>
            ))}
          </div>

          {/* Call to Action */}
          <div className="mt-24 rounded-[40px] border border-white/5 bg-linear-to-b from-[#1c0c0a] to-[#0a0a0a] p-12 text-center">
            <h3 className="mb-6 text-3xl font-black text-white">
              Ready to find your next idea?
            </h3>
            <p className="mx-auto mb-10 max-w-xl text-lg font-medium text-zinc-500">
              Stop guessing and start mining. Join 600+ founders using ThreddIQ
              to build products people actually want.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full rounded-2xl bg-[#ff4500] px-10 py-7 text-xl font-black text-white hover:bg-[#ff5a1a] sm:w-auto"
              >
                <Link href="/sign-up">Start Free Trial</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-2xl border-white/10 bg-transparent px-10 py-7 text-xl font-black text-white transition-colors hover:bg-white/5 sm:w-auto"
              >
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
