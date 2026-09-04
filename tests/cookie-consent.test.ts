import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies,
  rejectNonEssentialCookies,
  COOKIE_CONSENT_EVENT,
} from "@/lib/cookie-consent";

describe("Cookie Consent Manager", () => {
  let mockStorage: Record<string, string> = {};
  const dispatchMock = vi.fn();

  beforeEach(() => {
    mockStorage = {};
    dispatchMock.mockClear();

    // Stub globalThis.localStorage
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    });

    // Stub globalThis.window
    vi.stubGlobal("window", {
      dispatchEvent: dispatchMock,
      localStorage: {
        getItem: (key: string) => mockStorage[key] ?? null,
        setItem: (key: string, val: string) => {
          mockStorage[key] = val;
        },
      },
    });

    // CustomEvent constructor polyfill if not present
    if (typeof globalThis.CustomEvent === "undefined") {
      class MockCustomEvent extends Event {
        detail: any;
        constructor(type: string, params?: { detail?: any }) {
          super(type);
          this.detail = params?.detail;
        }
      }
      vi.stubGlobal("CustomEvent", MockCustomEvent);
    }
  });

  it("returns default preferences when no consent has been stored", () => {
    const prefs = getCookiePreferences();
    expect(prefs.essential).toBe(true);
    expect(prefs.analytics).toBe(false);
    expect(prefs.support).toBe(false);
    expect(prefs.marketing).toBe(false);
    expect(prefs.hasResponded).toBe(false);
  });

  it("persists accepted cookies and sets hasResponded to true", () => {
    const updated = acceptAllCookies();
    expect(updated.essential).toBe(true);
    expect(updated.analytics).toBe(true);
    expect(updated.support).toBe(true);
    expect(updated.marketing).toBe(true);
    expect(updated.hasResponded).toBe(true);

    const reloaded = getCookiePreferences();
    expect(reloaded.analytics).toBe(true);
    expect(reloaded.hasResponded).toBe(true);
  });

  it("handles rejection of non-essential cookies", () => {
    const updated = rejectNonEssentialCookies();
    expect(updated.essential).toBe(true);
    expect(updated.analytics).toBe(false);
    expect(updated.support).toBe(false);
    expect(updated.marketing).toBe(false);
    expect(updated.hasResponded).toBe(true);

    const reloaded = getCookiePreferences();
    expect(reloaded.support).toBe(false);
    expect(reloaded.hasResponded).toBe(true);
  });

  it("saves custom preferences and dispatches event", () => {
    const custom = saveCookiePreferences({
      analytics: true,
      support: false,
    });

    expect(custom.analytics).toBe(true);
    expect(custom.support).toBe(false);
    expect(custom.essential).toBe(true);
    expect(dispatchMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: COOKIE_CONSENT_EVENT }),
    );
  });
});
