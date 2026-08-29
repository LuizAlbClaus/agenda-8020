"use server";

import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";

export async function requestNextRecommendation() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_next_recommendation");
  if (error) return { ok: false, error: "Não conseguimos atualizar seu plano agora." };
  await trackAnalyticsEvent("recommendation_shown", { has_recommendation: Boolean(data?.recommendation_id), status: String(data?.status ?? "unknown") });
  return { ok: true, data };
}
