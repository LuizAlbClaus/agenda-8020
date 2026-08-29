import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sha256Hex } from "../_shared/observability.ts";

const FUNCTION_NAME = "activate-belevy-benefit";
const ACTIVATION_TIMEOUT_MS = 10_000;
const ACTIVATION_RATE_LIMIT = 5;
const ACTIVATION_RATE_WINDOW_SECONDS = 3_600;
type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getServiceKey(): string | null {
  const raw = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      const value = isObject(parsed) ? parsed.default : null;
      if (typeof value === "string" && value) return value;
      if (isObject(value)) {
        for (const key of ["secret", "service_role", "key", "value"]) {
          if (typeof value[key] === "string" && value[key]) return value[key] as string;
        }
      }
    } catch { /* use legacy environment variable */ }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = getServiceKey();
const supabase: SupabaseClient | null = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

function response(body: JsonObject, status: number, requestId: string): Response {
  return new Response(JSON.stringify({ ...body, request_id: requestId, function_name: FUNCTION_NAME }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function rateLimitedResponse(requestId: string): Response {
  const result = response({
    error: "Muitas tentativas de ativação. Tente novamente mais tarde.",
    error_code: "RATE_LIMIT_EXCEEDED",
  }, 429, requestId);
  result.headers.set("retry-after", String(ACTIVATION_RATE_WINDOW_SECONDS));
  return result;
}

function log(requestId: string, status: string, started: number, entityId?: string, errorCode?: string): void {
  const entry: JsonObject = {
    request_id: requestId,
    function_name: FUNCTION_NAME,
    status,
    latency: Date.now() - started,
  };
  if (entityId) entry.entity_id = entityId;
  if (errorCode) entry.error_code = errorCode;
  console.log(JSON.stringify(entry));
}

function stringValue(value: unknown, max = 256): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max ? value.trim() : null;
}

function safeExternalReference(value: unknown): string | null {
  const reference = stringValue(value, 256);
  return reference && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(reference) ? reference : null;
}

function activationId(value: unknown): string | null {
  if (!isObject(value)) return null;
  for (const key of ["activation_id", "id", "entity_id"]) {
    const found = stringValue(value[key], 128);
    if (found) return found;
  }
  return null;
}

function state(value: unknown): string | null {
  if (!isObject(value)) return null;
  return stringValue(value.status ?? value.state, 32)?.toLowerCase() ?? null;
}

async function failActivation(client: SupabaseClient, id: string | null, code: string): Promise<void> {
  if (!id) return;
  // These RPCs are intentionally service-only; no direct table writes are made here.
  await client.rpc("belevy_activation_fail", { p_activation_id: id, p_error_code: code });
}

Deno.serve(async (request) => {
  const started = Date.now();
  const requestId = request.headers.get("x-request-id")?.slice(0, 128) || crypto.randomUUID();
  if (request.method !== "POST") {
    log(requestId, "rejected", started, undefined, "METHOD_NOT_ALLOWED");
    return response({ error: "Método não permitido." }, 405, requestId);
  }
  if (!supabase) {
    log(requestId, "failed", started, undefined, "BELEVY_ACTIVATION_FAILED");
    return response({ error: "Não foi possível ativar o benefício agora.", error_code: "BELEVY_ACTIVATION_FAILED" }, 503, requestId);
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    log(requestId, "rejected", started, undefined, "ENTITLEMENT_REQUIRED");
    return response({ error: "Faça login para ativar seu benefício.", error_code: "ENTITLEMENT_REQUIRED" }, 401, requestId);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  const user = authData.user;
  if (authError || !user || !user.email) {
    log(requestId, "rejected", started, undefined, "ENTITLEMENT_REQUIRED");
    return response({ error: "Faça login para ativar seu benefício.", error_code: "ENTITLEMENT_REQUIRED" }, 401, requestId);
  }

  const { data: rateLimitAllowed, error: rateLimitError } = await supabase.rpc(
    "consume_rate_limit",
    {
      p_scope: "belevy_activation",
      p_subject_hash: await sha256Hex(`user:${user.id}`),
      p_limit: ACTIVATION_RATE_LIMIT,
      p_window_seconds: ACTIVATION_RATE_WINDOW_SECONDS,
    },
  );
  if (rateLimitError) {
    log(requestId, "failed", started, user.id, "RATE_LIMIT_UNAVAILABLE");
    return response({ error: "Não foi possível verificar a disponibilidade agora.", error_code: "RATE_LIMIT_UNAVAILABLE" }, 503, requestId);
  }
  if (rateLimitAllowed !== true) {
    log(requestId, "rejected", started, user.id, "RATE_LIMIT_EXCEEDED");
    return rateLimitedResponse(requestId);
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    log(requestId, "rejected", started, user.id, "INVALID_PAYLOAD");
    return response({ error: "Pedido inválido." }, 400, requestId);
  }
  const benefitId = isObject(body) ? stringValue(body.benefit_id, 128) : null;
  if (!benefitId) {
    log(requestId, "rejected", started, user.id, "INVALID_PAYLOAD");
    return response({ error: "Benefício inválido." }, 400, requestId);
  }

  const { data: flag, error: flagError } = await supabase.from("feature_flags").select("enabled").eq("key", "belevy_activation_enabled").maybeSingle();
  if (flagError) {
    log(requestId, "failed", started, user.id, "BELEVY_ACTIVATION_FAILED");
    return response({ error: "Não foi possível verificar a disponibilidade agora.", error_code: "BELEVY_ACTIVATION_FAILED" }, 503, requestId);
  }
  if (flag?.enabled !== true) {
    log(requestId, "unavailable", started, user.id, "BELEVY_ACTIVATION_UNAVAILABLE");
    return response({ available: false, message: "Este benefício ainda não está disponível." }, 503, requestId);
  }

  const nameResult = await supabase.from("profiles").select("name").eq("user_id", user.id).maybeSingle();
  const name = stringValue(nameResult.data?.name, 160) ?? stringValue(user.user_metadata?.name, 160) ?? "";
  const startedResult = await supabase.rpc("belevy_activation_start", {
    p_user_id: user.id,
    p_benefit_id: benefitId,
    // The database is the source of truth: paid extensions and legacy
    // benefits may have a different duration than the default promo.
    p_duration_days: null,
  });
  if (startedResult.error) {
    log(requestId, "failed", started, user.id, "BELEVY_ACTIVATION_FAILED");
    return response({ error: "Não foi possível iniciar a ativação.", error_code: "BELEVY_ACTIVATION_FAILED" }, 502, requestId);
  }
  const activation = startedResult.data;
  const durationDays = isObject(activation) && typeof activation.duration_days === "number"
    ? activation.duration_days
    : 0;
  const externalBenefitId = isObject(activation) && typeof activation.external_benefit_id === "string"
    ? activation.external_benefit_id
    : null;
  const benefitCode = isObject(activation) && typeof activation.benefit_code === "string"
    ? activation.benefit_code
    : null;
  // Both the Agenda promo and its paid extension are 30 days. The type must
  // travel explicitly: duration alone must never decide the commercial rule.
  const benefitKind = benefitCode === "belevy_promo"
    ? "promotional"
    : benefitCode === "belevy_paid_extension"
    ? "paid_extension"
    : null;
  if (!externalBenefitId || !benefitKind || !Number.isInteger(durationDays) || durationDays < 1 || durationDays > 3650) {
    log(requestId, "failed", started, user.id, "BELEVY_ACTIVATION_FAILED");
    return response({ error: "Não foi possível ativar o benefício agora.", error_code: "BELEVY_ACTIVATION_FAILED" }, 502, requestId);
  }
  const entityId = activationId(activation);
  const currentState = state(activation);
  // The DB state machine uses available/activating/active/expired/failed.
  // `active` is terminal for this request and must be idempotent.
  if (currentState === "active" || currentState === "completed" || currentState === "complete") {
    log(requestId, "completed", started, entityId ?? user.id);
    return response({ activated: true, already_completed: true, activation_id: entityId }, 200, requestId);
  }
  if (!entityId) {
    log(requestId, "failed", started, user.id, "BELEVY_ACTIVATION_FAILED");
    return response({ error: "Resposta de ativação inválida.", error_code: "BELEVY_ACTIVATION_FAILED" }, 502, requestId);
  }

  const endpoint = Deno.env.get("BELEVY_ACTIVATION_ENDPOINT");
  const sharedSecret = Deno.env.get("BELEVY_SHARED_SECRET");
  if (!endpoint || !sharedSecret) {
    await failActivation(supabase, entityId, "BELEVY_ACTIVATION_FAILED");
    log(requestId, "failed", started, entityId, "BELEVY_ACTIVATION_FAILED");
    return response({ error: "Não foi possível ativar o benefício agora.", error_code: "BELEVY_ACTIVATION_FAILED" }, 503, requestId);
  }

  let externalReference: string | null = null;
  try {
    let parsedEndpoint: URL;
    try { parsedEndpoint = new URL(endpoint); } catch { throw new Error("external_endpoint_invalid"); }
    if (!/^https?:$/.test(parsedEndpoint.protocol)) throw new Error("external_endpoint_invalid");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ACTIVATION_TIMEOUT_MS);
    const external = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", authorization: sharedSecret },
      body: JSON.stringify({
        email: user.email,
        name,
        benefit_id: externalBenefitId,
        duration_days: durationDays,
        benefit_kind: benefitKind,
        source: "agenda",
      }),
    }).finally(() => clearTimeout(timeout));
    if (!external.ok) throw new Error("external_http_failure");
    // The provider may return 204 or an empty body. Any 2xx is successful;
    // inspect JSON only when a non-empty body exists.
    const rawBody = (await external.text()).trim();
    if (rawBody) {
      let payload: unknown;
      try { payload = JSON.parse(rawBody); } catch { throw new Error("external_malformed_response"); }
      if (!isObject(payload)) throw new Error("external_malformed_response");
      // A successful provider response may omit an external identifier. Keep
      // it nullable; validate only an identifier that was actually supplied.
      const suppliedReference = payload.external_reference ?? payload.reference_id ?? payload.id;
      if (suppliedReference !== undefined && suppliedReference !== null) {
        externalReference = safeExternalReference(suppliedReference);
        if (!externalReference) throw new Error("external_malformed_response");
      }
    }
  } catch {
    await failActivation(supabase, entityId, "BELEVY_ACTIVATION_FAILED");
    log(requestId, "failed", started, entityId, "BELEVY_ACTIVATION_FAILED");
    return response({ error: "Não foi possível ativar o benefício agora.", error_code: "BELEVY_ACTIVATION_FAILED" }, 502, requestId);
  }

  const completed = await supabase.rpc("belevy_activation_complete", { p_activation_id: entityId, p_external_reference: externalReference });
  if (completed.error) {
    await failActivation(supabase, entityId, "BELEVY_ACTIVATION_FAILED");
    log(requestId, "failed", started, entityId, "BELEVY_ACTIVATION_FAILED");
    return response({ error: "Não foi possível concluir a ativação.", error_code: "BELEVY_ACTIVATION_FAILED" }, 502, requestId);
  }
  log(requestId, "completed", started, entityId);
  return response({ activated: true, activation_id: entityId }, 200, requestId);
});
