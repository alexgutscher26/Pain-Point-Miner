export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  support: boolean;
  marketing: boolean;
  hasResponded: boolean;
  updatedAt: string;
}

export const COOKIE_CONSENT_KEY = "ppm_cookie_consent_v1";
export const COOKIE_CONSENT_EVENT = "ppm_cookie_consent_updated";

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  support: false,
  marketing: false,
  hasResponded: false,
  updatedAt: new Date().toISOString(),
};

export function getCookiePreferences(): CookiePreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      essential: true, // Always true
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveCookiePreferences(
  preferences: Partial<CookiePreferences>,
): CookiePreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULT_PREFERENCES, ...preferences, essential: true };
  }

  const updated: CookiePreferences = {
    ...getCookiePreferences(),
    ...preferences,
    essential: true,
    hasResponded: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_EVENT, { detail: updated }),
    );
  } catch (e) {
    console.warn("Failed to persist cookie preferences:", e);
  }

  return updated;
}

export function acceptAllCookies(): CookiePreferences {
  return saveCookiePreferences({
    analytics: true,
    support: true,
    marketing: true,
  });
}

export function rejectNonEssentialCookies(): CookiePreferences {
  return saveCookiePreferences({
    analytics: false,
    support: false,
    marketing: false,
  });
}
