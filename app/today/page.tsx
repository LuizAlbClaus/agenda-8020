import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, Clock3, SlidersHorizontal, Settings as SettingsIcon, Sparkles, Brain } from "lucide-react";

import { BrandMark } from "@/components/ui/brand-mark";
import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";
import NextActionButton from "./next-action-button";
import { TodayInteractiveHub } from "./today-interactive-hub";
import { fetchCopilotTemplates, fetchDueRetentions } from "@/app/action/copilot-actions";
import {
  fetchDailyLearningPill,
  fetchDiagnosticQuestions,
  fetchActiveValueDiagnostic,
} from "@/app/diagnostic/actions";

export default async function TodayPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login");
  }

  const { data } = await supabase!.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  if (!(await canAccessAgenda(userId))) redirect("/access-blocked");

  const [{ data: plan, error }, { data: benefitData }, { data: member }] = await Promise.all([
    supabase!.rpc("get_today_plan"),
    supabase!.rpc("get_belevy_benefit"),
    supabase!
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle(),
  ]);

  const workspaceId = member?.workspace_id;

  const [
    copilotTemplates,
    dueRetentions,
    dailyPill,
    diagnosticQuestions,
    activeDiagnostic,
  ] = await Promise.all([
    fetchCopilotTemplates(),
    fetchDueRetentions(3),
    workspaceId ? fetchDailyLearningPill(workspaceId) : Promise.resolve(null),
    fetchDiagnosticQuestions(),
    workspaceId ? fetchActiveValueDiagnostic(workspaceId) : Promise.resolve(null),
  ]);

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-6 sm:p-8 shadow-[var(--shadow-card-resting)]">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">Hoje</p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            Seu plano está temporariamente indisponível.
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)]">
            Não conseguimos atualizar sua recomendação neste momento. Tente novamente em alguns instantes.
          </p>
        </div>
      </main>
    );
  }

  if (plan?.onboarding_required) {
    redirect("/onboarding");
  }

  const recommendation = plan?.recommendation as {
    recommendation_id?: string;
    title?: string;
    short_description?: string;
    why_now?: string;
    duration_minutes?: number;
    status?: string;
    message?: string;
    confidence_level?: string;
  } | null;

  const pendingOutcome = plan?.pending_outcome as {
    title?: string;
    outcome_id?: string;
    recommendation_id?: string;
  } | null;

  const benefit = (Array.isArray(benefitData) ? benefitData[0] : benefitData) as {
    show_handoff?: boolean;
    duration_days?: number;
    total_days?: number;
    status?: string;
  } | null;

  const showBenefitHandoff = benefit?.show_handoff === true;

  const confidenceCopy =
    recommendation?.confidence_level === "strong_signal"
      ? "Esse tipo de ação tem mostrado mais resultado nas suas últimas tentativas."
      : recommendation?.confidence_level === "signal"
      ? "As últimas tentativas desse tipo tiveram alguns sinais positivos."
      : "Ainda estamos conhecendo o que faz mais sentido para o seu momento.";

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-28 sm:pb-32">
      <div className="mx-auto w-full max-w-xl px-5 py-5 sm:px-8 sm:py-7">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <BrandMark showLabel={false} />
          <nav aria-label="Navegação principal" className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/agenda"
              className="inline-flex min-h-[48px] items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-[var(--color-ink-solid)] transition-colors hover:text-[var(--color-action-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
            >
              <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
              <span>Agenda</span>
            </Link>
            <Link
              href="/diagnostic"
              className="inline-flex min-h-[48px] items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
            >
              <Brain className="size-4 shrink-0" aria-hidden="true" />
              <span>Diagnóstico</span>
            </Link>
            <Link
              href="/onboarding?reason=edit"
              className="inline-flex min-h-[48px] items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
            >
              <SlidersHorizontal className="size-4 shrink-0" aria-hidden="true" />
              <span>Ajustar</span>
            </Link>
            <Link
              href="/settings"
              aria-label="Configurações"
              className="inline-flex min-h-[48px] size-12 items-center justify-center text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
            >
              <SettingsIcon className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </nav>
        </header>

        {/* Priority 1: Pending Outcome Alert */}
        {pendingOutcome?.recommendation_id && (
          <aside aria-label="Resultado pendente" className="mt-5">
            <Link
              href={`/action/${pendingOutcome.recommendation_id}`}
              className="block rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/30 bg-[var(--color-opportunity-subtle)] p-4 sm:p-5 transition-all hover:border-[var(--color-opportunity-primary)] shadow-xs"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-opportunity-primary)]">
                Resultado pendente
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-[var(--color-ink-solid)]">
                Essa ação trouxe algum retorno?
              </p>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
                {pendingOutcome.title}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[var(--color-opportunity-primary)]">
                <span>Registrar retorno</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </aside>
        )}

        {/* Priority 2: Checkin Prompt */}
        {plan?.checkin_required && (
          <aside aria-label="Check-in necessário" className="mt-4">
            <Link
              href="/checkin"
              className="block rounded-[var(--radius-card)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] p-4 sm:p-5 transition-all hover:border-[var(--color-action-primary)] shadow-xs"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Check-in semanal
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-[var(--color-ink-solid)]">
                Seu momento mudou?
              </p>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Atualize seu contexto para manter as recomendações perfeitamente calibradas.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[var(--color-action-primary)]">
                <span>Atualizar check-in</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </aside>
        )}

        {/* Focus Hero Section */}
        <section aria-labelledby="focus-title" className="pt-8 pb-6 sm:pt-10">
          <p className="text-sm font-medium text-[var(--color-ink-muted)]">
            Olá{plan?.name ? `, ${plan.name}` : ""}.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-bold text-[var(--color-action-primary)] border border-[var(--color-border-subtle)]">
              {plan?.service_name || "Seu serviço"}
            </span>
          </div>

          <h1 id="focus-title" className="mt-4 text-3xl sm:text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-[var(--color-ink-solid)] text-balance">
            Seu foco agora
          </h1>

          <div className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] p-5 sm:p-6 shadow-xs">
            <p className="text-base sm:text-lg font-semibold leading-relaxed text-[var(--color-ink-solid)] text-pretty">
              {plan?.focus}
            </p>
          </div>
        </section>

        {/* Priority Action Section */}
        <section
          aria-labelledby="next-action-title"
          className="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-[var(--color-action-primary)]" aria-hidden="true" />
              <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Sua próxima ação
              </p>
            </div>
            {recommendation?.duration_minutes ? (
              <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink-muted)]">
                <Clock3 className="size-3.5" aria-hidden="true" />
                <span>{recommendation.duration_minutes} min</span>
              </span>
            ) : null}
          </div>

          {recommendation?.recommendation_id ? (
            <div className="mt-5 space-y-4">
              <div>
                <h2
                  id="next-action-title"
                  className="text-xl sm:text-2xl font-bold leading-tight tracking-[-0.025em] text-[var(--color-ink-solid)] text-balance"
                >
                  {recommendation.title}
                </h2>
                {recommendation.short_description && (
                  <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
                    {recommendation.short_description}
                  </p>
                )}
              </div>

              {recommendation.why_now && (
                <div className="rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-4">
                  <p className="text-xs font-bold text-[var(--color-ink-solid)] uppercase tracking-wider">
                    Por que agora
                  </p>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {recommendation.why_now}
                  </p>
                  {recommendation.confidence_level && (
                    <p className="mt-2 text-xs text-[var(--color-ink-muted)] font-medium border-t border-[var(--color-border-subtle)] pt-2">
                      {confidenceCopy}
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Link
                  href={`/action/${recommendation.recommendation_id}`}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
                >
                  <span>Fazer agora</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <p id="next-action-title" className="text-base sm:text-lg font-semibold leading-relaxed text-[var(--color-ink-solid)]">
                {recommendation?.message ?? "Vamos ajustar seu plano para encontrar uma próxima ação possível."}
              </p>
              {recommendation?.status === "next_action_available" ? (
                <NextActionButton />
              ) : (
                <Link
                  href="/onboarding?reason=edit"
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-5 text-sm font-bold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
                >
                  <span>Ajustar meu serviço</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Belevy Benefit Card (Optional Integration) */}
        {benefit?.status && benefit.status !== "expired" && (
          <section aria-label="Benefício parceiro" className="mt-5">
            <Link
              href="/belevy"
              className="block rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-5 transition-all hover:border-[var(--color-revenue-primary)] shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white px-2.5 py-0.5 text-xs font-bold text-[var(--color-revenue-primary)] shadow-xs">
                  <Sparkles className="size-3" aria-hidden="true" />
                  Benefício Parceiro
                </span>
                <span className="text-xs font-semibold text-[var(--color-revenue-primary)]">
                  Opcional
                </span>
              </div>
              <p className="mt-2 text-base font-bold text-[var(--color-ink-solid)]">
                {showBenefitHandoff
                  ? "Seu serviço está começando a se movimentar."
                  : `Você tem ${benefit.total_days ?? benefit.duration_days ?? 30} dias cortesia de Belevy Pro.`}
              </p>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Centralize agenda oficial, clientes e confirmações automáticas por WhatsApp.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[var(--color-revenue-primary)]">
                <span>Conhecer ou ativar benefício</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </section>
        )}

        {/* Interactive Hub: Retenção Biológica, Diagnóstico de Valor, Pílula de Café & Copiloto */}
        {workspaceId && (
          <TodayInteractiveHub
            workspaceId={workspaceId}
            dueRetentions={dueRetentions}
            copilotTemplates={copilotTemplates}
            dailyPill={dailyPill}
            diagnosticQuestions={diagnosticQuestions}
            activeDiagnostic={activeDiagnostic}
          />
        )}

        {/* Progress Navigation Link */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border-subtle)] pt-6">
          <Link
            href="/progress"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-bold text-[var(--color-ink-solid)] underline decoration-[var(--color-action-primary)] decoration-2 underline-offset-4 hover:text-[var(--color-action-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <span>Ver meu progresso e histórico</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/settings"
            className="inline-flex min-h-[48px] items-center text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
          >
            Configurações da conta
          </Link>
        </div>
      </div>
    </main>
  );
}
