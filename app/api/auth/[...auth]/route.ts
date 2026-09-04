import { auth, sanitizeAuthHeaders } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse } from "next/server";

const authHandler = toNextJsHandler(auth);

function sanitizeIncomingRequest(req: Request): Request {
  const cleanHeaders = sanitizeAuthHeaders(req.headers);
  return new Request(req.url, {
    method: req.method,
    headers: cleanHeaders,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    // @ts-expect-error duplex is required in node runtime when body is passed
    duplex: "half",
  });
}

function clearStaleSessionDataCookies(res: Response, req: Request): Response {
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader && cookieHeader.includes("session_data")) {
    const isSecure = req.url.startsWith("https://");
    const secureFlag = isSecure ? " Secure;" : "";
    res.headers.append(
      "Set-Cookie",
      `better-auth.session_data=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax;${secureFlag}`,
    );
    res.headers.append(
      "Set-Cookie",
      `session_data=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax;${secureFlag}`,
    );
  }
  return res;
}

export async function GET(req: Request) {
  try {
    const cleanReq = sanitizeIncomingRequest(req);
    const res = await authHandler.GET(cleanReq);
    return clearStaleSessionDataCookies(res, req);
  } catch (error) {
    console.error("Caught error in Auth GET handler:", error);
    const res = NextResponse.json(
      { session: null, user: null },
      { status: 200 },
    );
    return clearStaleSessionDataCookies(res, req);
  }
}

export async function POST(req: Request) {
  try {
    const cleanReq = sanitizeIncomingRequest(req);
    const res = await authHandler.POST(cleanReq);
    return clearStaleSessionDataCookies(res, req);
  } catch (error) {
    console.error("Caught error in Auth POST handler:", error);
    const res = NextResponse.json(
      { error: "Internal Auth Error" },
      { status: 500 },
    );
    return clearStaleSessionDataCookies(res, req);
  }
}
