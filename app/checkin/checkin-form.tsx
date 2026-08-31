"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";

import { saveCheckin } from "./actions";

const bottlenecks = [
  { value: "first_clients", title: "Primeiros clientes", description: "Preciso conquistar meus primeiros atendimentos." },
  { value: "low_visibility", title: "Pouca visibilidade", description: "Pouca gente conhece meu trabalho ou o que ofereço." },
  { value: "low_conversion", title: "Baixa conversão", description: "As pessoas perguntam, mas muitas não chegam a marcar." },
  { value: "empty_slots", title: "Horários ociosos", description: "Tenho clientes, mas ainda sobram lacunas na grade." },
  { value: "low_return", title: "Retenção e retorno", description: "Quero incentivar quem já atendi a voltar com frequência." },
] as const;

const opportunitySignals = [
  { value: "price_question", label: "Alguém perguntou preço ou horário recentemente." },
  { value: "conversation_paused", label: "Uma conversa real ficou sem resposta ou decisão." },
  { value: "objection_raised", label: "Alguém trouxe uma dúvida ou objeção concreta." },
  { value: "positive_experience", label: "Uma pessoa relatou uma experiência muito positiva." },
  { value: "previous_client", label: "Já atendi essa pessoa antes e há contexto para retomar." },
  { value: "referral_permission", label: "Uma cliente satisfeita aceitaria indicar para amigas." },
  { value: "local_demand", label: "Há uma demanda visível na minha região ou bairro." },
  { value: "warm_contact", label: "Tenho um contato próximo com contexto profissional." },
  { value: "partner_context", label: "Conheço um negócio ou profissional complementar." },
  { value: "none", label: "Ainda não tenho um desses sinais no momento." },
] as const;

type Checkin = {
  stage: string;
  bottleneck: string;
  channels: string[];
  opportunity_signals?: string[];
  daily_available_minutes: number;
  can_serve_next_7_days: boolean;
  has_service_proof?: boolean;
  has_real_portfolio?: boolean;
  has_booking_path: boolean;
  extraordinary?: boolean;
};

export default function CheckinForm({ initial }: { initial: Checkin }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [bottleneck, setBottleneck] = useState(initial.bottleneck);
  const [signals, setSignals] = useState<string[]>(
    initial.opportunity_signals?.length ? initial.opportunity_signals : ["none"]
  );
  const [hasServiceProof, setHasServiceProof] = useState(
    initial.has_service_proof ?? initial.has_real_portfolio ?? false
  );
  const [hasBookingPath, setHasBookingPath] = useState(initial.has_booking_path);
  const [error, setError] = useState("");

  function toggleSignal(signal: string) {
    setSignals((current) => {
      if (signal === "none") return ["none"];
      const filtered = current.filter((item) => item !== "none" && item !== signal);
      const next = current.includes(signal) ? filtered : [...filtered, signal];
      return next.length > 0 ? next : ["none"];
    });
    setError("");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await saveCheckin({
        stage: initial.stage,
        bottleneck,
        channels: initial.channels,
        opportunitySignals: signals,
        dailyAvailableMinutes: initial.daily_available_minutes,
        canServeNext7Days: initial.can_serve_next_7_days,
        hasServiceProof,
        hasBookingPath,
      });
      if (!result.ok) {
        setError(result.error ?? "Não conseguimos atualizar seu momento agora. Tente novamente.");
      } else {
        router.push("/today");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Notice Card */}
      <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
        {initial.extraordinary
          ? "Suas últimas respostas sugerem que vale conferir seu momento antes de definir a próxima ação."
          : "Uma revisão rápida a cada 14 dias ajuda o plano a acompanhar seu ritmo real e os horários da sua agenda."}
      </div>

      {/* Principal Gargalo */}
      <section
        aria-labelledby="bottleneck-label"
        className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
      >
        <h2 id="bottleneck-label" className="text-base font-bold text-[var(--color-ink-solid)]">
          O que mais acontece com você hoje?
        </h2>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Selecione o desafio predominante neste momento.
        </p>

        <div className="mt-4 grid gap-2.5">
          {bottlenecks.map((item) => {
            const isSelected = bottleneck === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setBottleneck(item.value)}
                aria-pressed={isSelected}
                className={`min-h-[48px] rounded-[var(--radius-button)] border p-3.5 text-left transition-all select-none ${
                  isSelected
                    ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] shadow-xs"
                    : "border-[var(--color-border-subtle)] bg-white hover:border-[var(--color-border-strong)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--color-ink-solid)]">{item.title}</span>
                  {isSelected && <Check className="size-4 text-[var(--color-action-primary)] shrink-0 ml-2" aria-hidden="true" />}
                </div>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)] leading-relaxed">{item.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Preparação Operacional */}
      <section
        aria-labelledby="prep-label"
        className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
      >
        <h2 id="prep-label" className="text-base font-bold text-[var(--color-ink-solid)]">
          Sua preparação para receber novos clientes
        </h2>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Marque os itens que você já tem estruturados hoje.
        </p>

        <div className="mt-4 grid gap-3">
          <button
            type="button"
            aria-pressed={hasServiceProof}
            onClick={() => setHasServiceProof((curr) => !curr)}
            className={`min-h-[48px] rounded-[var(--radius-button)] border px-4 py-3 text-left text-xs sm:text-sm font-medium transition-all select-none flex items-center justify-between ${
              hasServiceProof
                ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-ink-solid)] font-semibold shadow-xs"
                : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
            }`}
          >
            <span>{hasServiceProof ? "✓ Tenho fotos / prova do meu serviço para mostrar" : "Ainda estou construindo uma prova do meu serviço"}</span>
          </button>

          <button
            type="button"
            aria-pressed={hasBookingPath}
            onClick={() => setHasBookingPath((curr) => !curr)}
            className={`min-h-[48px] rounded-[var(--radius-button)] border px-4 py-3 text-left text-xs sm:text-sm font-medium transition-all select-none flex items-center justify-between ${
              hasBookingPath
                ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-ink-solid)] font-semibold shadow-xs"
                : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
            }`}
          >
            <span>{hasBookingPath ? "✓ Tenho um caminho claro para receber agendamentos" : "Ainda preciso deixar claro como receber agendamentos"}</span>
          </button>
        </div>
      </section>

      {/* Sinais de Oportunidade */}
      <section
        aria-labelledby="signals-label"
        className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
      >
        <h2 id="signals-label" className="text-base font-bold text-[var(--color-ink-solid)]">
          Você tem algum sinal para começar conversas agora?
        </h2>
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Marque todas as opções presentes no seu momento atual.
        </p>

        <div className="mt-4 grid gap-2.5">
          {opportunitySignals.map((item) => {
            const isSelected = signals.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleSignal(item.value)}
                className={`min-h-[48px] rounded-[var(--radius-button)] border px-3.5 py-3 text-xs sm:text-sm font-medium transition-all select-none text-left flex items-center justify-between ${
                  isSelected
                    ? "border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] text-[var(--color-ink-solid)] font-semibold shadow-xs"
                    : "border-[var(--color-border-subtle)] bg-white text-[var(--color-ink-solid)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <span className="leading-snug">{item.label}</span>
                {isSelected && <Check className="size-4 shrink-0 ml-2 text-[var(--color-action-primary)]" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Error display */}
      {error && (
        <div role="alert" className="rounded-[var(--radius-card)] border border-[var(--color-danger-primary)]/20 bg-[var(--color-danger-subtle)] p-4 text-xs sm:text-sm font-medium text-[var(--color-danger-primary)]">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={pending || signals.length === 0}
          className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Atualizando seu momento…</span>
            </>
          ) : (
            <>
              <span>Confirmar meu momento</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
