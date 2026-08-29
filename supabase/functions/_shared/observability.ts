import "jsr:@supabase/functions-js/edge-runtime.d.ts";

export type ObservabilityContext = {
  requestId: string;
  functionName: string;
  startedAt: number;
  errorCode?: string;
  entityType?: string;
  entityId?: string;
};

type JsonObject = Record<string, unknown>;

function safeIdentifier(value: unknown, maxLength = 256): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    return null;
  }
  return /^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value) ? value : null;
}

function errorCode(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  return /^[A-Za-z0-9_]{1,80}$/.test(message) ? message : "INTERNAL_ERROR";
}

export function createObservabilityContext(
  request: Request,
  functionName: string,
): ObservabilityContext {
  const supplied = safeIdentifier(request.headers.get("x-request-id"), 128);
  return {
    requestId: supplied ?? crypto.randomUUID(),
    functionName,
    startedAt: Date.now(),
  };
}

export function setEntity(
  context: ObservabilityContext,
  entityType: string,
  entityId: unknown,
): void {
  const safeType = safeIdentifier(entityType, 64);
  const safeId = safeIdentifier(entityId);
  if (safeType) context.entityType = safeType;
  if (safeId) context.entityId = safeId;
}

export function setErrorCode(
  context: ObservabilityContext,
  code: string,
): void {
  if (/^[A-Za-z0-9_]{1,80}$/.test(code)) context.errorCode = code;
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

function jsonError(context: ObservabilityContext): Response {
  return new Response(JSON.stringify({
    error: "internal_error",
    error_code: "INTERNAL_ERROR",
    request_id: context.requestId,
  }), {
    status: 500,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function logRequest(context: ObservabilityContext, response: Response): void {
  const status = response.status;
  const entry: JsonObject = {
    request_id: context.requestId,
    function_name: context.functionName,
    status,
    latency: Math.max(0, Date.now() - context.startedAt),
  };
  if (context.entityType) entry.entity_type = context.entityType;
  if (context.entityId) entry.entity_id = context.entityId;
  if (status >= 400) {
    entry.error_code = context.errorCode ??
      (status >= 500 ? "INTERNAL_ERROR" : "REQUEST_REJECTED");
  }
  console.log(JSON.stringify(entry));
}

export function observedHandler(
  functionName: string,
  handler: (request: Request, context: ObservabilityContext) => Promise<Response>,
): (request: Request) => Promise<Response> {
  return async (request) => {
    const context = createObservabilityContext(request, functionName);
    let response: Response;
    try {
      response = await handler(request, context);
    } catch (error) {
      context.errorCode = errorCode(error);
      response = jsonError(context);
    }
    response.headers.set("x-request-id", context.requestId);
    logRequest(context, response);
    return response;
  };
}
