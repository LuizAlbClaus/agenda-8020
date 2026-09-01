"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  SubmitValueDiagnosticInputSchema,
  CompleteValueActionInputSchema,
  ConsumeLearningPillInputSchema,
  type SubmitValueDiagnosticInput,
  type CompleteValueActionInput,
  type ConsumeLearningPillInput,
  type ActiveValueDiagnosticUI,
  type DiagnosticQuestionUI,
  type MicroLearningPillUI,
} from "@/lib/value-diagnostic-types";

export async function submitValueDiagnosticAction(input: SubmitValueDiagnosticInput) {
  const parsed = SubmitValueDiagnosticInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados de diagnóstico inválidos." };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    return { ok: false, error: "Não autenticado." };
  }

  const { data, error } = await supabase.rpc("calculate_value_diagnostic", {
    p_workspace_id: parsed.data.workspaceId,
    p_trigger: parsed.data.trigger,
    p_answers: parsed.data.answers,
  });

  if (error) {
    return { ok: false, error: "Erro ao processar diagnóstico de valor." };
  }

  await trackAnalyticsEvent("value_diagnostic_completed", {
    archetype: data?.archetype,
    ivp_score: data?.ivp_score,
  });

  revalidatePath("/today");
  revalidatePath("/diagnostic");

  return { ok: true, data };
}

export async function completeValueActionMission(input: CompleteValueActionInput) {
  const parsed = CompleteValueActionInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados de missão inválidos." };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    return { ok: false, error: "Não autenticado." };
  }

  const { data, error } = await supabase.rpc("complete_value_action", {
    p_workspace_id: parsed.data.workspaceId,
    p_action_id: parsed.data.actionId,
  });

  if (error) {
    return { ok: false, error: "Erro ao marcar conclusão da missão." };
  }

  await trackAnalyticsEvent("value_action_completed", {
    action_id: parsed.data.actionId,
  });

  revalidatePath("/today");
  revalidatePath("/diagnostic");

  return { ok: true, data };
}

export async function markLearningPillConsumedAction(input: ConsumeLearningPillInput) {
  const parsed = ConsumeLearningPillInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados de pílula inválidos." };
  }

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) {
    return { ok: false, error: "Não autenticado." };
  }

  const { data, error } = await supabase.rpc("mark_micro_learning_consumed", {
    p_workspace_id: parsed.data.workspaceId,
    p_pill_id: parsed.data.pillId,
  });

  if (error) {
    return { ok: false, error: "Erro ao registrar consumo da pílula." };
  }

  await trackAnalyticsEvent("micro_learning_consumed", {
    pill_id: parsed.data.pillId,
  });

  return { ok: true, data };
}

export async function fetchActiveValueDiagnostic(workspaceId: string): Promise<ActiveValueDiagnosticUI | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_active_value_diagnostic", {
    p_workspace_id: workspaceId,
  });

  if (error || !data) {
    return null;
  }

  return data as ActiveValueDiagnosticUI;
}

export async function fetchDiagnosticQuestions(): Promise<DiagnosticQuestionUI[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("diagnostic_questions")
    .select("id, slug, dimension, step_order, title, helper_text, options")
    .eq("active", true)
    .order("step_order", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as unknown as DiagnosticQuestionUI[];
}

export async function fetchDailyLearningPill(workspaceId: string): Promise<MicroLearningPillUI | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_daily_micro_learning_pill", {
    p_workspace_id: workspaceId,
  });

  if (error || !data) {
    return null;
  }

  return data as MicroLearningPillUI;
}
