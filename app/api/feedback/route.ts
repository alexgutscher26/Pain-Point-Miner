import { db } from "@/lib/db";
import { painPoint, painPointFeedback } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext, workspaceScope } from "@/lib/api-auth";

const feedbackSchema = z.object({
  painPointId: z.string().min(1, "Pain point ID is required"),
  vote: z.union([z.literal(1), z.literal(-1)]),
});

export async function POST(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId, workspaceId } = authContext.context;

  try {
    const rawBody = await req.json();
    const parsedPayload = feedbackSchema.safeParse(rawBody);

    if (!parsedPayload.success) {
      return apiError(
        400,
        "VALIDATION_ERROR",
        "Invalid request payload",
        parsedPayload.error.flatten(),
        correlationId,
      );
    }

    const { painPointId, vote } = parsedPayload.data;

    // Verify pain point exists and is accessible by the user in this workspace
    const existingPoint = await db.query.painPoint.findFirst({
      where: and(
        eq(painPoint.id, painPointId),
        eq(painPoint.userId, userId),
        workspaceScope(painPoint.workspaceId, workspaceId),
      ),
      columns: { id: true },
    });

    if (!existingPoint) {
      return apiError(
        404,
        "NOT_FOUND",
        "Pain point not found",
        undefined,
        correlationId,
      );
    }

    // Use onConflictUpdate to allow users to change their vote
    const result = await db
      .insert(painPointFeedback)
      .values({
        id: crypto.randomUUID(),
        painPointId,
        userId,
        vote,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [painPointFeedback.painPointId, painPointFeedback.userId],
        set: {
          vote,
          createdAt: new Date(),
        },
      })
      .returning();

    return apiJson(
      {
        success: true,
        feedback: result[0],
      },
      200,
      correlationId,
    );
  } catch (error) {
    console.error("Feedback API Error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}
