"use server";

import { createClient } from "@/lib/supabase/server";

const EVENT_NAMES = new Set([
  "onboarding_completed",
  "recommendation_shown",
  "action_started",
  "action_completed",
  "outcome_recorded",
  "swap_requested",
  "checkin_completed",
  "benefit_activated",
  "data_export_requested",
  "account_deletion_requested",
  "support_email_correction_requested",
  "copilot_template_used",
  "value_diagnostic_completed",
  "value_action_completed",
  "micro_learning_consumed",
]);

type AnalyticsValue = string | number | boolean;
type AnalyticsProperties = Record<string, AnalyticsValue>;

function safeProperties(value: Record<string, unknown> | undefined): AnalyticsProperties {
  if (!value) return {};
  const result: AnalyticsProperties = {};
  for (const [key, item] of Object.entries(value)) {
    if (!/^[a-z][a-z0-9_]{0,31}$/.test(key)) continue;
    if (["email", "token", "token_hash", "access_token", "refresh_token", "name", "message", "body"].some((part) => key.includes(part))) continue;
    if (typeof item === "string") result[key] = item.slice(0, 80);
    else if (typeof item === "number" && Number.isFinite(item)) result[key] = item;
    else if (typeof item === "boolean") result[key] = item;
  }
  return result;
}

export async function trackAnalyticsEvent(eventName: string, properties?: Record<string, unknown>) {
  if (!EVENT_NAMES.has(eventName)) return false;
  try {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId !== "string" || !userId) return false;
    const { error } = await supabase.rpc("record_analytics_event", {
      p_event_name: eventName,
      p_event_id: globalThis.crypto.randomUUID(),
      p_properties: safeProperties(properties),
    });
    return !error;
  } catch {
    return false;
  }
}
