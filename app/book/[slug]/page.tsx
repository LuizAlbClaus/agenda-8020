import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { createClient } from "@/lib/supabase/server";
import { publicUrlForSlug } from "@/lib/belevy-integration";
import BookingForm from "./booking-form";

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Maintain Belevy redirect when connected
  const { data: belevyRedirect } = await supabase.rpc(
    "get_belevy_booking_redirect",
    { p_agenda_slug: slug }
  );
  const redirectData = belevyRedirect as {
    status?: string;
    slug?: string;
  } | null;

  if (redirectData?.status === "connected" && redirectData.slug) {
    const belevyUrl = publicUrlForSlug(redirectData.slug);
    if (belevyUrl) redirect(belevyUrl);
  }

  // 2. Fetch public booking context
  const { data, error } = await supabase.rpc("get_public_booking_context", {
    p_slug: slug,
  });

  if (error || !data || (data as { error?: string }).error) {
    notFound();
  }

  const context = data as {
    workspace: { name: string; timezone: string; slug: string };
    services: Array<{
      id: string;
      name: string;
      duration_minutes: number;
      description?: string | null;
      price_minor?: number | null;
      currency?: string | null;
    }>;
    days: Array<{
      date: string;
      slots: Array<{ starts_at: string; ends_at: string }>;
    }>;
  };

  const businessName = context.workspace.name.replace(/^Agenda de /, "");

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink-solid)]">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-8 sm:py-10">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-5">
          <Link
            href="/"
            className="flex items-center rounded-[var(--radius-button)] focus-visible:outline-none"
            aria-label="Agenda 80/20"
          >
            <BrandMark />
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
            <Clock className="size-3.5" aria-hidden="true" />
            <span>Fuso: {context.workspace.timezone}</span>
          </div>
        </header>

        {/* Page Title & Business Identity */}
        <div className="mt-8">
          <p className="flex items-center gap-2 text-sm font-bold text-[var(--color-action-primary)]">
            <CalendarDays className="size-4" aria-hidden="true" />
            <span>Agendamento</span>
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-[1.06] tracking-[-0.035em] text-balance sm:text-4xl">
            Marque seu horário com {businessName}.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)] sm:text-base">
            Escolha o serviço e um horário disponível. Os horários consideram o fuso de {context.workspace.timezone}.
          </p>
        </div>

        {/* Form or Empty State */}
        {context.services.length > 0 ? (
          <BookingForm
            slug={slug}
            services={context.services}
            days={context.days}
            businessName={businessName}
          />
        ) : (
          <div className="mt-8 rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-8 text-center shadow-[var(--shadow-card-resting)]">
            <CalendarDays
              className="mx-auto size-10 text-[var(--color-ink-muted)]"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-bold text-[var(--color-ink-solid)]">
              Nenhum serviço disponível
            </h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Este espaço ainda não disponibilizou horários públicos para agendamento online.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 flex flex-col gap-4 border-t border-[var(--color-border-subtle)] pt-6 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>Agendamento seguro via Agenda 80/20</span>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Privacidade
            </Link>
            <Link
              href="/terms"
              className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-none"
            >
              Termos
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
