"use server";

import { runAdminMutation, type AdminResult, type AdminRow } from "@/lib/admin";
import { listAdminResource } from "@/lib/admin";

type Mutation = { operation: string; id?: string; values?: AdminRow };

function jsonArray(value: unknown, fallback: string[] = []): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
    return value.split("\n").map((item) => item.trim()).filter(Boolean);
  } catch {
    return value.split("\n").map((item) => item.trim()).filter(Boolean);
  }
}

function parseJsonObject(value: unknown): { ok: true; data: Record<string, unknown> } | { ok: false; error: string } {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ok: true, data: value as Record<string, unknown> };
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { ok: true, data: parsed as Record<string, unknown> };
      }
      return { ok: false, error: "O JSON deve ser um objeto {...}." };
    } catch {
      return { ok: false, error: "Sintaxe JSON inválida." };
    }
  }
  return { ok: false, error: "Conteúdo JSON ausente ou vazio." };
}

export async function mutateActions(input: Mutation): Promise<AdminResult> {
  const values = input.values ?? {};

  if (input.operation === "create") {
    if (!values.slug || !String(values.slug).trim()) {
      return { ok: false, error: "O slug do protocolo é obrigatório para criação." };
    }
    if (!values.title || !String(values.title).trim()) {
      return { ok: false, error: "O título da ação é obrigatório para criação." };
    }

    const steps = jsonArray(values.steps);
    if (steps.length < 1 || steps.length > 3) {
      return { ok: false, error: "Informe entre 1 e 3 passos para a execução da ação." };
    }

    // Number validations
    let cooldownHours: number | undefined;
    if (values.cooldown_days !== undefined && values.cooldown_days !== "") {
      const cd = Number(values.cooldown_days);
      if (isNaN(cd) || cd < 0) {
        return { ok: false, error: "Cooldown (dias) deve ser um número maior ou igual a zero." };
      }
      cooldownHours = cd * 24;
    }

    let maturityHours: number | undefined;
    if (values.maturity_hours !== undefined && values.maturity_hours !== "") {
      const mh = Number(values.maturity_hours);
      if (isNaN(mh) || mh < 0) {
        return { ok: false, error: "Maturação (horas) deve ser um número maior ou igual a zero." };
      }
      maturityHours = mh;
    }

    let priorityVal: number | undefined;
    const rawPriority =
      values.priority !== undefined && values.priority !== ""
        ? values.priority
        : values.prior !== undefined && values.prior !== ""
          ? values.prior
          : undefined;
    if (rawPriority !== undefined) {
      const p = Number(rawPriority);
      if (isNaN(p) || p < 0 || p > 1) {
        return { ok: false, error: "Prioridade editorial deve ser um número entre 0 e 1." };
      }
      priorityVal = p;
    }

    // Build schema-native payload incrementally without fabricating defaults
    const payload: AdminRow = {
      slug: String(values.slug).trim(),
      title: String(values.title).trim(),
      steps,
    };

    if (values.short_description !== undefined && values.short_description !== "") {
      payload.short_description = String(values.short_description);
    }
    if (values.eligibility !== undefined || values.requires_context_signal !== undefined) {
      const reqObj: Record<string, unknown> = {};
      if (values.eligibility !== undefined) {
        reqObj.editorial_input =
          typeof values.eligibility === "object"
            ? JSON.stringify(values.eligibility)
            : String(values.eligibility);
      }
      if (values.requires_context_signal !== undefined) {
        reqObj.requires_context_signal = Boolean(values.requires_context_signal);
      }
      payload.requirements = reqObj;
    }
    if (cooldownHours !== undefined) {
      payload.cooldown_hours = cooldownHours;
    }
    if (maturityHours !== undefined) {
      payload.maturation_hours = maturityHours;
    }
    if (priorityVal !== undefined) {
      payload.editorial_prior = priorityVal;
    }
    if (values.guardrail !== undefined && values.guardrail !== "") {
      payload.ethical_guardrail = String(values.guardrail);
    }
    if (values.action_type !== undefined && values.action_type !== "") {
      payload.action_type = String(values.action_type);
    }
    if (values.category !== undefined && values.category !== "") {
      payload.category = String(values.category);
    }
    if (values.measurement_class !== undefined && values.measurement_class !== "") {
      payload.measurement_class = String(values.measurement_class);
    }

    return runAdminMutation(
      "admin_create_action_draft",
      { p_id: input.id ? input.id : null, p_input: payload },
      "/admin/actions"
    );
  }

  if (input.operation === "update") {
    if (!input.id) {
      return { ok: false, error: "ID da versão de ação ausente para atualização." };
    }

    // Validate numbers if provided
    if (values.cooldown_days !== undefined && values.cooldown_days !== "") {
      const cd = Number(values.cooldown_days);
      if (isNaN(cd) || cd < 0) {
        return { ok: false, error: "Cooldown (dias) deve ser um número maior ou igual a zero." };
      }
    }
    if (values.maturity_hours !== undefined && values.maturity_hours !== "") {
      const mh = Number(values.maturity_hours);
      if (isNaN(mh) || mh < 0) {
        return { ok: false, error: "Maturação (horas) deve ser um número maior ou igual a zero." };
      }
    }
    const rawPriority =
      values.priority !== undefined && values.priority !== ""
        ? values.priority
        : values.prior !== undefined && values.prior !== ""
          ? values.prior
          : undefined;
    if (rawPriority !== undefined) {
      const p = Number(rawPriority);
      if (isNaN(p) || p < 0 || p > 1) {
        return { ok: false, error: "Prioridade editorial deve ser um número entre 0 e 1." };
      }
    }

    // Send strictly the exact aliases consumed by admin_update_action_draft(p_id, p_input)
    const payload: AdminRow = {};
    if (values.title !== undefined && values.title !== "") {
      payload.title = String(values.title).trim();
    }
    if (values.short_description !== undefined) {
      payload.short_description = String(values.short_description);
    }
    if (values.eligibility !== undefined) {
      payload.eligibility =
        typeof values.eligibility === "object"
          ? JSON.stringify(values.eligibility)
          : String(values.eligibility);
    }
    if (values.requires_context_signal !== undefined) {
      payload.requires_context_signal = Boolean(values.requires_context_signal);
    }
    if (values.cooldown_days !== undefined && values.cooldown_days !== "") {
      payload.cooldown_days = Number(values.cooldown_days);
    }
    if (values.maturity_hours !== undefined && values.maturity_hours !== "") {
      payload.maturity_hours = Number(values.maturity_hours);
    }
    if (rawPriority !== undefined) {
      payload.priority = Number(rawPriority);
    }
    if (values.guardrail !== undefined) {
      payload.guardrail = String(values.guardrail);
    }

    return runAdminMutation(
      "admin_update_action_draft",
      { p_id: input.id, p_input: payload },
      "/admin/actions"
    );
  }

  if (input.operation === "publish") {
    if (!input.id) return { ok: false, error: "ID da versão ausente para publicação." };
    return runAdminMutation(
      "admin_publish_action_draft",
      { p_id: input.id, p_input: {} },
      "/admin/actions"
    );
  }

  if (input.operation === "active") {
    const protocolId = String(values.protocol_id ?? input.id ?? "");
    if (!protocolId) return { ok: false, error: "ID do protocolo ausente." };
    const nextActive = !Boolean(values.active ?? values.is_active);
    return runAdminMutation(
      "admin_set_protocol_active",
      { p_id: protocolId, p_input: { is_active: nextActive } },
      "/admin/actions"
    );
  }

  return { ok: false, error: "Operação desconhecida." };
}

export async function mutateMessages(input: Mutation): Promise<AdminResult> {
  const values = input.values ?? {};
  if (input.operation === "create") {
    const payload: AdminRow = {
      name: String(values.slug ?? values.name ?? "message").trim(),
      message_template: String(values.body ?? values.message_template ?? ""),
      channel: String(values.category ?? values.channel ?? "direct"),
      eligible_professions: jsonArray(values.eligible_professions, ["all_services"]),
    };
    return runAdminMutation(
      "admin_create_message_draft",
      { p_id: input.id ? input.id : null, p_input: payload },
      "/admin/messages"
    );
  }
  if (input.operation === "update") {
    const payload: AdminRow = {};
    if (values.title !== undefined || values.name !== undefined) {
      payload.name = String(values.title ?? values.name);
    }
    if (values.body !== undefined || values.message_template !== undefined) {
      payload.message_template = String(values.body ?? values.message_template);
    }
    return runAdminMutation(
      "admin_update_message_draft",
      { p_id: input.id ?? null, p_input: payload },
      "/admin/messages"
    );
  }
  if (input.operation === "publish") {
    return runAdminMutation(
      "admin_publish_message_draft",
      { p_id: input.id ?? null, p_input: {} },
      "/admin/messages"
    );
  }
  if (input.operation === "active") {
    const templateId = String(values.template_id ?? input.id ?? "");
    const nextActive = !Boolean(values.active ?? values.is_active);
    return runAdminMutation(
      "admin_set_message_template_active",
      { p_id: templateId, p_input: { is_active: nextActive } },
      "/admin/messages"
    );
  }
  return { ok: false, error: "Operação desconhecida." };
}

export async function mutatePolicies(input: Mutation): Promise<AdminResult> {
  const values = input.values ?? {};

  if (input.operation === "create" || input.operation === "update") {
    const parsed = parseJsonObject(values.params);
    if (!parsed.ok) {
      return { ok: false, error: `Parâmetros da política inválidos: ${parsed.error}` };
    }

    if (input.operation === "create") {
      return runAdminMutation(
        "admin_create_policy_draft",
        { p_id: null, p_input: { params: parsed.data } },
        "/admin/policies"
      );
    }

    return runAdminMutation(
      "admin_update_policy_draft",
      { p_id: input.id ?? null, p_input: { params: parsed.data } },
      "/admin/policies"
    );
  }

  if (input.operation === "activate") {
    if (!input.id) return { ok: false, error: "ID da política ausente." };
    return runAdminMutation(
      "admin_activate_policy",
      { p_id: input.id, p_input: {} },
      "/admin/policies"
    );
  }

  return { ok: false, error: "Operação desconhecida." };
}

export async function mutateUsers(input: Mutation): Promise<AdminResult> {
  if (input.operation === "resend") {
    return runAdminMutation(
      "admin_resend_access",
      { p_user_id: input.id ?? null },
      "/admin/users"
    );
  }
  if (input.operation === "correct_email") {
    const email = String(input.values?.new_email ?? "").trim().toLowerCase();
    const reason = String(input.values?.reason ?? "").trim();
    if (!input.id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || reason.length < 3 || reason.length > 240) {
      return { ok: false, error: "Informe um novo e-mail válido e um motivo curto." };
    }
    return runAdminMutation(
      "admin_correct_purchase_email",
      { p_purchase_id: input.id, p_new_email: email, p_reason: reason },
      "/admin/users"
    );
  }
  return { ok: false, error: "Operação desconhecida." };
}

export async function mutateCommerce(input: Mutation): Promise<AdminResult> {
  if (input.operation !== "update" && input.operation !== "create") {
    return { ok: false, error: "Operação desconhecida." };
  }
  const values = input.values ?? {};
  const payload: AdminRow = {
    provider_product_id: values.provider_product_id ?? values.product_id,
    provider_offer_id: values.provider_offer_id ?? values.offer_id,
    internal_product_code: values.internal_product_code ?? "agenda_8020",
    access_days: values.access_days !== undefined && values.access_days !== "" ? Number(values.access_days) : undefined,
    belevy_benefit_days: values.belevy_benefit_days !== undefined && values.belevy_benefit_days !== "" ? Number(values.belevy_benefit_days) : undefined,
    active: values.active !== undefined ? Boolean(values.active) : values.is_active !== undefined ? Boolean(values.is_active) : undefined,
  };
  return runAdminMutation(
    "admin_upsert_commerce_mapping",
    { p_id: input.operation === "create" ? null : input.id ?? null, p_payload: payload },
    "/admin/commerce"
  );
}

export async function mutateFeatureFlags(input: Mutation): Promise<AdminResult> {
  if (input.operation !== "update") {
    return { ok: false, error: "Criação de flags não suportada nesta rota." };
  }
  const values = input.values ?? {};
  const flagKey = String(values.flag_key ?? values.key ?? input.id ?? "").trim();
  const isEnabled = Boolean(values.is_enabled ?? values.enabled);
  const description = String(values.description ?? "");

  return runAdminMutation(
    "admin_update_feature_flag",
    {
      p_id: flagKey,
      p_input: {
        flag_key: flagKey,
        is_enabled: isEnabled,
        description: description,
      },
    },
    "/admin/feature-flags"
  );
}

export async function searchUsers(email: string) {
  return listAdminResource("admin_list_users", { p_email: email.trim() || null });
}
