import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  observedHandler,
  setEntity,
  setErrorCode,
} from "../_shared/observability.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getServerKey(): string | null {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      const value = isObject(parsed) ? parsed.default : null;
      if (typeof value === "string" && value) return value;
      if (isObject(value)) {
        for (const key of ["secret", "service_role", "key", "value"]) {
          if (typeof value[key] === "string" && value[key]) {
            return value[key] as string;
          }
        }
      }
    } catch {
      // Fall back to the legacy variable without logging secret material.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}

const serviceRoleKey = getServerKey();
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("outcome_reminders_configuration_missing");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function jsonResponse(body: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function validateScheduledRequest(secret: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("validate_scheduled_request", {
    p_secret: secret,
  });
  if (error) return false;
  return data === true ||
    (isObject(data) && (data.valid === true || data.ok === true));
}

function operationalSummary(value: unknown): JsonObject {
  if (!isObject(value)) return {};
  const summary: JsonObject = {};
  for (
    const key of ["processed", "queued", "skipped", "failed", "claimed", "sent"]
  ) {
    if (typeof value[key] === "number" && Number.isFinite(value[key])) {
      summary[key] = value[key];
    }
  }
  return summary;
}

Deno.serve(observedHandler("process-outcome-reminders", async (request, context) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") {
    setErrorCode(context, "METHOD_NOT_ALLOWED");
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const scheduleSecret = request.headers.get("x-agenda-cron-secret") ??
    request.headers.get("x-agenda-schedule-secret");
  if (!scheduleSecret || !(await validateScheduledRequest(scheduleSecret))) {
    setErrorCode(context, "UNAUTHORIZED");
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  let limit = 100;
  try {
    const body: unknown = await request.json();
    if (
      isObject(body) && typeof body.limit === "number" &&
      Number.isFinite(body.limit)
    ) {
      limit = Math.max(1, Math.min(500, Math.floor(body.limit)));
    }
  } catch {
    // Empty POST is the normal cron invocation shape.
  }
  setEntity(context, "scheduled_job", "outcome_reminders");

  const { data, error } = await supabase.rpc("enqueue_outcome_reminders", {
    p_limit: limit,
  });
  if (error) {
    setErrorCode(context, "PROCESSING_FAILED");
    console.error("outcome_reminders_processing_failed", { code: error.code });
    return jsonResponse({ error: "processing_failed" }, 500);
  }
  return jsonResponse({ ok: true, ...operationalSummary(data) });
}));
