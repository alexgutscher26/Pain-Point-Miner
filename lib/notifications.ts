import { toast as sonnerToast, ExternalToast } from "sonner";

export interface NotificationOptions extends ExternalToast {
  /**
   * Optional custom deduplication key or message. If identical to a recent toast within 2.5s, it will be skipped.
   */
  dedupeKey?: string;
  /**
   * Disables deduplication for this specific toast.
   */
  disableDedupe?: boolean;
}

// In-memory timestamp tracker for recent notification deduplication
const recentNotifications = new Map<string, number>();
const DEDUPE_WINDOW_MS = 2500;

function shouldDedupe(key: string, disableDedupe = false): boolean {
  if (disableDedupe) return false;
  const now = Date.now();
  const lastFired = recentNotifications.get(key);

  if (lastFired && now - lastFired < DEDUPE_WINDOW_MS) {
    return true; // deduplicate/skip
  }

  recentNotifications.set(key, now);

  // Clean up older keys if map grows large
  if (recentNotifications.size > 100) {
    for (const [k, timestamp] of recentNotifications.entries()) {
      if (now - timestamp > DEDUPE_WINDOW_MS * 2) {
        recentNotifications.delete(k);
      }
    }
  }

  return false;
}

/**
 * Unified notification manager for ThreddIQ with automatic deduplication,
 * typed presets, and rich action buttons.
 */
export const notify = {
  success(message: string, options?: NotificationOptions) {
    const key = options?.dedupeKey || `success:${message}`;
    if (shouldDedupe(key, options?.disableDedupe)) return;
    return sonnerToast.success(message, {
      duration: 3500,
      ...options,
    });
  },

  error(message: string, options?: NotificationOptions) {
    const key = options?.dedupeKey || `error:${message}`;
    if (shouldDedupe(key, options?.disableDedupe)) return;
    return sonnerToast.error(message, {
      duration: 5000,
      ...options,
    });
  },

  warning(message: string, options?: NotificationOptions) {
    const key = options?.dedupeKey || `warning:${message}`;
    if (shouldDedupe(key, options?.disableDedupe)) return;
    return sonnerToast.warning(message, {
      duration: 4000,
      ...options,
    });
  },

  info(message: string, options?: NotificationOptions) {
    const key = options?.dedupeKey || `info:${message}`;
    if (shouldDedupe(key, options?.disableDedupe)) return;
    return sonnerToast.info(message, {
      duration: 3500,
      ...options,
    });
  },

  promise<T>(
    promise: Promise<T>,
    data: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: NotificationOptions,
  ) {
    return sonnerToast.promise(promise, data);
  },

  dismiss(id?: string | number) {
    sonnerToast.dismiss(id);
  },

  // Helper for test reset
  _clearDedupeCache() {
    recentNotifications.clear();
  },
};
