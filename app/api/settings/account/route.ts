import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireApiContext } from "@/lib/api-auth";
import { apiError, apiJson } from "@/lib/api-error";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .refine(
      (value) => value === "DELETE",
      "Type DELETE to confirm account deletion",
    ),
});

export async function DELETE(req: Request) {
  const authContext = await requireApiContext(req);
  if (!authContext.ok) {
    return authContext.response;
  }
  const { correlationId, userId } = authContext.context;

  const body = await req.json().catch(() => null);
  const parsedBody = deleteAccountSchema.safeParse(body);
  if (!parsedBody.success) {
    return apiError(
      400,
      "VALIDATION_ERROR",
      "Invalid request body",
      parsedBody.error.flatten(),
      correlationId,
    );
  }

  try {
    const updatedUsers = await db
      .update(user)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning({ id: user.id });

    if (updatedUsers.length === 0) {
      return apiError(
        404,
        "NOT_FOUND",
        "User not found",
        undefined,
        correlationId,
      );
    }

    return apiJson({ ok: true }, 200, correlationId);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return apiError(
        404,
        "NOT_FOUND",
        "User not found",
        undefined,
        correlationId,
      );
    }
    console.error("Delete account API Error:", error);
    return apiError(
      500,
      "INTERNAL_SERVER_ERROR",
      "Internal Server Error",
      undefined,
      correlationId,
    );
  }
}
