"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveCheckin } from "./actions";

const bottlenecks = [["first_clients", "Preciso dos primeiros clientes"], ["low_visibility", "Pouca gente conhece meu serviço"], ["low_conversion", "As pessoas perguntam, mas não marcam"], ["empty_slots", "Ainda ficam horários vazios"], ["low_return", "Quero que meus clientes voltem"]];
const opportunitySignals = [["price_question", "Alguém perguntou preço ou horário."], ["conversation_paused", "Uma conversa real ficou sem resposta ou decisão."], ["objection_raised", "Alguém trouxe uma dúvida ou objeção concreta."], ["positive_experience", "Uma pessoa relatou uma experiência positiva."], ["previous_client", "Já atendi essa pessoa antes."], ["referral_permission", "Um cliente satisfeito aceitaria uma indicação."], ["local_demand", "Há uma demanda real na minha região."], ["warm_contact", "Tenho um contato próximo com contexto para conversar."], ["partner_context", "Conheço um negócio ou profissional complementar."], ["none", "Ainda não tenho um desses sinais."]];

type Checkin = { stage: string; bottleneck: string; channels: string[]; opportunity_signals?: string[]; daily_available_minutes: number; can_serve_next_7_days: boolean; has_service_proof?: boolean; has_real_portfolio?: boolean; has_booking_path: boolean; extraordinary?: boolean };

export default function CheckinForm({ initial }: { initial: Checkin }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [bottleneck, setBottleneck] = useState(initial.bottleneck);
  const [signals, setSignals] = useState<string[]>(initial.opportunity_signals?.length ? initial.opportunity_signals : ["none"]);
  const [hasServiceProof, setHasServiceProof] = useState(initial.has_service_proof ?? initial.has_real_portfolio ?? false);
  const [hasBookingPath, setHasBookingPath] = useState(initial.has_booking_path);
  const [error, setError] = useState("");

  function toggleSignal(signal: string) {
    setSignals((current) => signal === "none" ? ["none"] : [...current.filter((item) => item !== "none" && item !== signal), ...(current.includes(signal) ? [] : [signal])]);
  }

  function submit() {
    setError("");
    startTransition(async () => {
      const result = await saveCheckin({ stage: initial.stage, bottleneck, channels: initial.channels, opportunitySignals: signals, dailyAvailableMinutes: initial.daily_available_minutes, canServeNext7Days: initial.can_serve_next_7_days, hasServiceProof, hasBookingPath });
      if (!result.ok) setError(result.error ?? "Não conseguimos atualizar seu momento agora.");
      else router.push("/today");
    });
  }

  return <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
    <p className="text-sm leading-6 text-slate-600">{initial.extraordinary ? "Suas últimas respostas sugerem que vale conferir seu momento antes da próxima ação." : "Uma revisão rápida a cada 14 dias ajuda o plano a acompanhar seu serviço e sua agenda."}</p>
    <label className="mt-6 block text-sm font-semibold text-slate-800" htmlFor="bottleneck">O que mais acontece com você hoje?
      <select id="bottleneck" value={bottleneck} onChange={(event) => setBottleneck(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base font-normal">
        {bottlenecks.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <fieldset className="mt-6"><legend className="text-sm font-semibold text-slate-800">Sua preparação para receber um novo agendamento</legend>
      <div className="mt-3 grid gap-2">
        <button type="button" aria-pressed={hasServiceProof} onClick={() => setHasServiceProof((current) => !current)} className={`min-h-12 rounded-xl border px-3 text-left text-sm font-medium ${hasServiceProof ? "border-teal-700 bg-teal-50 text-teal-950" : "border-slate-300 bg-white text-slate-700"}`}>{hasServiceProof ? "Tenho uma prova do meu serviço para mostrar" : "Ainda estou construindo uma prova do meu serviço"}</button>
        <button type="button" aria-pressed={hasBookingPath} onClick={() => setHasBookingPath((current) => !current)} className={`min-h-12 rounded-xl border px-3 text-left text-sm font-medium ${hasBookingPath ? "border-teal-700 bg-teal-50 text-teal-950" : "border-slate-300 bg-white text-slate-700"}`}>{hasBookingPath ? "Tenho um caminho claro para receber agendamentos" : "Ainda preciso deixar claro como receber agendamentos"}</button>
      </div>
    </fieldset>
    <fieldset className="mt-6"><legend className="text-sm font-semibold text-slate-800">Você já tem algum sinal para começar uma conversa?</legend><p className="mt-1 text-sm text-slate-600">Não precisamos de nomes, contatos ou detalhes.</p>
      <div className="mt-3 grid gap-2">{opportunitySignals.map(([value, label]) => <button key={value} type="button" aria-pressed={signals.includes(value)} onClick={() => toggleSignal(value)} className={`min-h-12 rounded-xl border px-3 text-left text-sm font-medium ${signals.includes(value) ? "border-teal-700 bg-teal-50 text-teal-950" : "border-slate-300 bg-white text-slate-700"}`}>{label}</button>)}</div>
    </fieldset>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    <button type="button" onClick={submit} disabled={pending || signals.length === 0} className="mt-6 min-h-12 w-full rounded-full bg-teal-800 px-5 font-semibold text-white disabled:opacity-50">{pending ? "Atualizando…" : "Confirmar meu momento"}</button>
  </section>;
}
