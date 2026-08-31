import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-screen flex-col justify-between bg-[var(--color-canvas)] px-4 py-6 text-[var(--color-ink-solid)] sm:px-8 sm:py-10">
      {/* Top Brand Header */}
      <header className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center rounded-[var(--radius-button)] focus-visible:outline-none"
          aria-label="Agenda 80/20 — Página Inicial"
        >
          <BrandMark />
        </Link>
      </header>

      {/* Main Card Container */}
      <div className="mx-auto my-auto w-full max-w-md">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-resting)] sm:p-8">
          {/* Structural Calm Icon Badge */}
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-opportunity-subtle)] text-[var(--color-opportunity-primary)]">
            <AlertCircle className="size-6" aria-hidden="true" />
          </div>

          <div className="mt-5">
            <h1 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-balance sm:text-3xl text-[var(--color-ink-solid)]">
              Não foi possível entrar
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              O link pode ter expirado. Solicite um novo acesso para continuar.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-none"
            >
              <span>Voltar ao login</span>
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] px-5 text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none"
            >
              Voltar para o início
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <footer className="mx-auto flex w-full max-w-md items-center justify-between border-t border-[var(--color-border-subtle)] pt-6 text-xs text-[var(--color-ink-muted)]">
        <span>Agenda 80/20</span>
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
    </main>
  );
}
