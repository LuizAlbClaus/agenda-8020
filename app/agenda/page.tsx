import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";
import { getBelevyAgendaSummary, type BelevyAgendaSummary } from "@/lib/belevy-integration";

type AgendaSnapshot = {
  onboarding_required?: boolean;
  workspace?: { name: string; slug: string; timezone: string };
  services?: Array<{ id: string; name: string; duration_minutes: number }>;
  appointments?: Array<{
    id: string;
    service_name: string;
    customer_name: string;
    starts_at: string;
    ends_at: string;
    status: string;
  }>;
  public_booking_url?: string;
};

function formatAppointmentDate(value: string) {
  try {
    return new Date(value).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function renderBelevyConnection(summary: BelevyAgendaSummary) {
  if (summary.status === "connected") {
    return (
      <section
        aria-labelledby="belevy-status-title"
        className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-5 sm:p-6 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-white px-3 py-1 text-xs font-bold text-[var(--color-revenue-primary)] shadow-xs">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Belevy Conectado
          </span>
          <span className="text-xs font-semibold text-[var(--color-revenue-primary)]">
            Agenda Oficial
          </span>
        </div>

        <h2 id="belevy-status-title" className="mt-3 text-lg sm:text-xl font-bold text-[var(--color-ink-solid)]">
          Sua agenda oficial está centralizada no Belevy
        </h2>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Use o Belevy para gerenciar horários, remarcações e confirmações automáticas de clientes por WhatsApp. O Agenda 80/20 consome apenas os sinais essenciais para sugerir seu próximo movimento.
        </p>

        <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-white p-3.5 text-xs sm:text-sm font-semibold text-[var(--color-ink-solid)]">
          {summary.upcomingCount} horário(s) nos próximos 30 dias · {summary.completedLast30Days} atendimento(s) realizado(s)
        </div>

        <div className="mt-4">
          <a
            href={summary.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-revenue-primary)] px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-revenue-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-revenue-primary)]"
          >
            <span>Abrir Painel Belevy</span>
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    );
  }

  if (summary.status === "expired") {
    return (
      <section
        aria-labelledby="belevy-status-title"
        className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/30 bg-[var(--color-opportunity-subtle)] p-5 sm:p-6 shadow-xs"
      >
        <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-white px-3 py-1 text-xs font-bold text-[var(--color-opportunity-primary)] shadow-xs">
          Belevy Expirado
        </span>
        <h2 id="belevy-status-title" className="mt-3 text-lg sm:text-xl font-bold text-[var(--color-ink-solid)]">
          Sua conexão com o Belevy terminou
        </h2>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
          O Agenda 80/20 continua ativo no modo autônomo. Você pode reativar o Belevy a qualquer momento para voltar a contar com automações de agenda e WhatsApp.
        </p>
        <div className="mt-4">
          <Link
            href="/belevy"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-5 text-sm font-bold text-[var(--color-ink-solid)] shadow-xs transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <span>Ver opções do Belevy</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  if (summary.status === "unavailable") {
    return (
      <section
        aria-labelledby="belevy-status-title"
        className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
      >
        <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] px-3 py-1 text-xs font-semibold text-[var(--color-ink-muted)]">
          Integração Indisponível
        </span>
        <h2 id="belevy-status-title" className="mt-3 text-lg sm:text-xl font-bold text-[var(--color-ink-solid)]">
          O Belevy não respondeu no momento
        </h2>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
          Sua operação no Agenda 80/20 continua normalmente ativa. Tente atualizar mais tarde para verificar os dados da agenda parceira.
        </p>
      </section>
    );
  }

  // Autonomous mode (not_configured / not_connected)
  return (
    <section
      aria-labelledby="belevy-status-title"
      className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-3 py-1 text-xs font-bold text-[var(--color-action-primary)]">
          Modo Autônomo
        </span>
      </div>

      <h2 id="belevy-status-title" className="mt-3 text-lg sm:text-xl font-bold text-[var(--color-ink-solid)]">
        Agenda 80/20 funcionando de forma independente
      </h2>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Seu plano de ações, diagnósticos e registros continuam disponíveis de forma autônoma. Se quiser automações completas de agendamento online e confirmações por WhatsApp, conheça o benefício Belevy.
      </p>
      <div className="mt-4">
        <Link
          href="/belevy"
          className="inline-flex min-h-[48px] items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--color-action-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
        >
          <span>Conhecer benefício Belevy (opcional)</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />

        </Link>
      </div>
    </section>
  );
}

export default async function AgendaPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login");
  }

  const { data } = await supabase!.auth.getClaims();
  const userId = data?.claims?.sub;
  const userEmail = typeof data?.claims?.email === "string" ? data.claims.email : undefined;

  if (!userId) redirect("/login");
  if (!(await canAccessAgenda(userId))) redirect("/access-blocked");

  const [{ data: agenda, error }, belevy] = await Promise.all([
    supabase!.rpc("get_agenda_snapshot"),
    getBelevyAgendaSummary(userEmail),
  ]);

  if (error || !agenda) {
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
            Agenda indisponível
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Não conseguimos carregar as informações da sua agenda agora. Tente novamente mais tarde.
          </p>
        </div>
      </main>
    );
  }

  const snapshot = agenda as AgendaSnapshot;
  if (snapshot.onboarding_required) {
    redirect("/onboarding");
  }

  const connected = belevy.status === "connected";
  const bookingUrl = connected ? belevy.publicUrl : snapshot.public_booking_url;
  const appointments = connected
    ? belevy.appointments.map((appointment) => ({
        id: appointment.id,
        service_name: appointment.serviceName,
        customer_name: "",
        starts_at: appointment.startsAt,
        ends_at: appointment.endsAt,
        status: appointment.status,
      }))
    : snapshot.appointments ?? [];

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-16">
      <div className="mx-auto w-full max-w-2xl px-5 py-6 sm:px-8 sm:py-8">
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
            Gestão de Horários
          </span>
        </header>

        {/* Page Title */}
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            Seu espaço de atendimento
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            O Agenda 80/20 foca nas decisões de crescimento do seu serviço. Quando conectado, o Belevy cuida da operação detalhada.
          </p>
        </div>

        {/* Belevy Connection Section */}
        {renderBelevyConnection(belevy)}

        {/* Public Booking Link Card */}
        <section
          aria-labelledby="booking-link-title"
          className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)]"
        >
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-[var(--color-action-primary)]" aria-hidden="true" />
            <h2 id="booking-link-title" className="text-base font-bold text-[var(--color-ink-solid)]">
              Link público de agendamento
            </h2>
          </div>

          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {connected
              ? "Este é seu link oficial sincronizado com o Belevy para divulgar para clientes."
              : "Este é seu link básico do Agenda 80/20 no modo autônomo."}
          </p>

          {bookingUrl && (
            <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3.5 break-all text-xs sm:text-sm font-mono text-[var(--color-ink-solid)] select-all">
              {bookingUrl}
            </div>
          )}

          {bookingUrl && (
            <div className="mt-4">
              {connected ? (
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
                >
                  <span>Abrir página pública</span>
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  href={bookingUrl}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
                >
                  <span>Abrir página pública</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Published Services Section */}
        <section aria-labelledby="services-title" className="mt-8">
          <h2 id="services-title" className="text-lg sm:text-xl font-bold text-[var(--color-ink-solid)]">
            Serviços publicados
          </h2>

          <div className="mt-4 grid gap-3">
            {snapshot.services?.length ? (
              snapshot.services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-4 sm:p-5 shadow-[var(--shadow-card-resting)] flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm sm:text-base font-bold text-[var(--color-ink-solid)]">
                      {service.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                      {service.duration_minutes} minutos · Disponível para agendamento
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-revenue-primary)]">
                    Ativo
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-white p-5 text-center text-xs sm:text-sm text-[var(--color-ink-muted)]">
                Nenhum serviço configurado no momento.
              </div>
            )}
          </div>
        </section>

        {/* Upcoming Appointments Section */}
        <section aria-labelledby="appointments-title" className="mt-8">
          <h2 id="appointments-title" className="text-lg sm:text-xl font-bold text-[var(--color-ink-solid)]">
            Próximos agendamentos
          </h2>

          <div className="mt-4 grid gap-3">
            {appointments.length ? (
              appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-4 sm:p-5 shadow-[var(--shadow-card-resting)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm sm:text-base font-bold text-[var(--color-ink-solid)]">
                      {appointment.service_name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                      {appointment.customer_name ? `${appointment.customer_name} · ` : ""}
                      {formatAppointmentDate(appointment.starts_at)}
                    </p>
                  </div>
                  <span className="self-start sm:self-center inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-action-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-action-primary)] uppercase tracking-wider">
                    {appointment.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-white p-6 text-center text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Ainda não há agendamentos registrados. Compartilhe seu link de agendamento para começar a preencher seus horários.
              </div>
            )}
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-10 pt-6 border-t border-[var(--color-border-subtle)]">
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
