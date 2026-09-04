import { Check, Sparkles } from "lucide-react";

export function LandingBelevy() {
  return (
    <section
      aria-labelledby="belevy-heading"
      className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20 bg-[var(--color-surface-muted)]/20"
    >
      <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[var(--color-border-subtle)] pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-revenue-primary)]">
              <Sparkles className="size-3" />
              Infraestrutura Parceira Integrada
            </span>
            <h3
              id="belevy-heading"
              className="mt-2 text-xl sm:text-2xl font-bold text-[var(--color-ink-solid)]"
            >
              E quando a sua operação crescer?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)]">
              Entenda como o Agenda 80/20 e o Belevy se complementam sem dependência mútua:
            </p>
          </div>

          <div className="shrink-0 rounded-[var(--radius-sm)] border border-[var(--color-revenue-primary)]/20 bg-[var(--color-revenue-subtle)] p-3 text-center">
            <span className="text-xs font-bold text-[var(--color-revenue-primary)]">
              30 dias de cortesia inclusos
            </span>
            <p className="text-[10px] text-[var(--color-ink-muted)] mt-0.5">Para ativar quando desejar</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Card Agenda 80/20 */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-action-primary)]/30 bg-[var(--color-action-subtle)]/30 p-5">
            <h4 className="text-sm font-bold text-[var(--color-action-primary)] uppercase tracking-wider">
              Agenda 80/20 · Decisão Comercial
            </h4>
            <p className="mt-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">
              Foco em <strong>crescimento e movimento</strong>: entende seu momento, define a próxima ação do dia, entrega scripts para WhatsApp, destrava orçamentos e monitora retenção.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-[var(--color-ink-solid)]">
              <li className="flex items-center gap-2">
                <Check className="size-3 text-[var(--color-action-primary)]" />
                <span>Indica o que fazer hoje</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3 text-[var(--color-action-primary)]" />
                <span>Scripts em áudio e texto</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3 text-[var(--color-action-primary)]" />
                <span>100% autônomo e independente</span>
              </li>
            </ul>
          </div>

          {/* Card Belevy Pro */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-5">
            <h4 className="text-sm font-bold text-[var(--color-ink-solid)] uppercase tracking-wider">
              Belevy Pro · Gestão de Horários
            </h4>
            <p className="mt-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">
              Foco em <strong>operação detalhada</strong>: quando sua grade estiver com volume, centralize horários e ative confirmações automáticas por WhatsApp para clientes não faltarem.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs text-[var(--color-ink-solid)]">
              <li className="flex items-center gap-2">
                <Check className="size-3 text-[var(--color-revenue-primary)]" />
                <span>Lembretes automáticos anti-falta</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3 text-[var(--color-revenue-primary)]" />
                <span>Gestão avançada de grade semanal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-3 text-[var(--color-revenue-primary)]" />
                <span>Totalmente opcional</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-ink-muted)]">
          O Agenda 80/20 funciona perfeitamente sozinho. O Belevy é uma cortesia opcional para quando você quiser adicionar automação operacional.
        </p>
      </div>
    </section>
  );
}
