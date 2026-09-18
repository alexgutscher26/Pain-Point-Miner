import { beforeEach, describe, expect, it, vi } from "vitest";
import { notify } from "@/lib/notifications";
import { toast as sonnerToast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe("notify (unified notification system)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    notify._clearDedupeCache();
  });

  it("calls sonnerToast.success with default duration and message", () => {
    notify.success("Operation completed successfully");
    expect(sonnerToast.success).toHaveBeenCalledTimes(1);
    expect(sonnerToast.success).toHaveBeenCalledWith(
      "Operation completed successfully",
      expect.objectContaining({ duration: 3500 }),
    );
  });

  it("calls sonnerToast.error with longer duration for readability", () => {
    notify.error("Network connection failed");
    expect(sonnerToast.error).toHaveBeenCalledTimes(1);
    expect(sonnerToast.error).toHaveBeenCalledWith(
      "Network connection failed",
      expect.objectContaining({ duration: 5000 }),
    );
  });

  it("calls sonnerToast.warning and sonnerToast.info properly", () => {
    notify.warning("Quota approaching limit");
    expect(sonnerToast.warning).toHaveBeenCalledTimes(1);

    notify.info("Scan running in background");
    expect(sonnerToast.info).toHaveBeenCalledTimes(1);
  });

  it("deduplicates identical notifications sent in rapid succession", () => {
    notify.success("Saved filter successfully");
    notify.success("Saved filter successfully");
    notify.success("Saved filter successfully");

    expect(sonnerToast.success).toHaveBeenCalledTimes(1);
  });

  it("allows overriding deduplication with disableDedupe: true", () => {
    notify.success("Updated record", { disableDedupe: true });
    notify.success("Updated record", { disableDedupe: true });

    expect(sonnerToast.success).toHaveBeenCalledTimes(2);
  });

  it("supports custom dedupeKey for parameterized messages", () => {
    notify.error("Failed to load item 123", { dedupeKey: "load-error" });
    notify.error("Failed to load item 456", { dedupeKey: "load-error" });

    expect(sonnerToast.error).toHaveBeenCalledTimes(1);
  });

  it("delegates promises properly to sonner", () => {
    const dummyPromise = Promise.resolve("done");
    notify.promise(dummyPromise, {
      loading: "Saving...",
      success: "Saved!",
      error: "Error saving",
    });

    expect(sonnerToast.promise).toHaveBeenCalledTimes(1);
    expect(sonnerToast.promise).toHaveBeenCalledWith(dummyPromise, {
      loading: "Saving...",
      success: "Saved!",
      error: "Error saving",
    });
  });

  it("delegates dismiss correctly", () => {
    notify.dismiss("toast-123");
    expect(sonnerToast.dismiss).toHaveBeenCalledWith("toast-123");
  });
});
