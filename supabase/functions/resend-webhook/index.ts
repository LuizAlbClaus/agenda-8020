import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  observedHandler,
  setEntity,
  setErrorCode,
} from "../_shared/observability.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const resendWebhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");

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
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function jsonResponse(body: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function decodeBase64(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      Math.ceil(value.length / 4) * 4,
      "=",
    );
    const binary = atob(normalized);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function timingSafeEqual(left: string, right: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(left)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(right)),
  ]);
  const leftBytes = new Uint8Array(a);
  const rightBytes = new Uint8Array(b);
  let difference = leftBytes.length ^ rightBytes.length;
  for (
    let index = 0;
    index < Math.max(leftBytes.length, rightBytes.length);
    index += 1
  ) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return difference === 0;
}

async function verifySvixSignature(
  payload: string,
  id: string,
  timestamp: string,
  header: string,
  webhookSecret: string,
): Promise<boolean> {
  const timestampSeconds = Number(timestamp);
  if (!/^\d+$/.test(timestamp) || !Number.isSafeInteger(timestampSeconds)) {
    return false;
  }
  // Svix signs timestamps in seconds and rejects stale messages to prevent replay.
  if (Math.abs(Math.floor(Date.now() / 1000) - timestampSeconds) > 300) {
    return false;
  }

  const secretText = webhookSecret.startsWith("whsec_")
    ? webhookSecret.slice("whsec_".length)
    : webhookSecret;
  const secret = decodeBase64(secretText);
  if (!secret || secret.length === 0) return false;

  const secretBuffer = new ArrayBuffer(secret.byteLength);
  new Uint8Array(secretBuffer).set(secret);

  const key = await crypto.subtle.importKey(
    "raw",
    secretBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${id}.${timestamp}.${payload}`),
  );
  const expected = btoa(String.fromCharCode(...new Uint8Array(digest)));
  const signatures = header.trim().split(/\s+/).filter((part) =>
    part.startsWith("v1,")
  );
  for (const signature of signatures) {
    if (await timingSafeEqual(signature.slice(3), expected)) return true;
  }
  return false;
}

function normalizeEventType(
  value: unknown,
): "delivered" | "bounced" | "complained" | null {
  if (value === "email.delivered" || value === "delivered") return "delivered";
  if (value === "email.bounced" || value === "bounced") return "bounced";
  if (value === "email.complained" || value === "complained") {
    return "complained";
  }
  return null;
}

Deno.serve(observedHandler("resend-webhook", async (request, context) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") {
    setErrorCode(context, "METHOD_NOT_ALLOWED");
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }
  if (!supabase || !supabaseUrl || !serviceRoleKey || !resendWebhookSecret) {
    setErrorCode(context, "CONFIGURATION_MISSING");
    return jsonResponse({ error: "service_unavailable" }, 503);
  }

  const providerEventId = request.headers.get("svix-id");
  setEntity(context, "provider_event", providerEventId);
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!providerEventId || !timestamp || !signature) {
    setErrorCode(context, "MISSING_SIGNATURE_HEADERS");
    return jsonResponse({ error: "missing_signature_headers" }, 400);
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > 1_000_000) {
    setErrorCode(context, "PAYLOAD_TOO_LARGE");
    return jsonResponse({ error: "payload_too_large" }, 413);
  }
  if (
    !(await verifySvixSignature(
      rawBody,
      providerEventId,
      timestamp,
      signature,
      resendWebhookSecret,
    ))
  ) {
    setErrorCode(context, "INVALID_SIGNATURE");
    return jsonResponse({ error: "invalid_signature" }, 400);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    setErrorCode(context, "INVALID_PAYLOAD");
    return jsonResponse({ error: "invalid_payload" }, 400);
  }
  const eventType = isObject(body) ? normalizeEventType(body.type) : null;
  if (!isObject(body) || !eventType || !isObject(body.data)) {
    setErrorCode(context, "INVALID_PAYLOAD");
    return jsonResponse({ error: "invalid_payload" }, 400);
  }

  const providerMessageId = typeof body.data.email_id === "string"
    ? body.data.email_id
    : typeof body.data.id === "string"
    ? body.data.id
    : null;
  if (!providerMessageId || !providerMessageId.trim()) {
    setErrorCode(context, "INVALID_PAYLOAD");
    return jsonResponse({ error: "invalid_payload" }, 400);
  }
  const createdAt = typeof body.created_at === "string" &&
      !Number.isNaN(Date.parse(body.created_at))
    ? new Date(body.created_at).toISOString()
    : new Date().toISOString();

  // The idempotent RPC stores only delivery metadata. Recipient, subject and
  // the raw event body are deliberately never logged or forwarded to Postgres.
  const { error } = await supabase.rpc("record_email_delivery_event", {
    p_provider_event_id: providerEventId,
    p_provider_message_id: providerMessageId,
    p_event_type: eventType,
    p_occurred_at: createdAt,
  });
  if (error) {
    setErrorCode(context, "PROCESSING_FAILED");
    console.error("resend_delivery_event_record_failed", { code: error.code });
    return jsonResponse({ error: "processing_failed" }, 500);
  }
  return jsonResponse({ ok: true });
}));
