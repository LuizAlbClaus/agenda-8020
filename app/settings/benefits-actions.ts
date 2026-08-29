"use server";

import { revalidatePath } from "next/cache";
import { canAccessAgenda } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";

export async function activateBelevyBenefit() {
  let supabase;
  try { supabase = await createClient(); } catch { return { ok: false as const, error: "Sua sessão expirou. Entre novamente." }; }
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string" || !userId) return { ok: false as const, error: "Sua sessão expirou. Entre novamente." };
  if (!(await canAccessAgenda(userId))) return { ok: false as const, error: "Seu acesso ao Agenda 80/20 não está ativo." };

  const { data: benefit, error: benefitError } = await supabase.rpc("get_belevy_benefit");
  if (benefitError) return { ok: false as const, error: "Não conseguimos consultar seu benefício agora. Tente novamente." };
  const record = (Array.isArray(benefit) ? benefit[0] : benefit) as Record<string, unknown> | null;
  if (record?.activation_enabled !== true) return { ok: false as const, error: "A ativação ainda não está disponível. Avisaremos quando o Belevy estiver pronto." };
  if (record?.status !== "available") return { ok: false as const, error: "Este benefício não está disponível para ativação." };

  const { data: result, error } = await supabase.functions.invoke("activate-belevy-benefit", { body: { benefit_id: String(record.benefit_id ?? "belevy_60_days") } });
  if (error || !result || typeof result !== "object" || (("ok" in result && result.ok !== true) && ("activated" in result && result.activated !== true)) || ("status" in result && result.status !== "active" && result.status !== "success")) {
    console.error("Belevy activation failed", { code: error?.name ?? "invalid_response" });
    return { ok: false as const, error: "Não conseguimos ativar seu benefício agora. Tente novamente em alguns instantes." };
  }
  await trackAnalyticsEvent("benefit_activated", { benefit: "belevy" });
  revalidatePath("/belevy"); revalidatePath("/settings/benefits"); revalidatePath("/today");
  return { ok: true as const };
}
