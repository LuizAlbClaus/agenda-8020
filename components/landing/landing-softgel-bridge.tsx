import { CheckCircle2, Sparkles } from "lucide-react";

export function LandingSoftGelBridge() {
  return (
    <section
      aria-labelledby="softgel-bridge-heading"
      className="border-t border-[var(--color-border-subtle)] py-12 sm:py-16 bg-[var(--color-surface-muted)]/40"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            Continuidade Natural do Seu Aprendizado
          </span>
          <h2
            id="softgel-bridge-heading"
            className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-3xl"
          >
            A evolução lógica da sua carreira após o Soft Gel Express.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--color-ink-muted)] max-w-2xl mx-auto">
            Dominar a técnica de aplicação é fundamental, mas o que sustenta o seu negócio no final do mês são as clientes na cadeira:
          </p>
        </div>

        {/* 3-Step Journey Diagram */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-ink-muted)]">
                Etapa 1 Concluída
              </span>
              <h3 className="mt-3 text-base font-bold text-[var(--color-ink-solid)]">
                Soft Gel Express
              </h3>
              <p className="mt-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Aprender a técnica perfeita, durabilidade impecável, anatomia e segurança de aplicação.
              </p>
            </div>
            <p className="mt-4 text-xs font-semibold text-[var(--color-revenue-primary)] border-t border-[var(--color-border-subtle)] pt-3 flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>Você já sabe executar</span>
            </p>
          </div>

          {/* Step 2 (Highlighted: Agenda 80/20) */}
          <div className="rounded-[var(--radius-card)] border-2 border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] p-5 shadow-[var(--shadow-card-resting)] flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-action-primary)] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                <Sparkles className="size-3" />
                Seu Próximo Passo
              </span>
              <h3 className="mt-3 text-base font-bold text-[var(--color-action-primary)]">
                Agenda 80/20
              </h3>
              <p className="mt-2 text-xs text-[var(--color-ink-solid)] leading-relaxed font-medium">
                Movimentar oportunidades e clientes com 1 ação por dia no intervalo entre atendimentos.
              </p>
            </div>
            <p className="mt-4 text-xs font-bold text-[var(--color-action-primary)] border-t border-[var(--color-action-primary)]/20 pt-3 flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              <span>Clientes reais na sua cadeira</span>
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 shadow-xs flex flex-col justify-between opacity-85">
            <div>
              <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-ink-muted)]">
                Quando a grade crescer
              </span>
              <h3 className="mt-3 text-base font-bold text-[var(--color-ink-solid)]">
                Belevy Pro (Opcional)
              </h3>
              <p className="mt-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Centralizar sua grade oficial e disparar lembretes automáticos de WhatsApp anti-falta.
              </p>
            </div>
            <p className="mt-4 text-xs font-medium text-[var(--color-ink-muted)] border-t border-[var(--color-border-subtle)] pt-3">
              30 dias inclusos no plano
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-ink-muted)]">
          Cada ferramenta atua de forma autônoma. Você não precisa obrigatoriamente de uma para usar a outra.
        </p>
      </div>
    </section>
  );
}
