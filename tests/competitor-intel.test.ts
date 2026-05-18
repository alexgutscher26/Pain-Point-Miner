import { describe, it, expect } from "vitest";
import { normalizeToolName } from "@/lib/competitor-intel";

describe("normalizeToolName", () => {
  it("should return empty string for empty input", () => {
    expect(normalizeToolName("")).toBe("");
  });

  it("should return empty string for whitespace-only input", () => {
    expect(normalizeToolName("   ")).toBe("");
  });

  it("should normalize tool names by capitalizing first letter of words", () => {
    expect(normalizeToolName("hubspot")).toBe("Hubspot");
    expect(normalizeToolName("salesforce")).toBe("Salesforce");
    expect(normalizeToolName("apollo graphql")).toBe("Apollo Graphql");
  });

  it("should remove common suffixes", () => {
    expect(normalizeToolName("HubSpot CRM")).toBe("Hubspot");
    expect(normalizeToolName("hubspot software")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot App")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot platform")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot tool")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot service")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot c.r.m.")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot solutions")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot inc")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot corp")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot co")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot limited")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot ltd")).toBe("Hubspot");
  });

  it("should handle multiple spaces correctly", () => {
    expect(normalizeToolName("  hubspot   crm  ")).toBe("Hubspot");
    expect(normalizeToolName("apollo   graphql  software ")).toBe("Apollo Graphql");
  });

  it("should handle suffixes in different cases", () => {
    expect(normalizeToolName("HubSpot CRM")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot crm")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot Crm")).toBe("Hubspot");
    expect(normalizeToolName("HubSpot cRm")).toBe("Hubspot");
  });

  it("should not remove suffixes from the middle of the name", () => {
    expect(normalizeToolName("App Store")).toBe("App Store");
    expect(normalizeToolName("CRM Solutions")).toBe("Crm"); // "solutions" at the end is removed
    expect(normalizeToolName("Platform Builder Software")).toBe("Platform Builder");
  });

  it("should handle single word suffixes without removing them if it is the only word", () => {
      expect(normalizeToolName("software")).toBe("Software");
      expect(normalizeToolName("app")).toBe("App");
  });
});
