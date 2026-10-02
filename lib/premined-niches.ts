export type NicheCategory =
  | "E-Commerce"
  | "B2B SaaS"
  | "Creator Economy"
  | "Real Estate"
  | "Agency & Services"
  | "DevTools & Tech"
  | "Healthcare & MedTech"
  | "Fintech & Billing"
  | "Legal & Compliance"
  | "Local Business & Contractors";

export type ProjectDifficulty =
  | "weekend_project"
  | "side_project"
  | "startup_mvp"
  | "vc_scale_moat";

export type PainSentiment =
  | "frustrated"
  | "desperate"
  | "angry"
  | "curious"
  | "neutral";

export interface PreminedPainPoint {
  title: string;
  body: string;
  painIntensity: number; // 1-10
  urgency: number; // 1-10
  monetizationScore: number; // 1-10
  marketMaturity: number; // 1-10
  difficulty: ProjectDifficulty;
  sentiment: PainSentiment;
  willingnessToPayQuote?: string;
  triedSolutions: string[];
  sampleQuote: string;
  sourceSubreddit: string;
  urgencyTriggers?: string[];
  featureRequested?: string;
}

export interface PreminedNiche {
  slug: string;
  title: string;
  tagline: string;
  category: NicheCategory;
  subreddits: string[];
  opportunityScore: number; // 0-100
  urgencyScore: number; // 0-100
  monetizationScore: number; // 0-100
  estimatedTam: string;
  recommendedDifficulty: ProjectDifficulty;
  marketOverview: string;
  solutionBlueprint: string;
  topPainPoints: PreminedPainPoint[];
  trendingKeywords?: string[];
  targetPersona?: string;
  suggestedPricePoint?: string;
  validationSignals?: string[];
  moatStrategy?: string;
}

export const PREMINED_NICHES: PreminedNiche[] = [
  {
    slug: "shopify-stores",
    title: "Shopify Store Operations & App Fatigue",
    tagline:
      "Merchants spending $400+/mo on 15 separate micro-apps that slow down their store and conflict with theme code.",
    category: "E-Commerce",
    subreddits: ["shopify", "ecommerce", "dropship"],
    opportunityScore: 94,
    urgencyScore: 88,
    monetizationScore: 96,
    estimatedTam: "$1.4B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "D2C Brand Owners & Shopify Plus Store Managers ($1M-$10M GMV)",
    suggestedPricePoint: "$49 - $149 / month",
    trendingKeywords: ["app stack bloat", "pagespeed shopify", "cart drawer conflict", "inventory sync delay"],
    validationSignals: [
      "Over 400 monthly Reddit threads lamenting PageSpeed score drops from multi-app script tags",
      "High willingness-to-pay ($99+/mo) for consolidated all-in-one store utility suites",
      "Black Friday inventory desync complaints causing thousands in chargebacks",
    ],
    moatStrategy: "Zero-dependency Shopify Theme App Extension with unified serverless backend caching.",
    marketOverview:
      "Shopify merchants frequently complain about 'app stacking': installing 10+ single-purpose apps (bundles, upsells, reviews, email popups, inventory alerts) that each charge $20-$50/mo, inject heavy Javascript scripts, and crash during seasonal traffic spikes.",
    solutionBlueprint:
      "An all-in-one 'Lightweight Merchant OS' Shopify app combining smart bundles, post-purchase 1-click upsells, and instant low-stock notification webhooks with zero theme code pollution.",
    topPainPoints: [
      {
        title: "Multi-App JavaScript Bloat Crushing Mobile Speed",
        body: "Merchants install 12 apps for simple features, dropping their Google PageSpeed score from 85 to 22, severely killing mobile conversion rates.",
        painIntensity: 9,
        urgency: 9,
        monetizationScore: 9,
        marketMaturity: 6,
        difficulty: "startup_mvp",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "I would easily pay $99/month for one solid suite if it let me uninstall 8 apps slowing down my site.",
        triedSolutions: [
          "PageSpeed optimization agencies",
          "App uninstalls",
          "Manual theme code hacking",
        ],
        sampleQuote:
          "Every app leaves zombie script tags even after you uninstall it. Our bounce rate doubled after adding 4 upsell plugins.",
        sourceSubreddit: "shopify",
        urgencyTriggers: ["Google Core Web Vitals penalties", "Paid ad CPA doubling on mobile"],
        featureRequested: "Unified script tag manager and embedded theme app block suite",
      },
      {
        title: "Inventory Syncing Failures Across TikTok Shop and Shopify",
        body: "Stores selling simultaneously on TikTok Shop, Amazon, and Shopify suffer frequent overselling because inventory reconciliation takes 15-30 minutes.",
        painIntensity: 8,
        urgency: 9,
        monetizationScore: 8,
        marketMaturity: 4,
        difficulty: "side_project",
        sentiment: "desperate",
        willingnessToPayQuote:
          "We had to refund $3,200 of orders on Black Friday due to laggy stock sync. Need a reliable real-time webhook sync.",
        triedSolutions: [
          "Spreadsheet exports",
          "Manual updates",
          "Expensive enterprise ERPs",
        ],
        sampleQuote:
          "TikTok Shop sold 45 units that were already sold out on Shopify. Customers are furious and leaving 1-star reviews.",
        sourceSubreddit: "ecommerce",
        urgencyTriggers: ["Stockout chargeback risk", "Account suspension on TikTok Shop"],
      },
    ],
  },
  {
    slug: "property-management",
    title: "Short-Term & Rental Property Management",
    tagline:
      "Landlords and Airbnb managers struggling with contractor scheduling, turnover cleans, and guest damage claims.",
    category: "Real Estate",
    subreddits: ["landlord", "airbnbhosts", "realestateinvesting"],
    opportunityScore: 91,
    urgencyScore: 92,
    monetizationScore: 90,
    estimatedTam: "$2.8B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "Airbnb Superhosts & Independent Landlords (3-20 Doors)",
    suggestedPricePoint: "$19 - $79 / month",
    trendingKeywords: ["cleaner no show", "airbnb turnover dispatch", "contractor receipts text", "damage claim photos"],
    validationSignals: [
      "No-show cleaners leading to immediate guest refund demands ($300-$1000/incident)",
      "Tax season panic due to disorganized SMS repair invoices from plumbers and handymen",
    ],
    moatStrategy: "GPS-verified time-stamped photo capture engine built for non-technical cleaners.",
    marketOverview:
      "Independent landlords (1-10 units) and Airbnb co-hosts are stuck between overpriced enterprise software (AppFolio, Yardi) and messy SMS/WhatsApp threads with cleaners, plumbers, and handymen.",
    solutionBlueprint:
      "A mobile-first 'Turnover & Dispatch Autopilot' that automatically schedules cleaners upon guest checkout, collects photo timestamps before/after clean, and generates one-click deposit deduction reports.",
    topPainPoints: [
      {
        title: "Cleaner No-Shows and Inconsistent Turnover Verification",
        body: "Hosts find out a cleaner didn't show up only when the next guest arrives at 4 PM to a dirty unit, resulting in automatic $300+ refunds and Airbnb penalties.",
        painIntensity: 10,
        urgency: 10,
        monetizationScore: 9,
        marketMaturity: 5,
        difficulty: "side_project",
        sentiment: "desperate",
        willingnessToPayQuote:
          "A cleaner no-show cost me a Superhost badge and $800 in lost revenue this weekend. I'd pay $25/property/mo for guaranteed GPS check-in.",
        triedSolutions: [
          "Google Calendar sharing",
          "Turno",
          "WhatsApp group chats",
        ],
        sampleQuote:
          "Guest arrived at 4pm and sent me photos of unwashed sheets. Host nightmare fuel.",
        sourceSubreddit: "airbnbhosts",
      },
      {
        title:
          "Disorganized Contractor Expense & Invoice Tracking for Tax Season",
        body: "Landlords lose thousands in deductions because contractors text photos of handwritten receipts that get lost in SMS histories.",
        painIntensity: 7,
        urgency: 6,
        monetizationScore: 8,
        marketMaturity: 7,
        difficulty: "weekend_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "Willing to spend $15/mo on a simple SMS receipt bot where contractors text a photo and it auto-assigns to the property.",
        triedSolutions: [
          "QuickBooks (too complicated)",
          "Shoebox of paper receipts",
          "Apple Notes",
        ],
        sampleQuote:
          "Spent 40 hours during tax week matching Venmo payments to specific rental unit repairs.",
        sourceSubreddit: "landlord",
      },
    ],
  },
  {
    slug: "notion-creators",
    title: "Notion Creators & Digital Product Sellers",
    tagline:
      "Template builders looking to automate license protection, update distribution, and member customer support.",
    category: "Creator Economy",
    subreddits: ["Notion", "NotionCreations", "digitalnomad"],
    opportunityScore: 87,
    urgencyScore: 80,
    monetizationScore: 84,
    estimatedTam: "$420M / year",
    recommendedDifficulty: "weekend_project",
    targetPersona: "Digital Product Creators & Notion Template Consultants",
    suggestedPricePoint: "$29 - $59 / month",
    trendingKeywords: ["notion template update without wiping", "protect notion link", "gumroad template piracy"],
    validationSignals: [
      "Creators forced to record manual Loom videos whenever formulas update",
      "Buyers unwilling to purchase new template versions due to migration dread",
    ],
    marketOverview:
      "Notion creators sell millions in templates on Gumroad/LemonSqueezy, but buyers duplicate and redistribute links illegally, and creators have no way to push bug fixes or template updates to existing buyers without them starting from scratch.",
    solutionBlueprint:
      "A 'Notion Version Sync & Protection' micro-SaaS that diffs template databases, lets creators push schema updates to customer workspaces, and provides dynamic licensed embeds.",
    topPainPoints: [
      {
        title: "Zero Ability to Push Template Updates Without Wiping User Data",
        body: "When a creator updates formulas or adds new views to a $49 template, buyers have to manually recreate all their custom records if they want the updated version.",
        painIntensity: 8,
        urgency: 7,
        monetizationScore: 8,
        marketMaturity: 3,
        difficulty: "side_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "I sell a $99 CRM template and get 50 support tickets every time Notion updates formulas. Would pay $49/mo for an automated migration tool.",
        triedSolutions: [
          "Loom video tutorials",
          "Emailing manual patch notes",
          "Doing it manually via screen share",
        ],
        sampleQuote:
          "Customers get mad when I improve the template because they can't upgrade without losing 6 months of logged data.",
        sourceSubreddit: "Notion",
      },
    ],
  },
  {
    slug: "ai-automation",
    title: "AI Automation Agencies (AAA) & Client Delivery",
    tagline:
      "Agencies building Make/n8n/LLM workflows for local businesses who face broken webhooks and hallucinated client emails.",
    category: "Agency & Services",
    subreddits: ["SideProject", "Automate", "n8n", "OpenAI"],
    opportunityScore: 95,
    urgencyScore: 94,
    monetizationScore: 92,
    estimatedTam: "$1.9B / year",
    recommendedDifficulty: "side_project",
    targetPersona: "AI Agency Founders & No-Code Automation Freelancers",
    suggestedPricePoint: "$49 - $199 / month",
    trendingKeywords: ["n8n silent fail", "make webhook dead letter", "llm client hallucination sentry", "retrying failed execution"],
    validationSignals: [
      "Agencies losing retainers over 3-day unalerted webhook disconnects",
      "LLMs outputting incorrect pricing or hallucinations in automated customer replies",
    ],
    moatStrategy: "Zero-latency webhook proxy with automated retry queues and output guardrail sentiment scoring.",
    marketOverview:
      "Thousands of new AI agencies are deploying automated chatbots, lead triage, and voice agents for dental offices, roofers, and law firms. When an API breaks or an LLM outputs wrong pricing, the agency owner gets panicked calls.",
    solutionBlueprint:
      "An 'LLM Workflow Sentry & Guardrail Hub' providing instant dead-letter alerting for n8n/Make pipelines, automated PII scrubbing, and sentiment failover routing before emails reach end clients.",
    topPainPoints: [
      {
        title: "Silent Webhook Failures In Make/Zapier Ruining Client Retainers",
        body: "A client's CRM webhook expires or payload format changes silently, causing 3 days of high-value leads to vanish into a void without alerts.",
        painIntensity: 10,
        urgency: 10,
        monetizationScore: 9,
        marketMaturity: 5,
        difficulty: "side_project",
        sentiment: "desperate",
        willingnessToPayQuote:
          "Lost a $2,500/mo retainer because an n8n node ran out of memory silently. I will pay $79/mo for robust synthetic monitoring.",
        triedSolutions: [
          "UptimeRobot",
          "Checking logs manually every morning",
          "Custom Discord webhook alerts",
        ],
        sampleQuote:
          "The client called me asking why zero calls were scheduled this week. 84 leads were stuck in error state.",
        sourceSubreddit: "n8n",
      },
    ],
  },
  {
    slug: "cold-outreach",
    title: "B2B Cold Email & Inbox Warming Deliverability",
    tagline:
      "Outbound sales teams burning new secondary domains and landing in spam due to opaque ESP reputation changes.",
    category: "B2B SaaS",
    subreddits: ["sales", "coldemail", "emailmarketing"],
    opportunityScore: 96,
    urgencyScore: 96,
    monetizationScore: 98,
    estimatedTam: "$3.5B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "Outbound SDR Leaders & Lead Gen Agency Operators",
    suggestedPricePoint: "$79 - $299 / month",
    trendingKeywords: ["google spam update 2026", "cold email dmarc error", "inbox warming spam trap", "secondary domain burnt"],
    validationSignals: [
      "Strict 2025/2026 ESP spam thresholds causing instant domain blocklisting",
      "Sales teams spending 4+ hours per client configuring DNS records manually",
    ],
    marketOverview:
      "Recent Google & Yahoo spam filtering rules have disrupted traditional mass cold email. Sales reps and lead gen agencies are constantly burning through $10 Google Workspace accounts, DNS setups, and SPF/DKIM/DMARC configurations.",
    solutionBlueprint:
      "An automated 'Burner Domain Provisioner & Inbox Health Radar' that sets up SPF/DKIM/DMARC/BIMI in 60 seconds, rotates sending pools dynamically, and detects seed spam placement within 10 minutes of sending.",
    topPainPoints: [
      {
        title: "Manual DNS Record Verification & Domain Setup Takes Hours",
        body: "Agency reps setting up 20 inboxes spend 4 hours copy-pasting SPF, DKIM, MX, and Custom Tracking Domain records across registrar consoles.",
        painIntensity: 8,
        urgency: 8,
        monetizationScore: 9,
        marketMaturity: 6,
        difficulty: "weekend_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "I'd pay $3/domain just to have a 1-click Cloudflare + Google Workspace DNS propagator.",
        triedSolutions: [
          "Manual DNS edits",
          "Google Workspace admin console",
          "Freelance VAs",
        ],
        sampleQuote:
          "One typo in the DKIM TXT record and an entire $10,000 email campaign went straight to Gmail spam.",
        sourceSubreddit: "coldemail",
      },
    ],
  },
  {
    slug: "b2b-lead-generation",
    title: "High-Intent B2B Prospecting & Signal Tracking",
    tagline:
      "Sales teams tired of stale Apollo/ZoomInfo phone numbers looking for job-change and funding intent triggers.",
    category: "B2B SaaS",
    subreddits: ["sales", "startups", "SaaS"],
    opportunityScore: 93,
    urgencyScore: 89,
    monetizationScore: 95,
    estimatedTam: "$4.1B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "B2B Account Executives & Founder-Led Sales Teams",
    suggestedPricePoint: "$99 - $399 / month",
    trendingKeywords: ["apollo outdated phone", "live intent signal", "job change alert sales", "b2b trigger scraping"],
    marketOverview:
      "Static contact databases have low response rates (under 1%). B2B SDRs want live buying signals: hiring spikes in specific departments, newly installed tech stack plugins, and LinkedIn job changes.",
    solutionBlueprint:
      "A 'Trigger-Based Account Radar' that monitors target companies for key events (hiring VP Sales, switching billing provider, Reddit complaints about incumbent) and drafts personalized outreach with verified work emails.",
    topPainPoints: [
      {
        title: "Apollo & ZoomInfo Contact Data Is 30% Outdated Bounce Rate",
        body: "Outbound SDRs suffer high email bounce rates because contact lists contain people who left their companies 6 months ago.",
        painIntensity: 9,
        urgency: 8,
        monetizationScore: 9,
        marketMaturity: 8,
        difficulty: "side_project",
        sentiment: "angry",
        willingnessToPayQuote:
          "We pay $6,000/yr for ZoomInfo and half the direct dials are disconnected. Willing to pay per verified live signal.",
        triedSolutions: [
          "NeverBounce",
          "ZeroBounce",
          "Manual LinkedIn cross-checking",
        ],
        sampleQuote:
          "My sender domain reputation got destroyed after Apollo returned 40 dead emails in one batch.",
        sourceSubreddit: "sales",
      },
    ],
  },
  {
    slug: "podcast-producers",
    title: "Podcast Post-Production & Multi-Platform Clipping",
    tagline:
      "Creators spending 8 hours per episode extracting vertical video clips, writing timestamps, and syncing show notes.",
    category: "Creator Economy",
    subreddits: ["podcasting", "YouTubers", "videography"],
    opportunityScore: 89,
    urgencyScore: 84,
    monetizationScore: 86,
    estimatedTam: "$850M / year",
    recommendedDifficulty: "side_project",
    marketOverview:
      "Podcasters know vertical shorts drive 90% of their new listeners, but manually finding viral soundbites, adding animated captions, and writing SEO show notes takes more time than recording the actual interview.",
    solutionBlueprint:
      "An automated 'Episode-to-10-Clips' engine that identifies high-energy hook moments via speech-rate analysis, generates 9:16 video clips with animated captions, and drafts platform-tailored LinkedIn posts & Spotify show notes.",
    topPainPoints: [
      {
        title: "Manual Timeline Scrubbing to Find 30-Second Hook Moments",
        body: "Editors spend 2-3 hours re-listening to a 60-minute episode to pick 3 punchy quotes that work on TikTok and YouTube Shorts.",
        painIntensity: 8,
        urgency: 7,
        monetizationScore: 8,
        marketMaturity: 7,
        difficulty: "side_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "I pay an editor $250/episode just for clips. A tool that gets 80% there for $49/mo is an instant buy.",
        triedSolutions: ["Descript", "CapCut", "Upwork editors", "Opus Clip"],
        sampleQuote:
          "Opus clip picks random boring sentences. I need context-aware hooks that actually capture the thesis of the discussion.",
        sourceSubreddit: "podcasting",
      },
    ],
  },
  {
    slug: "micro-saas-founders",
    title: "Micro-SaaS Churn & Stripe Customer Retention",
    tagline:
      "Bootstrapped founders losing 6% MRR each month to passive failed card charges and unhandled cancellation flows.",
    category: "B2B SaaS",
    subreddits: ["SaaS", "IndieHackers", "Entrepreneur"],
    opportunityScore: 92,
    urgencyScore: 91,
    monetizationScore: 94,
    estimatedTam: "$1.1B / year",
    recommendedDifficulty: "weekend_project",
    marketOverview:
      "Indie hackers focus heavily on customer acquisition but ignore churn. Failed credit cards (dunning) and lack of exit-intent survey pause options bleed $500–$5,000 MRR from growing SaaS products.",
    solutionBlueprint:
      "A lightweight 'Stripe Dunning & Cancellation Rescue' widget with smart in-app card update banners, 1-click subscription pauses, and customizable salvage discounts.",
    topPainPoints: [
      {
        title:
          "Stripe Default Smart Retries Fail to Recover 60% of Expired Cards",
        body: "Founders rely on basic Stripe email alerts which users ignore, leading to involuntary churn when cards expire or fail fraud triggers.",
        painIntensity: 8,
        urgency: 9,
        monetizationScore: 9,
        marketMaturity: 7,
        difficulty: "weekend_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "I'd happily pay a 15% recovery fee or $29/mo if you can recover just 3 customers each month.",
        triedSolutions: [
          "Stripe built-in billing emails",
          "Baremetrics Recover",
          "Manual emails to customers",
        ],
        sampleQuote:
          "Just realized we lost $1,200 MRR over 3 months simply because Stripe's emails went to the customer's accounting spam folder.",
        sourceSubreddit: "SaaS",
      },
    ],
  },
  {
    slug: "indie-game-developers",
    title: "Indie Game Marketing & Steam Wishlist Velocity",
    tagline:
      "Solo devs building great games for 2 years that launch to 50 sales due to lack of streamer outreach and press lists.",
    category: "Creator Economy",
    subreddits: ["gamedev", "indiegames", "Unity3D"],
    opportunityScore: 88,
    urgencyScore: 87,
    monetizationScore: 82,
    estimatedTam: "$620M / year",
    recommendedDifficulty: "side_project",
    marketOverview:
      "Game developers excel at programming and art but struggle with publisher marketing. Reaching out to 500 relevant Twitch/YouTube streamers playing their exact game genre is painful and tedious.",
    solutionBlueprint:
      "A 'Streamer Match & Steam Key Dispatcher' that crawls Twitch/YouTube for creators playing similar tags, tracks whether keys were activated, and calculates streamer-to-wishlist conversion.",
    topPainPoints: [
      {
        title: "Steam Key Scammers Stealing Review Copies to Resell on G2A",
        body: "Developers receive hundreds of fake curator and influencer emails impersonating real YouTubers to get free Steam keys.",
        painIntensity: 9,
        urgency: 8,
        monetizationScore: 8,
        marketMaturity: 4,
        difficulty: "weekend_project",
        sentiment: "angry",
        willingnessToPayQuote:
          "Gave away 200 keys and found them listed on reseller sites within 2 hours. Willing to pay $19/mo for verified influencer vetting.",
        triedSolutions: [
          "Keymailer",
          "Manual email domain verification",
          "Terminals.io",
        ],
        sampleQuote:
          "Check the reply-to address carefully. Scammers use subtle typos like @youtuber-business.com instead of real domains.",
        sourceSubreddit: "gamedev",
      },
    ],
  },
  {
    slug: "freelance-designers",
    title: "Freelance Client Scope Creep & Feedback Management",
    tagline:
      "UI/UX and brand designers drowning in 37 revision rounds and conflicting comments across Figma, Slack, and email.",
    category: "Agency & Services",
    subreddits: ["freelance", "web_design", "graphic_design"],
    opportunityScore: 90,
    urgencyScore: 86,
    monetizationScore: 88,
    estimatedTam: "$1.3B / year",
    recommendedDifficulty: "side_project",
    marketOverview:
      "Designers sell projects with '2 rounds of revisions included', but clients send endless unstructured feedback via voice notes, email bullets, and Slack messages, creating tension and unpaid scope creep.",
    solutionBlueprint:
      "A 'Client Sign-off & Revision Portal' that bundles design deliverables into guided review rounds where clients must formally approve or request itemized changes against the agreed scope.",
    topPainPoints: [
      {
        title:
          "Endless 'Just One Quick Change' Requests Without Budget Approval",
        body: "Clients drag 2-week projects into 3-month ordeals because there is no formal barrier between minor feedback and chargeable scope changes.",
        painIntensity: 9,
        urgency: 8,
        monetizationScore: 8,
        marketMaturity: 6,
        difficulty: "side_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "I lose at least 15 billable hours per project to scope creep. I'd pay $29/mo for an approval gate tool.",
        triedSolutions: [
          "Google Docs contracts",
          "Figma comments",
          "Email threads",
        ],
        sampleQuote:
          "Client approved the final design on Monday, then had their CEO look at it on Friday and wants the whole color scheme redone for free.",
        sourceSubreddit: "freelance",
      },
    ],
  },
  {
    slug: "gym-fitness-coaches",
    title: "Personal Trainer Client Nutrition & Habit Compliance",
    tagline:
      "Coaches using MyFitnessPal and WhatsApp losing clients to low accountability and difficult meal logging.",
    category: "Agency & Services",
    subreddits: ["personaltraining", "fitness", "bodyweightfitness"],
    opportunityScore: 88,
    urgencyScore: 83,
    monetizationScore: 85,
    estimatedTam: "$980M / year",
    recommendedDifficulty: "side_project",
    marketOverview:
      "Personal trainers can program workouts easily, but client retention is determined by diet and lifestyle compliance outside the gym. Clients hate weighing food and logging grams into MyFitnessPal every day.",
    solutionBlueprint:
      "An AI-powered 'Photo Meal Log & Daily Habit Accountability Bot' via WhatsApp/iMessage that rates meals in 5 seconds from a photo and summarizes weekly adherence directly to the coach's dashboard.",
    topPainPoints: [
      {
        title: "Clients Give Up on Calorie Tracking After Day 4",
        body: "Clients find barcode scanning and gram measuring so tedious that they stop logging, lose progress, and cancel their $200/mo training packages.",
        painIntensity: 8,
        urgency: 8,
        monetizationScore: 8,
        marketMaturity: 7,
        difficulty: "side_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "If my clients could just snap a photo on WhatsApp and I see a compliance score, I'd pay $49/mo for up to 30 clients.",
        triedSolutions: ["MyFitnessPal", "Trainerize", "Excel sheets"],
        sampleQuote:
          "Client retention is 100% tied to diet adherence, and traditional apps feel like doing homework.",
        sourceSubreddit: "personaltraining",
      },
    ],
  },
  {
    slug: "accounting-bookkeeping",
    title: "Small Business Receipt OCR & QuickBooks Matching",
    tagline:
      "Bookkeepers spending hundreds of hours chasing clients for missing vendor invoices and debit card receipt photos.",
    category: "B2B SaaS",
    subreddits: ["Bookkeeping", "tax", "smallbusiness"],
    opportunityScore: 95,
    urgencyScore: 92,
    monetizationScore: 97,
    estimatedTam: "$3.8B / year",
    recommendedDifficulty: "startup_mvp",
    marketOverview:
      "Every month-end close involves dozens of un-categorized bank feed transactions where the bookkeeper has to email the business owner: 'What was this $342 charge at Home Depot on the 14th?'",
    solutionBlueprint:
      "An 'Auto-Chaser & Instant OCR Matcher' that sends a single SMS to the business owner whenever an uncategorized bank charge occurs, allowing them to reply with a photo of the receipt to instantly reconcile.",
    topPainPoints: [
      {
        title: "Chasing Clients for 40 Missing Receipts at Month-End",
        body: "Bookkeepers waste 30% of their billable hours playing detective and waiting for clients to check their gloveboxes or email inboxes for receipts.",
        painIntensity: 9,
        urgency: 9,
        monetizationScore: 10,
        marketMaturity: 8,
        difficulty: "side_project",
        sentiment: "desperate",
        willingnessToPayQuote:
          "I manage 25 client books. A tool that automatically texts them for missing receipts would save me 20 hours a month. Worth $99/mo.",
        triedSolutions: [
          "Dext",
          "Hubdoc",
          "Shared Google Drive folders",
          "Email reminders",
        ],
        sampleQuote:
          "Clients never log into portals. If you don't catch them within 2 hours of swiping the company card, the receipt is gone forever.",
        sourceSubreddit: "Bookkeeping",
      },
    ],
  },
  {
    slug: "developer-devtools",
    title: "API Documentation Drift & SDK Synchronization",
    tagline:
      "Engineering teams whose public API docs fall out of sync with backend code releases, causing broken integrations.",
    category: "DevTools & Tech",
    subreddits: ["webdev", "programming", "devops"],
    opportunityScore: 91,
    urgencyScore: 88,
    monetizationScore: 92,
    estimatedTam: "$2.2B / year",
    recommendedDifficulty: "startup_mvp",
    marketOverview:
      "Modern tech companies ship fast CI/CD updates, but their OpenAPI / Swagger definitions and documentation code snippets frequently drift from the production API payload response format.",
    solutionBlueprint:
      "A 'CI/CD Doc Drift Inspector' that runs synthetic contract tests against pull requests, detects payload schema mismatches, and auto-generates PR updates for public docs and SDK libraries.",
    topPainPoints: [
      {
        title:
          "Broken SDK Code Examples in Documentation Causing Support Spikes",
        body: "A developer updates an endpoint property in backend Go/Node code, and 30 external integration developers file support tickets when example code fails.",
        painIntensity: 8,
        urgency: 8,
        monetizationScore: 9,
        marketMaturity: 6,
        difficulty: "side_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "Engineering time spent debugging customer integration errors due to bad docs costs us $5k/mo. Would easily pay $149/mo for automated contract verification in GitHub Actions.",
        triedSolutions: [
          "Postman collections",
          "Manual documentation reviews in PRs",
          "ReadMe.com",
        ],
        sampleQuote:
          "Nothing burns developer trust faster than copying the 'quickstart curl' command from docs and getting a 400 Bad Request.",
        sourceSubreddit: "webdev",
      },
    ],
  },
  {
    slug: "newsletter-publishers",
    title: "Newsletter Sponsorship Management & Ad Insertion",
    tagline:
      "Substack and Beehiiv writers juggling sponsorship bookings, ad copy approvals, and click tracking in messy spreadsheets.",
    category: "Creator Economy",
    subreddits: ["Newsletter", "Blogging", "content_marketing"],
    opportunityScore: 89,
    urgencyScore: 84,
    monetizationScore: 87,
    estimatedTam: "$740M / year",
    recommendedDifficulty: "side_project",
    marketOverview:
      "Independent newsletters with 5,000–50,000 subscribers monetize via sponsors, but collecting copy assets, getting sponsor sign-offs, tracking UTM clicks, and generating post-campaign performance PDF reports is completely manual.",
    solutionBlueprint:
      "A self-serve 'Newsletter Sponsor Hub' where advertisers can book open calendar slots, upload headlines & images, review live mockups, and view a live analytics dashboard post-send.",
    topPainPoints: [
      {
        title: "Manual Back-and-Forth Emailing for Sponsor Ad Copy & Assets",
        body: "Publishers spend 10+ emails per sponsor collecting logos, checking word count limits, and sending test previews before publication.",
        painIntensity: 8,
        urgency: 8,
        monetizationScore: 8,
        marketMaturity: 5,
        difficulty: "weekend_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "Managing 4 sponsors an issue takes 6 hours of admin work every week. I'd pay $39/mo for an automated self-serve booking portal.",
        triedSolutions: [
          "Calendly + Typeform",
          "Notion databases",
          "Stripe payment links",
        ],
        sampleQuote:
          "A sponsor sent their updated tracking URL 10 minutes after we hit send on 20,000 emails. Total nightmare.",
        sourceSubreddit: "Newsletter",
      },
    ],
  },
  {
    slug: "course-creators",
    title: "Online Course Completion & Student Accountability",
    tagline:
      "Course creators facing an 8% completion rate and refund requests because students lose momentum after Module 1.",
    category: "Creator Economy",
    subreddits: ["CourseCreators", "instructionaldesign", "edtech"],
    opportunityScore: 87,
    urgencyScore: 82,
    monetizationScore: 86,
    estimatedTam: "$1.5B / year",
    recommendedDifficulty: "side_project",
    marketOverview:
      "Most online courses on Kajabi or Teachable have dismal completion rates (under 10%). Creators want cohort-like accountability and automated SMS check-ins without hiring full-time community managers.",
    solutionBlueprint:
      "An automated 'Student Success & Accountability Nudge Engine' that detects when a student stalls for more than 4 days, sends dynamic AI coaching messages, and pairs students into automated study duos.",
    topPainPoints: [
      {
        title: "High Refund Rates from Students Stalling Out on Heavy Lessons",
        body: "Students buy a $499 course with high intent, get stuck on lesson 3, feel guilty, and request a 30-day money-back refund.",
        painIntensity: 8,
        urgency: 7,
        monetizationScore: 9,
        marketMaturity: 6,
        difficulty: "side_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "If a retention bot saves even 2 refunds per cohort, it pays for itself 10x over. Willing to pay $79/mo.",
        triedSolutions: [
          "Discord / Slack communities",
          "Automated email sequences",
          "Live office hours",
        ],
        sampleQuote:
          "Our completion rate went from 6% to 28% when we manually texted students, but we can't scale manual texts to 500 students.",
        sourceSubreddit: "CourseCreators",
      },
    ],
  },
  {
    slug: "medical-practices",
    title: "Private Medical & Dental Patient Intake & No-Shows",
    tagline:
      "Solo clinics and dental practices losing $80k+/yr to missed appointments and illegible paper medical history forms.",
    category: "Healthcare & MedTech",
    subreddits: ["Dentistry", "medicine", "healthIT"],
    opportunityScore: 96,
    urgencyScore: 95,
    monetizationScore: 98,
    estimatedTam: "$4.5B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "Private Practice Doctors, Dentists, & Clinic Office Managers",
    suggestedPricePoint: "$149 - $399 / month",
    trendingKeywords: ["dental patient no show fee", "hipaa intake form tablet", "ehr insurance verification delay", "unconfirmed appointments"],
    validationSignals: [
      "Average private practice loses $200 per open chair hour due to last-minute cancellations",
      "Staff spending 2.5 hours every morning calling patients to manually confirm insurance numbers",
    ],
    moatStrategy: "HIPAA-compliant zero-knowledge SMS bridge with automated insurance card OCR pre-check.",
    marketOverview:
      "Independent health clinics still rely on clipboards and manual phone call confirmations. When patients don't show up or insurance eligibility fails at the front desk, the practice absorbs full doctor downtime.",
    solutionBlueprint:
      "A 'HIPAA-Compliant Smart Waiting Room & 2-Way SMS Waitlist Filler' that verifies insurance eligibility via OCR 24h prior, collects digital signatures on mobile, and automatically blasts open cancelled slots to waitlisted patients.",
    topPainPoints: [
      {
        title: "Same-Day Cancellations Leaving Empty Doctor & Hygienist Chairs",
        body: "Patients cancel 2 hours before appointments, leaving expensive medical staff idle with zero time to manually call 30 people on a paper waiting list.",
        painIntensity: 10,
        urgency: 10,
        monetizationScore: 10,
        marketMaturity: 7,
        difficulty: "startup_mvp",
        sentiment: "desperate",
        willingnessToPayQuote:
          "Each empty dental chair costs us $250/hr. If software filled just 4 open slots a month, I'd write a $200/mo check without blinking.",
        triedSolutions: [
          "Front desk staff cold-calling waitlists",
          "Automated robocalls (patients block them)",
          "Overbooking and crowding the lobby",
        ],
        sampleQuote:
          "We had 3 cancellations on a Friday morning. That was a $1,400 direct loss in provider billings.",
        sourceSubreddit: "Dentistry",
        urgencyTriggers: ["Doctor idle wage overhead", "Clinic margin compression"],
      },
      {
        title: "Illegible Paper Intake Forms Causing Billing & Insurance Rejections",
        body: "Front desk staff spend 15 minutes typing handwritten medical history and policy numbers into the EHR, resulting in rejected claims due to typos.",
        painIntensity: 8,
        urgency: 8,
        monetizationScore: 9,
        marketMaturity: 6,
        difficulty: "side_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "We get 12 claims rejected every week just from mistyped member IDs. Need a clean mobile intake app.",
        triedSolutions: ["PDF forms sent via email", "Lobby iPads with buggy browser forms"],
        sampleQuote:
          "Half the patients write in cursive. Our biller guessed an '8' instead of a 'B' and the claim sat in pending for 45 days.",
        sourceSubreddit: "healthIT",
      },
    ],
  },
  {
    slug: "contractor-dispatch",
    title: "Field Service & HVAC Subcontractor Dispatch",
    tagline:
      "Roofing, plumbing, and HVAC owners losing $5k jobs because quotes take 48 hours and subcontractors miss appointments.",
    category: "Local Business & Contractors",
    subreddits: ["HVAC", "Plumbing", "Roofing", "Contractor"],
    opportunityScore: 93,
    urgencyScore: 94,
    monetizationScore: 95,
    estimatedTam: "$3.2B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "HVAC, Plumbing, & Roofing Business Owners (2-15 Field Techs)",
    suggestedPricePoint: "$99 - $249 / month",
    trendingKeywords: ["hvac estimate follow up", "field service text dispatch", "jobber too expensive", "contractor quote ghosting"],
    validationSignals: [
      "Homeowners award 70% of emergency HVAC/plumbing jobs to the first contractor who sends a firm itemized quote",
      "Trades owners losing track of unaccepted estimates totaling $50,000+ every month",
    ],
    moatStrategy: "Instant voice-to-estimate WhatsApp bot tailored for greasy hands on job sites.",
    marketOverview:
      "Trades contractors (HVAC, electricians, roofers) are hands-on in the field all day. They scribble measurements on cardboard boxes, forget to send quotes until Sunday night, and lose high-ticket jobs to bigger competitors with dedicated sales dispatchers.",
    solutionBlueprint:
      "A voice-first 'Job Site Voice-to-Quote & Auto-Followup SMS' tool where technicians speak job details into their phone, generating a branded digital proposal with financing options sent to the homeowner within 5 minutes.",
    topPainPoints: [
      {
        title: "Losing $8,000 System Replacement Quotes Due to 48-Hour Delay",
        body: "Technicians measure furnace specs on Wednesday, but the owner doesn't send the formal PDF quote until Friday. By then, the homeowner has signed with a same-day competitor.",
        painIntensity: 9,
        urgency: 10,
        monetizationScore: 10,
        marketMaturity: 6,
        difficulty: "startup_mvp",
        sentiment: "angry",
        willingnessToPayQuote:
          "If I can send an itemized estimate from my truck before pulling out of the driveway, that's worth $150/month easily.",
        triedSolutions: [
          "Jobber / Housecall Pro (too bulky on mobile)",
          "Paper invoice pads",
          "Typing in Word docs late at night",
        ],
        sampleQuote:
          "Called a customer with the estimate on Monday and they said: 'Sorry, the other guy emailed me a quote in 20 minutes and already did the install.'",
        sourceSubreddit: "HVAC",
      },
    ],
  },
  {
    slug: "compliance-contract-review",
    title: "B2B Vendor Contract Redlining & SOC2 Evidence",
    tagline:
      "Growth-stage SaaS founders spending $600/hr on external lawyers for routine customer master services agreements (MSAs).",
    category: "Legal & Compliance",
    subreddits: ["startups", "SaaS", "legaladviceofftopic"],
    opportunityScore: 92,
    urgencyScore: 90,
    monetizationScore: 96,
    estimatedTam: "$2.6B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "B2B SaaS Founders, VP Sales, & In-House Legal Operations",
    suggestedPricePoint: "$199 - $599 / month",
    trendingKeywords: ["msa redline delay sales", "indemnification clause saas", "soc2 vendor assessment fatigue", "enterprise legal review bottleneck"],
    validationSignals: [
      "Enterprise deals stalled in legal procurement for 6-8 weeks over standard liability cap clauses",
      "Startups spending $10k+ quarterly on outside counsel for simple NDA and MSA redlines",
    ],
    marketOverview:
      "When a startup closes enterprise customers, the buyer's procurement team sends a 40-page contract redline. Founders either pay $600/hr to outside law firms or blindly sign aggressive unlimited liability and warranty clauses.",
    solutionBlueprint:
      "A domain-specific 'SaaS Contract Copilot & Redline Guardrail' that flags non-standard indemnity terms against market standards, suggests pre-approved fallback clauses, and generates side-by-side risk scorecards in seconds.",
    topPainPoints: [
      {
        title: "Enterprise Deal Stalled 6 Weeks Over Routine MSA Redlines",
        body: "A $50k ARR customer contract is held hostage in procurement review because the legal team demands uncapped liability and custom IP indemnification.",
        painIntensity: 9,
        urgency: 9,
        monetizationScore: 10,
        marketMaturity: 5,
        difficulty: "startup_mvp",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "Outside legal counsel billed us $4,200 just to mark up one customer contract. A software tool that flags high-risk clauses is worth $300/mo.",
        triedSolutions: [
          "Manual reading line-by-line",
          "Generic ChatGPT (misses jurisdictional nuance)",
          "Outside corporate lawyers",
        ],
        sampleQuote:
          "Our quarterly revenue target slipped into next quarter because procurement was arguing over Section 11.4 for 38 days.",
        sourceSubreddit: "SaaS",
      },
    ],
  },
  {
    slug: "freelance-finances",
    title: "Cross-Border Freelance Multi-Currency Invoicing",
    tagline:
      "International consultants and remote contractors losing 5-8% on hidden bank FX spreads and delayed SWIFT wires.",
    category: "Fintech & Billing",
    subreddits: ["digitalnomad", "freelance", "personalfinance"],
    opportunityScore: 91,
    urgencyScore: 89,
    monetizationScore: 93,
    estimatedTam: "$1.8B / year",
    recommendedDifficulty: "side_project",
    targetPersona: "Global Remote Freelancers, Agencies, & Digital Nomads",
    suggestedPricePoint: "$19 - $49 / month",
    trendingKeywords: ["wise business fee hike", "swift wire missing 2 weeks", "freelance tax cross border withholding", "client wont pay international wire"],
    validationSignals: [
      "Contractors losing $300-$800 per invoice to intermediary correspondent banking fees",
      "Clients refusing to pay invoices that require international wire fees",
    ],
    marketOverview:
      "Freelancers working with international clients face high wire fees ($45 per wire), 3-5% currency conversion markups, and delayed payment reconciliations across Stripe, PayPal, and Wise.",
    solutionBlueprint:
      "A 'Local Currency Invoice Portal' providing localized virtual IBAN/ACH deposit routing, automated payment tracking, and one-click W-8BEN compliance certificate generation.",
    topPainPoints: [
      {
        title: "Intermediary Banks Taking $50 Unexplained Deductions on SWIFT Wires",
        body: "A freelancer bills $3,000 to a US client, but receives only $2,870 in their local European or Asian account due to opaque intermediary correspondent bank charges.",
        painIntensity: 8,
        urgency: 8,
        monetizationScore: 9,
        marketMaturity: 7,
        difficulty: "side_project",
        sentiment: "angry",
        willingnessToPayQuote:
          "I lose $250 every month to wire fees and bad FX rates. I would pay $20/mo for a tool that gives clients a native domestic ACH account.",
        triedSolutions: ["PayPal (horrible 4% FX fee)", "Direct wire transfers", "Wise Personal"],
        sampleQuote:
          "Neither my bank nor the client's bank can tell me where the missing $65 went during the wire transfer.",
        sourceSubreddit: "digitalnomad",
      },
    ],
  },
  {
    slug: "ai-code-auditing",
    title: "AI-Generated Code Vulnerability & Dependency Hygiene",
    tagline:
      "Software teams merging thousands of lines of Cursor/Copilot code containing hallucinated npm packages and license leaks.",
    category: "DevTools & Tech",
    subreddits: ["programming", "devops", "netsec", "node"],
    opportunityScore: 94,
    urgencyScore: 92,
    monetizationScore: 95,
    estimatedTam: "$2.9B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "Engineering Managers, Tech Leads, & AppSec Engineers",
    suggestedPricePoint: "$79 - $299 / month",
    trendingKeywords: ["hallucinated package attack", "cursor ai security scan", "ai code hallucinated library", "npm typo squatting ai"],
    validationSignals: [
      "Security researchers demonstrating hallucinated package takeovers across LLM coding assistants",
      "Tech leads overwhelmed by massive PR diffs generated by junior devs using AI tools",
    ],
    moatStrategy: "Deterministic AST scanner cross-referencing public package registries and copyleft licenses.",
    marketOverview:
      "Developers are shipping code 3x faster with AI assistants, but LLMs regularly import non-existent packages (slingshot attacks), hardcode secrets, and pull in copyleft GPL code into proprietary codebases.",
    solutionBlueprint:
      "A 'PR Sentinel for AI Code' that runs in GitHub Actions, verifies every imported package exists and was published >30 days ago, detects subtle auth bypasses, and enforces strict architecture guidelines.",
    topPainPoints: [
      {
        title: "AI Suggesting Hallucinated Package Names Vulnerable to Hijacking",
        body: "An engineer copies an AI-generated snippet containing `import { secureJwt } from 'express-jwt-safe-v2'` which doesn't exist yet, opening a supply-chain attack vector.",
        painIntensity: 9,
        urgency: 9,
        monetizationScore: 10,
        marketMaturity: 4,
        difficulty: "startup_mvp",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "One supply-chain compromise would kill our enterprise SOC2 audit. We would pay $199/month for instant PR blocking of hallucinated packages.",
        triedSolutions: ["Snyk (doesn't catch hallucinated imports)", "Manual PR code review"],
        sampleQuote:
          "Found a junior dev merged an AI-suggested helper library that someone registered on npm 2 hours earlier. Terrifying.",
        sourceSubreddit: "netsec",
      },
    ],
  },
  {
    slug: "ecom-returns-logistics",
    title: "E-Commerce Return Logistics & Restocking Dispute Management",
    tagline:
      "Online apparel and electronics retailers losing 20% margin to 'wardrobing' return fraud and chaotic warehouse RMA processing.",
    category: "E-Commerce",
    subreddits: ["ecommerce", "shopify", "FulfillmentByAmazon"],
    opportunityScore: 93,
    urgencyScore: 91,
    monetizationScore: 94,
    estimatedTam: "$3.7B / year",
    recommendedDifficulty: "startup_mvp",
    targetPersona: "E-Commerce Founders & Operations Directors ($2M-$20M GMV)",
    suggestedPricePoint: "$129 - $399 / month",
    trendingKeywords: ["return fraud wardrobing", "loop returns too expensive", "restocking fee dispute chargeback", "rma warehouse barcode"],
    marketOverview:
      "Return rates in online retail are at an all-time high (25-35%). Small brands lose thousands when customers return empty boxes, worn garments, or claim items never arrived while Loop Returns charges high enterprise fees.",
    solutionBlueprint:
      "A 'Fraud-Shield Return Portal' that grades customer return history, requires photo verification for high-value items, automatically offers store credit bonuses instead of cash refunds, and prints dynamic warehouse scan labels.",
    topPainPoints: [
      {
        title: "Serial Returners Abusing Free Returns & Wardrobing Products",
        body: "Shoppers buy 5 designer dresses for a Saturday wedding and return all 5 on Monday with tags cut or makeup stains, leaving the merchant with unsellable inventory.",
        painIntensity: 9,
        urgency: 9,
        monetizationScore: 9,
        marketMaturity: 7,
        difficulty: "startup_mvp",
        sentiment: "angry",
        willingnessToPayQuote:
          "We lose $60,000/year to return fraud. A tool that stops serial offenders and converts 30% of returns to gift cards is worth $250/mo.",
        triedSolutions: ["Manual return email approvals", "Loop Returns (expensive)", "No-returns policy (kills conversion)"],
        sampleQuote:
          "Customer returned a box with a bottle of water inside to match the shipping weight and Shopify auto-refunded them $400.",
        sourceSubreddit: "ecommerce",
      },
    ],
  },
  {
    slug: "youtube-sponsorships",
    title: "YouTube Creator Sponsorship CRM & Ad Cue Optimization",
    tagline:
      "Video creators with 50k-500k subscribers losing $15k per month in un-monetized mid-rolls and chaotic sponsor contracts.",
    category: "Creator Economy",
    subreddits: ["YouTubers", "PartneredYoutube", "videography"],
    opportunityScore: 90,
    urgencyScore: 86,
    monetizationScore: 91,
    estimatedTam: "$920M / year",
    recommendedDifficulty: "side_project",
    targetPersona: "Full-Time YouTubers & Channel Production Managers",
    suggestedPricePoint: "$39 - $99 / month",
    trendingKeywords: ["sponsor cpm calculator youtube", "agency taking 30% cut", "mid roll ad placement retention", "youtube contract redline"],
    marketOverview:
      "Mid-sized YouTubers receive dozens of shady inbound brand deal emails daily. They don't know their fair market CPM rate, let talent agencies take 30% cuts, and manually calculate mid-roll timestamps where viewer drop-off is lowest.",
    solutionBlueprint:
      "A dedicated 'Creator Brand Deal Desk' that parses sponsor inbound pitches, calculates fair dynamic CPMs based on 30-day median views, provides boilerplate video insertion agreements, and recommends exact retention valleys for ad placement.",
    topPainPoints: [
      {
        title: "Under-Pricing Channel Sponsorships Due to Opaque Market Rates",
        body: "A YouTuber with 100k views per video signs a flat $1,000 sponsor deal, unaware that industry CPM for their tech niche is $35 ($3,500 value).",
        painIntensity: 8,
        urgency: 8,
        monetizationScore: 9,
        marketMaturity: 4,
        difficulty: "weekend_project",
        sentiment: "frustrated",
        willingnessToPayQuote:
          "I left $10k on the table last year because I didn't know how to negotiate with brands. Would pay $49/mo for an automated rate card calculator.",
        triedSolutions: ["Asking other creators in Discord", "Talent management agencies", "Guessing"],
        sampleQuote:
          "Sponsor accepted my $800 quote in 4 minutes flat. That's when I knew I massively undercharged them.",
        sourceSubreddit: "PartneredYoutube",
      },
    ],
  },
];

/**
 * Find a premined niche by slug.
 */
export function getPreminedNiche(slug: string): PreminedNiche | undefined {
  return PREMINED_NICHES.find((n) => n.slug === slug);
}

/**
 * Get all available premined niches.
 */
export function getAllPreminedNiches(): PreminedNiche[] {
  return PREMINED_NICHES;
}

/**
 * Filter niches by category.
 */
export function getPreminedNichesByCategory(
  category: NicheCategory,
): PreminedNiche[] {
  return PREMINED_NICHES.filter((n) => n.category === category);
}

/**
 * Filter niches by project difficulty.
 */
export function getPreminedNichesByDifficulty(
  difficulty: ProjectDifficulty,
): PreminedNiche[] {
  return PREMINED_NICHES.filter((n) => n.recommendedDifficulty === difficulty);
}

/**
 * Search niches by keyword across title, tagline, subreddits, category, and pain points.
 */
export function searchPreminedNiches(query: string): PreminedNiche[] {
  const q = query.toLowerCase().trim();
  if (!q) return PREMINED_NICHES;

  return PREMINED_NICHES.filter((niche) => {
    if (niche.title.toLowerCase().includes(q)) return true;
    if (niche.tagline.toLowerCase().includes(q)) return true;
    if (niche.category.toLowerCase().includes(q)) return true;
    if (niche.subreddits.some((s) => s.toLowerCase().includes(q))) return true;
    if (niche.trendingKeywords?.some((k) => k.toLowerCase().includes(q))) return true;
    if (niche.targetPersona?.toLowerCase().includes(q)) return true;
    if (
      niche.topPainPoints.some(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.sampleQuote.toLowerCase().includes(q),
      )
    ) {
      return true;
    }
    return false;
  });
}

/**
 * Get the top opportunity niches ordered by opportunityScore descending.
 */
export function getTopOpportunityNiches(limit = 6): PreminedNiche[] {
  return [...PREMINED_NICHES]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, Math.max(1, limit));
}

/**
 * Get related niches sharing category or similar subreddits.
 */
export function getRelatedNiches(slug: string, limit = 3): PreminedNiche[] {
  const current = getPreminedNiche(slug);
  if (!current) return [];

  return PREMINED_NICHES.filter((n) => n.slug !== slug)
    .map((n) => {
      let score = 0;
      if (n.category === current.category) score += 5;
      const sharedSubs = n.subreddits.filter((s) =>
        current.subreddits.includes(s),
      ).length;
      score += sharedSubs * 3;
      if (n.recommendedDifficulty === current.recommendedDifficulty) score += 2;
      return { niche: n, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit))
    .map((item) => item.niche);
}

/**
 * Get aggregate statistics across the entire premined intelligence library.
 */
export function getPreminedNicheStats(): {
  totalNiches: number;
  totalPainPoints: number;
  averageOpportunityScore: number;
  averageUrgencyScore: number;
  categories: Record<string, number>;
} {
  const totalNiches = PREMINED_NICHES.length;
  const totalPainPoints = PREMINED_NICHES.reduce(
    (acc, n) => acc + n.topPainPoints.length,
    0,
  );
  const totalOppScore = PREMINED_NICHES.reduce(
    (acc, n) => acc + n.opportunityScore,
    0,
  );
  const totalUrgScore = PREMINED_NICHES.reduce(
    (acc, n) => acc + n.urgencyScore,
    0,
  );

  const categories: Record<string, number> = {};
  for (const n of PREMINED_NICHES) {
    categories[n.category] = (categories[n.category] ?? 0) + 1;
  }

  return {
    totalNiches,
    totalPainPoints,
    averageOpportunityScore: totalNiches > 0 ? Math.round(totalOppScore / totalNiches) : 0,
    averageUrgencyScore: totalNiches > 0 ? Math.round(totalUrgScore / totalNiches) : 0,
    categories,
  };
}
