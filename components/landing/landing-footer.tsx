import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

export function LandingFooter() {
  return (
    <footer className="flex flex-col gap-6 border-t border-[var(--color-border-subtle)] py-8 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:items-center sm:justify-between sm:text-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <BrandMark size="sm" />
        <span className="text-xs text-[var(--color-ink-muted)]">
          Sistema de decisão comercial para profissionais prestadores de serviço. Não promete faturamento ou agenda cheia.
        </span>
      </div>
      <div className="flex items-center gap-5 shrink-0">
        <Link
          href="/privacy"
          className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
        >
          Privacidade
        </Link>
        <Link
          href="/terms"
          className="underline underline-offset-4 transition-colors hover:text-[var(--color-ink-solid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)]"
        >
          Termos
        </Link>
      </div>
    </footer>
  );
}
