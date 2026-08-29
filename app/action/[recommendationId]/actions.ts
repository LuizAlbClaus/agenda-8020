"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";

export async function startRecommendation(recommendationId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("start_recommendation", { p_recommendation_id: recommendationId });
  if (error) return { ok: false, error: "Não conseguimos iniciar esta ação agora." };
  await trackAnalyticsEvent("action_started");
  revalidatePath(`/action/${recommendationId}`);
  revalidatePath("/today");
  return { ok: true };
}

export async function completeRecommendation(recommendationId: string, exposureBucket: "1" | "2" | "3+" | null) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("complete_recommendation", {
    p_recommendation_id: recommendationId,
    p_exposure_bucket: exposureBucket,
  });
  if (error) return { ok: false, error: "Não conseguimos registrar a conclusão agora." };
  await trackAnalyticsEvent("action_completed", { exposure_bucket: exposureBucket ?? "none" });
  revalidatePath(`/action/${recommendationId}`);
  revalidatePath("/today");
  revalidatePath("/progress");
  return { ok: true, data };
}

export async function recordOutcome(executionId: string, status: "pending" | "none" | "interest" | "booking") {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_outcome", {
    p_execution_id: executionId,
    p_status: status,
  });
  if (error) return { ok: false, error: "Não conseguimos registrar esse retorno agora." };
  await trackAnalyticsEvent("outcome_recorded", { outcome_status: status });
  revalidatePath("/today");
  revalidatePath("/progress");
  return { ok: true, data };
}

export async function markNotCompleted(recommendationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mark_recommendation_not_completed", { p_recommendation_id: recommendationId });
  if (error || data !== true) return { ok: false, error: "Não conseguimos registrar isso agora." };
  revalidatePath(`/action/${recommendationId}`); revalidatePath("/today");
  return { ok: true };
}

export async function swapRecommendation(recommendationId: string, reason: string) {
  const validReasons = ["no_time", "no_opportunity", "recently_done", "not_for_my_moment", "did_not_understand", "do_not_want"];
  if (!validReasons.includes(reason)) return { ok: false, error: "Escolha um motivo válido." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("swap_recommendation", { p_recommendation_id: recommendationId, p_reason: reason });
  if (error) return { ok: false, error: "Não conseguimos trocar a ação agora." };
  await trackAnalyticsEvent("swap_requested", { reason });
  revalidatePath("/today");
  return { ok: true, data };
}
