import { Clock3, Sparkles } from "lucide-react";
import { SCENARIOS_DATA } from "./types";

export function LandingScenarios() {
  return (
    <section
      aria-labelledby="scenarios-heading"
      className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
          Exemplos Reais do Dia a Dia
        </span>
        <h2
          id="scenarios-heading"
          className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-4xl"
        >
          Veja o que ele faria no seu caso.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          A promessa deixa de ser abstrata quando você enxerga a decisão sendo tomada para a sua situação real:
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-5xl grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS_DATA.map((item, index) => (
          <div
            key={item.id}
            className={`rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-[var(--shadow-card-resting)] flex flex-col justify-between transition-all hover:border-[var(--color-action-primary)]/50 ${
              index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div>
              <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-ink-muted)]">
                {item.tag}
              </span>

              <h3 className="mt-3 text-base font-bold text-[var(--color-ink-solid)] leading-snug">
                {item.title}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                {item.description}
              </p>
            </div>

            <div className="mt-5 border-t border-[var(--color-border-subtle)] pt-4">
              <div className="flex items-center justify-between text-[11px] text-[var(--color-action-primary)] font-bold mb-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="size-3" />
                  {item.movementTitle}
                </span>
                <span className="inline-flex items-center gap-1 text-[var(--color-ink-muted)] font-normal">
                  <Clock3 className="size-3" />
                  {item.durationMinutes} min
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--color-ink-solid)] font-medium">
                {item.movementRationale}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--color-ink-muted)] max-w-xl mx-auto">
        *Estes são exemplos ilustrativos do raciocínio prático do sistema. As recomendações reais são calibradas com base nas respostas e canais que você informar no seu perfil.
      </p>
    </section>
  );
}
