import { and, eq, isNull } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workspace, workspaceMember } from "@/lib/db/schema";
import { apiError, getCorrelationId } from "@/lib/api-error";

const workspaceHeaderSchema = z
  .string()
  .uuid("Invalid workspace id")
  .nullable();

type ApiContext = {
  correlationId: string;
  userId: string;
  userEmail: string;
  workspaceId: string | null;
};

export function workspaceScope(
  column: AnyPgColumn,
  workspaceId: string | null,
): SQL {
  return workspaceId ? eq(column, workspaceId) : isNull(column);
}

export async function requireApiContext(req: Request) {
  const correlationId = getCorrelationId(req);

  // CSRF Protection: Validate Origin for Mutations
  const origin = req.headers.get("origin");
  const method = req.method.toUpperCase();
  const isMutation = ["POST", "PATCH", "PUT", "DELETE"].includes(method);

  if (isMutation) {
    const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "";
    const isLocalhost = origin?.includes("localhost") || origin?.includes("127.0.0.1");
    const isSafeOrigin = origin === allowedOrigin || isLocalhost;

    if (origin && !isSafeOrigin) {
      return {
        ok: false as const,
        response: apiError(
          403,
          "FORBIDDEN",
          "CSRF: Invalid request origin",
          undefined,
          correlationId,
        ),
      };
    }
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user && (session.user as { deletedAt?: Date | null }).deletedAt) {
    return {
      ok: false as const,
      response: apiError(
        403,
        "FORBIDDEN",
        "Your account is currently scheduled for deletion and is in a 30-day grace period. Please contact support to restore access.",
        undefined,
        correlationId,
      ),
    };
  }

  if (!session) {
    return {
      ok: false as const,
      response: apiError(
        401,
        "UNAUTHORIZED",
        "Unauthorized",
        undefined,
        correlationId,
      ),
    };
  }

  const parsedWorkspaceHeader = workspaceHeaderSchema.safeParse(
    req.headers.get("x-workspace-id"),
  );

  if (!parsedWorkspaceHeader.success) {
    return {
      ok: false as const,
      response: apiError(
        400,
        "VALIDATION_ERROR",
        "Invalid workspace header",
        parsedWorkspaceHeader.error.flatten(),
        correlationId,
      ),
    };
  }

  const workspaceId = parsedWorkspaceHeader.data;

  if (workspaceId) {
    const member = await db.query.workspaceMember.findFirst({
      where: and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, session.user.id),
      ),
    });

    if (!member) {
      const ownedWorkspace = await db.query.workspace.findFirst({
        where: and(
          eq(workspace.id, workspaceId),
          eq(workspace.ownerId, session.user.id),
        ),
      });

      if (!ownedWorkspace) {
        return {
          ok: false as const,
          response: apiError(
            403,
            "FORBIDDEN",
            "Workspace access denied",
            undefined,
            correlationId,
          ),
        };
      }
    }
  }

  return {
    ok: true as const,
    context: {
      correlationId,
      userId: session.user.id,
      userEmail: session.user.email,
      workspaceId,
    } satisfies ApiContext,
  };
}
