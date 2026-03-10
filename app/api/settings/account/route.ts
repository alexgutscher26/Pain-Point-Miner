import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireApiContext } from "@/lib/api-auth";
import { apiError, apiJson } from "@/lib/api-error";
import { db } from "@/lib/db";
import { user, workspace } from "@/lib/db/schema";

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
    await db.transaction(async (tx) => {
      await tx.delete(workspace).where(eq(workspace.ownerId, userId));

      const deletedUsers = await tx
        .delete(user)
        .where(eq(user.id, userId))
        .returning({ id: user.id });

      if (deletedUsers.length === 0) {
        throw new Error("User not found");
      }
    });

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
