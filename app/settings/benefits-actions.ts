"use server";

import { revalidatePath } from "next/cache";
import { canAccessAgenda } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { getBelevyAgendaSummary } from "@/lib/belevy-integration";

export async function activateBelevyBenefit() {
  let supabase;
  try { supabase = await createClient(); } catch { return { ok: false as const, error: "Sua sessão expirou. Entre novamente." }; }
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string" || !userId) return { ok: false as const, error: "Sua sessão expirou. Entre novamente." };
  if (!(await canAccessAgenda(userId))) return { ok: false as const, error: "Seu acesso ao Agenda 80/20 não está ativo." };

  let activated = 0;
  // A bump is stored as a paid extension beside the included promo. Process
  // the small, fixed bundle in one user action; every activation remains
  // individually idempotent in both applications.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data: benefit, error: benefitError } = await supabase.rpc("get_belevy_benefit");
    if (benefitError) return { ok: false as const, error: "Não conseguimos consultar seu benefício agora. Tente novamente." };
    const record = (Array.isArray(benefit) ? benefit[0] : benefit) as Record<string, unknown> | null;
    if (record?.activation_enabled !== true) {
      return activated > 0 ? { ok: true as const } : { ok: false as const, error: "A ativação ainda não está disponível. Avisaremos quando o Belevy estiver pronto." };
    }
    if (record?.status !== "available") break;
    const { data: result, error } = await supabase.functions.invoke("activate-belevy-benefit", {
      body: { benefit_id: String(record.benefit_id ?? "") },
    });
    if (error || !result || typeof result !== "object" || (("ok" in result && result.ok !== true) && ("activated" in result && result.activated !== true)) || ("status" in result && result.status !== "active" && result.status !== "success")) {
      console.error("Belevy activation failed", { code: error?.name ?? "invalid_response" });
      return { ok: false as const, error: "Não conseguimos ativar seu benefício agora. Tente novamente em alguns instantes." };
    }
    activated += 1;
  }
  if (activated === 0) return { ok: false as const, error: "Este benefício não está disponível para ativação." };
  const email = typeof claims?.claims?.email === "string" ? claims.claims.email : undefined;
  if (email) {
    const belevy = await getBelevyAgendaSummary(email);
    if (belevy.status === "connected") {
      const { error: connectionError } = await supabase.rpc("save_belevy_connection", {
        p_slug: belevy.slug,
        p_expires_at: belevy.expiresAt,
      });
      if (connectionError) {
        console.error("Belevy connection could not be persisted", { code: connectionError.code ?? "unknown" });
      }
    }
  }
  await trackAnalyticsEvent("benefit_activated", { benefit: "belevy" });
  revalidatePath("/belevy"); revalidatePath("/settings/benefits"); revalidatePath("/today");
  return { ok: true as const, activated };
}
