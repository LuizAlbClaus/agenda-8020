import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";

export default async function ProgressPage() {
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

  const { data: progress, error } = await supabase!.rpc("get_progress");

  if (error || !progress) {
    return (
      <main className="min-h-screen bg-[var(--color-canvas)] flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-6 sm:p-8 shadow-[var(--shadow-card-resting)]">
          <Link
            href="/today"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Voltar para Hoje</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[var(--color-ink-solid)]">
            Progresso indisponível
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Não conseguimos carregar seu histórico no momento. Tente novamente em instantes.
          </p>
        </div>
      </main>
    );
  }

  const foundation = progress.foundation as {
    completed?: number;
    total?: number;
    availability?: boolean;
    booking_path?: boolean;
    portfolio?: boolean;
  } | null;

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
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] px-3 py-1 text-xs font-semibold text-[var(--color-ink-muted)]">
            Histórico Real
          </span>
        </header>

        {/* Page Title */}
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            Pequenos sinais do seu movimento
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            Acompanhe as ações executadas e os sinais registrados no seu negócio.
          </p>
        </div>


        {/* Metrics Grid */}
        <section aria-label="Métricas de progresso" className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-action-primary)]">
              {progress.actions_completed ?? 0}
            </p>
            <p className="mt-2 text-xs font-semibold text-[var(--color-action-primary)] uppercase tracking-wider">
              Ações feitas
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-4 sm:p-5 flex flex-col justify-between shadow-[var(--shadow-card-resting)]">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink-solid)]">
              {progress.people_interested ?? 0}
            </p>
            <p className="mt-2 text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wider">
              Interessados
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-revenue-primary)]">
              {progress.bookings ?? 0}
            </p>
            <p className="mt-2 text-xs font-semibold text-[var(--color-revenue-primary)] uppercase tracking-wider">
              Agendamentos
            </p>
          </div>
        </section>

        {/* Moment and Focus Card */}
        <section
          aria-labelledby="moment-title"
          className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--color-action-primary)]" aria-hidden="true" />
            <h2 id="moment-title" className="text-base font-bold text-[var(--color-ink-solid)]">
              Diagnóstico do seu momento
            </h2>
          </div>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            {progress.moment_message}
          </p>

          {progress.next_focus && (
            <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
                Próximo foco estratégico
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-ink-solid)]">
                {progress.next_focus}
              </p>
            </div>
          )}
        </section>

        {/* Foundation Card */}
        {foundation && foundation.completed !== foundation.total && (
          <section
            aria-labelledby="foundation-title"
            className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <h2 id="foundation-title" className="text-base font-bold text-[var(--color-ink-solid)]">
                Fundação do seu serviço
              </h2>
              <span className="text-xs font-semibold text-[var(--color-ink-muted)]">
                {foundation.completed} de {foundation.total} concluídos
              </span>
            </div>

            <ul className="mt-4 space-y-2.5">
              <li className="flex items-center gap-3 text-xs sm:text-sm text-[var(--color-ink-solid)]">
                {foundation.availability ? (
                  <CheckCircle2 className="size-4 text-[var(--color-revenue-primary)] shrink-0" aria-hidden="true" />
                ) : (
                  <Circle className="size-4 text-[var(--color-border-strong)] shrink-0" aria-hidden="true" />
                )}
                <span className={foundation.availability ? "font-medium" : "text-[var(--color-ink-muted)]"}>
                  Disponibilidade na agenda organizada
                </span>
              </li>

              <li className="flex items-center gap-3 text-xs sm:text-sm text-[var(--color-ink-solid)]">
                {foundation.booking_path ? (
                  <CheckCircle2 className="size-4 text-[var(--color-revenue-primary)] shrink-0" aria-hidden="true" />
                ) : (
                  <Circle className="size-4 text-[var(--color-border-strong)] shrink-0" aria-hidden="true" />
                )}
                <span className={foundation.booking_path ? "font-medium" : "text-[var(--color-ink-muted)]"}>
                  Caminho claro para receber agendamentos
                </span>
              </li>

              <li className="flex items-center gap-3 text-xs sm:text-sm text-[var(--color-ink-solid)]">
                {foundation.portfolio ? (
                  <CheckCircle2 className="size-4 text-[var(--color-revenue-primary)] shrink-0" aria-hidden="true" />
                ) : (
                  <Circle className="size-4 text-[var(--color-border-strong)] shrink-0" aria-hidden="true" />
                )}
                <span className={foundation.portfolio ? "font-medium" : "text-[var(--color-ink-muted)]"}>
                  Fotos ou prova do serviço pronta para mostrar
                </span>
              </li>
            </ul>
          </section>
        )}

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Link
            href="/checkin"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-5 text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <span>Atualizar meu contexto no Check-in</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>

          <Link
            href="/today"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <span>Voltar para Hoje</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
