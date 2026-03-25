export type BudgetCadence = "one_time" | "monthly" | "annual" | "unknown";

export type BudgetSignalSource = "post" | "comment";

export type BudgetSignal = {
  quote: string;
  amountMinUsd: number | null;
  amountMaxUsd: number | null;
  cadence: BudgetCadence;
  annualizedMidpointUsd: number | null;
  source: BudgetSignalSource;
};

type RawBudgetSignal = Partial<BudgetSignal> & {
  quote?: unknown;
  amountMinUsd?: unknown;
  amountMaxUsd?: unknown;
  cadence?: unknown;
  annualizedMidpointUsd?: unknown;
  source?: unknown;
};

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeMoneyToken(token: string) {
  const normalized = token.replace(/[$,\s]/g, "").toLowerCase();
  const match = normalized.match(/^(\d+(?:\.\d+)?)(k)?$/i);
  if (!match) {
    return null;
  }

  const base = Number(match[1]);
  if (!Number.isFinite(base)) {
    return null;
  }

  return match[2] ? Math.round(base * 1_000) : Math.round(base);
}

function inferCadence(
  quote: string,
  hintedCadence?: BudgetCadence,
): BudgetCadence {
  if (
    hintedCadence === "one_time" ||
    hintedCadence === "monthly" ||
    hintedCadence === "annual"
  ) {
    return hintedCadence;
  }

  const normalized = quote.toLowerCase();
  if (/\b(per month|\/month|monthly|mo\b|mrr\b)\b/.test(normalized)) {
    return "monthly";
  }

  if (/\b(per year|\/year|annually|annual|yearly|arr\b)\b/.test(normalized)) {
    return "annual";
  }

  if (/\b(one[- ]time|once|upfront|setup fee)\b/.test(normalized)) {
    return "one_time";
  }

  return "unknown";
}

function parseAmountsFromQuote(quote: string) {
  const rangeMatch = quote.match(
    /\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?(?:k)?)\s*(?:-|to|and)\s*\$?\s*(\d+(?:,\d{3})*(?:\.\d+)?(?:k)?)/i,
  );
  if (rangeMatch) {
    const first = normalizeMoneyToken(rangeMatch[1]);
    const second = normalizeMoneyToken(rangeMatch[2]);
    if (first !== null && second !== null) {
      return {
        amountMinUsd: Math.min(first, second),
        amountMaxUsd: Math.max(first, second),
      };
    }
  }

  const amountMatches = Array.from(
    quote.matchAll(/\$\s*(\d+(?:,\d{3})*(?:\.\d+)?(?:k)?)/gi),
  )
    .map((match) => normalizeMoneyToken(match[1]))
    .filter((value): value is number => value !== null);

  if (amountMatches.length === 0) {
    return {
      amountMinUsd: null,
      amountMaxUsd: null,
    };
  }

  const sorted = amountMatches.sort((left, right) => left - right);
  return {
    amountMinUsd: sorted[0] ?? null,
    amountMaxUsd: sorted[sorted.length - 1] ?? null,
  };
}

function midpoint(min: number | null, max: number | null) {
  if (min === null && max === null) {
    return null;
  }

  if (min !== null && max !== null) {
    return Math.round((min + max) / 2);
  }

  return min ?? max;
}

export function computeAnnualizedMidpointUsd(
  amountMinUsd: number | null,
  amountMaxUsd: number | null,
  cadence: BudgetCadence,
) {
  const base = midpoint(amountMinUsd, amountMaxUsd);
  if (base === null) {
    return null;
  }

  if (cadence === "monthly") {
    return base * 12;
  }

  if (cadence === "annual" || cadence === "one_time") {
    return base;
  }

  return null;
}

export function normalizeBudgetSignal(
  rawSignal: RawBudgetSignal,
  fallbackSource: BudgetSignalSource = "post",
): BudgetSignal | null {
  const quote =
    typeof rawSignal.quote === "string" ? rawSignal.quote.trim() : "";
  if (!quote) {
    return null;
  }

  const parsedAmounts = parseAmountsFromQuote(quote);
  const amountMinUsd =
    toNullableNumber(rawSignal.amountMinUsd) ?? parsedAmounts.amountMinUsd;
  const amountMaxUsd =
    toNullableNumber(rawSignal.amountMaxUsd) ?? parsedAmounts.amountMaxUsd;

  const cadence = inferCadence(
    quote,
    rawSignal.cadence === "one_time" ||
      rawSignal.cadence === "monthly" ||
      rawSignal.cadence === "annual" ||
      rawSignal.cadence === "unknown"
      ? rawSignal.cadence
      : undefined,
  );

  const annualizedMidpointUsd =
    toNullableNumber(rawSignal.annualizedMidpointUsd) ??
    computeAnnualizedMidpointUsd(amountMinUsd, amountMaxUsd, cadence);

  return {
    quote,
    amountMinUsd,
    amountMaxUsd,
    cadence,
    annualizedMidpointUsd,
    source: rawSignal.source === "comment" ? "comment" : fallbackSource,
  };
}

export function normalizeBudgetSignals(value: unknown): BudgetSignal[] {
  if (typeof value === "string") {
    const signal = normalizeBudgetSignal({
      quote: value,
      cadence: "unknown",
      source: "post",
    });
    return signal ? [signal] : [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) =>
      entry && typeof entry === "object"
        ? normalizeBudgetSignal(entry as RawBudgetSignal)
        : null,
    )
    .filter((entry): entry is BudgetSignal => entry !== null);
}

export function hasWillingnessToPaySignals(signals: BudgetSignal[]) {
  return signals.length > 0;
}

export function summarizeBudgetSignal(signal: BudgetSignal) {
  const amount =
    signal.amountMinUsd !== null && signal.amountMaxUsd !== null
      ? signal.amountMinUsd === signal.amountMaxUsd
        ? `$${signal.amountMinUsd.toLocaleString("en-US")}`
        : `$${signal.amountMinUsd.toLocaleString("en-US")}-$${signal.amountMaxUsd.toLocaleString("en-US")}`
      : signal.annualizedMidpointUsd !== null
        ? `$${signal.annualizedMidpointUsd.toLocaleString("en-US")}`
        : "Unparsed budget";

  const cadenceLabel =
    signal.cadence === "monthly"
      ? "/month"
      : signal.cadence === "annual"
        ? "/year"
        : signal.cadence === "one_time"
          ? " one-time"
          : "";

  return `${amount}${cadenceLabel}`;
}

export function aggregateBudgetSignals(signals: BudgetSignal[]) {
  const annualizedValues = signals
    .map((signal) => signal.annualizedMidpointUsd)
    .filter((value): value is number => typeof value === "number");

  return {
    budgetSignalCount: signals.length,
    estimatedTamUsdAnnual:
      annualizedValues.length > 0
        ? annualizedValues.reduce((sum, value) => sum + value, 0)
        : null,
  };
}
