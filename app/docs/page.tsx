import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import {
  Search,
  Zap,
  Code,
  Key,
  LayoutDashboard,
  Database,
  Terminal,
} from "lucide-react";
import Link from "next/link";

const docSections = [
  {
    title: "Getting Started",
    icon: <Zap className="h-6 w-6 text-yellow-500" />,
    items: [
      "Quickstart Guide",
      "Setting up your first scan",
      "Interpreting mining reports",
      "Validating pain points",
    ],
  },
  {
    title: "Mining Engine",
    icon: <Database className="h-6 w-6 text-emerald-500" />,
    items: [
      "How semantic clustering works",
      "Custom problem patterns",
      "Subreddit filtering rules",
      "Depth vs Speed",
    ],
  },
  {
    title: "Intelligence & Scoring",
    icon: <Search className="h-6 w-6 text-[#ff4500]" />,
    items: [
      "Opportunity scoring explained",
      "Validation signals deep dive",
      "Desperation index tracking",
      "Willingness to pay analysis",
    ],
  },
  {
    title: "Developer Tools",
    icon: <Terminal className="h-6 w-6 text-indigo-500" />,
    items: [
      "API Documentation",
      "Integrations overview",
      "Custom webhooks",
      "Exporting raw JSON",
    ],
  },
  {
    title: "Account & Billing",
    icon: <Key className="h-6 w-6 text-amber-500" />,
    items: [
      "Subscription plans",
      "Usage limits per month",
      "Managing team workspaces",
      "Trial entitlements",
    ],
  },
  {
    title: "Dashboard Guide",
    icon: <LayoutDashboard className="h-6 w-6 text-sky-500" />,
    items: [
      "Project organization",
      "Mission control overview",
      "Saving and sharing reports",
      "Subreddit heatmap visualization",
    ],
  },
];

export const metadata: Metadata = {
  title: `Documentation - ${siteConfig.name}`,
  description:
    "Learn how to use ThreddIQ to find, validate, and build successful SaaS ideas using Reddit data.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] font-sans text-zinc-300 selection:bg-[#ff4500]/30">
      <Header />

      <main className="flex flex-col items-center px-6 pt-32 pb-24">
        <div className="w-full max-w-6xl">
          <header className="mb-20 text-center">
            <h1 className="mb-6 text-[48px] font-extrabold tracking-tight text-white md:text-[64px]">
              ThreddIQ <span className="text-[#ff4500]">Docs</span>
            </h1>
            <p className="text-xl font-medium text-zinc-400">
              Everything you need to master Reddit-driven product discovery.
            </p>
            <div className="group relative mx-auto mt-12 max-w-2xl">
              <div className="absolute inset-0 bg-[#ff4500]/10 opacity-0 blur-[30px] transition-opacity group-hover:opacity-100" />
              <div className="absolute top-1/2 left-4 -translate-y-1/2">
                <Search className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="Search documentation..."
                className="relative z-10 w-full rounded-2xl border border-white/10 bg-[#0f0f0f] px-12 py-5 text-lg font-bold text-white shadow-2xl outline-hidden transition-colors focus:border-[#ff4500]/50"
              />
            </div>
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {docSections.map((section, i) => (
              <div
                key={i}
                className="group relative flex flex-col items-start overflow-hidden rounded-[32px] border border-white/5 bg-[#0f0f0f] p-8 shadow-2xl backdrop-blur-sm transition-all hover:border-white/10 hover:bg-white/2"
              >
                <div className="mb-8 flex items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition-transform duration-500 group-hover:scale-110">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight text-[#f4f4f5]">
                    {section.title}
                  </h3>
                </div>

                <ul className="w-full flex-1 space-y-4">
                  {section.items.map((item, j) => (
                    <li key={j} className="group/item">
                      <Link
                        href="#"
                        className="group/link flex items-center justify-between rounded-xl border border-transparent p-3 transition-colors hover:border-white/5 hover:bg-white/5"
                      >
                        <span className="text-sm font-bold text-zinc-400 transition-colors group-hover/link:text-white">
                          {item}
                        </span>
                        <Zap className="h-3.5 w-3.5 -translate-x-2 text-zinc-600 opacity-0 transition-colors duration-300 group-hover/link:translate-x-0 group-hover/link:text-[#ff4500] group-hover/link:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>

                <button className="mt-8 w-full rounded-xl bg-white/5 py-3 text-xs font-black tracking-widest text-zinc-500 uppercase transition-all hover:bg-white/10 hover:text-white">
                  View All
                </button>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-col items-center justify-between gap-8 rounded-[32px] border border-[#ff4500]/10 bg-linear-to-r from-[#1c0c0a] to-[#0f0504] p-12 shadow-2xl sm:flex-row">
            <div className="flex flex-col items-start gap-2">
              <h4 className="text-2xl font-black text-white">
                Need more help?
              </h4>
              <p className="font-medium tracking-tight text-zinc-500">
                Our support team is ready to help you with any questions.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white transition-all hover:bg-white/10">
              Contact Support <Code className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
