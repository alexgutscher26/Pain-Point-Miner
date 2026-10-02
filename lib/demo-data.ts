export interface DemoPainPoint {
  id: string;
  title: string;
  description: string;
  intensity: number;
  monetization: number;
  maturity: number;
  mentions: number;
  validationScore: number;
  confidenceScore: number;
  hasWillingnessToPay: boolean;
  difficulty:
    | "weekend_project"
    | "side_project"
    | "startup_mvp"
    | "vc_scale_moat";
  subreddits: string[];
  postUrl?: string;
  communityVoices: string[];
  budgetSignals?: Array<{
    quote: string;
    source: string;
    amountMinUsd?: number;
    amountMaxUsd?: number;
    annualizedMidpointUsd?: number;
  }>;
  userLanguage?: {
    overview: string;
    sections: Array<{
      label: string;
      examples: string[];
    }>;
  };
}

export interface DemoReport {
  id: string;
  title: string;
  keyword: string;
  subreddits: string[];
  miningDepth: string;
  createdAt: string;
  saved: boolean;
  category: string;
  topPainPoints: DemoPainPoint[];
  isDemo: true;
}

export const DEMO_REPORT_ID = "demo-sample-report-v1";

export const DEMO_REPORT: DemoReport = {
  id: DEMO_REPORT_ID,
  title: "AI Voice & Workflow Dispatcher for Solo Field Service Pros",
  keyword: "contractor missed calls intake answering service dispatch",
  subreddits: ["smallbusiness", "entrepreneur", "sales", "freelance"],
  miningDepth: "deep",
  createdAt: new Date().toISOString(),
  saved: true,
  category: "Product",
  isDemo: true,
  topPainPoints: [
    {
      id: "demo-pain-1",
      title:
        "After-Hours Missed Calls Costing $2.4K/mo in Lost High-Ticket Jobs",
      description:
        "Solo HVAC technicians and plumbers are under sinks or on roofs when high-ticket emergency calls hit. If the phone rings more than 4 times, the homeowner immediately calls the next contractor on Google Maps.\n\nOperators report intense frustration with traditional call centers that have zero technical context and misroute emergency requests, resulting in hundreds of dollars in wasted call center fees and thousands in lost revenue.\n\nAn AI-powered voice agent that answers instantly, asks 3 diagnostic triage questions, and automatically books emergency calendar slots with SMS confirmation solves the entire leakage point.",
      intensity: 9,
      monetization: 9,
      maturity: 3,
      mentions: 48,
      validationScore: 88,
      confidenceScore: 94,
      hasWillingnessToPay: true,
      difficulty: "startup_mvp",
      subreddits: ["smallbusiness", "entrepreneur", "sales"],
      postUrl: "https://reddit.com/r/smallbusiness",
      communityVoices: [
        "I calculated that missed calls cost me roughly $2,800 last month alone because I was on a commercial roof installation and couldn't pick up.",
        "Traditional answering services charge me $250/mo and still mess up the customer's address and basic job scope.",
        "If someone built an AI assistant that just answered like a real dispatcher and sent me a text summary with the job type, I would happily pay $99/mo.",
      ],
      budgetSignals: [
        {
          quote:
            "I'd easily pay $150 to $300 a month for something that actually captured those emergency calls cleanly.",
          source: "Reddit r/smallbusiness",
          amountMinUsd: 150,
          amountMaxUsd: 300,
          annualizedMidpointUsd: 2700,
        },
      ],
      userLanguage: {
        overview:
          "Operators talk about lost jobs in terms of 'walkaway revenue' and 'bleeding emergency leads' to competitors.",
        sections: [
          {
            label: "Trigger Phrases",
            examples: [
              "phone ringing while on a ladder",
              "lost another $500 repair job to the guy down the street",
              "answering service gave wrong address again",
            ],
          },
          {
            label: "Desired Outcome",
            examples: [
              "instant booking with deposit",
              "text summary right after call",
              "sound professional without hiring a receptionist",
            ],
          },
        ],
      },
    },
    {
      id: "demo-pain-2",
      title:
        "Bloated Incumbent Dispatch Tools Charging $120/mo Per Seat Minimums",
      description:
        "Solo operators and 2-person teams are forced to buy into enterprise platforms like ServiceTitan or Housecall Pro that require multi-seat minimums and complex onboarding.\n\nUsers repeatedly express a need for a lightweight, mobile-first dispatch tool focused strictly on automated SMS job notifications and 1-click Google Calendar sync.",
      intensity: 8,
      monetization: 7,
      maturity: 5,
      mentions: 34,
      validationScore: 78,
      confidenceScore: 89,
      hasWillingnessToPay: true,
      difficulty: "side_project",
      subreddits: ["smallbusiness", "freelance"],
      postUrl: "https://reddit.com/r/freelance",
      communityVoices: [
        "ServiceTitan wanted $300/mo minimum for features I will never use as a solo master electrician.",
        "All I need is something that pings my phone when a job comes in and syncs with my calendar.",
      ],
      budgetSignals: [
        {
          quote:
            "I just want a $29-$49/mo tool that does 1 thing well without requiring a 60-minute demo call.",
          source: "Reddit r/entrepreneur",
          amountMinUsd: 29,
          amountMaxUsd: 49,
          annualizedMidpointUsd: 468,
        },
      ],
    },
  ],
};

export function isDemoReportId(id?: string | null): boolean {
  return id === DEMO_REPORT_ID || id === "demo";
}

export function getDemoReport(): DemoReport {
  return DEMO_REPORT;
}
