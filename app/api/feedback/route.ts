import { db } from "@/lib/db";
import { painPointFeedback } from "@/lib/db/schema";
import { z } from "zod";
import { apiError, apiJson } from "@/lib/api-error";
import { requireApiContext } from "@/lib/api-auth";

const feedbackSchema = z.object({
  painPointId: z.string().min(1, "Pain point ID is required"),
  vote: z.union([z.literal(1), z.literal(-1)]),
});

export async function POST(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId } = authContext.context;

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
