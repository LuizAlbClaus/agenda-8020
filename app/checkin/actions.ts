"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";

export async function saveCheckin(input: { stage: string; bottleneck: string; channels: string[]; opportunitySignals: string[]; dailyAvailableMinutes: number; canServeNext7Days: boolean; hasServiceProof: boolean; hasBookingPath: boolean }) {
  const stages = ["starting", "some_clients", "irregular_schedule"]; const bottlenecks = ["first_clients", "low_visibility", "low_conversion", "empty_slots", "low_return"];
  const channels = ["instagram", "whatsapp", "existing_clients", "local_network", "partnerships", "none"];
  const signals = ["conversation_paused", "price_question", "objection_raised", "positive_experience", "previous_client", "referral_permission", "local_demand", "warm_contact", "partner_context", "none"];
  if (!stages.includes(input.stage) || !bottlenecks.includes(input.bottleneck) || ![10, 20, 30, 45].includes(input.dailyAvailableMinutes) || !Array.isArray(input.channels) || input.channels.length === 0 || input.channels.some((item) => !channels.includes(item)) || (input.channels.includes("none") && input.channels.length !== 1) || !Array.isArray(input.opportunitySignals) || input.opportunitySignals.length === 0 || input.opportunitySignals.some((item) => !signals.includes(item)) || (input.opportunitySignals.includes("none") && input.opportunitySignals.length !== 1)) return { ok: false, error: "Revise as respostas e tente novamente." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_checkin_v2", { p_stage: input.stage, p_bottleneck: input.bottleneck, p_channels: input.channels, p_opportunity_signals: input.opportunitySignals, p_daily_available_minutes: input.dailyAvailableMinutes, p_can_serve_next_7_days: input.canServeNext7Days, p_has_service_proof: input.hasServiceProof, p_has_booking_path: input.hasBookingPath });
  if (error) return { ok: false, error: "Não conseguimos atualizar seu momento agora." };
  await trackAnalyticsEvent("checkin_completed", { stage: input.stage, bottleneck: input.bottleneck, opportunity_signal_count: input.opportunitySignals.includes("none") ? 0 : input.opportunitySignals.length });
  revalidatePath("/today"); revalidatePath("/progress"); revalidatePath("/checkin");
  return { ok: true, data };
}
