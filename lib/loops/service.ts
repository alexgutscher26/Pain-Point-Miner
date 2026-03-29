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
      console.error("Failed to sync user to Loops:", response);
    }
  } catch (error) {
    console.error("Error syncing user to Loops:", error);
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
  if (!process.env.LOOPS_API_KEY) return;

  try {
    const response = await loops.sendEvent({
      email,
      eventName,
      eventProperties: properties,
    });

    if (!response.success) {
      console.error(`Failed to send Loops event (${eventName}):`, response);
    }
  } catch (error) {
    console.error(`Error sending Loops event (${eventName}):`, error);
  }
}
