"use client";

import Link from "next/link";
import { useTransition, useState } from "react";
import { activateBelevyBenefit } from "../settings/benefits-actions";

export type BelevyBenefit = {
  benefit_id: string;
  status: string;
  duration_days: number;
  activation_enabled: boolean;
  show_handoff: boolean;
  movement: boolean;
  activated_at?: string | null;
};

export default function BenefitCard({ benefit, handoff = false }: { benefit: BelevyBenefit; handoff?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const activated = benefit.status === "active";
  const available = benefit.status === "available";

  function activate() {
    setMessage(""); setError(false);
    startTransition(async () => {
      const result = await activateBelevyBenefit();
      setError(!result.ok);
      setMessage(result.ok ? "Benefício ativado. Você receberá as instruções do Belevy." : result.error);
    });
  }

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${handoff ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-white"}`} aria-labelledby="belevy-heading">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Belevy</p>
      <h2 id="belevy-heading" className="mt-2 text-xl font-bold text-slate-900">{handoff ? "Sua agenda está começando a se movimentar." : `Você tem ${benefit.duration_days} dias de Belevy Pro disponíveis.`}</h2>
      <p className="mt-2 leading-6 text-slate-600">{handoff ? "Agora organize seus horários, clientes e dinheiro sem guardar tudo na cabeça." : "Ative quando fizer sentido para você."}</p>
      {activated ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">Seu benefício está ativado.</p> : available && benefit.activation_enabled ? <button type="button" onClick={activate} disabled={pending} className="mt-5 min-h-12 w-full rounded-full bg-teal-800 px-5 font-semibold text-white disabled:cursor-wait disabled:opacity-60">{pending ? "Ativando…" : benefit.duration_days === 30 ? "Ativar meus 30 dias grátis" : `Ativar meus ${benefit.duration_days} dias`}</button> : <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm leading-5 text-slate-700">A ativação ainda não está disponível. Avisaremos quando o Belevy estiver pronto para receber você.</p>}
      {available && !benefit.activation_enabled && <Link href="/settings/benefits" className="mt-3 inline-flex text-sm font-semibold text-teal-800 underline underline-offset-4">Ver meu benefício</Link>}
      {message && <p role={error ? "alert" : "status"} className={`mt-3 text-sm ${error ? "text-red-700" : "text-teal-800"}`}>{message}</p>}
    </section>
  );
}
