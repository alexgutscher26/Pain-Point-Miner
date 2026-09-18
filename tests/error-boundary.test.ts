import { describe, expect, it, vi } from "vitest";
import React from "react";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";

describe("SectionErrorBoundary", () => {
  it("computes derived state on error correctly", () => {
    const error = new Error("Widget rendering crashed");
    const derived = SectionErrorBoundary.getDerivedStateFromError(error);
    expect(derived.hasError).toBe(true);
    expect(derived.error).toBe(error);
  });

  it("handles componentDidCatch and logs section context", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const boundary = new SectionErrorBoundary({
      title: "Market Radar",
      children: React.createElement("div", null, "Child"),
    });

    const setStateSpy = vi.spyOn(boundary, "setState");
    const error = new Error("Failed to render radar chart");
    const errorInfo = {
      componentStack: "\n    in RadarChart\n    in Section",
    } as React.ErrorInfo;

    boundary.componentDidCatch(error, errorInfo);

    expect(setStateSpy).toHaveBeenCalledWith({ errorInfo });
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Section Error in "Market Radar"]',
      error,
      errorInfo,
    );

    consoleSpy.mockRestore();
  });

  it("resets error state when resetError is called and invokes onReset callback", () => {
    const onResetMock = vi.fn();
    const boundary = new SectionErrorBoundary({
      children: React.createElement("div", null, "Child"),
      onReset: onResetMock,
    });

    const setStateSpy = vi.spyOn(boundary, "setState");
    boundary.resetError();

    expect(setStateSpy).toHaveBeenCalledWith({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
    expect(onResetMock).toHaveBeenCalledTimes(1);
  });

  it("resets error when resetKeys change in componentDidUpdate", () => {
    const boundary = new SectionErrorBoundary({
      children: React.createElement("div", null, "Child"),
      resetKeys: ["v1"],
    });

    boundary.state = {
      hasError: true,
      error: new Error("Test error"),
      errorInfo: null,
      showDetails: false,
      copied: false,
    };

    const resetSpy = vi.spyOn(boundary, "resetError");

    // No key change -> no reset
    boundary.componentDidUpdate({
      children: React.createElement("div", null, "Child"),
      resetKeys: ["v1"],
    });
    expect(resetSpy).not.toHaveBeenCalled();

    // Key changed -> reset triggered
    (boundary as any).props = {
      children: React.createElement("div", null, "Child"),
      resetKeys: ["v2"],
    };
    boundary.componentDidUpdate({
      children: React.createElement("div", null, "Child"),
      resetKeys: ["v1"],
    });
    expect(resetSpy).toHaveBeenCalledTimes(1);
  });

  it("renders custom fallback node when provided and in error state", () => {
    const fallbackNode = React.createElement(
      "div",
      { id: "custom-fallback" },
      "Custom Error",
    );
    const boundary = new SectionErrorBoundary({
      children: React.createElement("div", null, "Healthy Child"),
      fallback: fallbackNode,
    });

    boundary.state = {
      hasError: true,
      error: new Error("Oops"),
      errorInfo: null,
      showDetails: false,
      copied: false,
    };

    const rendered = boundary.render();
    expect(rendered).toEqual(fallbackNode);
  });
});
