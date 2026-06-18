import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { siteConfig } from "@/lib/seo";
import { 
  AlertTriangle, 
  Search, 
  TrendingDown, 
  Zap, 
  ShieldAlert, 
  BarChart3, 
  DollarSign, 
  Settings2, 
  Unlock,
  Trash2,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Why SaaS Founders Can't Stop Bleeding Users | ThreddIQ Blog",
  description: "We ran our SaaS churn dataset through a structured frustration analysis—737 pieces of customer feedback, distilled into the top five reasons users actually leave.",
};

const stats = [
  { label: "Signals analyzed", value: "737", sub: "Across customer feedback" },
  { label: "Core frustrations", value: "5", sub: "All rated 7/10 severity" },
  { label: "Overall churn score", value: "33", sub: "Out of 100" },
  { label: "Urgency index", value: "65", sub: "Out of 100" },
];

const frustrations = [
  {
    title: "Navigating legal risks of cold outreach",
    severity: "7/10",
    icon: <ShieldAlert className="h-6 w-6 text-red-500" />,
    description: "Founders hitting commercial messaging walls. Compliance concerns around GDPR and CAN-SPAM make cold outreach feel like a legal minefield. High willingness to pay for a solution, existing tools are being used—but none fully solve it. TAM is undefined, scaling is the challenge.",
  },
  {
    title: "B2B SaaS sales and marketing remains difficult",
    severity: "7/10",
    icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
    description: "The B2B sales cycle is still grueling. Low-cost, low-touch CRMs struggle with enterprise complexity. Founders want contracts for long-term revenue but the tooling doesn't match the ambition. Efficiency is the unlocked opportunity.",
  },
  {
    title: "Low SaaS pricing attracts unqualified, feature-requesting leads",
    severity: "7/10",
    icon: <DollarSign className="h-6 w-6 text-green-500" />,
    description: "Pricing low doesn't just hurt margins—it attracts the wrong customers. These users churn faster, demand more, and expect custom features at commodity prices. A $200 ACV buyer behaves very differently than a $2,000 one.",
  },
  {
    title: "SaaS products lack needed customization and flexibility",
    severity: "7/10",
    icon: <Settings2 className="h-6 w-6 text-purple-500" />,
    description: "Customers are immediately requesting customizations that the product doesn't support. They're not asking for luxury—they need their unique business processes to work. Generic platforms lose to tailored workflows.",
  },
  {
    title: "SaaS cancellation processes are often intentionally difficult",
    severity: "7/10",
    icon: <Trash2 className="h-6 w-6 text-orange-500" />,
    description: "Many SaaS companies deploy dark patterns at cancellation. Multi-step processes, buried buttons, mandatory calls—users know when they're being trapped, and they tell everyone. This is the fastest way to turn churn into reputation damage.",
  },
];

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-zinc-300 selection:bg-[#ff4500]/30">
      <Header />

      <main className="mx-auto flex w-full max-w-5xl flex-col px-6 pt-32 pb-24">
        {/* Breadcrumb */}
        <div className="mb-12 flex items-center gap-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <Link href="/resources/best-subreddits-by-industry" className="transition-colors hover:text-white">
            Resources
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-white">Churn Analysis</span>
        </div>

        {/* Hero */}
        <header className="mb-20">
          <h1 className="mb-8 text-[40px] leading-tight font-black tracking-tight text-white md:text-[72px]">
            Why SaaS founders <br className="hidden md:block" />
            can&apos;t stop <span className="text-[#ff4500]">bleeding users</span>
          </h1>
          <p className="max-w-3xl text-xl leading-relaxed font-medium text-zinc-400 md:text-2xl">
            We ran our SaaS churn dataset through a structured frustration analysis—737 pieces of customer feedback, distilled into the top five reasons users actually leave. The findings are blunt. And most of them are fixable.
          </p>
        </header>

        {/* Stats Grid */}
        <section className="mb-24 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-[#0f0f0f] p-8 transition-all hover:border-[#ff4500]/20">
              <div className="absolute top-0 right-0 h-24 w-24 bg-[#ff4500]/5 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-2 text-4xl font-black text-white">{stat.value}</div>
                <div className="mb-1 text-sm font-bold text-zinc-300 uppercase tracking-wide">{stat.label}</div>
                <div className="text-[11px] font-medium text-zinc-500">{stat.sub}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Intro Body */}
        <section className="prose prose-invert prose-zinc max-w-none mb-24">
          <h2 className="mb-10 text-3xl font-black text-white md:text-4xl">The five frustrations</h2>
          <p className="text-xl font-medium text-zinc-400 leading-relaxed max-w-3xl">
            Every frustration in our analysis scored a 7 out of 10 on severity—not catastrophic, but consistently painful. That&apos;s actually more dangerous than a single 10/10 crisis. These are the slow bleeds.
          </p>
        </section>

        {/* Frustrations List */}
        <section className="mb-32 space-y-12">
          {frustrations.map((item, i) => (
            <div key={i} className="flex flex-col gap-10 md:flex-row md:items-start">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="mb-4 flex items-center gap-4">
                  <h3 className="text-2xl font-black text-white md:text-3xl">{i + 1}. {item.title}</h3>
                  <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-black text-red-500 uppercase tracking-wider">
                    <AlertTriangle className="h-3 w-3" />
                    {item.severity}
                  </span>
                </div>
                <p className="text-lg leading-relaxed font-medium text-zinc-400 md:text-xl">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Quote */}
        <div className="mb-32 border-l-4 border-[#ff4500] bg-[#0f0f0f] py-12 px-10 rounded-r-[32px]">
          <blockquote className="text-3xl font-black italic leading-tight text-white md:text-4xl">
            &ldquo;They only ask us to go. We only count the ways we made it hard for them to leave.&rdquo;
          </blockquote>
        </div>

        {/* Signal Section */}
        <section className="mb-32 grid gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-8 text-3xl font-black text-white">What the signals are really saying</h2>
            <p className="mb-10 text-lg font-medium text-zinc-400 leading-relaxed md:text-xl">
              Across all five frustrations, three underlying signals repeat themselves. Customers have high willingness to pay—they&apos;re not leaving because SaaS is too expensive. They&apos;re leaving because the experience doesn&apos;t justify the cost.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                "High willingness to pay",
                "Existing tools already in use",
                "No clear TAM leader",
                "Scaling is the gap",
                "Feature mismatch",
                "Trust erosion at cancellation"
              ].map((signal) => (
                <div key={signal} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/2 p-4 text-[13px] font-bold text-zinc-300">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ff4500]" />
                  {signal}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[40px] border border-white/5 bg-linear-to-br from-[#121212] to-[#0a0a0a] p-10 flex flex-col justify-center">
             <p className="text-lg font-medium text-zinc-400 leading-relaxed italic md:text-xl">
               &ldquo;The market isn&apos;t lacking demand. It&apos;s lacking products that grow with their customers. The founders who win are the ones who price for the customer they want, build flexibility in from day one, and make it embarrassingly easy to cancel—because customers who leave cleanly often come back.&rdquo;
             </p>
          </div>
        </section>

        {/* Pricing Trap */}
        <section className="mb-32 rounded-[48px] border border-[#ff4500]/20 bg-linear-to-b from-[#1c0c0a] to-[#0a0a0a] p-12 md:p-20">
          <div className="max-w-3xl">
            <h2 className="mb-8 text-3xl font-black text-white md:text-5xl">The B2B pricing trap</h2>
            <p className="mb-8 text-xl font-medium text-zinc-400 leading-relaxed md:text-2xl">
              Frustrations three and four are deeply linked. When you price at $200/month, you attract buyers with $200/month expectations. Those buyers then request features that would only make sense at $2,000/month.
            </p>
            <p className="text-lg font-medium text-zinc-500 leading-relaxed md:text-xl">
              Your roadmap gets pulled in a direction that serves the wrong segment—and your best-fit customers churn because the product drifted away from them. 
              <br /><br />
              Our analysis found <span className="text-white">$200 ACV</span> and <span className="text-white">$2,000 ACV</span> behavior diverging sharply. High-user accounts with many products locked into annual contracts require dedicated sales—yet most SaaS tooling treats them the same as a single-seat starter.
            </p>
          </div>
        </section>

        {/* What to do about it */}
        <section className="mb-32">
          <h2 className="mb-12 text-3xl font-black text-white md:text-5xl text-center">What to do about it</h2>
          <div className="grid gap-6 md:grid-cols-2">
             {[
               { title: "Price for your ideal customer", desc: "Not your easiest customer. High-intent users deserve premium attention." },
               { title: "Build a compliance layer", desc: "Cold outreach tooling needs built-in GDPR/CAN-SPAM safety by default." },
               { title: "Audit your cancellation flow", desc: "Like a regulator would. Then fix it. Transparency builds long-term trust." },
               { title: "Offer configurability", desc: "Focus on the contract level, not just the settings level. Workflows must adapt." },
               { title: "Separate your pipelines", desc: "Enterprise and SMB tracks need different tooling and different focus levels." }
             ].map((task, i) => (
               <div key={i} className="group relative overflow-hidden rounded-[32px] border border-white/5 bg-[#0f0f0f] p-10 transition-all hover:bg-white/5">
                 <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff4500]/10 text-[#ff4500]">
                   <CheckCircle2 className="h-6 w-6" />
                 </div>
                 <h4 className="mb-4 text-xl font-black text-white">{task.title}</h4>
                 <p className="text-[15px] font-medium text-zinc-500 leading-relaxed">{task.desc}</p>
               </div>
             ))}
          </div>
        </section>

        {/* Conclusion */}
        <section className="mb-32 py-16 text-center border-t border-white/5">
           <p className="mx-auto max-w-2xl text-xl font-medium text-zinc-400 italic md:text-2xl leading-relaxed">
             Churn isn&apos;t a product problem or a pricing problem in isolation. It&apos;s a fit problem. The companies that solve it aren&apos;t the ones with the most features—they're the ones who made every friction point feel intentional rather than accidental.
           </p>
           <div className="mt-12 text-xs font-bold text-zinc-700 uppercase tracking-widest">
             Analysis sourced from Thematic SaaS Churn research. 737 customer signals reviewed.
           </div>
        </section>

        {/* CTA */}
        <div className="relative mt-24 flex flex-col items-center overflow-hidden rounded-[48px] border-2 border-white/5 bg-[#0c0c0c] p-16 shadow-2xl">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#ff4500]/50 to-transparent opacity-50" />
          <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#ff4500]/30 bg-[#ff4500]/10">
            <Zap className="h-8 w-8 text-[#ff4500]" />
          </div>
          <h2 className="mb-6 text-center text-3xl font-extrabold text-white md:text-5xl">
            Find your high-intent <span className="text-[#ff4500]">opportunities</span>
          </h2>
          <p className="mb-12 max-w-2xl text-center text-xl leading-relaxed font-medium text-zinc-500">
            Stop guessing what customers want. Use ThreddIQ to mine Reddit for real-world pain points and build a product that retains users.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-linear-to-b from-[#ff5100] to-[#e63e00] px-12 py-7 text-xl font-black text-white shadow-xl shadow-[#ff4500]/20 transition-all hover:from-[#ff621a] hover:to-[#ff4500]"
            >
              <Link href="/sign-up">Get Started Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
