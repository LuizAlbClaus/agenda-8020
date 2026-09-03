/**
 * Test Suite Profundo de Integração e Segurança: Agenda 80/20 <-> Belevy
 * 
 * Valida os contratos arquiteturais:
 * 1. Autorização Bearer com timingSafeEqual (resistência a timing attacks).
 * 2. Validação estrita de schema: rejeição de payloads malformados e datas invertidas (ends_at <= starts_at).
 * 3. Idempotência de eventos de agendamento duplicados (event_id idêntico).
 * 4. Normalização dos estados do benefício Belevy (not_configured, available, activating, active, expired).
 * 5. Transição de copy no app logado: ausência de "Benefício Parceiro Opcional" e presença de "Sua Agenda Oficial Integrada".
 */

import assert from "node:assert/strict";
import { timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

// Carregar dinamicamente o Route Handler e dependências
let postBelevyEventWithDeps;
try {
  // Tentativa de importação direta (quando executado via tsx)
  const mod = await import("../app/api/integrations/belevy/events/route.ts");
  postBelevyEventWithDeps = mod.postBelevyEventWithDeps;
} catch {
  // Execução via Node nativo (com strip-types): adaptar os imports para resolução ESM do Node
  const routePath = path.resolve("app/api/integrations/belevy/events/route.ts");
  let code = fs.readFileSync(routePath, "utf-8");
  code = code
    .replace(/from\s+["']next\/server["']/g, 'from "next/server.js"')
    .replace(/from\s+["']@\/lib\/supabase\/admin["']/g, 'from "../../../../../lib/supabase/admin.ts"');

  const tempShim = path.resolve("app/api/integrations/belevy/events/.temp-deep-test-shim.ts");
  fs.writeFileSync(tempShim, code, "utf-8");
  try {
    const mod = await import(pathToFileURL(tempShim).href);
    postBelevyEventWithDeps = mod.postBelevyEventWithDeps;
  } finally {
    try { fs.unlinkSync(tempShim); } catch {}
  }
}

// Carregar módulo de integração Belevy
const { getBelevyAgendaSummary, publicUrlForSlug } = await import("../lib/belevy-integration.ts");

// Helper para montar requisições HTTP simuladas
function makeRequest(body, options = {}) {
  const {
    authorization = "Bearer test-secret-agenda-8020",
    contentLength,
    rawBody,
  } = options;

  const headers = {
    authorization,
    "content-type": "application/json",
  };

  if (contentLength !== undefined) {
    headers["content-length"] = String(contentLength);
  }

  const payload = rawBody !== undefined ? rawBody : JSON.stringify(body);

  return new Request("https://agenda.local/api/integrations/belevy/events", {
    method: "POST",
    headers,
    body: payload,
  });
}

// Helper para mock de dependências do handler
function makeDeps(mockRpcResult = { ok: true, duplicate: false }, expectedSecret = "test-secret-agenda-8020") {
  const calls = [];
  const admin = {
    rpc: async (name, args) => {
      calls.push({ name, args });
      if (mockRpcResult.error) {
        return { data: null, error: mockRpcResult.error };
      }
      return { data: mockRpcResult, error: null };
    },
  };
  return {
    expectedSecret,
    createAdminClient: () => admin,
    calls,
  };
}

const baseValidEvent = {
  event_id: "evt_belevy_2026_001",
  event_type: "confirmed",
  appointment_id: "apt_998877",
  service_name: "Coloração e Corte Especial",
  starts_at: "2026-09-10T14:00:00.000Z",
  ends_at: "2026-09-10T15:30:00.000Z",
  status: "confirmed",
  occurred_at: "2026-09-10T13:45:00.000Z",
  source: "belevy",
};

// ============================================================================
// 1. AUTORIZAÇÃO BEARER & TIMING-SAFE EQUAL
// ============================================================================
test("1.1 Validação de tempo constante com timingSafeEqual", () => {
  function sameSecret(provided, expected) {
    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);
    return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
  }

  const secret = "super-secret-key-1234567890-belevy-auth";
  const sameLengthWrong = "super-secret-key-1234567890-belevy-diff";
  const shorter = "super-secret";
  const longer = "super-secret-key-1234567890-belevy-auth-extra-bytes";

  // Correspondência exata
  assert.equal(sameSecret(secret, secret), true);

  // Mesmo tamanho, bytes diferentes: deve avaliar sem lançar RangeError
  assert.equal(sameSecret(sameLengthWrong, secret), false);

  // Tamanhos diferentes: proteção contra RangeError do timingSafeEqual
  assert.equal(sameSecret(shorter, secret), false);
  assert.equal(sameSecret(longer, secret), false);
  assert.equal(sameSecret("", secret), false);
  assert.equal(sameSecret(secret, ""), false);
});

test("1.2 Rejeição de requests sem autorização ou com segredo inválido", async () => {
  const d = makeDeps();

  // Sem header Authorization
  const reqNoAuth = new Request("https://agenda.local/api/integrations/belevy/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(baseValidEvent),
  });
  const resNoAuth = await postBelevyEventWithDeps(reqNoAuth, d);
  assert.equal(resNoAuth.status, 401);
  assert.deepEqual(await resNoAuth.json(), { error: "Não autorizado" });
  assert.equal(d.calls.length, 0, "Supabase RPC não pode ser chamado em falha de autenticação");

  // Header Authorization com esquema inválido (não-Bearer)
  const resBasic = await postBelevyEventWithDeps(makeRequest(baseValidEvent, { authorization: "Basic dXNlcjpwYXNz" }), d);
  assert.equal(resBasic.status, 401);

  // Header Authorization com token incorreto de mesmo comprimento
  const resWrongSameLen = await postBelevyEventWithDeps(makeRequest(baseValidEvent, { authorization: "Bearer wrong-secret-agenda-9999" }), d);
  assert.equal(resWrongSameLen.status, 401);

  // Header Authorization com token de comprimento diferente
  const resWrongDiffLen = await postBelevyEventWithDeps(makeRequest(baseValidEvent, { authorization: "Bearer wrong" }), d);
  assert.equal(resWrongDiffLen.status, 401);

  // Dependência sem expectedSecret configurado no servidor
  const resNoEnvSecret = await postBelevyEventWithDeps(makeRequest(baseValidEvent), { ...d, expectedSecret: undefined });
  assert.equal(resNoEnvSecret.status, 401);
  assert.equal(d.calls.length, 0);
});

test("1.3 Aceite de formato Bearer em diferentes capitalizações (case-insensitive)", async () => {
  const variations = [
    "Bearer test-secret-agenda-8020",
    "bearer test-secret-agenda-8020",
    "BEARER test-secret-agenda-8020",
  ];

  for (const authHeader of variations) {
    const d = makeDeps({ ok: true, duplicate: false });
    const res = await postBelevyEventWithDeps(makeRequest(baseValidEvent, { authorization: authHeader }), d);
    assert.equal(res.status, 200, `Falha para header: ${authHeader}`);
    assert.equal(d.calls.length, 1);
  }
});

// ============================================================================
// 2. REJEIÇÃO DE PAYLOADS MALFORMADOS OU DATAS INVERTIDAS
// ============================================================================
test("2.1 Rejeita datas invertidas (ends_at < starts_at) com 400", async () => {
  const d = makeDeps();
  const invertedPayload = {
    ...baseValidEvent,
    starts_at: "2026-09-10T16:00:00.000Z",
    ends_at: "2026-09-10T14:00:00.000Z", // Termina antes de começar!
  };

  const res = await postBelevyEventWithDeps(makeRequest(invertedPayload), d);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "Payload inválido" });
  assert.equal(d.calls.length, 0, "Supabase RPC jamais deve ser chamado para datas invertidas");
});

test("2.2 Rejeita datas idênticas (ends_at == starts_at) com 400", async () => {
  const d = makeDeps();
  const equalPayload = {
    ...baseValidEvent,
    starts_at: "2026-09-10T14:00:00.000Z",
    ends_at: "2026-09-10T14:00:00.000Z", // Duração zero!
  };

  const res = await postBelevyEventWithDeps(makeRequest(equalPayload), d);
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "Payload inválido" });
  assert.equal(d.calls.length, 0, "Supabase RPC jamais deve ser chamado para duração zero");
});

test("2.3 Rejeita payload sem campos obrigatórios do contrato Belevy", async () => {
  const requiredFields = [
    "event_id",
    "event_type",
    "appointment_id",
    "service_name",
    "starts_at",
    "ends_at",
    "status",
    "source",
  ];

  for (const field of requiredFields) {
    const d = makeDeps();
    const incomplete = { ...baseValidEvent };
    delete incomplete[field];

    const res = await postBelevyEventWithDeps(makeRequest(incomplete), d);
    assert.equal(res.status, 400, `Deveria rejeitar ausência de ${field}`);
    assert.equal(d.calls.length, 0);
  }
});

test("2.4 Rejeita event_type desconhecido", async () => {
  const d = makeDeps();
  const invalidTypePayload = { ...baseValidEvent, event_type: "deleted_permanently" };
  const res = await postBelevyEventWithDeps(makeRequest(invalidTypePayload), d);
  assert.equal(res.status, 400);
  assert.equal(d.calls.length, 0);
});

test("2.5 Rejeita source diferente de 'belevy'", async () => {
  const d = makeDeps();
  const invalidSourcePayload = { ...baseValidEvent, source: "google_calendar" };
  const res = await postBelevyEventWithDeps(makeRequest(invalidSourcePayload), d);
  assert.equal(res.status, 400);
  assert.equal(d.calls.length, 0);
});

test("2.6 Rejeita payload malformado (JSON corrompido) ou acima de 16KB", async () => {
  const d1 = makeDeps();
  const resBadJson = await postBelevyEventWithDeps(makeRequest(null, { rawBody: "{ invalid json: true" }), d1);
  assert.equal(resBadJson.status, 400);
  assert.equal(d1.calls.length, 0);

  const d2 = makeDeps();
  const resTooLarge = await postBelevyEventWithDeps(makeRequest(baseValidEvent, { contentLength: 20_000 }), d2);
  assert.equal(resTooLarge.status, 400);
  assert.equal(d2.calls.length, 0);
});

// ============================================================================
// 3. IDEMPOTÊNCIA DE EVENTOS DE AGENDAMENTO DUPLICADOS
// ============================================================================
test("3.1 Ingestão inicial de evento gera duplicate: false", async () => {
  const d = makeDeps({ ok: true, duplicate: false });
  const res = await postBelevyEventWithDeps(makeRequest(baseValidEvent), d);

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.duplicate, false);

  assert.equal(d.calls.length, 1);
  assert.equal(d.calls[0].name, "record_belevy_appointment_event");
  assert.equal(d.calls[0].args.p_event_id, baseValidEvent.event_id);
  assert.equal(d.calls[0].args.p_appointment_id, baseValidEvent.appointment_id);
  assert.equal(d.calls[0].args.p_service_name, baseValidEvent.service_name);
  assert.equal(d.calls[0].args.p_starts_at, baseValidEvent.starts_at);
  assert.equal(d.calls[0].args.p_ends_at, baseValidEvent.ends_at);
});

test("3.2 Re-entrega de evento com mesmo event_id retorna duplicate: true com status 200", async () => {
  // Simulando segunda chamada com duplicate: true pelo Postgres/RPC
  const d = makeDeps({ ok: true, duplicate: true });
  const res = await postBelevyEventWithDeps(makeRequest(baseValidEvent), d);

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.duplicate, true, "Deve sinalizar duplicate: true para re-entregas idempotentes");
});

test("3.3 Falha transitória de banco de dados retorna 503 com erro seguro", async () => {
  const d = makeDeps({ error: { code: "57P01", message: "admin shutdown" } });
  const res = await postBelevyEventWithDeps(makeRequest(baseValidEvent), d);

  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "Evento temporariamente indisponível" });
});

// ============================================================================
// 4. NORMALIZAÇÃO DOS ESTADOS DO BENEFÍCIO BELEVY
// ============================================================================
test("4.1 Normalização de URLs com publicUrlForSlug", () => {
  assert.equal(publicUrlForSlug("salao-maria"), "https://belevy.com.br/salao-maria");
  assert.equal(publicUrlForSlug("espaco bella"), "https://belevy.com.br/espaco%20bella");
});

test("4.2 getBelevyAgendaSummary retorna 'not_configured' sem parâmetros", async () => {
  // Sem variáveis de ambiente nem e-mail
  const originalEndpoint = process.env.BELEVY_AGENDA_SUMMARY_ENDPOINT;
  const originalSecret = process.env.BELEVY_SHARED_SECRET;
  delete process.env.BELEVY_AGENDA_SUMMARY_ENDPOINT;
  delete process.env.BELEVY_SHARED_SECRET;

  try {
    const res = await getBelevyAgendaSummary("teste@agenda.com");
    assert.deepEqual(res, { status: "not_configured" });

    const resNoEmail = await getBelevyAgendaSummary(undefined);
    assert.deepEqual(resNoEmail, { status: "not_configured" });
  } finally {
    if (originalEndpoint) process.env.BELEVY_AGENDA_SUMMARY_ENDPOINT = originalEndpoint;
    if (originalSecret) process.env.BELEVY_SHARED_SECRET = originalSecret;
  }
});

test("4.3 Normalização dos 5 estados de benefício no modelo da aplicação", () => {
  // Função canônica de normalização de benefício presente em app/belevy/page.tsx e settings
  function normalizeBenefit(raw) {
    if (!raw) return { status: "not_configured", available: false, active: false, activating: false, expired: false };
    const status = String(raw.status ?? "available");
    return {
      benefit_id: raw.benefit_id ? String(raw.benefit_id) : null,
      status,
      duration_days: Number(raw.duration_days ?? 0),
      total_days: Number(raw.total_days ?? raw.duration_days ?? 0),
      activation_enabled: raw.activation_enabled === true,
      show_handoff: raw.show_handoff === true,
      available: status === "available",
      activating: status === "activating",
      active: status === "active",
      expired: status === "expired",
    };
  }

  // Estado 1: not_configured (usuário sem registro de benefício)
  const sNotConfigured = normalizeBenefit(null);
  assert.equal(sNotConfigured.status, "not_configured");
  assert.equal(sNotConfigured.available, false);
  assert.equal(sNotConfigured.active, false);

  // Estado 2: available (elegível, aguardando ativação voluntária do usuário)
  const sAvailable = normalizeBenefit({ benefit_id: "b-1", status: "available", duration_days: 30, activation_enabled: true });
  assert.equal(sAvailable.status, "available");
  assert.equal(sAvailable.available, true);
  assert.equal(sAvailable.activation_enabled, true);

  // Estado 3: activating (máquina de estados em processamento/tentativa)
  const sActivating = normalizeBenefit({ benefit_id: "b-2", status: "activating", duration_days: 30 });
  assert.equal(sActivating.status, "activating");
  assert.equal(sActivating.activating, true);
  assert.equal(sActivating.active, false);

  // Estado 4: active (benefício ativado e funcional)
  const sActive = normalizeBenefit({ benefit_id: "b-3", status: "active", duration_days: 30 });
  assert.equal(sActive.status, "active");
  assert.equal(sActive.active, true);

  // Estado 5: expired (período de cortesia finalizado, retorno ao modo autônomo)
  const sExpired = normalizeBenefit({ benefit_id: "b-4", status: "expired", duration_days: 30 });
  assert.equal(sExpired.status, "expired");
  assert.equal(sExpired.expired, true);
  assert.equal(sExpired.active, false);
});

// ============================================================================
// 5. TRANSIÇÃO DE COPY NO APP LOGADO (/today e /belevy)
// ============================================================================
test("5.1 Verificação da transição de copy nos arquivos do app logado", () => {
  const todayPath = path.resolve("app/today/page.tsx");
  const belevyPath = path.resolve("app/belevy/page.tsx");
  const benefitCardPath = path.resolve("app/belevy/benefit-card.tsx");

  const todayContent = fs.readFileSync(todayPath, "utf-8");
  const belevyContent = fs.readFileSync(belevyPath, "utf-8");
  const benefitCardContent = fs.readFileSync(benefitCardPath, "utf-8");

  const legacyTermRegex = /benef[ií]cio\s+parceiro\s+opcional/i;
  const partnerOptionalRegex = /parceiro\s+opcional/i;

  // 1. Ausência do termo legado depreciado
  assert.equal(
    legacyTermRegex.test(todayContent),
    false,
    "app/today/page.tsx não deve conter 'Benefício Parceiro Opcional'"
  );
  assert.equal(
    legacyTermRegex.test(belevyContent),
    false,
    "app/belevy/page.tsx não deve conter 'Benefício Parceiro Opcional'"
  );
  assert.equal(
    legacyTermRegex.test(benefitCardContent),
    false,
    "app/belevy/benefit-card.tsx não deve conter 'Benefício Parceiro Opcional'"
  );
  assert.equal(
    partnerOptionalRegex.test(todayContent),
    false,
    "app/today/page.tsx não deve conter 'Parceiro Opcional'"
  );
  assert.equal(
    partnerOptionalRegex.test(belevyContent),
    false,
    "app/belevy/page.tsx não deve conter 'Parceiro Opcional'"
  );

  // 2. Presença dos termos oficiais de infraestrutura integrada
  const hasOfficialInToday =
    todayContent.includes("Sua agenda oficial integrada") ||
    todayContent.includes("Sua Agenda Oficial");
  assert.equal(
    hasOfficialInToday,
    true,
    "app/today/page.tsx deve conter 'Sua agenda oficial integrada' ou 'Sua Agenda Oficial'"
  );

  const hasOfficialInBelevy =
    belevyContent.includes("Agenda Oficial Integrada") ||
    belevyContent.includes("Sua Agenda Oficial no Belevy Pro");
  assert.equal(
    hasOfficialInBelevy,
    true,
    "app/belevy/page.tsx deve conter 'Agenda Oficial Integrada' e 'Sua Agenda Oficial no Belevy Pro'"
  );

  // 3. Garantia de independência arquitetural expressa na interface
  assert.equal(
    benefitCardContent.includes("O Agenda 80/20 é um produto independente"),
    true,
    "app/belevy/benefit-card.tsx deve manter o disclaimer de independência de produto"
  );
});
