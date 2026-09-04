import { type MiningDepth } from "@/lib/mining-presets";
import { type TimeWindow } from "@/lib/time-window";

export interface ScanPreset {
  id: string;
  name: string;
  category: "saas" | "developer" | "ecommerce" | "ai" | "creator" | "service";
  tagline: string;
  description: string;
  keyword: string;
  subreddits: string[];
  miningDepth: MiningDepth;
  timeWindow: TimeWindow;
  customPatterns?: string[];
  estimatedCredits: number;
}

export const SCAN_PRESETS: ScanPreset[] = [
  {
    id: "saas-churn-onboarding",
    name: "SaaS Tools & Micro-SaaS",
    category: "saas",
    tagline: "Uncover customer onboarding friction and cancellation drivers",
    description:
      "Scans founder and business communities for complaints about tool fatigue, clunky onboarding, and missing integrations.",
    keyword: "churn cancel onboarding clunky expensive alternative",
    subreddits: ["saas", "startups", "entrepreneur", "smallbusiness"],
    miningDepth: "deep",
    timeWindow: "90d",
    customPatterns: [
      "cancelled my subscription",
      "looking for an alternative to",
      "too expensive for small teams",
      "switched away from",
    ],
    estimatedCredits: 2,
  },
  {
    id: "developer-infrastructure",
    name: "Developer Tools & CI/CD",
    category: "developer",
    tagline:
      "Find painful developer workflow bottlenecks and build frustrations",
    description:
      "Mines engineering channels for issues with flaky tests, slow builds, complex Docker configs, and API rate limiting.",
    keyword: "ci cd flaky tests build slow docker deploy api rate limit",
    subreddits: ["webdev", "devops", "programming", "reactjs", "node"],
    miningDepth: "deep",
    timeWindow: "90d",
    customPatterns: [
      "hate debugging",
      "took 3 hours to deploy",
      "broken in production",
      "maintenance nightmare",
    ],
    estimatedCredits: 2,
  },
  {
    id: "ecommerce-logistics",
    name: "E-Commerce & 3PL Logistics",
    category: "ecommerce",
    tagline:
      "Discover store owner struggles with inventory, returns, and fulfillment",
    description:
      "Analyzes Shopify and online retail discussions for painful returns processes, stockouts, and shipping carrier disputes.",
    keyword: "returns inventory stockout 3pl fulfillment lost package supplier",
    subreddits: ["ecommerce", "shopify", "dropship", "amazonfba"],
    miningDepth: "deep",
    timeWindow: "90d",
    customPatterns: [
      "lost money on returns",
      "chargeback fraud",
      "inventory sync issue",
      "damaged in transit",
    ],
    estimatedCredits: 2,
  },
  {
    id: "ai-intake-automation",
    name: "AI Agents & Voice Intake",
    category: "ai",
    tagline:
      "Explore opportunities for automated lead capture and voice dispatch",
    description:
      "Captures service business complaints about missed customer calls, manual scheduling overhead, and slow intake responses.",
    keyword:
      "missed call customer intake answering service scheduling receptionist",
    subreddits: ["smallbusiness", "sales", "entrepreneur", "freelance"],
    miningDepth: "deep",
    timeWindow: "90d",
    customPatterns: [
      "lost a client because",
      "answering calls while working",
      "need automated booking",
      "after hours inquiries",
    ],
    estimatedCredits: 2,
  },
  {
    id: "creator-video-workflows",
    name: "Content Creators & Media",
    category: "creator",
    tagline:
      "Spot friction in video editing, asset management, and sponsorships",
    description:
      "Tracks creator subreddits for bottlenecks with thumbnail testing, sponsor deliverables, and rendering speeds.",
    keyword: "editing render thumbnail sponsor contract audio sync clipping",
    subreddits: ["youtubers", "podcasting", "videography", "contentcreation"],
    miningDepth: "deep",
    timeWindow: "90d",
    customPatterns: [
      "takes too long to edit",
      "sponsor didn't pay",
      "copyright strike",
      "audio clean up issue",
    ],
    estimatedCredits: 2,
  },
  {
    id: "realestate-property-management",
    name: "Real Estate & Landlord Ops",
    category: "service",
    tagline:
      "Unearth landlord pain points with rent collection and contractor dispatch",
    description:
      "Mines property investor communities for complaints about maintenance request delays, tenant screening, and lease paperwork.",
    keyword: "tenant maintenance rent collection lease contractor repair",
    subreddits: ["realestateinvesting", "landlord", "propertymanagement"],
    miningDepth: "deep",
    timeWindow: "90d",
    customPatterns: [
      "tenant stopped paying",
      "contractor overcharged",
      "emergency plumbing call",
      "lost keys lockbox",
    ],
    estimatedCredits: 2,
  },
];

export function getScanPresetById(id: string): ScanPreset | undefined {
  return SCAN_PRESETS.find((p) => p.id === id);
}
