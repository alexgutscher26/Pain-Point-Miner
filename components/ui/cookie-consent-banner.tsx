"use client";

import React, { useState, useEffect } from "react";
import {
  getCookiePreferences,
  saveCookiePreferences,
  acceptAllCookies,
  rejectNonEssentialCookies,
  COOKIE_CONSENT_EVENT,
  type CookiePreferences,
} from "@/lib/cookie-consent";
import {
  Shield,
  Settings,
  Check,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

export function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(() =>
    getCookiePreferences(),
  );

  useEffect(() => {
    setMounted(true);
    const prefs = getCookiePreferences();
    setPreferences(prefs);
    if (!prefs.hasResponded) {
      // Small delay for smooth entry animation
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleReopen = () => {
      setPreferences(getCookiePreferences());
      setIsVisible(true);
      setShowPreferences(true);
    };

    const handleUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<CookiePreferences>;
      if (customEvent.detail) {
        setPreferences(customEvent.detail);
      }
    };

    window.addEventListener("ppm_open_cookie_consent", handleReopen);
    window.addEventListener(COOKIE_CONSENT_EVENT, handleUpdated);
    return () => {
      window.removeEventListener("ppm_open_cookie_consent", handleReopen);
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleUpdated);
    };
  }, []);

  if (!mounted || !isVisible) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    rejectNonEssentialCookies();
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
    setIsVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie Consent Banner"
      className="animate-in fade-in slide-in-from-bottom-5 fixed right-4 bottom-4 left-4 z-50 duration-300 sm:right-auto sm:left-6 sm:max-w-lg"
    >
      <div className="rounded-2xl border-2 border-white/15 bg-[#121212]/95 p-5 text-white shadow-2xl ring-1 ring-black/50 backdrop-blur-xl">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#ff4500]/30 bg-[#ff4500]/15 text-[#ff4500]">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="flex items-center justify-between font-mono text-sm font-black tracking-tight text-white uppercase">
              <span>Privacy & Cookie Preferences</span>
            </h3>
            <p className="font-sans text-xs leading-relaxed text-zinc-300">
              We use cookies and telemetry to improve your mining experience,
              provide support widgets, and ensure reliable security.
            </p>
          </div>
        </div>

        {/* Detailed Preferences Accordion */}
        {showPreferences && (
          <div className="mt-4 space-y-3 border-t border-white/10 pt-3 text-xs">
            {/* Essential */}
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>Essential & Security</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Required for authentication, session verification, and CSRF
                  protection.
                </p>
              </div>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">
                Required
              </span>
            </div>

            {/* Analytics */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-2.5 transition-colors hover:bg-white/10">
              <div className="space-y-0.5 pr-2">
                <span className="font-mono font-bold text-white">
                  Analytics & Performance
                </span>
                <p className="text-[11px] text-zinc-400">
                  Helps us understand feature usage, app performance, and fix
                  platform bottlenecks.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    analytics: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-white/20 bg-black text-[#ff4500] accent-[#ff4500] focus:ring-0"
              />
            </label>

            {/* Support Widget */}
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-white/5 p-2.5 transition-colors hover:bg-white/10">
              <div className="space-y-0.5 pr-2">
                <span className="font-mono font-bold text-white">
                  Customer Feedback Widget
                </span>
                <p className="text-[11px] text-zinc-400">
                  Enables the interactive UserJot feedback and live support
                  assistance launcher.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.support}
                onChange={(e) =>
                  setPreferences((prev) => ({
                    ...prev,
                    support: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-white/20 bg-black text-[#ff4500] accent-[#ff4500] focus:ring-0"
              />
            </label>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setShowPreferences((prev) => !prev)}
            className="flex cursor-pointer items-center gap-1 font-mono text-xs text-zinc-400 transition-colors hover:text-white"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>{showPreferences ? "Hide Details" : "Customize"}</span>
            {showPreferences ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            {showPreferences ? (
              <button
                type="button"
                onClick={handleSavePreferences}
                className="flex cursor-pointer items-center gap-1 rounded-xl bg-[#ff4500] px-3.5 py-1.5 font-mono text-xs font-black text-white uppercase shadow-xs transition-all hover:bg-[#ff571a] active:scale-95"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Save Choices</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="cursor-pointer rounded-xl bg-[#ff4500] px-3.5 py-1.5 font-mono text-xs font-black text-white uppercase shadow-xs transition-all hover:bg-[#ff571a] active:scale-95"
                >
                  Accept All
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
