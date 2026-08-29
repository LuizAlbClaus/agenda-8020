"use server";

import { revalidatePath } from "next/cache";
import { canAccessAgenda } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";

export type ReminderPeriod = "morning" | "afternoon" | "evening";

export type NotificationPreferences = {
  dailyPlanReminderEnabled: boolean;
  dailyPlanReminderPeriod: ReminderPeriod;
  weeklyReviewEnabled: boolean;
  outcomePendingEnabled: boolean;
  marketingOptIn?: boolean;
};

const PERIODS: readonly ReminderPeriod[] = ["morning", "afternoon", "evening"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseInput(value: unknown): NotificationPreferences | null {
  if (!isRecord(value)) return null;

  const dailyPlanReminderEnabled = value.dailyPlanReminderEnabled;
  const dailyPlanReminderPeriod = value.dailyPlanReminderPeriod;
  const weeklyReviewEnabled = value.weeklyReviewEnabled;
  const outcomePendingEnabled = value.outcomePendingEnabled;
  const marketingOptIn = value.marketingOptIn;

  if (
    typeof dailyPlanReminderEnabled !== "boolean" ||
    typeof weeklyReviewEnabled !== "boolean" ||
    typeof outcomePendingEnabled !== "boolean" ||
    typeof dailyPlanReminderPeriod !== "string" ||
    !PERIODS.includes(dailyPlanReminderPeriod as ReminderPeriod) ||
    (marketingOptIn !== undefined && typeof marketingOptIn !== "boolean")
  ) {
    return null;
  }

  return {
    dailyPlanReminderEnabled,
    dailyPlanReminderPeriod: dailyPlanReminderPeriod as ReminderPeriod,
    weeklyReviewEnabled,
    outcomePendingEnabled,
    ...(marketingOptIn === undefined ? {} : { marketingOptIn }),
  };
}

/**
 * Saves only the authenticated user's notification preferences.
 * The RPC owns the row-level authorization and receives the explicit
 * preference arguments defined by the notification-preferences contract.
 */
export async function saveNotificationPreferences(input: unknown) {
  const preferences = parseInput(input);
  if (!preferences) {
    return { ok: false as const, error: "Revise suas preferências e tente novamente." };
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { ok: false as const, error: "Sua sessão expirou. Entre novamente para salvar." };
  }

  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string" || !userId) {
    return { ok: false as const, error: "Sua sessão expirou. Entre novamente para salvar." };
  }

  if (!(await canAccessAgenda(userId))) {
    return { ok: false as const, error: "Seu acesso ao Agenda 80/20 não está ativo." };
  }

  const { data, error } = await supabase.rpc("save_notification_preferences", {
    p_daily_email_enabled: preferences.dailyPlanReminderEnabled,
    p_daily_period: preferences.dailyPlanReminderPeriod,
    p_weekly_email_enabled: preferences.weeklyReviewEnabled,
    p_outcome_reminder_enabled: preferences.outcomePendingEnabled,
    p_marketing_email_enabled: preferences.marketingOptIn ?? false,
  });

  if (error) {
    console.error("Notification preferences save failed", { code: error.code });
    return { ok: false as const, error: "Não conseguimos salvar suas preferências agora. Tente novamente." };
  }

  revalidatePath("/settings");
  return { ok: true as const, data };
}
