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
  } catch (error: any) {
    if (error?.statusCode === 409 || error?.json?.message?.includes("already in your audience")) {
      console.log(`[Loops] User ${email} is already in your audience. Sync complete.`);
      return;
    }
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

/**
 * Sends a welcome email programmatically with built HTML
 */
export async function sendWelcomeEmailProgrammatically(
  email: string,
  firstName: string,
  scanUrl: string,
) {
  if (!process.env.LOOPS_API_KEY) return;

  try {
    const { render } = await import("@react-email/components");
    const { WelcomeEmail } = await import("../../emails/WelcomeEmail");
    
    const htmlBody = await render(WelcomeEmail({ firstName, scanUrl }));

    // Note: You must configure a Transactional Email in Loops.so and grab its ID.
    // Add an 'html' variable in the template.
    const response = await loops.sendTransactionalEmail({
      transactionalId: process.env.LOOPS_WELCOME_TRANSACTIONAL_ID || "cm2xxxx", 
      email,
      dataVariables: {
        html: htmlBody,
        firstName, // In case you want to use it directly in the UI template
      },
    });

    if (!response.success) {
      console.error("[Loops] Failed to send welcome email programmatically:", response);
    } else {
      console.log(`[Loops] Successfully sent programmatic welcome email to ${email}`);
    }
  } catch (error) {
    console.error("[Loops] Error sending welcome email programmatically:", error);
  }
}

/**
 * Sends a Report Ready email programmatically with built HTML
 */
export async function sendReportReadyEmailProgrammatically(
  email: string,
  keyword: string,
  painPointsFound: number,
  reportUrl: string,
  topPainPoints: { title: string; excerpt: string; score: number }[]
) {
  if (!process.env.LOOPS_API_KEY) return;

  try {
    const { render } = await import("@react-email/components");
    const { ReportReadyEmail } = await import("../../emails/ReportReadyEmail");
    
    const htmlBody = await render(
      ReportReadyEmail({
        keyword,
        painPointsFound,
        reportUrl,
        topPainPoints,
      })
    );

    const response = await loops.sendTransactionalEmail({
      transactionalId: process.env.LOOPS_REPORT_READY_TRANSACTIONAL_ID || "cm2xxxy", 
      email,
      dataVariables: {
        html: htmlBody,
      },
    });

    if (!response.success) {
      console.error("[Loops] Failed to send report ready email:", response);
    } else {
      console.log(`[Loops] Successfully sent report ready email to ${email}`);
    }
  } catch (error) {
    console.error("[Loops] Error sending report ready email:", error);
  }
}

/**
 * Sends a Weekly Digest email programmatically with built HTML
 */
export async function sendWeeklyDigestEmailProgrammatically(
  email: string,
  firstName: string,
  topOpportunities: { title: string; score: number; niche: string }[],
  trendingKeyword: string,
  scansRemaining: number | null,
  unsubscribeUrl: string,
) {
  if (!process.env.LOOPS_API_KEY) return;

  try {
    const { render } = await import("@react-email/components");
    const { WeeklyDigestEmail } = await import("../../emails/WeeklyDigestEmail");

    const htmlBody = await render(
      WeeklyDigestEmail({
        firstName,
        topOpportunities,
        trendingKeyword,
        scansRemaining,
        unsubscribeUrl,
      }),
    );

    const response = await loops.sendTransactionalEmail({
      transactionalId:
        process.env.LOOPS_WEEKLY_DIGEST_TRANSACTIONAL_ID || "cm2xxxz",
      email,
      dataVariables: {
        html: htmlBody,
      },
    });

    if (!response.success) {
      console.error("[Loops] Failed to send weekly digest email:", response);
    } else {
      console.log(`[Loops] Successfully sent weekly digest email to ${email}`);
    }
  } catch (error) {
    console.error("[Loops] Error sending weekly digest email:", error);
  }
}

/**
  * Sends a Reset Password email programmatically with built HTML
  */
export async function sendResetPasswordEmailProgrammatically(
  email: string,
  resetLink: string,
) {
  if (!process.env.LOOPS_API_KEY) return;

  try {
    const { render } = await import("@react-email/components");
    const { ResetPasswordEmail } = await import("../../emails/ResetPasswordEmail");
    
    const htmlBody = await render(ResetPasswordEmail({ userEmail: email, resetLink }));

    // Use the Reset Password Transactional ID
    const response = await loops.sendTransactionalEmail({
      transactionalId: process.env.LOOPS_RESET_PASSWORD_TRANSACTIONAL_ID || "cm2xxxx", 
      email,
      dataVariables: {
        html: htmlBody,
      },
    });

    if (!response.success) {
      console.error("[Loops] Failed to send reset password email:", response);
    } else {
      console.log(`[Loops] Successfully sent reset password email to ${email}`);
    }
  } catch (error) {
    console.error("[Loops] Error sending reset password email:", error);
  }
}
