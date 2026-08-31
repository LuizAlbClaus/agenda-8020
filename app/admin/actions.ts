"use server";

import { runAdminMutation, type AdminResult, type AdminRow } from "@/lib/admin";
import { listAdminResource } from "@/lib/admin";

type Mutation = { operation: string; id?: string; values?: AdminRow };

function jsonArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : value.split("\n").map((item) => item.trim()).filter(Boolean);
  } catch {
    return value.split("\n").map((item) => item.trim()).filter(Boolean);
  }
}

function jsonObject(value: unknown) {
  if (value && typeof value === "object") return value;
  if (typeof value === "string" && value.trim()) {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return {};
}

function buildActionDraftPayload(values: AdminRow) {
  const payload: AdminRow = {};
  if (values.title !== undefined) payload.title = String(values.title).trim();
  if (values.short_description !== undefined) payload.short_description = String(values.short_description);
  if (values.why_now_template !== undefined) payload.why_now_template = String(values.why_now_template);
  if (values.when_to_use !== undefined) payload.when_to_use = String(values.when_to_use);
  if (values.when_not_to_use !== undefined) payload.when_not_to_use = String(values.when_not_to_use);
  if (values.steps !== undefined) payload.steps = jsonArray(values.steps, ["Executar a ação"]);
  if (values.eligible_professions !== undefined) payload.eligible_professions = jsonArray(values.eligible_professions, ["all_services"]);
  if (values.eligible_stages !== undefined) payload.eligible_stages = jsonArray(values.eligible_stages);
  if (values.eligible_bottlenecks !== undefined) payload.eligible_bottlenecks = jsonArray(values.eligible_bottlenecks);
  if (values.required_channels !== undefined) payload.required_channels = jsonArray(values.required_channels);
  if (values.requirements !== undefined) payload.requirements = jsonObject(values.requirements);
  if (values.duration_minutes !== undefined && values.duration_minutes !== "") payload.duration_minutes = Number(values.duration_minutes);
  if (values.difficulty !== undefined) payload.difficulty = String(values.difficulty);
  if (values.exposure_mode !== undefined) payload.exposure_mode = String(values.exposure_mode);
  if (values.max_exposure !== undefined && values.max_exposure !== "") payload.max_exposure = Number(values.max_exposure);
  if (values.cooldown_hours !== undefined && values.cooldown_hours !== "") payload.cooldown_hours = Number(values.cooldown_hours);
  if (values.maturation_hours !== undefined && values.maturation_hours !== "") payload.maturation_hours = Number(values.maturation_hours);
  if (values.finalization_hours !== undefined && values.finalization_hours !== "") payload.finalization_hours = Number(values.finalization_hours);
  if (values.editorial_prior !== undefined && values.editorial_prior !== "") payload.editorial_prior = Number(values.editorial_prior);
  if (values.ethical_guardrail !== undefined) payload.ethical_guardrail = String(values.ethical_guardrail);
  if (values.message_template !== undefined) payload.message_template = String(values.message_template);
  if (values.slug !== undefined) payload.slug = String(values.slug);
  if (values.action_type !== undefined) payload.action_type = String(values.action_type);
  if (values.category !== undefined) payload.category = String(values.category);
  if (values.measurement_class !== undefined) payload.measurement_class = String(values.measurement_class);
  return payload;
}

export async function mutateActions(input: Mutation): Promise<AdminResult> {
  const values = input.values ?? {};
  if (input.operation === "create") {
    const payload = buildActionDraftPayload(values);
    return runAdminMutation(
      "admin_create_action_draft",
      { p_id: input.id ? input.id : null, p_input: payload },
      "/admin/actions"
    );
  }
  if (input.operation === "update") {
    const payload = buildActionDraftPayload(values);
    return runAdminMutation(
      "admin_update_action_draft",
      { p_id: input.id ?? null, p_input: payload },
      "/admin/actions"
    );
  }
  if (input.operation === "publish") {
    return runAdminMutation(
      "admin_publish_action_draft",
      { p_id: input.id ?? null, p_input: {} },
      "/admin/actions"
    );
  }
  if (input.operation === "active") {
    const protocolId = String(values.protocol_id ?? input.id ?? "");
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
  let params: unknown = {};
  if (values.params) {
    params = jsonObject(values.params);
  } else {
    params = {
      score_weights: {
        fit: Number(values.fit_weight ?? 35),
        channel: Number(values.channel_weight ?? 20),
        prior: Number(values.prior_weight ?? 15),
        evidence: 15,
        exploration: 10,
        viability: 5,
      },
      prior_weight: Number(values.prior_weight ?? 8),
      recency_half_life_days: Number(values.half_life_days ?? 60),
      exploration_rate: Number(values.exploration_rate ?? 0),
    };
  }

  if (input.operation === "create") {
    return runAdminMutation(
      "admin_create_policy_draft",
      { p_id: null, p_input: { params } },
      "/admin/policies"
    );
  }
  if (input.operation === "update") {
    return runAdminMutation(
      "admin_update_policy_draft",
      { p_id: input.id ?? null, p_input: { params } },
      "/admin/policies"
    );
  }
  if (input.operation === "activate") {
    return runAdminMutation(
      "admin_activate_policy",
      { p_id: input.id ?? null, p_input: {} },
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
