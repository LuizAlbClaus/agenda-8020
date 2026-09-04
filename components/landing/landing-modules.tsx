import {
  Calendar,
  Clock3,
  LineChart,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";
import { SUPPORT_MODULES } from "./types";

const moduleIcons: Record<string, typeof Sparkles> = {
  "growth-coach": Sparkles,
  copilot: ShieldAlert,
  retention: Clock3,
  diagnostic: Target,
  booking: Calendar,
  progress: LineChart,
};

export function LandingModules() {
  return (
    <section
      aria-labelledby="modules-heading"
      className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-revenue-primary)]">
          Ecossistema de Apoio Contínuo
        </span>
        <h2
          id="modules-heading"
          className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-4xl"
        >
          E quando o problema muda, o Agenda 80/20 continua com você.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          Seu negócio passa por fases diferentes ao longo dos meses. O Agenda 80/20 acompanha cada uma delas com ferramentas especializadas para o momento em que a necessidade surgir:
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-5xl grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SUPPORT_MODULES.map((mod) => {
          const Icon = moduleIcons[mod.id] ?? Sparkles;
          const isCore = mod.id === "growth-coach";

          return (
            <div
              key={mod.id}
              className={`rounded-[var(--radius-card)] p-5 sm:p-6 border flex flex-col justify-between transition-all ${
                isCore
                  ? "border-2 border-[var(--color-action-primary)] bg-[var(--color-action-subtle)]/40 shadow-xs"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-[var(--shadow-card-resting)]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[11px] font-bold ${
                      isCore
                        ? "bg-[var(--color-action-primary)] text-white shadow-xs"
                        : "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)] border border-[var(--color-border-subtle)]"
                    }`}
                  >
                    {mod.tag}
                  </span>
                  <Icon
                    className={`size-4 ${
                      isCore
                        ? "text-[var(--color-action-primary)]"
                        : "text-[var(--color-ink-muted)]"
                    }`}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mt-4 text-base font-bold text-[var(--color-ink-solid)]">
                  {mod.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                  {mod.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--color-border-subtle)] text-[11px] font-semibold text-[var(--color-revenue-primary)]">
                ✓ {mod.benefit}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
