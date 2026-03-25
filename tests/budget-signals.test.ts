import { describe, expect, it } from "vitest";
import {
  aggregateBudgetSignals,
  normalizeBudgetSignal,
  normalizeBudgetSignals,
  summarizeBudgetSignal,
} from "@/lib/budget-signals";

describe("budget signal normalization", () => {
  it("parses monthly willingness-to-pay quotes and annualizes them", () => {
    const signal = normalizeBudgetSignal({
      quote: 'I would pay $50/month for this today.',
      source: "comment",
    });

    expect(signal).toMatchObject({
      quote: 'I would pay $50/month for this today.',
      amountMinUsd: 50,
      amountMaxUsd: 50,
      cadence: "monthly",
      annualizedMidpointUsd: 600,
      source: "comment",
    });
  });

  it("parses budget ranges and annual cadence", () => {
    const signal = normalizeBudgetSignal({
      quote: "Our budget is $5k-$8k annually if it works.",
      source: "post",
    });

    expect(signal).toMatchObject({
      amountMinUsd: 5000,
      amountMaxUsd: 8000,
      cadence: "annual",
      annualizedMidpointUsd: 6500,
    });
  });

  it("keeps unknown cadence quotes as evidence without TAM", () => {
    const signal = normalizeBudgetSignal({
      quote: "Shut up and take my money.",
    });

    expect(signal).toMatchObject({
      cadence: "unknown",
      annualizedMidpointUsd: null,
    });
  });

  it("converts legacy string budgets into a single preserved quote", () => {
    const signals = normalizeBudgetSignals("budget of $300");

    expect(signals).toHaveLength(1);
    expect(signals[0]).toMatchObject({
      quote: "budget of $300",
      amountMinUsd: 300,
      amountMaxUsd: 300,
      cadence: "unknown",
      annualizedMidpointUsd: null,
      source: "post",
    });
  });

  it("aggregates annualized TAM across multiple signals", () => {
    const signals = normalizeBudgetSignals([
      { quote: "I'd pay $100/month", source: "comment" },
      { quote: "budget of $2,000 annually", source: "post" },
      { quote: "shut up and take my money", source: "comment" },
    ]);

    expect(aggregateBudgetSignals(signals)).toEqual({
      budgetSignalCount: 3,
      estimatedTamUsdAnnual: 3200,
    });
  });

  it("summarizes parsed signals for the report UI", () => {
    const signal = normalizeBudgetSignal({
      quote: "We'd spend $250 one-time to stop this.",
    });

    expect(signal).not.toBeNull();
    expect(summarizeBudgetSignal(signal!)).toBe("$250 one-time");
  });
});
