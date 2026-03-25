import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Better Auth 1.x provides listSessions in the API context
  const sessions = await auth.api.listSessions({
    headers: await headers(),
  });

  return NextResponse.json(sessions);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the session token by ID in the database
  const targetSession = await auth.api.listSessions({
    headers: await headers(),
  }).then(list => list.find(s => s.id === id));

  if (!targetSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Revoke a specific session by token
  await auth.api.revokeSession({
    headers: await headers(),
    body: { token: targetSession.token },
  });

  return NextResponse.json({ success: true });
}
