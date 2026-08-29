"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding, type OnboardingInput } from "./actions";
import { bookingModes, proofTypes, serviceTypeFor, serviceTypes } from "@/lib/service-domain";

type Choice = { value: string; label: string };
type Question = { key: string; title: string; description?: string; choices: Choice[]; multiple?: boolean };
const baseQuestions: Question[] = [
  { key: "profession", title: "Que tipo de serviço você oferece?", description: "Começamos pela beleza, mas o Agenda 80/20 também funciona para outros serviços com atendimento e marcação.", choices: serviceTypes.map(({ value, label }) => ({ value, label })) },
  { key: "stage", title: "Em qual situação você está hoje?", choices: [{ value: "starting", label: "Estou começando e ainda quase não tenho clientes." }, { value: "some_clients", label: "Já tenho alguns clientes e quero atender mais." }, { value: "irregular_schedule", label: "Já atendo, mas ainda sobram muitos horários." }] },
  { key: "bottleneck", title: "O que mais acontece com você hoje?", choices: [{ value: "first_clients", label: "Estou começando e preciso dos primeiros clientes." }, { value: "low_visibility", label: "Pouca gente conhece meu serviço." }, { value: "low_conversion", label: "As pessoas perguntam, mas muitas não marcam." }, { value: "empty_slots", label: "Tenho clientes, mas ainda ficam horários vazios." }, { value: "low_return", label: "Quero fazer meus clientes voltarem mais." }] },
  { key: "bookingMode", title: "Como você costuma atender?", choices: bookingModes.map(({ value, label }) => ({ value, label })) },
  { key: "proofType", title: "Que tipo de prova do seu serviço você já tem?", description: "Pode ser uma prova visual, uma avaliação ou um resultado. Ela ajuda a transformar interesse em agendamento.", choices: proofTypes.map(({ value, label }) => ({ value, label })) },
  { key: "dailyAvailableMinutes", title: "Quanto tempo você tem por dia?", choices: [{ value: "10", label: "10 minutos" }, { value: "20", label: "20 minutos" }, { value: "30", label: "30 minutos" }, { value: "45", label: "45 minutos ou mais" }] },
  { key: "canServeNext7Days", title: "Você conseguiria atender uma nova pessoa nos próximos 7 dias?", choices: [{ value: "true", label: "Sim" }, { value: "false", label: "Ainda não" }] },
  { key: "hasBookingPath", title: "Se alguém quiser marcar com você hoje, já sabe por onde falar?", choices: [{ value: "true", label: "Sim" }, { value: "false", label: "Ainda não" }] },
];

const opportunityQuestion: Question = { key: "opportunitySignals", title: "Você já tem algum sinal para começar uma conversa?", description: "Não precisamos de nomes, contatos ou detalhes. Marque apenas o que já existe hoje; se ainda não houver, escolha a última opção.", multiple: true, choices: [{ value: "price_question", label: "Alguém perguntou preço ou horário." }, { value: "conversation_paused", label: "Uma conversa real ficou sem resposta ou decisão." }, { value: "objection_raised", label: "Alguém trouxe uma dúvida ou objeção concreta." }, { value: "positive_experience", label: "Uma cliente relatou uma experiência positiva." }, { value: "previous_client", label: "Já atendi essa pessoa antes." }, { value: "referral_permission", label: "Uma cliente satisfeita aceitaria uma indicação." }, { value: "local_demand", label: "Há uma demanda real na minha região." }, { value: "warm_contact", label: "Tenho um contato próximo com contexto para conversar." }, { value: "partner_context", label: "Conheço um negócio ou profissional complementar." }, { value: "none", label: "Ainda não tenho um desses sinais." }] };
const channelsQuestion: Question = { key: "channels", title: "Onde você consegue conversar com pessoas?", description: "Pode escolher mais de uma opção.", multiple: true, choices: [{ value: "instagram", label: "Instagram" }, { value: "whatsapp", label: "WhatsApp" }, { value: "existing_clients", label: "Pessoas/clientes que já conheço" }, { value: "local_network", label: "Pessoas da minha cidade ou bairro" }, { value: "partnerships", label: "Outros profissionais/comércios" }, { value: "none", label: "Ainda não sei onde divulgar" }] };
const initial: OnboardingInput = { name: "", profession: "nail_design", serviceNiche: "beauty", serviceName: "", bookingMode: "in_person", proofType: "none", stage: "starting", bottleneck: "first_clients", channels: [], opportunitySignals: [], dailyAvailableMinutes: 10, canServeNext7Days: false, hasServiceProof: false, hasBookingPath: false };

function selectedValue(input: OnboardingInput, key: string): string[] {
  const value = input[key as keyof OnboardingInput];
  return Array.isArray(value) ? value : [String(value)];
}

export default function OnboardingForm({ initialName = "", reviewNotice = false, initialValue }: { initialName?: string; reviewNotice?: boolean; initialValue?: Partial<OnboardingInput> }) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState<OnboardingInput>({ ...initial, name: initialName, ...initialValue });
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<{ recommendation_id?: string; title?: string; why_now?: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const questions = [...baseQuestions.slice(0, 3), ...(value.bottleneck ? [opportunityQuestion, channelsQuestion] : [channelsQuestion]), ...baseQuestions.slice(3)];
  const question = questions[step] ?? questions[questions.length - 1];
  const selected = selectedValue(value, question.key);

  function choose(choice: string) {
    if (question.multiple) {
      const next = choice === "none" ? ["none"] : [...selected.filter((item) => item !== "none" && item !== choice), ...(selected.includes(choice) ? [] : [choice])];
      setValue((old) => ({ ...old, [question.key]: next }));
      return;
    }
    setValue((old) => question.key === "profession"
      ? { ...old, profession: choice as OnboardingInput["profession"], serviceNiche: serviceTypeFor(choice).niche }
      : { ...old, [question.key]: question.key === "dailyAvailableMinutes" ? Number(choice) : question.key === "proofType" ? (choice as OnboardingInput["proofType"]) : ["canServeNext7Days", "hasBookingPath"].includes(question.key) ? choice === "true" : choice, ...(question.key === "proofType" ? { hasServiceProof: choice !== "none" } : {}) } as OnboardingInput);
  }

  function next() {
    setError("");
    if (["channels", "opportunitySignals"].includes(question.key) && selected.length === 0) { setError("Escolha pelo menos uma opção."); return; }
    if (step < questions.length - 1) { setStep((current) => current + 1); return; }
    startTransition(async () => { const result = await saveOnboarding(value); if (!result.ok) { setError(result.error ?? "Não conseguimos salvar seu plano agora."); return; } setPlan(result.recommendation as { recommendation_id?: string; title?: string; why_now?: string }); });
  }

  if (plan) return <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-8 sm:px-8"><p className="text-sm font-semibold text-teal-700">Agenda 80/20</p><div className="mt-8 rounded-3xl border border-teal-200 bg-teal-50 p-6"><p className="text-2xl" aria-hidden="true">🎯</p><h1 className="mt-3 text-3xl font-bold leading-tight text-teal-950">Seu plano está pronto</h1><p className="mt-4 leading-7 text-teal-950">Sua próxima ação foi escolhida para o momento do seu serviço e da sua agenda.</p>{plan.title && <p className="mt-6 font-semibold text-teal-950">{plan.title}</p>}{plan.why_now && <p className="mt-2 text-sm leading-6 text-teal-900">{plan.why_now}</p>}</div><button type="button" onClick={() => router.push(plan.recommendation_id ? `/action/${plan.recommendation_id}` : "/today")} className="mt-8 min-h-12 rounded-full bg-teal-800 px-5 font-semibold text-white">Ver minha próxima ação</button></main>;

  return <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8">
    <div className="flex items-center justify-between"><p className="text-sm font-semibold text-teal-700">Agenda 80/20</p><span className="text-sm text-slate-500">{step + 1} de {questions.length}</span></div>
    {reviewNotice && <p className="mt-6 rounded-2xl bg-teal-50 p-4 text-sm leading-6 text-teal-950">Parece que seu momento pode ter mudado. Vamos ajustar seu plano.</p>}
    <div className="mt-4 h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal-700 transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>
    <section className="flex flex-1 flex-col justify-center py-10"><h1 className="text-3xl font-bold leading-tight text-slate-900">{question.title}</h1>{question.description && <p className="mt-3 text-slate-600">{question.description}</p>}
      {step === 0 && <label className="mt-8 block text-sm font-semibold text-slate-800" htmlFor="name">Como podemos chamar você?<input id="name" value={value.name} onChange={(event) => setValue((old) => ({ ...old, name: event.target.value }))} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base font-normal" placeholder="Seu nome" autoComplete="name" /></label>}
      {question.key === "profession" && <label className="mt-8 block text-sm font-semibold text-slate-800" htmlFor="service-name">Qual serviço você quer colocar em movimento?<input id="service-name" value={value.serviceName} onChange={(event) => setValue((old) => ({ ...old, serviceName: event.target.value }))} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base font-normal" placeholder="Ex.: corte feminino, drenagem, aula de inglês" autoComplete="off" /></label>}
      <div className="mt-8 grid gap-3">{question.choices.map((choice) => <button key={choice.value} type="button" onClick={() => choose(choice.value)} aria-pressed={selected.includes(choice.value)} className={`min-h-14 rounded-2xl border px-4 py-3 text-left font-medium transition ${selected.includes(choice.value) ? "border-teal-700 bg-teal-50 text-teal-950" : "border-slate-300 bg-white text-slate-800 hover:border-teal-500"}`}>{choice.label}</button>)}</div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    </section>
    <div className="flex gap-3"><button type="button" disabled={step === 0 || isPending} onClick={() => setStep((current) => current - 1)} className="min-h-12 rounded-full border border-slate-300 px-5 font-semibold text-slate-700 disabled:opacity-40">Voltar</button><button type="button" disabled={isPending || selected.length === 0 || (step === 0 && !value.name.trim()) || (question.key === "profession" && !value.serviceName.trim())} onClick={next} className="min-h-12 flex-1 rounded-full bg-teal-800 px-5 font-semibold text-white disabled:opacity-50">{isPending ? "Montando seu plano…" : step === questions.length - 1 ? "Montar meu plano" : "Continuar"}</button></div>
  </main>;
}
