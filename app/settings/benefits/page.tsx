import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

import { canAccessAgenda } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";
import BenefitCard, { type BelevyBenefit } from "../../belevy/benefit-card";
import { getBelevyAgendaSummary } from "@/lib/belevy-integration";

export default async function BenefitsSettingsPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login");
  }

  const { data: claims } = await supabase!.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string" || !(await canAccessAgenda(userId))) {
    redirect("/access-blocked");
  }

  const email = typeof claims?.claims?.email === "string" ? claims.claims.email : undefined;
  const [{ data, error }, belevy] = await Promise.all([
    supabase!.rpc("get_belevy_benefit"),
    getBelevyAgendaSummary(email),
  ]);

  const benefit = (Array.isArray(data) ? data[0] : data) as BelevyBenefit | null;
  const normalized = benefit && {
    benefit_id: String(benefit.benefit_id ?? ""),
    status: String(benefit.status ?? "available"),
    duration_days: Number(benefit.duration_days ?? 0),
    total_days: Number(benefit.total_days ?? benefit.duration_days ?? 0),
    activation_enabled: benefit.activation_enabled === true,
    show_handoff: benefit.show_handoff === true,
    movement: benefit.movement === true,
    activated_at: benefit.activated_at,
  };

  const belevyBaseUrl = (
    process.env.BELEVY_PUBLIC_URL?.trim() || "https://belevy.com.br"
  ).replace(/\/$/, "");

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-16">
      <div className="mx-auto w-full max-w-xl px-5 py-6 sm:px-8 sm:py-8">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
          <Link
            href="/settings"
            className="inline-flex min-h-[48px] items-center gap-2 py-2 pr-4 text-sm font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Voltar para Configurações</span>
          </Link>
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-3 py-1 text-xs font-bold text-[var(--color-revenue-primary)]">
            Parceria
          </span>
        </header>

        {/* Page Title */}
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            Gerenciar Benefício Belevy
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            Controle a integração com a plataforma operacional parceira para gestão de agenda, clientes e WhatsApp.
          </p>
        </div>

        {/* Status Card & Benefit Management */}
        {error || !normalized ? (
          <section className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-5 sm:p-6 shadow-[var(--shadow-card-resting)]">
            <p className="font-bold text-[var(--color-ink-solid)]">
              Não conseguimos carregar o status do benefício agora.
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Tente novamente em alguns instantes.
            </p>
          </section>
        ) : (
          <div className="mt-6 space-y-6">
            <BenefitCard
              benefit={normalized}
              handoff={normalized.show_handoff}
              integrationStatus={belevy.status}
              publicUrl={belevy.status === "connected" ? belevy.publicUrl : undefined}
              loginUrl={`${belevyBaseUrl}/login`}
            />

            {/* Architecture Independence Card */}
            <aside
              aria-label="Arquitetura de integração"
              className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-5 shadow-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-[var(--color-action-primary)]" aria-hidden="true" />
                <h2 className="text-sm font-bold text-[var(--color-ink-solid)]">
                  Privacidade e arquitetura independente
                </h2>
              </div>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)]">
                O Agenda 80/20 e o Belevy funcionam de forma independente. Quando conectado, o Agenda 80/20 consulta apenas contagens mínimas da sua agenda para calibrar a recomendação do dia. Nenhum dado de clientes é modificado pelo Agenda 80/20.
              </p>

            </aside>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-[var(--color-border-subtle)] pt-6">
          <Link
            href="/settings"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-semibold text-[var(--color-ink-muted)] hover:text-[var(--color-ink-solid)]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            <span>Configurações</span>
          </Link>
          <Link
            href="/today"
            className="inline-flex min-h-[48px] items-center gap-2 text-sm font-bold text-[var(--color-action-primary)] hover:underline"
          >
            <span>Ir para Hoje</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
