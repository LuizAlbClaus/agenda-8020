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
  throw new Error("checkins_configuration_missing");
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

function safeSummary(value: unknown): JsonObject {
  if (!isObject(value)) return {};
  const summary: JsonObject = {};
  for (
    const key of ["processed", "expired", "queued", "sent", "skipped", "failed"]
  ) {
    if (typeof value[key] === "number" && Number.isFinite(value[key])) {
      summary[key] = value[key];
    }
  }
  return summary;
}

Deno.serve(observedHandler("process-checkins", async (request, context) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") {
    setErrorCode(context, "METHOD_NOT_ALLOWED");
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  // Cron is transitioning to x-agenda-schedule-secret; accept the explicit
  // cron name as well so existing Supabase Cron jobs can be rotated safely.
  const cronSecret = request.headers.get("x-agenda-cron-secret") ??
    request.headers.get("x-agenda-schedule-secret");
  if (!cronSecret || !(await validateScheduledRequest(cronSecret))) {
    setErrorCode(context, "UNAUTHORIZED");
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    setErrorCode(context, "INVALID_PAYLOAD");
    return jsonResponse({ error: "invalid_payload" }, 400);
  }
  if (!isObject(body) || typeof body.job !== "string") {
    setErrorCode(context, "INVALID_PAYLOAD");
    return jsonResponse({ error: "invalid_payload" }, 400);
  }
  setEntity(context, "scheduled_job", body.job);

  if (body.job === "checkins") {
    // Today evaluates check-in state on demand. There is no periodic email to
    // invent here, so this scheduled operation is intentionally a no-op.
    return jsonResponse({ ok: true, job: "checkins", noop: true });
  }

  if (body.job === "expire_entitlements") {
    const { data, error } = await supabase.rpc("expire_entitlements");
    if (error) {
      setErrorCode(context, "PROCESSING_FAILED");
      console.error("entitlements_expiry_failed", { code: error.code });
      return jsonResponse({ error: "processing_failed" }, 500);
    }
    const { data: belevyData, error: belevyError } = await supabase.rpc("expire_belevy_benefits");
    if (belevyError) {
      setErrorCode(context, "PROCESSING_FAILED");
      console.error("belevy_benefits_expiry_failed", { code: belevyError.code });
      return jsonResponse({ error: "processing_failed" }, 500);
    }
    const belevySummary = safeSummary(belevyData);
    return jsonResponse({
      ok: true,
      job: body.job,
      ...safeSummary(data),
      ...(typeof belevySummary.expired === "number" ? { belevy_expired: belevySummary.expired } : {}),
    });
  }

  if (body.job === "expiry_notices") {
    const limit = typeof body.limit === "number" && Number.isFinite(body.limit)
      ? Math.max(1, Math.min(500, Math.floor(body.limit)))
      : 500;
    const { data, error } = await supabase.rpc("enqueue_expiry_notices", {
      p_limit: limit,
    });
    if (error) {
      setErrorCode(context, "PROCESSING_FAILED");
      console.error("expiry_notices_enqueue_failed", { code: error.code });
      return jsonResponse({ error: "processing_failed" }, 500);
    }
    return jsonResponse({ ok: true, job: body.job, ...safeSummary(data) });
  }

  if (body.job === "daily_reminders") {
    const period = typeof body.period === "string" ? body.period : "morning";
    if (!["morning", "afternoon", "evening"].includes(period)) {
      setErrorCode(context, "INVALID_PERIOD");
      return jsonResponse({ error: "invalid_period" }, 400);
    }
    const limit = typeof body.limit === "number" && Number.isFinite(body.limit)
      ? Math.max(1, Math.min(500, Math.floor(body.limit)))
      : 500;
    const { data, error } = await supabase.rpc("enqueue_daily_plan_reminders", {
      p_period: period,
      p_limit: limit,
    });
    if (error) {
      setErrorCode(context, "PROCESSING_FAILED");
      console.error("daily_reminders_enqueue_failed", { code: error.code });
      return jsonResponse({ error: "processing_failed" }, 500);
    }
    return jsonResponse({
      ok: true,
      job: body.job,
      period,
      ...safeSummary(data),
    });
  }

  setErrorCode(context, "INVALID_JOB");
  return jsonResponse({ error: "invalid_job" }, 400);
}));
