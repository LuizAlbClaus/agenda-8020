"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { bookingModes, proofTypes, serviceNiches, serviceTypeFor, serviceTypes, type BookingMode, type ProofType, type ServiceNiche, type ServiceType } from "@/lib/service-domain";

export type OnboardingInput = {
  name: string;
  profession: ServiceType;
  serviceNiche: ServiceNiche;
  serviceName: string;
  bookingMode: BookingMode;
  proofType: ProofType;
  stage: "starting" | "some_clients" | "irregular_schedule";
  bottleneck: "first_clients" | "low_visibility" | "low_conversion" | "empty_slots" | "low_return";
  channels: string[];
  opportunitySignals: string[];
  dailyAvailableMinutes: 10 | 20 | 30 | 45;
  canServeNext7Days: boolean;
  hasServiceProof: boolean;
  hasBookingPath: boolean;
};

export async function saveOnboarding(input: OnboardingInput) {
  const stages = ["starting", "some_clients", "irregular_schedule"] as const;
  const bottlenecks = ["first_clients", "low_visibility", "low_conversion", "empty_slots", "low_return"] as const;
  const allowedChannels = ["instagram", "whatsapp", "existing_clients", "local_network", "partnerships", "none"];
  const allowedSignals = ["conversation_paused", "price_question", "objection_raised", "positive_experience", "previous_client", "referral_permission", "local_demand", "warm_contact", "partner_context", "none"];
  const validProfession = serviceTypes.some((item) => item.value === input?.profession);
  const validNiche = serviceNiches.some((item) => item.value === input?.serviceNiche);
  const validBookingMode = bookingModes.some((item) => item.value === input?.bookingMode);
  const validProofType = proofTypes.some((item) => item.value === input?.proofType);
  if (!input || typeof input.name !== "string" || input.name.trim().length > 120 || !validProfession || !validNiche || serviceTypeFor(input.profession).niche !== input.serviceNiche || !validBookingMode || !validProofType || typeof input.serviceName !== "string" || input.serviceName.trim().length > 120 || !stages.includes(input.stage) || !bottlenecks.includes(input.bottleneck) || ![10, 20, 30, 45].includes(input.dailyAvailableMinutes) || !Array.isArray(input.channels) || input.channels.length === 0 || input.channels.some((item) => !allowedChannels.includes(item)) || (input.channels.includes("none") && input.channels.length !== 1) || !Array.isArray(input.opportunitySignals) || input.opportunitySignals.length === 0 || input.opportunitySignals.some((item) => !allowedSignals.includes(item)) || (input.opportunitySignals.includes("none") && input.opportunitySignals.length !== 1)) {
    return { ok: false, error: "Revise as respostas e tente novamente." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("save_onboarding_v2", {
    p_name: input.name.trim().slice(0, 120),
    p_profession: input.profession,
    p_service_niche: input.serviceNiche,
    p_service_name: input.serviceName.trim().slice(0, 120),
    p_booking_mode: input.bookingMode,
    p_stage: input.stage,
    p_bottleneck: input.bottleneck,
    p_channels: input.channels,
    p_daily_available_minutes: input.dailyAvailableMinutes,
    p_can_serve_next_7_days: input.canServeNext7Days,
    p_has_service_proof: input.hasServiceProof,
    p_proof_type: input.proofType,
    p_has_booking_path: input.hasBookingPath,
    p_opportunity_signals: input.opportunitySignals,
  });
  if (error) return { ok: false, error: "Não conseguimos salvar seu plano agora. Tente novamente." };
  const { data: recommendation, error: recommendationError } = await supabase.rpc("generate_next_recommendation");
  if (recommendationError) return { ok: false, error: "Seu contexto foi salvo, mas não conseguimos montar a ação agora." };
  await trackAnalyticsEvent("onboarding_completed", { profession: input.profession, service_niche: input.serviceNiche, booking_mode: input.bookingMode, stage: input.stage, bottleneck: input.bottleneck, opportunity_signal_count: input.opportunitySignals.includes("none") ? 0 : input.opportunitySignals.length });
  await trackAnalyticsEvent("recommendation_shown", { has_recommendation: Boolean(recommendation?.recommendation_id), status: String(recommendation?.status ?? "unknown") });
  revalidatePath("/today");
  return { ok: true, data, recommendation };
}
