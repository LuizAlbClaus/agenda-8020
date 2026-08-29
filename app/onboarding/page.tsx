import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  let supabase; try { supabase = await createClient(); } catch { redirect("/login"); }
  const { data } = await supabase!.auth.getClaims(); const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  if (!(await canAccessAgenda(userId))) redirect("/access-blocked");
  const params = await searchParams;
  const { data: profile } = await supabase!.from("business_profiles").select("onboarding_completed_at, profession, service_niche, service_name, booking_mode, stage, current_bottleneck, channels, opportunity_signals, daily_available_minutes, can_serve_next_7_days, has_service_proof, has_real_portfolio, has_booking_path, proof_type").eq("user_id", userId).maybeSingle();
  if (profile?.onboarding_completed_at && params.reason !== "moment" && params.reason !== "edit") redirect("/today");
  const { data: identity } = await supabase!.from("profiles").select("name").eq("user_id", userId).maybeSingle();
  const initialValue = profile ? {
    name: identity?.name ?? "",
    profession: profile.profession,
    serviceNiche: profile.service_niche,
    serviceName: profile.service_name,
    bookingMode: profile.booking_mode,
    proofType: profile.proof_type ?? (profile.has_service_proof || profile.has_real_portfolio ? "portfolio" : "none"),
    stage: profile.stage,
    bottleneck: profile.current_bottleneck,
    channels: profile.channels ?? [],
    opportunitySignals: profile.opportunity_signals ?? [],
    dailyAvailableMinutes: profile.daily_available_minutes,
    canServeNext7Days: profile.can_serve_next_7_days,
    hasServiceProof: profile.has_service_proof ?? profile.has_real_portfolio ?? false,
    hasBookingPath: profile.has_booking_path,
  } : undefined;
  return <OnboardingForm initialName={identity?.name ?? ""} initialValue={initialValue} reviewNotice={params.reason === "moment" || params.reason === "edit"} />;
}
