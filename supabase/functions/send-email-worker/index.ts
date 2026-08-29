import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  observedHandler,
  setEntity,
  setErrorCode,
} from "../_shared/observability.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const resendApiKey = Deno.env.get("RESEND_API_KEY");
const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
// Kept for the Cakto -> worker trigger. Scheduled callers use the RPC-backed
// x-agenda-schedule-secret path below.
const workerSharedSecret = Deno.env.get("WORKER_SHARED_SECRET");
const appUrl = Deno.env.get("APP_URL") || "https://app.flaviaclaus.com.br";
const redirectTo = `${appUrl.replace(/\/$/, "")}/auth/confirm?next=/onboarding`;

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
      // Legacy fallback below. Never log configuration values.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
}

const serviceRoleKey = getServerKey();

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("worker_supabase_configuration_missing");
}
if (!resendApiKey || !resendFromEmail) {
  throw new Error("worker_email_configuration_missing");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type OutboxItem = {
  id: string;
  idempotency_key: string;
  template_key: string;
  recipient_email: string;
  recipient_name: string | null;
  user_id: string | null;
  payload: JsonObject;
  attempts: number;
  processing_token: string;
};

function jsonResponse(body: JsonObject, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function timingSafeEqual(left: string, right: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(left)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(right)),
  ]);
  const leftBytes = new Uint8Array(a);
  const rightBytes = new Uint8Array(b);
  let difference = leftBytes.length ^ rightBytes.length;
  for (let i = 0; i < Math.max(leftBytes.length, rightBytes.length); i += 1) {
    difference |= (leftBytes[i] ?? 0) ^ (rightBytes[i] ?? 0);
  }
  return difference === 0;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[character] ?? character));
}

function payloadText(item: OutboxItem, ...keys: string[]): string {
  for (const key of keys) {
    const value = text(item.payload?.[key]);
    if (value) return value;
  }
  return "";
}

function safeUrl(value: unknown, fallbackPath: string): string {
  const candidate = text(value);
  try {
    const parsed = new URL(candidate || fallbackPath, appUrl);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    // Use the known application URL when a payload contains an invalid link.
  }
  return new URL(fallbackPath, appUrl).toString();
}

type EmailContent = { subject: string; html: string; text: string };

function emailContent(item: OutboxItem, actionLink = ""): EmailContent {
  const name = text(item.recipient_name, "Olá");
  const safeName = escapeHtml(name);
  const link = actionLink ? safeUrl(actionLink, "/onboarding") : "";
  const safeLink = link ? escapeHtml(link) : "";
  const rawTitle = payloadText(
    item,
    "action_title",
    "recommendation_title",
    "title",
  );
  const rawSummary = payloadText(item, "summary", "message", "body");
  const rawExpiresAt = payloadText(item, "expires_at", "access_expires_at");
  const rawDays = payloadText(item, "days_remaining", "days");
  const title = escapeHtml(rawTitle);
  const summary = escapeHtml(rawSummary);
  const expiresAt = escapeHtml(rawExpiresAt);
  const plainName = name;

  switch (item.template_key) {
    case "access_granted":
      return {
        subject: "Seu acesso ao Agenda 80/20 está pronto",
        html:
          `<p>${safeName},</p><p>Seu pagamento foi confirmado e seu acesso ao Agenda 80/20 está liberado por 365 dias.</p><p><a href="${safeLink}">Entrar no Agenda 80/20</a></p><p>Se o botão não abrir, copie e cole este link no navegador:<br>${safeLink}</p><p>Abraços,<br>Flávia Claus</p>`,
        text:
          `${plainName},\n\nSeu pagamento foi confirmado e seu acesso ao Agenda 80/20 está liberado por 365 dias.\n\nAcesse: ${link}\n\nAbraços,\nFlávia Claus`,
      };
    case "auth_magic_link":
      return {
        subject: "Seu link de acesso ao Agenda 80/20",
        html:
          `<p>${safeName},</p><p>Use este link para entrar no Agenda 80/20:</p><p><a href="${safeLink}">Entrar agora</a></p><p>${safeLink}</p>`,
        text:
          `${plainName},\n\nUse este link para entrar no Agenda 80/20:\n${link}`,
      };
    case "daily_plan_reminder":
      return {
        subject: "Seu próximo passo no Agenda 80/20",
        html:
          `<p>${safeName},</p><p>Separe alguns minutos para fazer seu próximo passo${
            title ? `: <strong>${title}</strong>` : ""
          }.</p>${
            safeLink ? `<p><a href="${safeLink}">Abrir meu plano</a></p>` : ""
          }<p>Um passo simples já conta.</p>`,
        text:
          `${plainName},\n\nSepare alguns minutos para fazer seu próximo passo${
            rawTitle ? `: ${rawTitle}` : ""
          }.\n${
            link ? `Abra seu plano: ${link}\n` : ""
          }\nUm passo simples já conta.`,
      };
    case "outcome_pending":
      return {
        subject: "Como foi seu último passo?",
        html: `<p>${safeName},</p><p>Já dá para registrar como foi${
          title ? ` <strong>${title}</strong>` : ""
        }.</p>${summary ? `<p>${summary}</p>` : ""}${
          safeLink ? `<p><a href="${safeLink}">Registrar resultado</a></p>` : ""
        }`,
        text: `${plainName},\n\nJá dá para registrar como foi${
          rawTitle ? ` ${rawTitle}` : ""
        }.\n${summary ? `${summary}\n` : ""}${
          link ? `Registrar resultado: ${link}` : ""
        }`,
      };
    case "weekly_review":
      return {
        subject: "Sua revisão semanal está pronta",
        html: `<p>${safeName},</p><p>Sua revisão da semana está pronta.</p>${
          summary ? `<p>${summary}</p>` : ""
        }${
          safeLink ? `<p><a href="${safeLink}">Ver minha revisão</a></p>` : ""
        }`,
        text: `${plainName},\n\nSua revisão da semana está pronta.\n${
          rawSummary ? `${rawSummary}\n` : ""
        }${link ? `Ver minha revisão: ${link}` : ""}`,
      };
    case "access_expiring_30d":
    case "access_expiring_7d":
    case "access_expiring_1d": {
      const defaultRemaining = ({
        access_expiring_30d: "30",
        access_expiring_7d: "7",
        access_expiring_1d: "1",
      } as Record<string, string>)[item.template_key];
      const remaining = /^\d{1,3}$/.test(rawDays) ? rawDays : defaultRemaining;
      const safeRemaining = escapeHtml(remaining);
      return {
        subject: `Seu acesso está perto do fim (${defaultRemaining} dias)`,
        html:
          `<p>${safeName},</p><p>Seu acesso ao Agenda 80/20 termina em <strong>${safeRemaining} ${
            remaining === "1" ? "dia" : "dias"
          }</strong>${expiresAt ? ` (${expiresAt})` : ""}.</p>${
            safeLink
              ? `<p><a href="${safeLink}">Abrir o Agenda 80/20</a></p>`
              : ""
          }`,
        text:
          `${plainName},\n\nSeu acesso ao Agenda 80/20 termina em ${remaining} ${
            remaining === "1" ? "dia" : "dias"
          }${expiresAt ? ` (${expiresAt})` : ""}.\n${
            link ? `Abrir o Agenda 80/20: ${link}` : ""
          }`,
      };
    }
    case "access_revoked":
      return {
        subject: "Atualização sobre seu acesso ao Agenda 80/20",
        html:
          `<p>${safeName},</p><p>Seu acesso ao Agenda 80/20 foi encerrado.</p><p>Se você acredita que isso aconteceu por engano, fale com nosso suporte.</p>${
            safeLink
              ? `<p><a href="${safeLink}">Falar com o suporte</a></p>`
              : ""
          }`,
        text:
          `${plainName},\n\nSeu acesso ao Agenda 80/20 foi encerrado.\nSe você acredita que isso aconteceu por engano, fale com nosso suporte.${
            link ? `\n\nSuporte: ${link}` : ""
          }`,
      };
    default:
      throw new Error("unsupported_template");
  }
}

function templateNeedsMagicLink(templateKey: string): boolean {
  return templateKey === "access_granted" || templateKey === "auth_magic_link";
}

async function createDeliveryLink(item: OutboxItem): Promise<string> {
  if (!templateNeedsMagicLink(item.template_key)) {
    const configuredLink = item.payload?.action_url ?? item.payload?.url ??
      item.payload?.support_url;
    return text(configuredLink) ? safeUrl(configuredLink, "/") : "";
  }

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: item.recipient_email,
    options: { redirectTo },
  });
  const actionLink = data?.properties?.action_link;
  const hashedToken = data?.properties?.hashed_token;
  if (error || typeof actionLink !== "string" || !actionLink) {
    throw new Error("magic_link_generation_failed");
  }

  // Prefer a first-party callback carrying the one-time hash. The raw action
  // link remains a compatibility fallback for older Auth responses.
  const callbackUrl = new URL(redirectTo);
  if (typeof hashedToken === "string" && hashedToken) {
    callbackUrl.searchParams.set("token_hash", hashedToken);
    callbackUrl.searchParams.set("type", "magiclink");
  }
  return typeof hashedToken === "string" && hashedToken
    ? callbackUrl.toString()
    : actionLink;
}

async function sendEmail(item: OutboxItem): Promise<string> {
  const deliveryLink = await createDeliveryLink(item);
  const content = emailContent(item, deliveryLink);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [item.recipient_email],
      ...content,
    }),
  });
  if (!response.ok) {
    // Deliberately discard the provider response: it may contain recipient data.
    throw new Error(
      response.status >= 400 && response.status < 500
        ? "resend_rejected"
        : "resend_unavailable",
    );
  }
  try {
    const body: unknown = await response.json();
    const providerMessageId = isObject(body) ? body.id : null;
    if (typeof providerMessageId !== "string" || !providerMessageId.trim()) {
      throw new Error("resend_invalid_response");
    }
    return providerMessageId.trim();
  } catch (error) {
    if (error instanceof Error && error.message === "resend_invalid_response") {
      throw error;
    }
    throw new Error("resend_invalid_response");
  }
}

async function validateScheduledRequest(
  secret: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("validate_scheduled_request", {
    p_secret: secret,
  });
  if (error) return false;
  if (data === true) return true;
  return isObject(data) && (data.valid === true || data.ok === true);
}

async function authorizeRequest(request: Request): Promise<boolean> {
  const scheduleSecret = request.headers.get("x-agenda-cron-secret") ??
    request.headers.get("x-agenda-schedule-secret");
  if (
    scheduleSecret &&
    await validateScheduledRequest(scheduleSecret)
  ) return true;

  // Compatibility path used by cakto-webhook. It stays independent from the
  // RPC so the payment webhook can continue triggering the worker quickly.
  const receivedSecret = request.headers.get("x-agenda-worker-secret");
  return Boolean(
    workerSharedSecret && receivedSecret &&
      await timingSafeEqual(receivedSecret, workerSharedSecret),
  );
}

async function markFailed(
  item: OutboxItem,
  errorCode: string,
  retryable: boolean,
): Promise<void> {
  const { error } = await supabase.rpc("mark_email_outbox_failed", {
    p_id: item.id,
    p_processing_token: item.processing_token,
    p_error_code: errorCode,
    p_retryable: retryable,
  });
  if (error) {
    console.error("email_outbox_failure_update_failed", { code: error.code });
  }
}

Deno.serve(observedHandler("send-email-worker", async (request, context) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "POST") {
    setErrorCode(context, "METHOD_NOT_ALLOWED");
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }
  if (!(await authorizeRequest(request))) {
    setErrorCode(context, "UNAUTHORIZED");
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  let limit = 10;
  try {
    const body: unknown = await request.json();
    if (
      isObject(body) && typeof body.limit === "number" &&
      Number.isFinite(body.limit)
    ) {
      limit = Math.floor(body.limit);
    }
  } catch {
    // Empty POST is the normal invocation shape; invalid JSON is ignored.
  }
  setEntity(context, "email_batch", String(limit));

  const { data: items, error: claimError } = await supabase.rpc(
    "claim_email_outbox",
    { p_limit: limit },
  );
  if (claimError) {
    setErrorCode(context, "WORKER_UNAVAILABLE");
    console.error("email_outbox_claim_failed", { code: claimError.code });
    return jsonResponse({ error: "worker_unavailable" }, 500);
  }

  let sent = 0;
  let failed = 0;
  for (const candidate of (Array.isArray(items) ? items : []) as OutboxItem[]) {
    try {
      const providerMessageId = await sendEmail(candidate);
      const { error } = await supabase.rpc("mark_email_outbox_sent", {
        p_id: candidate.id,
        p_processing_token: candidate.processing_token,
        p_provider_message_id: providerMessageId,
      });
      if (error) throw new Error("email_status_update_failed");
      sent += 1;
    } catch (error) {
      failed += 1;
      const errorCode = error instanceof Error && [
          "magic_link_generation_failed",
          "resend_rejected",
          "resend_unavailable",
          "resend_invalid_response",
          "unsupported_template",
        ].includes(error.message)
        ? error.message
        : "email_delivery_failed";
      await markFailed(
        candidate,
        errorCode,
        errorCode !== "resend_rejected" && errorCode !== "unsupported_template",
      );
    }
  }

  // Counters are operational metadata only; no PII or provider response leaves the function.
  return jsonResponse({
    ok: true,
    claimed: Array.isArray(items) ? items.length : 0,
    sent,
    failed,
  });
}));
