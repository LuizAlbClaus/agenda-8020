"use server";

import { runAdminMutation, type AdminResult, type AdminRow } from "@/lib/admin";
import { listAdminResource } from "@/lib/admin";

type Mutation = { operation: string; id?: string; values?: AdminRow };

function jsonArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return fallback;
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : value.split("\n").map((item) => item.trim()).filter(Boolean); } catch { return value.split("\n").map((item) => item.trim()).filter(Boolean); }
}

function jsonObject(value: unknown) {
  if (value && typeof value === "object") return value;
  if (typeof value === "string" && value.trim()) { try { return JSON.parse(value); } catch { return {}; } }
  return {};
}

function actionVersionPayload(values: AdminRow) {
  return { ...values, steps: jsonArray(values.steps, ["Executar a ação escolhida"]), eligible_professions: jsonArray(values.eligible_professions, ["all_services"]), eligible_stages: jsonArray(values.eligible_stages), eligible_bottlenecks: jsonArray(values.eligible_bottlenecks), required_channels: jsonArray(values.required_channels), requirements: jsonObject(values.requirements), max_exposure: values.max_exposure === "" ? null : values.max_exposure };
}

export async function mutateActions(input: Mutation): Promise<AdminResult> {
  const values = input.values ?? {};
  if (input.operation === "create") {
    const protocol = await runAdminMutation("admin_create_action_protocol", { p_slug: String(values.slug ?? values.protocol_id ?? "").trim(), p_type: String(values.action_type ?? "acquisition"), p_category: String(values.category ?? "general"), p_measurement_class: String(values.measurement_class ?? "direct_outreach") }, "/admin/actions");
    if (!protocol.ok) return protocol;
    const protocolId = (protocol.data as { id?: string } | null)?.id;
    if (!protocolId || !values.title) return protocol;
    return runAdminMutation("admin_create_action_version", { p_protocol_id: protocolId, p_payload: actionVersionPayload(values) }, "/admin/actions");
  }
  if (input.operation === "update") return runAdminMutation("admin_update_action_draft", { p_version_id: input.id ?? null, p_payload: actionVersionPayload(values) }, "/admin/actions");
  if (input.operation === "publish") return runAdminMutation("admin_publish_action_version", { p_version_id: input.id ?? null }, "/admin/actions");
  if (input.operation === "active") return runAdminMutation("admin_set_action_protocol_active", { p_protocol_id: String(values.protocol_id ?? values.id ?? input.id ?? ""), p_active: !Boolean(values.active) }, "/admin/actions");
  return { ok: false, error: "Operação desconhecida." };
}

export async function mutateMessages(input: Mutation): Promise<AdminResult> {
  const values = input.values ?? {};
  if (input.operation === "create") {
    const template = await runAdminMutation("admin_create_message_template", { p_slug: String(values.slug ?? "").trim(), p_category: String(values.category ?? "general") }, "/admin/messages");
    if (!template.ok) return template;
    const templateId = (template.data as { id?: string } | null)?.id;
    if (!templateId || !values.title) return template;
    return runAdminMutation("admin_create_message_version", { p_template_id: templateId, p_payload: { title: values.title, body: values.body ?? "", eligible_professions: jsonArray(values.eligible_professions, ["all_services"]) } }, "/admin/messages");
  }
  if (input.operation === "update") return runAdminMutation("admin_update_message_draft", { p_version_id: input.id ?? null, p_payload: { title: values.title, body: values.body, eligible_professions: jsonArray(values.eligible_professions, ["all_services"]) } }, "/admin/messages");
  if (input.operation === "publish") return runAdminMutation("admin_publish_message_version", { p_version_id: input.id ?? null }, "/admin/messages");
  if (input.operation === "active") return runAdminMutation("admin_set_message_template_active", { p_template_id: String(values.template_id ?? input.id ?? ""), p_active: !Boolean(values.active) }, "/admin/messages");
  return { ok: false, error: "Operação desconhecida." };
}

export async function mutatePolicies(input: Mutation): Promise<AdminResult> {
  const values = input.values ?? {};
  const params = jsonObject(values.params ?? { score_weights: { fit: values.fit_weight ?? 35, channel: values.channel_weight ?? 20, prior: values.prior_weight ?? 15, evidence: 15, exploration: 10, viability: 5 }, prior_weight: values.prior_weight ?? 8, recency_half_life_days: values.half_life_days ?? 60, exploration_rate: values.exploration_rate ?? 0 });
  if (input.operation === "create") return runAdminMutation("admin_create_policy_version", { p_params: params }, "/admin/policies");
  if (input.operation === "update") return runAdminMutation("admin_update_policy_draft", { p_version_id: input.id ?? null, p_params: params }, "/admin/policies");
  if (input.operation === "activate") return runAdminMutation("admin_activate_policy_version", { p_version_id: input.id ?? null }, "/admin/policies");
  return { ok: false, error: "Operação desconhecida." };
}

export async function mutateUsers(input: Mutation): Promise<AdminResult> {
  if (input.operation === "resend") return runAdminMutation("admin_resend_access", { p_user_id: input.id ?? null }, "/admin/users");
  if (input.operation === "correct_email") {
    const email = String(input.values?.new_email ?? "").trim().toLowerCase();
    const reason = String(input.values?.reason ?? "").trim();
    if (!input.id || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || reason.length < 3 || reason.length > 240) return { ok: false, error: "Informe um novo e-mail válido e um motivo curto." };
    return runAdminMutation("admin_correct_purchase_email", { p_purchase_id: input.id, p_new_email: email, p_reason: reason }, "/admin/users");
  }
  return { ok: false, error: "Operação desconhecida." };
}

export async function mutateCommerce(input: Mutation): Promise<AdminResult> {
  if (input.operation !== "update" && input.operation !== "create") return { ok: false, error: "Operação desconhecida." };
  const values = input.values ?? {};
  return runAdminMutation("admin_upsert_commerce_mapping", { p_id: input.operation === "create" ? null : input.id ?? null, p_payload: { provider_product_id: values.provider_product_id ?? values.product_id, provider_offer_id: values.provider_offer_id ?? values.offer_id, internal_product_code: values.internal_product_code ?? "agenda_8020", access_days: values.access_days, belevy_benefit_days: values.belevy_benefit_days, active: values.active ?? values.is_active } }, "/admin/commerce");
}

export async function mutateFeatureFlags(input: Mutation): Promise<AdminResult> {
  if (input.operation !== "update" && input.operation !== "create") return { ok: false, error: "Operação desconhecida." };
  const values = input.values ?? {};
  return runAdminMutation("admin_upsert_feature_flag", { p_key: String(values.key ?? values.flag_key ?? input.id ?? ""), p_enabled: Boolean(values.enabled ?? values.is_enabled), p_config: jsonObject(values.config) }, "/admin/feature-flags");
}

export async function searchUsers(email: string) {
  return listAdminResource("admin_list_users", { p_email: email.trim() || null });
}
