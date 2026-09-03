import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

export function LandingHeader() {
  return (
    <header className="flex items-center justify-between py-5 sm:py-7 border-b border-[var(--color-border-subtle)]">
      <Link
        href="/"
        className="flex items-center rounded-[var(--radius-button)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
        aria-label="Agenda 80/20 — Página Inicial"
      >
        <BrandMark />
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="inline-flex min-h-[48px] items-center rounded-[var(--radius-button)] px-4 py-2 text-sm font-semibold text-[var(--color-ink-solid)] transition-colors hover:text-[var(--color-action-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
        >
          <span>Entrar</span>
          <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
