import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

interface ReadinessLockBannerProps {
  reason: string;
  fixUrl: string;
}

export function ReadinessLockBanner({ reason, fixUrl }: ReadinessLockBannerProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-opportunity-primary)]/40 bg-[var(--color-opportunity-subtle)] p-4 sm:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-white flex items-center justify-center text-[var(--color-opportunity-primary)] shadow-xs">
          <Lock className="size-3.5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-opportunity-primary)]">
          Trava de Prontidão Ativa
        </span>
      </div>

      <p className="text-sm font-semibold text-[var(--color-ink-solid)] leading-snug">
        {reason}
      </p>

      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
        Para manter sua reputação e autoridade, não fazemos convites sem antes garantir que você tenha onde receber essa cliente.
      </p>

      <Link
        href={fixUrl}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[var(--color-action-hover)]"
      >
        <span>Resolver pendência na Agenda</span>
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
