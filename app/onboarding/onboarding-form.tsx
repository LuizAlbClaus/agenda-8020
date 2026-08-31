"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { saveOnboarding, type OnboardingInput } from "./actions";
import {
  bookingModes,
  proofTypes,
  serviceTypeFor,
  serviceTypes,
} from "@/lib/service-domain";

import { BrandMark } from "@/components/ui/brand-mark";

const stageOptions = [
  {
    value: "starting",
    title: "Iniciando",
    description: "Estou começando e ainda quase não tenho clientes.",
  },
  {
    value: "some_clients",
    title: "Crescendo",
    description: "Já tenho alguns clientes e quero atender com mais consistência.",
  },
  {
    value: "irregular_schedule",
    title: "Consolidando",
    description: "Já atendo com frequência, mas ainda sobram muitos horários vazios.",
  },
] as const;

const bottleneckOptions = [
  {
    value: "first_clients",
    title: "Primeiros clientes",
    description: "Estou começando e preciso conquistar meus primeiros atendimentos.",
  },
  {
    value: "low_visibility",
    title: "Pouca visibilidade",
    description: "Pouca gente conhece meu trabalho ou sabe o que ofereço.",
  },
  {
    value: "low_conversion",
    title: "Baixa conversão",
    description: "As pessoas perguntam no privado ou direct, mas muitas não chegam a marcar.",
  },
  {
    value: "empty_slots",
    title: "Horários ociosos",
    description: "Tenho clientes fiéis, mas ainda sobram lacunas na grade da semana.",
  },
  {
    value: "low_return",
    title: "Retenção e retorno",
    description: "Quero incentivar quem já foi atendido a retornar com periodicidade.",
  },
] as const;

const opportunitySignalOptions = [
  { value: "price_question", label: "Alguém perguntou preço ou horário recentemente." },
  { value: "conversation_paused", label: "Uma conversa real ficou sem resposta ou decisão." },
  { value: "objection_raised", label: "Alguém trouxe uma dúvida ou objeção concreta." },
  { value: "positive_experience", label: "Uma pessoa relatou uma experiência muito positiva." },
  { value: "previous_client", label: "Já atendi essa pessoa antes e há contexto para retomar." },
  { value: "referral_permission", label: "Uma cliente satisfeita aceitaria indicar para amigas." },
  { value: "local_demand", label: "Há uma demanda visível na minha região/bairro." },
  { value: "warm_contact", label: "Tenho um contato próximo com contexto profissional." },
  { value: "partner_context", label: "Conheço um negócio ou profissional complementar." },
  { value: "none", label: "Ainda não tenho um desses sinais no momento." },
] as const;

const channelOptions = [
  { value: "instagram", label: "Instagram (Direct / Stories)" },
  { value: "whatsapp", label: "WhatsApp (Status / Conversas)" },
  { value: "existing_clients", label: "Clientes que já conheço" },
  { value: "local_network", label: "Pessoas da minha cidade ou bairro" },
  { value: "partnerships", label: "Parcerias com outros profissionais" },
  { value: "none", label: "Ainda não sei onde divulgar" },
] as const;

const timeOptions = [
  { value: 10, label: "10 min/dia", description: "Micro-ações rápidas" },
  { value: 20, label: "20 min/dia", description: "Foco consistente" },
  { value: 30, label: "30 min/dia", description: "Ritmo acelerado" },
  { value: 45, label: "45 min+/dia", description: "Dedicação intensiva" },
] as const;

const defaultInitial: OnboardingInput = {
  name: "",
  profession: "nail_design",
  serviceNiche: "beauty",
  serviceName: "",
  bookingMode: "in_person",
  proofType: "none",
  stage: "starting",
  bottleneck: "first_clients",
  channels: ["whatsapp"],
  opportunitySignals: ["none"],
  dailyAvailableMinutes: 20,
  canServeNext7Days: true,
  hasServiceProof: false,
  hasBookingPath: false,
};

type OnboardingFormProps = {
  initialName?: string;
  reviewNotice?: boolean;
  initialValue?: Partial<OnboardingInput>;
};

export default function OnboardingForm({
  initialName = "",
  reviewNotice = false,
  initialValue,
}: OnboardingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<{
    recommendation_id?: string;
    title?: string;
    why_now?: string;
  } | null>(null);

  const [form, setForm] = useState<OnboardingInput>(() => ({
    ...defaultInitial,
    name: initialName || defaultInitial.name,
    ...initialValue,
  }));

  function updateField<K extends keyof OnboardingInput>(key: K, value: OnboardingInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function handleProfessionChange(professionValue: OnboardingInput["profession"]) {
    const matched = serviceTypeFor(professionValue);
    setForm((current) => ({
      ...current,
      profession: professionValue,
      serviceNiche: matched.niche,
    }));
    setError("");
  }

  function toggleChannel(channelValue: string) {
    setForm((current) => {
      if (channelValue === "none") {
        return { ...current, channels: ["none"] };
      }
      const existing = current.channels.filter((c) => c !== "none");
      const next = existing.includes(channelValue)
        ? existing.filter((c) => c !== channelValue)
        : [...existing, channelValue];
      return {
        ...current,
        channels: next.length > 0 ? next : ["none"],
      };
    });
    setError("");
  }

  function toggleOpportunitySignal(signalValue: string) {
    setForm((current) => {
      if (signalValue === "none") {
        return { ...current, opportunitySignals: ["none"] };
      }
      const existing = current.opportunitySignals.filter((s) => s !== "none");
      const next = existing.includes(signalValue)
        ? existing.filter((s) => s !== signalValue)
        : [...existing, signalValue];
      return {
        ...current,
        opportunitySignals: next.length > 0 ? next : ["none"],
      };
    });
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Por favor, informe seu nome.");
      return;
    }
    if (!form.serviceName.trim()) {
      setError("Por favor, informe o nome do serviço que você oferece.");
      return;
    }
    if (!form.channels.length) {
      setError("Escolha pelo menos um canal de contato.");
      return;
    }
    if (!form.opportunitySignals.length) {
      setError("Escolha pelo menos um sinal de conversa (ou 'Ainda não tenho').");
      return;
    }

    startTransition(async () => {
      const result = await saveOnboarding(form);
      if (!result.ok) {
        setError(result.error ?? "Não conseguimos salvar seu plano agora. Tente novamente.");
        return;
      }
      setPlan(result.recommendation as { recommendation_id?: string; title?: string; why_now?: string });
    });
  }

  if (plan) {
    return (
      <main className="min-h-screen bg-[var(--color-canvas)]">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-10 sm:px-8">
          <BrandMark showLabel={false} />

          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-revenue-subtle)] p-6 sm:p-8 shadow-[var(--shadow-card-resting)]">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white px-3 py-1 text-xs font-bold text-[var(--color-revenue-primary)] shadow-xs">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Plano montado com sucesso
            </span>

            <h1 className="mt-4 text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
              Seu próximo passo está pronto.
            </h1>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
              Organizamos seu contexto para sugerir uma próxima ação compatível com seu momento atual.
            </p>

            {plan.title && (
              <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-action-primary)]">
                  Primeira recomendação
                </p>
                <p className="mt-1 text-base font-bold text-[var(--color-ink-solid)]">
                  {plan.title}
                </p>
                {plan.why_now && (
                  <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                    {plan.why_now}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push(plan.recommendation_id ? `/action/${plan.recommendation_id}` : "/today")}
            className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <span>Ver minha próxima ação</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-16">
      <div className="mx-auto w-full max-w-xl px-5 py-6 sm:px-8 sm:py-8">
        {/* Top Header */}
        <header className="flex items-center justify-between pb-4">
          <BrandMark showLabel={false} />
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-3 py-1 text-xs font-semibold text-[var(--color-action-primary)]">
            {reviewNotice ? "Atualização de contexto" : "3 blocos rápidos"}
          </span>
        </header>

        {reviewNotice && (
          <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/20 bg-[var(--color-opportunity-subtle)] p-4 text-sm leading-relaxed text-[var(--color-ink-solid)]">
            <strong>Revisão de contexto:</strong> Atualize suas respostas para recalibrar as próximas ações sugeridas.
          </div>
        )}

        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            {reviewNotice ? "Ajuste seu momento" : "Monte seu plano de crescimento"}
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            Responda as perguntas abaixo. O Agenda 80/20 usa esse contexto para calibrar a recomendação mais adequada para o seu momento.
          </p>
        </div>


        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* BLOCO 1: SOBRE O SEU TRABALHO */}
          <section
            aria-labelledby="block-1-title"
            className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--color-border-subtle)]">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-xs font-bold text-[var(--color-action-primary)]">
                1
              </span>
              <h2 id="block-1-title" className="text-lg font-bold text-[var(--color-ink-solid)]">
                Sobre o seu trabalho
              </h2>
            </div>

            <div className="mt-5 space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Como podemos chamar você? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Seu nome ou nome comercial"
                  autoComplete="name"
                  className="mt-2 min-h-[48px] w-full rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-4 text-base text-[var(--color-ink-solid)] placeholder:text-[var(--color-ink-muted)] outline-none transition-colors focus:border-[var(--color-action-primary)] focus:ring-1 focus:ring-[var(--color-action-primary)]"
                />
              </div>

              {/* Nicho / Tipo de serviço */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Que tipo de serviço você oferece? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  Selecione a categoria que melhor descreve sua atividade principal.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {serviceTypes.map((item) => {
                    const isSelected = form.profession === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleProfessionChange(item.value)}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] rounded-[var(--radius-button)] border px-3 py-2.5 text-xs font-semibold transition-all select-none text-left flex items-center justify-between ${
                          isSelected
                            ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] shadow-xs"
                            : "border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {isSelected && <Check className="size-3.5 shrink-0 ml-1" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nome do serviço em movimento */}
              <div>
                <label htmlFor="serviceName" className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Qual serviço você quer colocar em movimento agora? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  Ex.: Manicure russa, Corte feminino, Design de sobrancelhas, Massagem relaxante.
                </p>
                <input
                  id="serviceName"
                  type="text"
                  required
                  value={form.serviceName}
                  onChange={(e) => updateField("serviceName", e.target.value)}
                  placeholder="Nome do seu serviço principal"
                  className="mt-2 min-h-[48px] w-full rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-4 text-base text-[var(--color-ink-solid)] placeholder:text-[var(--color-ink-muted)] outline-none transition-colors focus:border-[var(--color-action-primary)] focus:ring-1 focus:ring-[var(--color-action-primary)]"
                />
              </div>

              {/* Formato de atendimento */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Como você costuma atender? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {bookingModes.map((mode) => {
                    const isSelected = form.bookingMode === mode.value;
                    return (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => updateField("bookingMode", mode.value)}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] rounded-[var(--radius-button)] border px-3 py-2.5 text-xs sm:text-sm font-semibold transition-all select-none text-left flex items-center justify-between ${
                          isSelected
                            ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] shadow-xs"
                            : "border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                        }`}
                      >
                        <span>{mode.label}</span>
                        {isSelected && <Check className="size-4 shrink-0" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tipo de prova do serviço */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Que tipo de prova do seu serviço você já tem?
                </label>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  Ajuda a transformar interesse em agendamento concreto.
                </p>
                <div className="mt-2 grid gap-2">
                  {proofTypes.map((proof) => {
                    const isSelected = form.proofType === proof.value;
                    return (
                      <button
                        key={proof.value}
                        type="button"
                        onClick={() => {
                          updateField("proofType", proof.value);
                          updateField("hasServiceProof", proof.value !== "none");
                        }}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] rounded-[var(--radius-button)] border px-4 py-3 text-xs sm:text-sm font-medium transition-all select-none text-left flex items-center justify-between ${
                          isSelected
                            ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-ink-solid)] font-semibold shadow-xs"
                            : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                        }`}
                      >
                        <span>{proof.label}</span>
                        {isSelected && <Check className="size-4 shrink-0 text-[var(--color-action-primary)]" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* BLOCO 2: SEU MOMENTO ATUAL */}
          <section
            aria-labelledby="block-2-title"
            className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--color-border-subtle)]">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-xs font-bold text-[var(--color-action-primary)]">
                2
              </span>
              <h2 id="block-2-title" className="text-lg font-bold text-[var(--color-ink-solid)]">
                Seu momento atual
              </h2>
            </div>

            <div className="mt-5 space-y-6">
              {/* Situação atual */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Em qual estágio você está hoje? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <div className="mt-2 grid gap-2.5">
                  {stageOptions.map((opt) => {
                    const isSelected = form.stage === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField("stage", opt.value)}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] rounded-[var(--radius-button)] border p-3.5 text-left transition-all select-none ${
                          isSelected
                            ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] shadow-xs"
                            : "border-[var(--color-border-subtle)] bg-white hover:border-[var(--color-border-strong)]"
                        }`}
                      >
                        <p className="text-sm font-bold text-[var(--color-ink-solid)]">{opt.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Principal desafio / gargalo */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  O que mais acontece com você hoje? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <div className="mt-2 grid gap-2.5">
                  {bottleneckOptions.map((opt) => {
                    const isSelected = form.bottleneck === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField("bottleneck", opt.value)}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] rounded-[var(--radius-button)] border p-3.5 text-left transition-all select-none ${
                          isSelected
                            ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] shadow-xs"
                            : "border-[var(--color-border-subtle)] bg-white hover:border-[var(--color-border-strong)]"
                        }`}
                      >
                        <p className="text-sm font-bold text-[var(--color-ink-solid)]">{opt.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sinais de oportunidade */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Você já tem algum sinal para começar uma conversa? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  Selecione quantos se aplicarem. Não precisamos de nomes ou dados pessoais.
                </p>
                <div className="mt-3 grid gap-2">
                  {opportunitySignalOptions.map((signal) => {
                    const isSelected = form.opportunitySignals.includes(signal.value);
                    return (
                      <button
                        key={signal.value}
                        type="button"
                        onClick={() => toggleOpportunitySignal(signal.value)}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] rounded-[var(--radius-button)] border px-3.5 py-3 text-xs sm:text-sm font-medium transition-all select-none text-left flex items-center justify-between ${
                          isSelected
                            ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-ink-solid)] font-semibold shadow-xs"
                            : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                        }`}
                      >
                        <span className="leading-snug">{signal.label}</span>
                        {isSelected && <Check className="size-4 shrink-0 ml-2 text-[var(--color-action-primary)]" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* BLOCO 3: CANAIS E SEU TEMPO */}
          <section
            aria-labelledby="block-3-title"
            className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--color-border-subtle)]">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-action-subtle)] text-xs font-bold text-[var(--color-action-primary)]">
                3
              </span>
              <h2 id="block-3-title" className="text-lg font-bold text-[var(--color-ink-solid)]">
                Canais e seu tempo
              </h2>
            </div>

            <div className="mt-5 space-y-6">
              {/* Canais de conversa */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Onde você consegue conversar com pessoas? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  Marque os locais onde você tem facilidade para falar com interessados.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {channelOptions.map((channel) => {
                    const isSelected = form.channels.includes(channel.value);
                    return (
                      <button
                        key={channel.value}
                        type="button"
                        onClick={() => toggleChannel(channel.value)}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] rounded-[var(--radius-button)] border px-3.5 py-3 text-xs sm:text-sm font-medium transition-all select-none text-left flex items-center justify-between ${
                          isSelected
                            ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-ink-solid)] font-semibold shadow-xs"
                            : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                        }`}
                      >
                        <span>{channel.label}</span>
                        {isSelected && <Check className="size-4 shrink-0 text-[var(--color-action-primary)]" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tempo diário */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Quanto tempo você tem por dia para movimentar seu serviço? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {timeOptions.map((opt) => {
                    const isSelected = form.dailyAvailableMinutes === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField("dailyAvailableMinutes", opt.value as OnboardingInput["dailyAvailableMinutes"])}
                        aria-pressed={isSelected}
                        className={`min-h-[48px] rounded-[var(--radius-button)] border p-2.5 text-center transition-all select-none flex flex-col justify-center items-center ${
                          isSelected
                            ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] font-bold shadow-xs"
                            : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                        }`}
                      >
                        <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                        <span className="text-[10px] text-[var(--color-ink-muted)] leading-none mt-1">{opt.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capacidade 7 dias */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Você conseguiria atender uma nova pessoa nos próximos 7 dias? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField("canServeNext7Days", true)}
                    aria-pressed={form.canServeNext7Days === true}
                    className={`min-h-[48px] rounded-[var(--radius-button)] border px-4 py-2.5 text-sm font-semibold transition-all select-none flex items-center justify-center gap-2 ${
                      form.canServeNext7Days === true
                        ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] shadow-xs"
                        : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <span>Sim, tenho vaga</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("canServeNext7Days", false)}
                    aria-pressed={form.canServeNext7Days === false}
                    className={`min-h-[48px] rounded-[var(--radius-button)] border px-4 py-2.5 text-sm font-semibold transition-all select-none flex items-center justify-center gap-2 ${
                      form.canServeNext7Days === false
                        ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] shadow-xs"
                        : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <span>Ainda não</span>
                  </button>
                </div>
              </div>

              {/* Caminho claro para marcar */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-ink-solid)]">
                  Se alguém quiser marcar com você hoje, já sabe por onde falar? <span className="text-[var(--color-action-primary)]">*</span>
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField("hasBookingPath", true)}
                    aria-pressed={form.hasBookingPath === true}
                    className={`min-h-[48px] rounded-[var(--radius-button)] border px-4 py-2.5 text-sm font-semibold transition-all select-none flex items-center justify-center gap-2 ${
                      form.hasBookingPath === true
                        ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] shadow-xs"
                        : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <span>Sim, já tenho</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("hasBookingPath", false)}
                    aria-pressed={form.hasBookingPath === false}
                    className={`min-h-[48px] rounded-[var(--radius-button)] border px-4 py-2.5 text-sm font-semibold transition-all select-none flex items-center justify-center gap-2 ${
                      form.hasBookingPath === false
                        ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-action-primary)] shadow-xs"
                        : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <span>Ainda não</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Erro inline */}
          {error && (
            <div
              role="alert"
              className="rounded-[var(--radius-card)] border border-[var(--color-danger-primary)]/20 bg-[var(--color-danger-subtle)] p-4 text-sm font-medium text-[var(--color-danger-primary)]"
            >
              {error}
            </div>
          )}

          {/* CTA Principal */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] disabled:cursor-wait disabled:opacity-60"
            >
              {isPending ? (
                <span>Montando seu plano…</span>
              ) : (
                <>
                  <span>{reviewNotice ? "Atualizar meu contexto" : "Montar meu plano"}</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
