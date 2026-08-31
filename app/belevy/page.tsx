import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { canAccessAgenda } from "@/lib/supabase/access";
import { createClient } from "@/lib/supabase/server";
import BenefitCard, { type BelevyBenefit } from "./benefit-card";
import { getBelevyAgendaSummary } from "@/lib/belevy-integration";

export default async function BelevyPage(_props: { manual?: boolean } = {}) {
  void _props;
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
            href="/today"
            className="inline-flex min-h-[48px] items-center gap-2 py-2 pr-4 text-sm font-semibold text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] rounded-[var(--radius-button)]"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span>Voltar para Hoje</span>
          </Link>
          <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-3 py-1 text-xs font-bold text-[var(--color-revenue-primary)]">
            Benefício Parceiro
          </span>
        </header>

        {/* Page Title */}
        <div className="mt-6">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink-solid)] text-balance">
            Benefício Belevy Pro
          </h1>
          <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            O Agenda 80/20 foca na estratégia de crescimento. O Belevy é a ferramenta parceira para quem deseja operação completa de agenda, clientes e confirmações automáticas por WhatsApp.
          </p>
        </div>

        {/* Benefit Card */}
        {error || !normalized ? (
          <section className="mt-6 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-white p-5 sm:p-6 shadow-[var(--shadow-card-resting)]">
            <p className="font-bold text-[var(--color-ink-solid)]">
              Não conseguimos carregar seu benefício agora.
            </p>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Tente novamente em alguns instantes.
            </p>
          </section>
        ) : (
          <div className="mt-6">
            <BenefitCard
              benefit={normalized}
              handoff={normalized.show_handoff}
              integrationStatus={belevy.status}
              publicUrl={belevy.status === "connected" ? belevy.publicUrl : undefined}
              loginUrl={`${belevyBaseUrl}/login`}
            />
          </div>
        )}

        {/* Secondary Back Navigation */}
        <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)]">
          <Link
            href="/today"
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-white px-5 text-sm font-bold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
          >
            <span>Continuar no modo autônomo</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
