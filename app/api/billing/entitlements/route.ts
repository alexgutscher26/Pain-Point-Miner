import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext } from "@/lib/api-auth";
import { getMonthlyScanUsage, getMonthlyUsageSummary, getPlanEntitlements } from "@/lib/plan-gating";
import { resolveCurrentPlan } from "@/lib/plan-resolver";

export async function GET(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }

  const { correlationId, userId, userEmail } = authContext.context;

  try {
    const plan = await resolveCurrentPlan({
      userId,
      email: userEmail,
      requestHeaders: req.headers,
    });
    const entitlements = getPlanEntitlements(plan);
    const monthlyScansUsed = await getMonthlyScanUsage(userId);

    return apiJson(
      {
        plan,
        entitlements,
        usage: getMonthlyUsageSummary(plan, monthlyScansUsed),
      },
      200,
      correlationId
    );
  } catch (error) {
    console.error("Billing entitlements API error:", error);
    return apiError(500, "INTERNAL_SERVER_ERROR", "Internal Server Error", undefined, correlationId);
  }
}
