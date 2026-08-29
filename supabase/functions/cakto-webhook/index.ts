import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  observedHandler,
  sha256Hex,
  setEntity,
  setErrorCode,
} from "../_shared/observability.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const webhookSecret = Deno.env.get("CAKTO_WEBHOOK_SECRET");
const workerSharedSecret = Deno.env.get("WORKER_SHARED_SECRET");

function getServerKey(): string | null {
  const secretKeysJson = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeysJson) {
    try {
      const parsed: unknown = JSON.parse(secretKeysJson);
      const defaultKey = isObject(parsed) ? parsed.default : null;
      if (typeof defaultKey === "string" && defaultKey.length > 0) return defaultKey;
      if (isObject(defaultKey)) {
        for (const keyName of ["secret", "service_role", "key", "value"]) {
          const candidate = defaultKey[keyName];
          if (typeof candidate === "string" && candidate.length > 0) return candidate;
        }
      }
    } catch {
      // Fall back to the legacy variable below; do not log secret material.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}

const serviceRoleKey = getServerKey();

if (!supabaseUrl || !serviceRoleKey || !webhookSecret) {
  throw new Error("cakto_webhook_configuration_missing");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const allowedEvents = new Set(["purchase_approved", "refund", "chargeback"]);
const MAX_PAYLOAD_BYTES = 1_000_000;

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(value: unknown, maxLength = 512): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength
    ? value
    : null;
}

function jsonResponse(body: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function rateLimitedResponse(): Response {
  const result = jsonResponse({
    error: "rate_limit_exceeded",
    error_code: "RATE_LIMIT_EXCEEDED",
  }, 429);
  result.headers.set("retry-after", "60");
  return result;
}

function requestSubject(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return `ip:${request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() || forwarded || "unknown"}`;
}

async function consumeRateLimit(subject: string): Promise<boolean | null> {
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_scope: "cakto_webhook",
    p_subject_hash: await sha256Hex(subject),
    p_limit: 120,
    p_window_seconds: 60,
  });
  if (error) return null;
  return data === true;
}

function triggerEmailWorker(): void {
  if (!supabaseUrl || !workerSharedSecret) return;

  const delivery = fetch(`${supabaseUrl}/functions/v1/send-email-worker`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-agenda-worker-secret": workerSharedSecret,
    },
    body: JSON.stringify({ limit: 10 }),
  })
    .then((response) => {
      if (!response.ok) console.error("email_worker_trigger_failed", { status: response.status });
    })
    .catch(() => {
      console.error("email_worker_trigger_unavailable");
    });

  const runtime = (globalThis as typeof globalThis & {
    EdgeRuntime?: { waitUntil: (promise: Promise<unknown>) => void };
  }).EdgeRuntime;
  if (runtime) runtime.waitUntil(delivery);
}

async function timingSafeEqual(left: string, right: string): Promise<boolean> {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(left)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(right)),
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let index = 0; index < Math.max(leftBytes.length, rightBytes.length); index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return difference === 0;
}

function normalizeEmail(value: unknown): string | null {
  const email = stringField(value, 254)?.trim().toLowerCase() ?? null;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function parsePaidAt(value: unknown): string | null {
  const date = stringField(value, 64);
  if (!date || Number.isNaN(Date.parse(date))) return null;
  return new Date(date).toISOString();
}

async function findOrCreateUser(email: string, name: string | null): Promise<string> {
  const lookup = async (): Promise<string | null> => {
    const { data, error } = await supabase.rpc("lookup_cakto_user_id", {
      p_email: email,
    });
    if (error) throw new Error("user_lookup_failed");
    return typeof data === "string" ? data : null;
  };

  const existingUserId = await lookup();
  if (existingUserId) {
    const { error } = await supabase.auth.admin.updateUserById(existingUserId, {
      email_confirm: true,
      ...(name ? { user_metadata: { name } } : {}),
    });
    if (error) throw new Error("user_confirmation_failed");
    return existingUserId;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    ...(name ? { user_metadata: { name } } : {}),
  });
  if (!error && data.user) return data.user.id;

  // A concurrent webhook may have provisioned the same email between the
  // lookup and create calls. Resolve that race without exposing provider data.
  const racedUserId = await lookup();
  if (racedUserId) return racedUserId;
  throw new Error("user_provision_failed");
}

Deno.serve(observedHandler("cakto-webhook", async (request, context) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") {
    setErrorCode(context, "METHOD_NOT_ALLOWED");
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const rateLimitResult = await consumeRateLimit(requestSubject(request));
  if (rateLimitResult === null) {
    setErrorCode(context, "RATE_LIMIT_UNAVAILABLE");
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
  if (!rateLimitResult) {
    setErrorCode(context, "RATE_LIMIT_EXCEEDED");
    return rateLimitedResponse();
  }

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_PAYLOAD_BYTES) {
    setErrorCode(context, "PAYLOAD_TOO_LARGE");
    return jsonResponse({ error: "payload_too_large" }, 413);
  }
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    setErrorCode(context, "INVALID_JSON");
    return jsonResponse({ error: "invalid_json" }, 400);
  }
  if (!isObject(body)) {
    setErrorCode(context, "INVALID_PAYLOAD");
    return jsonResponse({ error: "invalid_payload" }, 400);
  }

  const receivedSecret = stringField(body.secret, 256);
  if (!receivedSecret || !(await timingSafeEqual(receivedSecret, webhookSecret))) {
    setErrorCode(context, "UNAUTHORIZED");
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const event = stringField(body.event, 64);
  const data = isObject(body.data) ? body.data : null;
  if (!event || !allowedEvents.has(event) || !data) {
    setErrorCode(context, "INVALID_EVENT");
    return jsonResponse({ error: "invalid_event" }, 400);
  }

  const providerOrderId = stringField(data.id, 128);
  setEntity(context, "provider_order", providerOrderId);
  const providerRefId = stringField(data.refId, 128);
  const product = isObject(data.product) ? data.product : null;
  const offer = isObject(data.offer) ? data.offer : null;
  const providerProductId = product ? stringField(product.id, 128) : null;
  const providerOfferId = offer ? stringField(offer.id, 128) : null;
  if (!providerOrderId || !providerProductId || !providerOfferId) {
    setErrorCode(context, "INVALID_ORDER");
    return jsonResponse({ error: "invalid_order" }, 400);
  }

  const customer = isObject(data.customer) ? data.customer : null;
  const customerEmail = normalizeEmail(customer?.email);
  const customerName = stringField(customer?.name, 160)?.trim() || null;
  const paidAt = parsePaidAt(data.paidAt ?? data.createdAt);
  const amount = typeof data.amount === "number" && Number.isFinite(data.amount) && data.amount >= 0
    ? data.amount
    : null;

  // Hash only the received bytes for audit/idempotency evidence. The raw body
  // is never logged or sent to the database.
  const payloadHash = await sha256Hex(rawBody);
  const eventKey = `cakto:${event}:${providerOrderId}`;

  try {
    let userId: string | null = null;
    let mappingIsActive = true;
    const { data: mapping, error: mappingError } = await supabase
      .from("commerce_products")
      .select("id")
      .eq("provider", "cakto")
      .eq("provider_product_id", providerProductId)
      .eq("provider_offer_id", providerOfferId)
      .eq("active", true)
      .maybeSingle();
    if (mappingError) throw new Error("product_mapping_lookup_failed");
    mappingIsActive = Boolean(mapping);

  if (event === "purchase_approved" && mappingIsActive) {
      if (!customerEmail || !paidAt) {
        setErrorCode(context, "INVALID_PURCHASE");
        return jsonResponse({ error: "invalid_purchase" }, 400);
      }
      userId = await findOrCreateUser(customerEmail, customerName);
    }

    const { data: result, error } = await supabase.rpc("process_cakto_webhook_event", {
      p_event_key: eventKey,
      p_event_type: event,
      p_provider_order_id: providerOrderId,
      p_provider_ref_id: providerRefId,
      p_product_id: providerProductId,
      p_offer_id: providerOfferId,
      p_payload_hash: payloadHash,
      p_customer_email: customerEmail,
      p_customer_name: customerName,
      p_user_id: userId,
      p_paid_at: paidAt,
      p_amount: amount,
    });
    if (error) {
      setErrorCode(context, "PROCESSING_FAILED");
      console.error("cakto_webhook_processing_failed", { code: error.code });
      return jsonResponse({ error: "processing_failed" }, 500);
    }

    const resultObject = isObject(result) ? result : {};
    if (event === "purchase_approved" && resultObject.status === "processed") {
      triggerEmailWorker();
    }
    return jsonResponse({ ok: true, status: resultObject.status ?? "processed" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "processing_failed";
    setErrorCode(context, /^[A-Za-z0-9_]{1,80}$/.test(code) ? code : "PROCESSING_FAILED");
    console.error("cakto_webhook_request_failed", { code });
    return jsonResponse({ error: "processing_failed" }, 500);
  }
}));
