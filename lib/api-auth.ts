import { and, eq, isNull } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { workspace, workspaceMember } from "@/lib/db/schema";
import { apiError, getCorrelationId } from "@/lib/api-error";

const workspaceHeaderSchema = z.string().uuid("Invalid workspace id").nullable();

type ApiContext = {
  correlationId: string;
  userId: string;
  userEmail: string;
  workspaceId: string | null;
};

export function workspaceScope(column: AnyPgColumn, workspaceId: string | null): SQL {
  return workspaceId ? eq(column, workspaceId) : isNull(column);
}

export async function requireApiContext(req: Request) {
  const correlationId = getCorrelationId(req);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return {
      ok: false as const,
      response: apiError(401, "UNAUTHORIZED", "Unauthorized", undefined, correlationId),
    };
  }

  const parsedWorkspaceHeader = workspaceHeaderSchema.safeParse(
    req.headers.get("x-workspace-id")
  );

  if (!parsedWorkspaceHeader.success) {
    return {
      ok: false as const,
      response: apiError(
        400,
        "VALIDATION_ERROR",
        "Invalid workspace header",
        parsedWorkspaceHeader.error.flatten(),
        correlationId
      ),
    };
  }

  const workspaceId = parsedWorkspaceHeader.data;

  if (workspaceId) {
    const member = await db.query.workspaceMember.findFirst({
      where: and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, session.user.id)
      ),
    });

    if (!member) {
      const ownedWorkspace = await db.query.workspace.findFirst({
        where: and(eq(workspace.id, workspaceId), eq(workspace.ownerId, session.user.id)),
      });

      if (!ownedWorkspace) {
        return {
          ok: false as const,
          response: apiError(403, "FORBIDDEN", "Workspace access denied", undefined, correlationId),
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
