import { Clock, ShieldCheck, Smartphone } from "lucide-react";

export function LandingPositioning() {
  return (
    <section
      aria-labelledby="positioning-heading"
      className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 sm:p-10 shadow-[var(--shadow-card-resting)]">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            Baixa Carga Cognitiva · Alto Impacto
          </span>
          <h2
            id="positioning-heading"
            className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-3xl lg:text-4xl"
          >
            Você não precisa virar especialista em marketing para agir como dona do seu negócio.
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty">
            O Agenda 80/20 não foi feito para exigir horas estudando funis, métricas complexas de tráfego, planilhas ou teorias infinitas.
          </p>
        </div>

        {/* 4 Simple Daily Steps */}
        <div className="mt-10 grid gap-4 sm:grid-cols-4">
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-4 text-center border border-[var(--color-border-subtle)]">
            <span className="text-xs font-extrabold text-[var(--color-action-primary)] uppercase">1. Você abre</span>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">No intervalo de 2 a 5 minutos no celular.</p>
          </div>

          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-4 text-center border border-[var(--color-border-subtle)]">
            <span className="text-xs font-extrabold text-[var(--color-action-primary)] uppercase">2. Entende o foco</span>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Vê apenas a ação que merece sua atenção hoje.</p>
          </div>

          <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] p-4 text-center border border-[var(--color-border-subtle)]">
            <span className="text-xs font-extrabold text-[var(--color-action-primary)] uppercase">3. Executa</span>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">Copia o roteiro em áudio ou texto e manda no WhatsApp.</p>
          </div>

          <div className="rounded-[var(--radius-sm)] bg-[var(--color-revenue-subtle)] p-4 text-center border border-[var(--color-revenue-primary)]/20">
            <span className="text-xs font-extrabold text-[var(--color-revenue-primary)] uppercase">4. Segue seu dia</span>
            <p className="mt-1 text-xs text-[var(--color-revenue-primary)] font-medium">Volta a atender suas clientes com tranquilidade.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-ink-muted)]">
          <span className="flex items-center gap-1.5 font-medium">
            <Smartphone className="size-4 text-[var(--color-action-primary)]" />
            Operado 100% com 1 polegar no celular
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="size-4 text-[var(--color-revenue-primary)]" />
            Ações desenhadas para menos de 10 minutos
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-4 text-[var(--color-ink-solid)]" />
            Zero teoria inútil ou jargões corporativos
          </span>
        </div>
      </div>
    </section>
  );
}
