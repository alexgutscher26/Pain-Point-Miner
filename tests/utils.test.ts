import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges basic classes", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("a", true && "b", false && "c")).toBe("a b");
  });

  it("merges tailwind classes and overrides conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("supports arrays and objects", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });

  it("ignores undefined and null values", () => {
    expect(cn("a", undefined, null, "b")).toBe("a b");
  });
});
