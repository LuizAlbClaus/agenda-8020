import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";
import CheckinForm from "./checkin-form";

export default async function CheckinPage() {
  let supabase; try { supabase = await createClient(); } catch { redirect("/login"); }
  const { data } = await supabase!.auth.getClaims(); const userId = data?.claims?.sub;
  if (!userId) redirect("/login"); if (!(await canAccessAgenda(userId))) redirect("/access-blocked");
  const { data: checkin, error } = await supabase!.rpc("get_checkin");
  if (error || !checkin || checkin.onboarding_required) redirect("/onboarding");
  return <main className="mx-auto min-h-screen w-full max-w-xl px-5 py-8 sm:px-8"><Link href="/today" className="text-sm font-semibold text-teal-700">← Hoje</Link><p className="mt-10 text-sm font-semibold uppercase tracking-wide text-teal-700">Check-in</p><h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900">Alguma coisa mudou no seu serviço ou na sua agenda?</h1><CheckinForm initial={checkin} /></main>;
}
