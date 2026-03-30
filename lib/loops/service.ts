import { loops } from "./client";

/**
 * Syncs a user to the Loops audience.
 * Typically called on sign-up.
 */
export async function syncUserToLoops(
  email: string,
  firstName?: string,
  properties: Record<string, string | number | boolean> = {},
) {
  if (!process.env.LOOPS_API_KEY) return;

  try {
    const response = await loops.createContact({
      email,
      properties: {
        firstName: firstName ?? null,
        ...properties,
      },
    });

    if (!response.success) {
      console.error("[Loops] Failed to sync user to Loops:", response);
    } else {
      console.log(`[Loops] Successfully synced user to Loops audience: ${email}`);
    }
  } catch (error) {
    console.error("[Loops] Error syncing user to Loops:", error);
  }
}

/**
 * Sends a transactional event to a user in Loops.
 */
export async function sendLoopsEvent(
  email: string,
  eventName: string,
  properties: Record<string, string | number | boolean> = {},
) {
  console.log(`[Loops] Sending event ${eventName} to ${email}...`);
  if (!process.env.LOOPS_API_KEY) {
    console.warn("[Loops] LOOPS_API_KEY is missing!");
    return;
  }

  try {
    const response = await loops.sendEvent({
      email,
      eventName,
      eventProperties: properties,
    });

    if (!response.success) {
      console.error(`[Loops] Failed to send event (${eventName}):`, response);
    } else {
      console.log(`[Loops] Successfully sent event (${eventName}) to ${email}`);
    }
  } catch (error) {
    console.error(`[Loops] Error sending event (${eventName}):`, error);
  }
}

/**
 * Sends a notification when a user's trial is about to end.
 */
export async function sendTrialEndingNotification(
  email: string,
  daysRemaining: number,
) {
  await sendLoopsEvent(email, "trial_ending", { daysRemaining });
}

/**
 * Sends a notification when a mining run fails.
 */
export async function sendScanFailedNotification(
  email: string,
  keyword: string,
  error: string,
) {
  await sendLoopsEvent(email, "scan_failed", { keyword, error });
}

/**
 * Sends a notification when a user's credits are running low.
 */
export async function sendLowCreditsNotification(
  email: string,
  remainingCredits: number,
) {
  await sendLoopsEvent(email, "low_credits", { remainingCredits });
}
