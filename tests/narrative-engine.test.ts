import { describe, it, expect } from "vitest";
import {
  generateStructuredNarrative,
  generatePainThesis,
  generateDemandPicture,
  generateTimingThesis,
  generateMoneyMath,
  generateOpportunitySignals,
  generateComprehensiveAgentPrompt,
} from "@/lib/narrative-engine";

describe("generateStructuredNarrative", () => {
  it("generates distinct, domain-specific narratives for local businesses vs developer tools", () => {
    const localStoreIdea = generateStructuredNarrative({
      id: "pain-local-1",
      title: "Board Game Group Finding Table Formation",
      body: "Independent game stores run weekly game nights where tables sit half empty.",
      subreddit: "boardgames",
      triedSolutions: ["Meetup", "Facebook Events"],
      monetizationScore: 8,
      quotes: ["I can't find a board game group even at my local game store"],
    });

    const devToolIdea = generateStructuredNarrative({
      id: "pain-dev-1",
      title: "Silent Webhook Drop and Retry Failure",
      body: "Developers lose critical Stripe events when webhook retries time out.",
      subreddit: "webdev",
      triedSolutions: ["Zapier", "Make"],
      monetizationScore: 9,
      quotes: ["Webhooks fail silently and we lose customer upgrade events"],
    });

    expect(localStoreIdea.paragraphs).toHaveLength(5);
    expect(devToolIdea.paragraphs).toHaveLength(5);

    // Ensure they do not use identical boilerplate
    expect(localStoreIdea.paragraphs[0]).toContain("r/boardgames");
    expect(localStoreIdea.paragraphs[1]).toContain("single location");
    expect(localStoreIdea.paragraphs[2]).toContain("metro area");
    expect(localStoreIdea.paragraphs[3]).toContain("Meetup");

    expect(devToolIdea.paragraphs[0]).toContain("r/webdev");
    expect(devToolIdea.paragraphs[1]).toContain("proxy");
    expect(devToolIdea.paragraphs[2]).toContain("GitHub");
    expect(devToolIdea.paragraphs[3]).toContain("Zapier");

    // Check that paragraph contents are distinct
    expect(localStoreIdea.paragraphs[0]).not.toEqual(devToolIdea.paragraphs[0]);
    expect(localStoreIdea.paragraphs[1]).not.toEqual(devToolIdea.paragraphs[1]);
  });

  it("prioritizes AI-extracted ideaNarrative when available in rawResponse or direct input", () => {
    const bespoke = {
      catalystContext: "Custom catalyst for specialized niche.",
      productMechanics: "Custom product mechanics priced at $199/mo.",
      distributionPlaybook: "Custom founder outbound to 20 vetted prospects.",
      wedgeAnalysis: "Custom wedge customer analysis.",
      revenueCeilingModel: "Custom ceiling breakdown reaching $4.5M ARR.",
    };

    const result = generateStructuredNarrative({
      id: "custom-1",
      title: "Specialized Niche",
      body: "Specialized description",
      ideaNarrative: bespoke,
    });

    expect(result.catalystContext).toBe(bespoke.catalystContext);
    expect(result.productMechanics).toBe(bespoke.productMechanics);
    expect(result.distributionPlaybook).toBe(bespoke.distributionPlaybook);
    expect(result.wedgeAnalysis).toBe(bespoke.wedgeAnalysis);
    expect(result.revenueCeilingModel).toBe(bespoke.revenueCeilingModel);
  });
});

describe("generatePainThesis", () => {
  it("generates an IdeaBrowser-style 'Why the pain scores high' thesis with 4 pain points and quotes", () => {
    const localPainThesis = generatePainThesis({
      id: "pain-bg-1",
      title: "Board Game Group Finding Table Formation",
      body: "Independent game stores run weekly game nights where tables sit half empty.",
      subreddit: "boardgames",
      triedSolutions: ["Meetup"],
      intensity: 8,
      quotes: [
        "I can't find a board game group, even my local game store",
        "Does hosting a board game night make economic sense?",
      ],
    });

    expect(localPainThesis.title).toBe("Why the pain scores high.");
    expect(localPainThesis.severityScore).toBe(8);
    expect(localPainThesis.customerContext).toContain("independent game store");
    expect(localPainThesis.customerContext).toContain("name recognition");
    expect(localPainThesis.leakageContext).toContain("goodwill model leaks");
    expect(localPainThesis.leakageContext).toContain("Meetup");
    expect(localPainThesis.painPoints).toHaveLength(4);
    expect(localPainThesis.painPoints[0].theme).toContain("Customers who go to local store sessions");
    expect(localPainThesis.quotes.length).toBeGreaterThanOrEqual(2);
  });

  it("generates domain-specific pain thesis for developer tools", () => {
    const devPainThesis = generatePainThesis({
      id: "pain-dev-2",
      title: "Silent Webhook Drop and Retry Failure",
      body: "Developers lose critical Stripe events when webhook retries time out.",
      subreddit: "webdev",
      triedSolutions: ["Zapier"],
      intensity: 9,
    });

    expect(devPainThesis.customerContext).toContain("backend engineer");
    expect(devPainThesis.leakageContext).toContain("ad-hoc retry scripts");
    expect(devPainThesis.painPoints).toHaveLength(4);
    expect(devPainThesis.painPoints[0].theme).toContain("Silent webhook drops");
  });
});

describe("generateDemandPicture", () => {
  it("generates the exact demand picture structure matching IdeaBrowser for board game store niche", () => {
    const demand = generateDemandPicture({
      id: "pain-bg-demand",
      title: "Board Game Group Finding Table Formation",
      body: "Independent game stores run weekly game nights where tables sit half empty.",
      subreddit: "boardgames",
    });

    expect(demand.headlineCategory).toBe("LOCAL PLAY SEARCHES");
    expect(demand.topSearchVolume).toBe("14.8K/mo");
    expect(demand.topSearchQuery).toContain("'board game cafe near me' US, rising 1.6x YoY");
    expect(demand.sourceUrl).toContain("trends.google.com");
    expect(demand.terms.length).toBeGreaterThanOrEqual(3);

    const meetupTerm = demand.terms.find((t) => t.term === "meetup");
    expect(meetupTerm).toBeDefined();
    expect(meetupTerm?.volume).toBe("201.0K");
    expect(meetupTerm?.growth).toBe("-18%");
    expect(meetupTerm?.cpc).toBe("$3.94");
    expect(meetupTerm?.competition).toBe("Low");
    expect(meetupTerm?.yAxisTicks).toEqual(["260k", "195k", "130k", "65k", "0"]);
    expect(meetupTerm?.chartPoints.length).toBeGreaterThanOrEqual(5);
  });

  it("generates developer infrastructure search terms for dev tools", () => {
    const demand = generateDemandPicture({
      id: "pain-dev-demand",
      title: "Silent Webhook Drop and Retry Failure",
      body: "Developers lose critical Stripe events when webhook retries time out.",
      subreddit: "webdev",
    });

    expect(demand.headlineCategory).toBe("DEV INFRASTRUCTURE SEARCHES");
    expect(demand.terms.length).toBeGreaterThanOrEqual(3);
    expect(demand.terms.some((t) => t.term.includes("webhook"))).toBe(true);
  });
});

describe("generateTimingThesis", () => {
  it("generates the exact timing case matching IdeaBrowser for board game store niche", () => {
    const timing = generateTimingThesis({
      id: "pain-bg-timing",
      title: "Board Game Group Finding Table Formation",
      body: "Independent game stores run weekly game nights where tables sit half empty.",
      subreddit: "boardgames",
      urgency: 8,
    });

    expect(timing.title).toBe("The full timing case.");
    expect(timing.headline).toBe("One owner now runs Meetup and Eventbrite");
    expect(timing.score).toBe(8);
    expect(timing.leadSummary).toContain("Bending Spoons now owns both Meetup and Eventbrite");
    expect(timing.narrativeParagraphs).toHaveLength(2);
    expect(timing.narrativeParagraphs[0]).toContain("Meetup on January 24, 2024");
    expect(timing.narrativeParagraphs[0]).toContain("Eventbrite on March 10, 2026 for about $500M");
    expect(timing.narrativeParagraphs[1]).toContain("board game cafe count worldwide grew 15%");
    expect(timing.narrativeParagraphs[1]).toContain("Gen Z put loneliness at 80%");
    expect(timing.sources.length).toBeGreaterThanOrEqual(4);
    expect(timing.sources.some((s) => s.name.includes("Meetup") || s.name.includes("Business Wire"))).toBe(true);
    expect(timing.counterCases).toHaveLength(2);
    expect(timing.counterCases[0].title).toBe("The counter case:");
    expect(timing.counterCases[0].detail).toContain("Bending Spoons could go the other way");
    expect(timing.counterCases[1].title).toBe("The other counter:");
    expect(timing.counterCases[1].detail).toContain("outbound sales window");
  });

  it("generates developer infrastructure timing thesis for dev tools", () => {
    const timing = generateTimingThesis({
      id: "pain-dev-timing",
      title: "Silent Webhook Drop and Retry Failure",
      body: "Developers lose critical Stripe events when webhook retries time out.",
      subreddit: "webdev",
      urgency: 9,
    });

    expect(timing.score).toBe(9);
    expect(timing.headline).toContain("edge runtimes");
    expect(timing.leadSummary).toContain("proxies 10x cheaper");
    expect(timing.narrativeParagraphs[0]).toContain("Zapier");
    expect(timing.narrativeParagraphs[0]).toContain("high-throughput webhook streams");
    expect(timing.sources.length).toBeGreaterThanOrEqual(3);
    expect(timing.counterCases.length).toBeGreaterThanOrEqual(2);
  });
});

describe("generateMoneyMath", () => {
  it("generates the exact napkin math and ceiling calculations for local board game store niche", () => {
    const math = generateMoneyMath({
      id: "pain-bg-math",
      title: "Board Game Group Finding Table Formation",
      body: "Independent game stores run weekly game nights where tables sit half empty.",
      subreddit: "boardgames",
    });

    expect(math.title).toBe("The money math.");
    expect(math.yearOneTitle).toBe("Year one, on a napkin");
    expect(math.yearOneItems.length).toBeGreaterThanOrEqual(8);
    expect(math.yearOneItems.some((i) => i.label.includes("Target stores in first-90-day pilot city"))).toBe(true);
    expect(math.yearOneItems.find((i) => i.label.includes("Year-one paid stores"))?.value).toBe("60");
    expect(math.yearOneItems.find((i) => i.label.includes("Year-one ARR from stores"))?.value).toBe("$79,200");
    expect(math.yearOneSummary).toContain("First-year target: 60 paying stores");

    expect(math.ceilingTitle).toContain("what $3M ARR takes");
    expect(math.ceilingItems.length).toBeGreaterThanOrEqual(8);
    expect(math.ceilingItems.some((i) => i.label.includes("Publisher campaigns/yr"))).toBe(true);
    expect(math.ceilingBadge).toBe("$3M-$6M ARR");
    expect(math.ceilingSummary).toContain("The honest ceiling combines a saturated store base");
  });

  it("generates developer infrastructure money math for dev tools", () => {
    const math = generateMoneyMath({
      id: "pain-dev-math",
      title: "Silent Webhook Drop and Retry Failure",
      body: "Developers lose critical Stripe events when webhook retries time out.",
      subreddit: "webdev",
    });

    expect(math.yearOneItems.some((i) => i.label.includes("Target engineering teams"))).toBe(true);
    expect(math.ceilingBadge).toBe("$5M-$10M ARR");
  });

  it("generates realistic metrics for B2B SaaS and sales outreach niches", () => {
    const math = generateMoneyMath({
      id: "pain-saas-math",
      title: "HubSpot Churn Alerting Tool",
      body: "B2B SaaS companies lose customer renewals due to delayed usage drop detection.",
      subreddit: "saas",
    });

    expect(math.yearOneItems.length).toBeGreaterThanOrEqual(6);
    expect(math.ceilingBadge).toMatch(/\$\d+M-\$\d+M ARR/);
  });
});

describe("generateComprehensiveAgentPrompt", () => {
  it("generates a detailed, turnkey prompt blueprint with schema, API contracts, algorithms, and roadmap", () => {
    const prompt = generateComprehensiveAgentPrompt({
      id: "pain-bg-agent",
      title: "Board Game Group Finding Table Formation",
      body: "Independent game stores run weekly game nights where tables sit half empty.",
      subreddit: "boardgames",
      monetizationScore: 8,
      triedSolutions: ["Meetup"],
      quotes: ["I can't find a board game group, even my local game store"],
    });

    expect(prompt).toContain("Principal Software Architect and Elite SaaS Builder");
    expect(prompt).toContain("1. EXECUTIVE PRODUCT SPECIFICATION & ICP");
    expect(prompt).toContain("2. THE 5-PILLAR INVESTMENT THESIS");
    expect(prompt).toContain("3. VERBATIM OPERATOR COMPLAINTS");
    expect(prompt).toContain("4. FULL-STACK TECHNICAL ARCHITECTURE & TECH STACK");
    expect(prompt).toContain("5. DATABASE SCHEMA SPECIFICATION (`lib/db/schema.ts`)");
    expect(prompt).toContain("6. REST API & SERVER ACTION CONTRACTS");
    expect(prompt).toContain("7. CORE BUSINESS LOGIC & ALGORITHMIC WORKFLOW");
    expect(prompt).toContain("8. FRONTEND UI/UX STRUCTURE & KEY COMPONENTS");
    expect(prompt).toContain("9. STEP-BY-STEP AGENT IMPLEMENTATION PLAN");

    // Check code snippets and concrete schema entities
    expect(prompt).toContain("pgTable");
    expect(prompt).toContain("game_sessions");
    expect(prompt).toContain("player_registrations");
    expect(prompt).toContain("/api/v1/sessions");
    expect(prompt).toContain("MATCHING & TABLE FORMATION ALGORITHM");
    expect(prompt).toContain("Phase 1: Database & Validation Foundation");
  });

  it("generates tailored webhook proxy and replay architecture for dev tools", () => {
    const prompt = generateComprehensiveAgentPrompt({
      id: "pain-dev-agent",
      title: "Silent Webhook Drop and Retry Failure",
      body: "Developers lose critical Stripe events when webhook retries time out.",
      subreddit: "webdev",
      monetizationScore: 9,
      triedSolutions: ["Zapier"],
    });

    expect(prompt).toContain("relayEndpoints");
    expect(prompt).toContain("webhookDeliveries");
    expect(prompt).toContain("EXPONENTIAL BACKOFF & IDEMPOTENT RELAY PIPELINE");
    expect(prompt).toContain("/api/v1/relay/[endpointId]");
  });
});

describe("generateOpportunitySignals", () => {
  it("generates whitespace, wedge strategy, and proof signals matching the reference for board game niche", () => {
    const opp = generateOpportunitySignals({
      id: "pain-bg-opp",
      title: "Board Game Group Finding Table Formation",
      body: "Independent game stores run weekly game nights where tables sit half empty.",
      subreddit: "boardgames",
    });

    expect(opp.whitespaceHeadline).toBe("Free tools own the calendar. Nobody owns the table match");
    expect(opp.wedgeDescription).toContain("Start with one store's existing audience and library");
    expect(opp.wedgeDescription).toContain("Match players by game, availability, experience");
    expect(opp.incumbentToBeat).toBe("Meetup");
    expect(opp.proofSignals.length).toBeGreaterThanOrEqual(4);
    expect(opp.proofSignals[0].text).toContain("StartPlaying.games");
    expect(opp.proofSignals[0].sourceName).toBe("VENTUREBEAT");
    expect(opp.proofSignals[1].sourceName).toBe("TTRPG INSIDER");
    expect(opp.proofSignals[2].sourceName).toBe("BUSINESS RESEARCH INSIGHTS");
    expect(opp.proofSignals[3].sourceName).toBe("IMARC GROUP");
  });

  it("generates webhook relay opportunity signals for developer tools", () => {
    const opp = generateOpportunitySignals({
      id: "pain-dev-opp",
      title: "Silent Webhook Drop and Retry Failure",
      body: "Developers lose critical Stripe events when webhook retries time out.",
      subreddit: "webdev",
    });

    expect(opp.whitespaceHeadline).toContain("webhook relay");
    expect(opp.wedgeDescription).toContain("drop-in proxy URL");
    expect(opp.incumbentToBeat).toContain("Zapier");
    expect(opp.proofSignals.length).toBeGreaterThanOrEqual(3);
    expect(opp.proofSignals[0].sourceName).toBe("STRIPE ENGINEERING");
  });
});




