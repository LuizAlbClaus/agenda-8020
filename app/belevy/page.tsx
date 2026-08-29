import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessAgenda } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";
import BenefitCard, { type BelevyBenefit } from "./benefit-card";

export default async function BelevyPage(_props: { manual?: boolean } = {}) {
  void _props;
  let supabase; try { supabase = await createClient(); } catch { redirect("/login"); }
  const { data: claims } = await supabase!.auth.getClaims(); const userId = claims?.claims?.sub;
  if (typeof userId !== "string" || !(await canAccessAgenda(userId))) redirect("/access-blocked");
  const { data, error } = await supabase!.rpc("get_belevy_benefit");
  const benefit = (Array.isArray(data) ? data[0] : data) as BelevyBenefit | null;
  const normalized = benefit && { benefit_id: String(benefit.benefit_id ?? ""), status: String(benefit.status ?? "available"), duration_days: Number(benefit.duration_days ?? 0), activation_enabled: benefit.activation_enabled === true, show_handoff: benefit.show_handoff === true, movement: benefit.movement === true, activated_at: benefit.activated_at };
  return <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8"><Link href="/today" className="w-fit text-sm font-semibold text-teal-700 underline underline-offset-4">← Hoje</Link><header className="mt-10"><p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Seu benefício</p><h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900">Belevy</h1></header>{error || !normalized ? <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5"><p className="font-semibold text-slate-900">Não conseguimos carregar seu benefício agora.</p><p className="mt-2 text-sm leading-6 text-slate-600">Tente novamente em alguns instantes.</p></section> : <div className="mt-8"><BenefitCard benefit={normalized} handoff={normalized.show_handoff} /></div>}</main>;
}
