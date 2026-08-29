"use server";

import { revalidatePath } from "next/cache";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";

async function authorizedClient() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string" || !userId) return null;
  return supabase;
}

export async function requestDataExport() {
  try {
    const supabase = await authorizedClient();
    if (!supabase) return { ok: false as const, error: "Sua sessão expirou ou seu acesso não está ativo." };
    const { error } = await supabase.rpc("request_data_export");
    if (error) return { ok: false as const, error: "Não conseguimos registrar sua solicitação agora. Tente novamente." };
    await trackAnalyticsEvent("data_export_requested");
    revalidatePath("/settings");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Não conseguimos registrar sua solicitação agora. Tente novamente." };
  }
}

export async function requestAccountDeletion() {
  try {
    const supabase = await authorizedClient();
    if (!supabase) return { ok: false as const, error: "Sua sessão expirou ou seu acesso não está ativo." };
    const { error } = await supabase.rpc("request_account_deletion");
    if (error) return { ok: false as const, error: "Não conseguimos registrar sua solicitação agora. Tente novamente." };
    await trackAnalyticsEvent("account_deletion_requested");
    revalidatePath("/settings");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Não conseguimos registrar sua solicitação agora. Tente novamente." };
  }
}
