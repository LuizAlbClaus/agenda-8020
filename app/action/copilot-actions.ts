"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";
import type { CopilotTemplate, DueRetentionItem, ReadinessLockResult } from "@/lib/copilot-types";

const TrackObjectionSchema = z.object({
  templateId: z.string().uuid(),
  category: z.enum([
    "price_too_high",
    "procrastination",
    "third_party_decision",
    "just_browsing",
    "schedule_friction",
  ]),
  mode: z.enum(["text", "audio"]),
  customerId: z.string().uuid().optional(),
  resolution: z.enum(["converted", "declined", "dismissed", "pending"]).optional().default("pending"),
});

export async function trackCopilotUsage(input: z.input<typeof TrackObjectionSchema>) {
  const parsed = TrackObjectionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados de rastreamento inválidos." };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    return { ok: false, error: "Não autenticado." };
  }

  const { data, error } = await supabase.rpc("track_objection_interaction", {
    p_template_id: parsed.data.templateId,
    p_category: parsed.data.category,
    p_mode: parsed.data.mode,
    p_customer_id: parsed.data.customerId ?? null,
    p_resolution: parsed.data.resolution,
  });

  if (error) {
    return { ok: false, error: "Erro ao registrar telemetria do copiloto." };
  }

  await trackAnalyticsEvent("copilot_template_used", {
    category: parsed.data.category,
    mode: parsed.data.mode,
  });

  return { ok: true, interactionId: data };
}

export async function verifyActionReadiness(actionSlug: string): Promise<ReadinessLockResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("check_readiness_lock", {
    p_action_slug: actionSlug,
  });

  if (error || !data) {
    return { locked: false, reason: null, fix_url: null };
  }

  return data as ReadinessLockResult;
}

export async function fetchCopilotTemplates(category?: string): Promise<CopilotTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_copilot_templates", {
    p_category: category ?? null,
    p_niche: "all",
  });

  if (error || !data) {
    return [];
  }

  return data as CopilotTemplate[];
}

export async function fetchDueRetentions(limit = 5): Promise<DueRetentionItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_due_retentions", {
    p_limit: limit,
  });

  if (error || !data) {
    return [];
  }

  return data as DueRetentionItem[];
}
