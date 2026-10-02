import { describe, expect, it } from "vitest";
import { DEFAULT_FILTER_PRESETS } from "@/lib/saved-filters";

describe("saved filter presets", () => {
  it("provides built-in smart presets with valid filtering configurations", () => {
    expect(DEFAULT_FILTER_PRESETS).toHaveLength(3);

    const highYield = DEFAULT_FILTER_PRESETS.find(
      (p) => p.id === "preset-high-yield",
    );
    expect(highYield).toBeDefined();
    expect(highYield?.filters.minScore).toBe("85");
    expect(highYield?.filters.status).toBe("completed");

    const starred = DEFAULT_FILTER_PRESETS.find(
      (p) => p.id === "preset-starred",
    );
    expect(starred).toBeDefined();
    expect(starred?.filters.savedOnly).toBe("true");

    const active = DEFAULT_FILTER_PRESETS.find(
      (p) => p.id === "preset-active-scans",
    );
    expect(active).toBeDefined();
    expect(active?.filters.status).toBe("in-progress");
  });
});
