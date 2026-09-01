"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Info,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  completeRecommendation,
  markNotCompleted,
  recordOutcome,
  startRecommendation,
  swapRecommendation,
} from "./actions";

const swapReasons = [
  { value: "no_time", label: "Estou sem tempo agora" },
  { value: "no_opportunity", label: "Não tenho essa oportunidade hoje" },
  { value: "recently_done", label: "Fiz algo parecido recentemente" },
  { value: "not_for_my_moment", label: "Não combina com o meu momento" },
  { value: "did_not_understand", label: "Não entendi a instrução" },
  { value: "do_not_want", label: "Prefiro fazer outro movimento" },
] as const;

const outcomeOptions = [
  { value: "pending", label: "Ainda aguardando resposta" },
  { value: "none", label: "Não trouxe retorno desta vez" },
  { value: "interest", label: "Pessoa demonstrou interesse real" },
  { value: "booking", label: "Horário agendado com sucesso!" },
] as const;

type Detail = {
  id: string;
  status: string;
  title: string;
  short_description: string;
  why_now: string;
  steps: string[];
  duration_minutes: number;
  ethical_guardrail: string;
  message_template: string | null;
  action_type: string;
  exposure_mode: string;
  confidence_level?: string;
  outcome?: {
    id: string;
    execution_id: string;
    status: string;
    maturation_at: string;
    finalized_at: string | null;
    matured?: boolean;
  } | null;
};

const confidenceCopy: Record<string, string> = {
  learning: "Ainda estamos conhecendo o que faz mais sentido para o seu momento.",
  signal: "As últimas tentativas desse tipo tiveram alguns sinais positivos.",
  strong_signal: "Esse tipo de ação tem mostrado mais resultado nas suas últimas tentativas.",
};


export default function ActionDetail({ detail }: { detail: Detail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showSwap, setShowSwap] = useState(false);
  const [showExposure, setShowExposure] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [scriptMode, setScriptMode] = useState<"text" | "audio">("text");


  const [started, setStarted] = useState(detail.status === "started");
  const [completed, setCompleted] = useState(
    ["completed", "swapped", "expired", "not_completed"].includes(detail.status)
  );
  const [outcomeStatus, setOutcomeStatus] = useState(detail.outcome?.status ?? "");

  const requiresExposure = ["direct", "return", "referral", "partnership"].includes(
    detail.exposure_mode
  );

  async function handleCopy() {
    if (!detail.message_template) return;
    try {
      await navigator.clipboard.writeText(detail.message_template);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setError("Não foi possível copiar automaticamente. Selecione o texto para copiar.");
    }
  }

  function begin() {
    setError("");
    startTransition(async () => {
      const result = await startRecommendation(detail.id);
      if (result.ok) {
        setStarted(true);
      } else {
        setError(result.error ?? "Não conseguimos iniciar essa ação agora.");
      }
    });
  }

  function finish(bucket: "1" | "2" | "3+" | null) {
    setError("");
    startTransition(async () => {
      const result = await completeRecommendation(detail.id, bucket);
      if (result.ok) {
        setCompleted(true);
        setOutcomeStatus((result.data as { outcome_status?: string })?.outcome_status ?? "");
        setShowExposure(false);
        router.refresh();
      } else {
        setError(result.error ?? "Não conseguimos registrar a conclusão agora.");
      }
    });
  }

  function handleNotCompleted() {
    setError("");
    startTransition(async () => {
      const result = await markNotCompleted(detail.id);
      if (result.ok) {
        router.push("/today");
      } else {
        setError(result.error ?? "Não conseguimos registrar isso agora.");
      }
    });
  }

  function chooseOutcome(status: "pending" | "none" | "interest" | "booking") {
    setError("");
    if (!detail.outcome) return;
    startTransition(async () => {
      const result = await recordOutcome(detail.outcome!.execution_id, status);
      if (result.ok) {
        setOutcomeStatus(status);
        router.refresh();
      } else {
        setError(result.error ?? "Não conseguimos registrar esse retorno agora.");
      }
    });
  }

  function swap(reason: string) {
    setError("");
    startTransition(async () => {
      const result = await swapRecommendation(detail.id, reason);
      if (!result.ok) {
        setError(result.error ?? "Não conseguimos trocar a ação agora.");
        return;
      }
      const payload = result.data as {
        recommendation?: { recommendation_id?: string };
        review_plan?: boolean;
      };
      if (payload?.review_plan) {
        router.push("/onboarding?reason=moment");
        return;
      }
      const recommendation = payload?.recommendation;
      if (recommendation?.recommendation_id) {
        router.push(`/action/${recommendation.recommendation_id}`);
      } else {
        router.push("/today");
      }
    });
  }

  const outcomeMatured = detail.outcome?.matured ?? false;

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-16">
      <div className="mx-auto w-full max-w-xl px-5 py-6 sm:px-8 sm:py-8">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <Link
            href="/today"
            className="inline-flex min-h-[48px] items-center gap-2 py-2 pr-4 text-sm font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Voltar para Hoje</span>
          </Link>
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-3 py-1 text-xs font-semibold text-[var(--color-action-primary)]">
            Ação Focada
          </span>
        </header>

        {/* Action Title & Overview */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-bold text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]">
              <Clock3 className="size-3.5" aria-hidden="true" />
              <span>{detail.duration_minutes} minutos estimados</span>
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            {detail.title}
          </h1>

          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            {detail.short_description}
          </p>

          {detail.action_type === "acquisition" && (
            <p className="mt-3 text-xs text-[var(--color-ink-muted)] font-medium">
              {confidenceCopy[detail.confidence_level ?? "learning"]}
            </p>
          )}
        </div>

        {/* Card: Por que agora */}
        <section
          aria-labelledby="why-now-heading"
          className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-action-subtle)] p-5 shadow-xs"
        >
          <h2 id="why-now-heading" className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            Por que esta ação agora
          </h2>
          <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-[var(--color-ink-solid)] text-pretty">
            {detail.why_now}
          </p>
        </section>

        {/* Card: Passos executáveis */}
        <section
          aria-labelledby="steps-heading"
          className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
        >
          <h2 id="steps-heading" className="text-base sm:text-lg font-bold text-[var(--color-ink-solid)]">
            Passo a passo recomendado
          </h2>
          <ol className="mt-4 space-y-3">
            {detail.steps.slice(0, 3).map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-solid)]"
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-xs font-bold text-white shadow-xs"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Message Template Card with Copy Feedback */}
        {detail.message_template && (
          <section
            aria-labelledby="template-heading"
            className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h2 id="template-heading" className="text-sm font-bold uppercase tracking-wider text-[var(--color-ink-solid)]">
                Sugestão de mensagem
              </h2>
              <div className="inline-flex p-0.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setScriptMode("text")}
                  className={cn(
                    "px-3 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer",
                    scriptMode === "text"
                      ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
                  )}
                >
                  Texto
                </button>
                <button
                  type="button"
                  onClick={() => setScriptMode("audio")}
                  className={cn(
                    "px-3 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer",
                    scriptMode === "audio"
                      ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
                  )}
                >
                  Áudio
                </button>
              </div>
            </div>

            {scriptMode === "text" ? (
              <>
                <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4">
                  <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-[var(--color-ink-solid)] font-sans select-all">
                    {detail.message_template}
                  </p>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex min-h-[48px] w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-5 text-sm font-bold text-[var(--color-ink-solid)] shadow-xs transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4 text-[var(--color-revenue-primary)]" aria-hidden="true" />
                        <span className="text-[var(--color-revenue-primary)]">Mensagem copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-4 text-[var(--color-ink-muted)]" aria-hidden="true" />
                        <span>Copiar mensagem</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="rounded-[var(--radius-sm)] bg-[var(--color-action-subtle)] p-3 border border-[var(--color-action-primary)]/20 text-xs text-[var(--color-action-primary)] font-semibold leading-relaxed">
                  🎙️ Roteiro de Áudio (~25s): Fale com voz calorosa, calma e segura. Segure o microfone no WhatsApp e fale com um sorrisinho leve na voz.
                </div>
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-white p-4">
                  <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-[var(--color-ink-solid)] font-medium">
                    {detail.message_template}
                  </p>
                </div>
              </div>
            )}

            <p aria-live="polite" className="mt-3 text-xs text-[var(--color-ink-muted)]">
              Dica: Se a cliente responder achando caro ou pedindo desconto, use o SOS Copiloto para responder sem perder a autoridade.
            </p>
          </section>
        )}

        {/* Ethical Guardrail Reminder */}
        {detail.ethical_guardrail && (
          <aside
            aria-label="Lembrete ético"
            className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/20 bg-[var(--color-opportunity-subtle)] p-4 sm:p-5 shadow-xs flex items-start gap-3"
          >
            <Info className="size-4 shrink-0 text-[var(--color-opportunity-primary)] mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm leading-relaxed text-[var(--color-ink-solid)]">
              <strong>Lembrete importante:</strong> {detail.ethical_guardrail}
            </div>
          </aside>
        )}

        {/* Outcome Evaluation (When pending) */}
        {detail.outcome && outcomeStatus === "pending" && (
          <section
            aria-labelledby="outcome-heading"
            className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/30 bg-white p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
          >
            <h2 id="outcome-heading" className="text-base sm:text-lg font-bold text-[var(--color-ink-solid)]">
              Essa ação trouxe algum retorno?
            </h2>

            {!outcomeMatured ? (
              <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
                Aguarde o tempo natural de resposta dos contatos antes de registrar o resultado final.
              </p>
            ) : (
              <div className="mt-4 grid gap-2.5">
                {outcomeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isPending}
                    onClick={() => chooseOutcome(opt.value)}
                    className="inline-flex min-h-[48px] w-full items-center justify-between rounded-[var(--radius-button)] border border-[var(--color-border-subtle)] bg-white px-4 py-3 text-left text-xs sm:text-sm font-medium text-[var(--color-ink-solid)] transition-all hover:border-[var(--color-action-primary)] hover:bg-[var(--color-action-subtle)] disabled:opacity-50"
                  >
                    <span>{opt.label}</span>
                    <ArrowRight className="size-4 text-[var(--color-ink-muted)]" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Finalized Outcome Display */}
        {detail.outcome && outcomeStatus && outcomeStatus !== "pending" && (
          <div className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-4 text-xs sm:text-sm text-[var(--color-ink-solid)] flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[var(--color-revenue-primary)] shrink-0" aria-hidden="true" />
            <span>
              Retorno registrado: <strong>{outcomeOptions.find((opt) => opt.value === outcomeStatus)?.label ?? outcomeStatus}</strong>.
            </span>
          </div>
        )}

        {/* Inline Error Message */}
        {error && (
          <div role="alert" className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-danger-primary)]/20 bg-[var(--color-danger-subtle)] p-4 text-xs sm:text-sm font-medium text-[var(--color-danger-primary)]">
            {error}
          </div>
        )}

        {/* Action Controls */}
        {!completed && !showSwap && (
          <div className="mt-8 space-y-3">
            {!started ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={begin}
                  disabled={isPending}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] disabled:cursor-wait disabled:opacity-60"
                >
                  <span>Fazer agora</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowSwap(true)}
                  disabled={isPending}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
                >
                  <span>Trocar ação por outro motivo</span>
                </button>
              </div>
            ) : showExposure ? (
              <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-5 sm:p-6 shadow-[var(--shadow-card-resting)]">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-[var(--color-action-primary)]" aria-hidden="true" />
                  <h2 className="text-base font-bold text-[var(--color-ink-solid)]">
                    Com quantas pessoas você executou esta ação?
                  </h2>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  {(["1", "2", "3+"] as const).map((bucket) => (
                    <button
                      key={bucket}
                      type="button"
                      disabled={isPending}
                      onClick={() => finish(bucket)}
                      className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white text-base font-bold text-[var(--color-ink-solid)] transition-all hover:border-[var(--color-action-primary)] hover:bg-[var(--color-action-subtle)] hover:text-[var(--color-action-primary)] active:scale-98"
                    >
                      {bucket} {bucket === "1" ? "pessoa" : "pessoas"}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => (requiresExposure ? setShowExposure(true) : finish(null))}
                  disabled={isPending}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-revenue-primary)] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-revenue-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-revenue-primary)] disabled:cursor-wait disabled:opacity-60"
                >
                  <Check className="size-4" aria-hidden="true" />
                  <span>Consegui fazer a ação</span>
                </button>
                <button
                  type="button"
                  onClick={handleNotCompleted}
                  disabled={isPending}
                  className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
                >
                  Não consegui fazer hoje
                </button>
                <button
                  type="button"
                  onClick={() => setShowSwap(true)}
                  disabled={isPending}
                  className="inline-flex min-h-[48px] w-full items-center justify-center text-xs font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
                >
                  Trocar ação
                </button>
              </div>
            )}
          </div>
        )}

        {/* Swap Action Dialog/Section */}
        {showSwap && (
          <section
            aria-labelledby="swap-heading"
            className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
          >
            <h2 id="swap-heading" className="text-base sm:text-lg font-bold text-[var(--color-ink-solid)]">
              Por que prefere trocar esta ação?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)]">
              Isso ajuda a calibrar a próxima sugestão de acordo com a sua realidade.
            </p>

            <div className="mt-4 grid gap-2.5">
              {swapReasons.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  disabled={isPending}
                  onClick={() => swap(reason.value)}
                  className="inline-flex min-h-[48px] w-full items-center justify-between rounded-[var(--radius-button)] border border-[var(--color-border-subtle)] bg-white px-4 py-3 text-left text-xs sm:text-sm font-medium text-[var(--color-ink-solid)] transition-all hover:border-[var(--color-action-primary)] hover:bg-[var(--color-action-subtle)] disabled:opacity-50"
                >
                  <span>{reason.label}</span>
                  <ArrowRight className="size-4 text-[var(--color-ink-muted)]" aria-hidden="true" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowSwap(false)}
              className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center text-sm font-semibold text-[var(--color-action-primary)] underline underline-offset-4"
            >
              Cancelar e voltar para a ação
            </button>
          </section>
        )}

        {/* Completed Feedback State */}
        {completed && !detail.outcome && (
          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-6 text-center shadow-xs">
            <CheckCircle2 className="size-8 text-[var(--color-revenue-primary)] mx-auto" aria-hidden="true" />
            <h2 className="mt-2 text-lg font-bold text-[var(--color-ink-solid)]">
              Ação concluída com sucesso!
            </h2>
            <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Excelente movimento. O sistema acompanhará os sinais para sua próxima etapa.
            </p>
            <Link
              href="/today"
              className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)]"
            >
              <span>Voltar para Hoje</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
