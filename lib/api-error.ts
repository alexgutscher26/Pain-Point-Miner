import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR";

export interface ApiErrorBody {
  code: ApiErrorCode | (string & {});
  message: string;
  details?: unknown;
}

const CORRELATION_ID_HEADER = "x-correlation-id";

function resolveCorrelationId(correlationId?: string) {
  if (correlationId && correlationId.trim().length > 0) {
    return correlationId.trim();
  }
  return crypto.randomUUID();
}

export function getCorrelationId(req: Request) {
  return resolveCorrelationId(
    req.headers.get(CORRELATION_ID_HEADER) ?? undefined,
  );
}

export function apiJson<T>(
  body: T,
  status = 200,
  correlationId?: string,
  extraHeaders?: Record<string, string>,
) {
  const id = resolveCorrelationId(correlationId);
  return NextResponse.json(body, {
    status,
    headers: {
      [CORRELATION_ID_HEADER]: id,
      ...extraHeaders,
    },
  });
}

export function apiError(
  status: number,
  code: ApiErrorBody["code"],
  message: string,
  details?: unknown,
  correlationId?: string,
  extraHeaders?: Record<string, string>,
) {
  return apiJson(
    {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    } satisfies ApiErrorBody,
    status,
    correlationId,
    extraHeaders,
  );
}
