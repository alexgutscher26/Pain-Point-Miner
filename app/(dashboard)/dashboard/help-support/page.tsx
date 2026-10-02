import type { Metadata } from "next";
import { HelpSupportClient } from "./help-support-client";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Get help with searches, billing, reports, and account setup.",
};

const quickActions = [
  {
    title: "Start a new search",
    description:
      "Launch another investigation and validate a new market angle in minutes.",
    href: "/dashboard/search",
    iconName: "search" as const,
    cta: "Open Search",
  },
  {
    title: "Manage billing",
    description:
      "Review plan limits, trial status, and upgrade options from one place.",
    href: "/dashboard/billing",
    iconName: "credit-card" as const,
    cta: "Open Billing",
  },
  {
    title: "Update settings",
    description:
      "Change notifications, default scan settings, and account preferences.",
    href: "/dashboard/settings",
    iconName: "settings" as const,
    cta: "Open Settings",
  },
];

const faqs = [
  {
    question: "Why can't I start a new search?",
    answer:
      "If your trial ended or your plan limit was reached, the app switches to read-only mode until a paid plan is active. Check your current quota details in Billing.",
    category: "billing" as const,
  },
  {
    question: "How do I improve report quality?",
    answer:
      "Use specific niche keywords, narrow down your subreddits whenever possible, and add custom intelligence patterns for the specific opportunity signals you care about most.",
    category: "search" as const,
  },
  {
    question: "Where do I change scan defaults?",
    answer:
      "Head to Settings to adjust your default subreddit count, minimum opportunity scoring parameters, preferred locale, and email/app notifications.",
    category: "technical" as const,
  },
  {
    question: "What should I do if a report looks stuck?",
    answer:
      "Open Reports to check the current scraper status. If a run failed or timed out, start a new search with fewer subreddits or a simpler keyword scope.",
    category: "technical" as const,
  },
  {
    question: "Is the mined data private to my workspace?",
    answer:
      "Yes. All searches, reports, and extracted insights are strictly private to your workspace and not visible to other users. You can selectively share reports if desired.",
    category: "technical" as const,
  },
  {
    question: "Can I export the opportunity reports?",
    answer:
      "Yes. From any report page, you can export raw data, download a formatted summary report, or copy a private link to share with collaborators.",
    category: "search" as const,
  },
  {
    question: "How do I update my payment method?",
    answer:
      "Navigate to the Billing tab and click 'Manage Subscription' to open the secure Stripe billing customer portal where you can update card details, download invoices, or change plans.",
    category: "billing" as const,
  },
];

export default function HelpSupportPage() {
  return <HelpSupportClient quickActions={quickActions} faqs={faqs} />;
}
