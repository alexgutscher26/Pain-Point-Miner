"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  MessageSquareWarning,
  Search,
  Settings,
  ChevronDown,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  iconName: "search" | "credit-card" | "settings";
  cta: string;
}

interface Faq {
  question: string;
  answer: string;
  category: "search" | "billing" | "technical";
}

interface HelpSupportClientProps {
  quickActions: QuickAction[];
  faqs: Faq[];
}

const iconMap = {
  search: Search,
  "credit-card": CreditCard,
  settings: Settings,
};

export function HelpSupportClient({ quickActions, faqs }: HelpSupportClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Categories definition
  const categories = [
    { id: "all", label: "All Topics" },
    { id: "search", label: "Search & Mining" },
    { id: "billing", label: "Billing & Account" },
    { id: "technical", label: "Technical & Status" },
  ];

  // Filter FAQs based on query and active category
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqs, activeCategory, searchQuery]);

  // Count matches per category for pill indicators
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: 0, search: 0, billing: 0, technical: 0 };
    faqs.forEach((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

      if (matchesSearch) {
        counts.all += 1;
        counts[faq.category] += 1;
      }
    });
    return counts;
  }, [faqs, searchQuery]);

  const handleToggleFaq = (question: string) => {
    if (expandedFaq === question) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(question);
    }
  };

  const handleSuggestSearch = (term: string) => {
    setSearchQuery(term);
    setActiveCategory("all");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4500] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ff4500]"></span>
            </span>
            <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#ff4500] uppercase">
              Help Desk
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-955">
            Help & Support
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-zinc-550">
            Find quick answers to common questions, view troubleshooting checklists, or manage your subscription preferences.
          </p>
        </div>
      </div>

      {/* Main Grid: Search & Actions + Sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          
          <section className="grid gap-4 sm:grid-cols-3">
            {quickActions.map(({ title, description, href, iconName, cta }) => {
              const Icon = iconMap[iconName];
              return (
                <Link
                  key={href}
                  href={href}
                  className="group glass-card glass-card-hover flex flex-col justify-between p-6 rounded-2xl cursor-pointer"
                >
                  <div>
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#ff4500]/15 bg-[#ff4500]/5 text-[#ff4500] transition-colors duration-300 group-hover:bg-[#ff4500] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-900 group-hover:text-[#ff4500] transition-colors">
                      {title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      {description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-widest text-[#ff4500] uppercase">
                    {cta}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </section>

          {/* Interactive Search Section */}
          <section className="glass-card p-6 sm:p-8 rounded-2xl space-y-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2.5">
                <HelpCircle className="h-5 w-5 text-[#ff4500]" />
                Browse FAQs
              </h3>
              
              {/* Search input with icons */}
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search questions, settings, plan details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-black/[0.06] bg-white/70 py-3.5 pr-12 pl-12 font-sans text-sm text-zinc-900 outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-[#ff4500]/30 focus:bg-white focus:ring-4 focus:ring-[#ff4500]/5"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-650"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="font-medium">Suggestions:</span>
                {["limit", "scoring weights", "stuck scan"].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSuggestSearch(term)}
                    className="cursor-pointer rounded-full border border-black/[0.04] bg-white/40 px-2.5 py-0.5 transition-colors hover:border-[#ff4500]/20 hover:bg-[#ff4500]/5 hover:text-[#ff4500]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Category tabs */}
            <div className="border-b border-black/[0.04] pb-2">
              <div className="flex flex-wrap gap-2">
                {categories.map(({ id, label }) => {
                  const count = categoryCounts[id] || 0;
                  const isActive = activeCategory === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveCategory(id)}
                      className={`cursor-pointer rounded-full px-4 py-2 font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-300 ${
                        isActive
                          ? "bg-[#ff4500] text-white shadow-xs"
                          : "bg-white/40 text-zinc-550 border border-black/[0.04] hover:bg-white hover:text-zinc-800"
                      }`}
                    >
                      {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accordion FAQ List */}
            <div className="divide-y divide-black/[0.04]">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isOpen = expandedFaq === faq.question;
                  return (
                    <div key={faq.question} className="py-4.5 first:pt-0 last:pb-0">
                      <button
                        onClick={() => handleToggleFaq(faq.question)}
                        className="flex w-full cursor-pointer items-start justify-between text-left gap-4 group"
                      >
                        <span className="text-[14px] font-extrabold text-zinc-900 transition-colors group-hover:text-[#ff4500]">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-[#ff4500]" : "group-hover:text-zinc-650"
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen ? "grid-rows-[1fr] opacity-100 mt-2.5" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="text-[13px] leading-relaxed text-zinc-550 font-medium">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-zinc-400">
                    No matching questions found in this category.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                    className="mt-3 cursor-pointer text-xs font-semibold text-[#ff4500] hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar panels */}
        <aside className="space-y-6">
          
          {/* Support Checklist */}
          <section className="glass-card p-6 rounded-2xl space-y-6">
            <h3 className="flex items-center gap-2.5 text-base font-extrabold text-zinc-900 border-b border-black/[0.04] pb-4">
              <LifeBuoy className="h-4.5 w-4.5 text-[#ff4500]" />
              Support Checklist
            </h3>
            <div className="space-y-4">
              <div className="relative pl-6">
                <div className="absolute top-1 left-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4500]/10 font-mono text-[9px] font-bold text-[#ff4500]">
                  1
                </div>
                <h4 className="text-xs font-extrabold text-zinc-900">Double Check Scope</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  Verify your keyword limits, active filters, and scan depth parameters.
                </p>
              </div>

              <div className="relative pl-6">
                <div className="absolute top-1 left-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4500]/10 font-mono text-[9px] font-bold text-[#ff4500]">
                  2
                </div>
                <h4 className="text-xs font-extrabold text-zinc-900">Check Subscription Limits</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  Ensure you have enough remaining scans on your monthly quota.
                </p>
              </div>

              <div className="relative pl-6">
                <div className="absolute top-1 left-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4500]/10 font-mono text-[9px] font-bold text-[#ff4500]">
                  3
                </div>
                <h4 className="text-xs font-extrabold text-zinc-900">Review Error Status</h4>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                  Check status logs in Reports for explicit scraper warning details.
                </p>
              </div>
            </div>
          </section>

          {/* Need Deeper Troubleshooting? */}
          <section className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="pointer-events-none absolute top-0 right-0 h-16 w-16 rounded-full bg-[#ff4500] opacity-[0.02] blur-[24px]"></div>
            
            <h3 className="flex items-center gap-2.5 text-base font-extrabold text-zinc-900">
              <MessageSquareWarning className="h-4.5 w-4.5 text-[#ff4500]" />
              Need Help Mined?
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-zinc-500">
              Check the detailed execution logs of your runs. Most issues are related to narrow subreddits or generic query scopes.
            </p>
            <div className="mt-6 flex gap-2">
              <Link
                href="/dashboard/reports"
                className="flex flex-1 items-center justify-center gap-2 bg-[#ff4500] hover:bg-[#e03d00] py-2.5 rounded-full font-mono text-[11px] font-bold tracking-wider text-white uppercase transition-colors shadow-xs"
              >
                Open Reports
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
