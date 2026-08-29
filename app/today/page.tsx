import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";
import NextActionButton from "./next-action-button";

export default async function TodayPage() {
  let supabase;
  try { supabase = await createClient(); } catch { redirect("/login"); }
  const { data } = await supabase!.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  if (!(await canAccessAgenda(userId))) redirect("/access-blocked");
  const [{ data: plan, error }, { data: benefitData }] = await Promise.all([supabase!.rpc("get_today_plan"), supabase!.rpc("get_belevy_benefit")]);
  if (error) return <main className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-10"><p className="text-sm font-semibold text-teal-700">Hoje</p><h1 className="mt-3 text-3xl font-bold text-slate-900">Seu plano está temporariamente indisponível</h1><p className="mt-3 text-slate-600">Não conseguimos atualizar seu plano agora. Tente novamente em alguns instantes.</p></main>;
  if (plan?.onboarding_required) redirect("/onboarding");
  const recommendation = plan?.recommendation as { recommendation_id?: string; title?: string; short_description?: string; why_now?: string; duration_minutes?: number; status?: string; message?: string; confidence_level?: string } | null;
  const pendingOutcome = plan?.pending_outcome as { title?: string; outcome_id?: string; recommendation_id?: string } | null;
  const benefit = (Array.isArray(benefitData) ? benefitData[0] : benefitData) as { show_handoff?: boolean; duration_days?: number; total_days?: number; status?: string } | null;
  const showBenefitHandoff = benefit?.show_handoff === true;
  const confidenceCopy = recommendation?.confidence_level === "strong_signal" ? "Esse tipo de ação tem mostrado mais resultado nas suas últimas tentativas." : recommendation?.confidence_level === "signal" ? "As últimas tentativas desse tipo tiveram alguns sinais positivos." : "Ainda estamos conhecendo o que faz mais sentido para o seu momento.";
  return <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-8 sm:px-8">
    <header className="flex items-center justify-between"><div className="flex items-center gap-4"><p className="text-sm font-semibold text-teal-700">Hoje</p><Link href="/agenda" className="text-sm font-semibold text-teal-800 underline">Abrir agenda</Link></div><Link href="/onboarding?reason=edit" className="text-sm text-slate-500 underline">Ajustar meu serviço</Link></header>
    <p className="mt-10 text-slate-600">Olá{plan?.name ? `, ${plan.name}` : ""}.</p>
    <p className="mt-2 text-sm font-medium text-teal-800">{plan?.service_name || "Seu serviço"}</p>
    <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900">Seu foco agora</h1>
    <p className="mt-3 rounded-2xl bg-teal-50 p-5 text-lg font-medium leading-7 text-teal-950">{plan?.focus}</p>
    {pendingOutcome?.recommendation_id && <Link href={`/action/${pendingOutcome.recommendation_id}`} className="mt-5 block rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Essa ação trouxe algum retorno? <span className="font-semibold">{pendingOutcome.title}</span></Link>}
    {plan?.checkin_required && <Link href="/checkin" className="mt-5 block rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Alguma coisa mudou no seu serviço ou na sua agenda? <span className="font-semibold text-teal-800">Atualizar meu momento</span></Link>}
    <section className="mt-10"><p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Sua próxima ação</p>
      {recommendation?.recommendation_id ? <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold text-slate-900">{recommendation.title}</h2><p className="mt-2 text-slate-600">{recommendation.short_description}</p><p className="mt-5 text-sm leading-6 text-slate-600"><strong className="text-slate-900">Por que agora:</strong> {recommendation.why_now}</p>{recommendation.confidence_level && <p className="mt-4 text-sm text-slate-500">{confidenceCopy}</p>}<p className="mt-4 text-sm text-slate-500">{recommendation.duration_minutes} minutos</p><Link href={`/action/${recommendation.recommendation_id}`} className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-teal-800 px-5 font-semibold text-white">Fazer agora</Link></div> : <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5"><p className="font-semibold text-slate-900">{recommendation?.message ?? "Vamos ajustar seu plano para encontrar uma próxima ação possível."}</p>{recommendation?.status === "next_action_available" ? <NextActionButton /> : <Link href="/onboarding?reason=edit" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-teal-800 px-5 font-semibold text-teal-800">Ajustar meu serviço</Link>}</div>}
    </section>
    {benefit?.status && benefit.status !== "expired" && <Link href="/belevy" className="mt-5 block rounded-2xl border border-teal-200 bg-teal-50 p-5"><p className="font-semibold text-teal-950">{showBenefitHandoff ? "Seu serviço está começando a se movimentar." : `Você tem ${benefit.total_days ?? benefit.duration_days ?? 30} dias opcionais de Belevy Pro disponíveis.`}</p><p className="mt-1 text-sm text-teal-900">Conhecer ou ativar o Belevy</p></Link>}
    <Link href="/progress" className="mt-8 inline-flex text-sm font-semibold text-teal-800 underline">Ver meu progresso</Link>
  </main>;
}
