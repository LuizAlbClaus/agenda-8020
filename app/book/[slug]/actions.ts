"use server";

import { createClient } from "@/lib/supabase/server";

export async function createBooking(input: { slug: string; serviceId: string; startsAt: string; customerName: string; customerContact?: string }) {
  if (!input.slug || !input.serviceId || !input.startsAt || input.customerName.trim().length < 2) return { ok: false, error: "Informe seu nome e escolha um serviço e horário." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_public_booking", { p_slug: input.slug, p_service_id: input.serviceId, p_starts_at: input.startsAt, p_customer_name: input.customerName.trim(), p_customer_contact: input.customerContact?.trim() || null });
  if (error) return { ok: false, error: error.message.includes("slot_unavailable") ? "Esse horário acabou de ser ocupado. Escolha outro." : "Não conseguimos confirmar esse agendamento agora." };
  return { ok: true, data };
}
