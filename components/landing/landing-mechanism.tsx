import { ArrowRight, CheckCircle2, Filter, Layers, Sparkles, Target, Timer } from "lucide-react";

const mechanismSteps = [
  {
    step: "1",
    label: "Seu Momento",
    icon: Layers,
    desc: "Onde seu negócio está hoje (começando do zero, com poucos clientes ou agenda irregular).",
  },
  {
    step: "2",
    label: "Seu Gargalo",
    icon: Filter,
    desc: "Onde o fluxo está travando (sem clientes, baixa conversão, horários vazios ou falta de retorno).",
  },
  {
    step: "3",
    label: "Seus Sinais",
    icon: Target,
    desc: "Quais oportunidades reais existem (conversas pausadas, pedidos de preço, contatos locais).",
  },
  {
    step: "4",
    label: "Seu Tempo",
    icon: Timer,
    desc: "Quanto tempo você realmente pode dedicar hoje (10, 15 ou 30 minutos no intervalo).",
  },
  {
    step: "5",
    label: "Próximo Movimento",
    icon: Sparkles,
    desc: "1 única ação elegível, com justificativa clara de 'por que agora' e roteiro pronto para executar.",
    highlight: true,
  },
];

export function LandingMechanism() {
  return (
    <section
      aria-labelledby="mechanism-heading"
      className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-revenue-primary)]">
          Como o Sistema Funciona
        </span>
        <h2
          id="mechanism-heading"
          className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-4xl"
        >
          Seu negócio muda. Sua próxima ação também deveria mudar.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          O Agenda 80/20 não entrega uma lista aleatória de tarefas nem repete o mesmo conselho todo dia. Ele filtra sua realidade através de 5 dimensões práticas:
        </p>
      </div>

      {/* Visual Funnel / Flow: 5 Steps */}
      <div className="mt-12 mx-auto max-w-5xl">
        <div className="grid gap-3 sm:grid-cols-5">
          {mechanismSteps.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === mechanismSteps.length - 1;

            return (
              <div
                key={item.step}
                className={`relative flex flex-col justify-between rounded-[var(--radius-card)] p-4 sm:p-5 border transition-all ${
                  item.highlight
                    ? "border-2 border-[var(--color-action-primary)] bg-[var(--color-action-subtle)] shadow-[var(--shadow-card-resting)]"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-extrabold ${
                        item.highlight
                          ? "bg-[var(--color-action-primary)] text-white shadow-xs"
                          : "bg-[var(--color-surface-muted)] text-[var(--color-ink-solid)]"
                      }`}
                    >
                      {item.step}
                    </span>
                    <Icon
                      className={`size-4 ${
                        item.highlight
                          ? "text-[var(--color-action-primary)]"
                          : "text-[var(--color-ink-muted)]"
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  <h3
                    className={`mt-3 text-sm font-bold ${
                      item.highlight
                        ? "text-[var(--color-action-primary)]"
                        : "text-[var(--color-ink-solid)]"
                    }`}
                  >
                    {item.label}
                  </h3>

                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
                    {item.desc}
                  </p>
                </div>

                {/* Arrow indicator between steps */}
                {!isLast && (
                  <div className="hidden sm:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 size-5 items-center justify-center rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] text-[var(--color-ink-muted)] shadow-xs">
                    <ArrowRight className="size-3" aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Narrative Box */}
      <div className="mt-10 mx-auto max-w-3xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 sm:p-8 shadow-[var(--shadow-card-resting)]">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)] font-bold">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[var(--color-ink-solid)]">
              Uma decisão clara antes da execução
            </h4>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[var(--color-ink-muted)] text-pretty">
              Em vez de acordar se perguntando <em>“o que eu posto hoje?”</em> ou <em>“como consigo clientes?”</em>, você abre o aplicativo, vê exatamente o movimento que faz sentido para aquele dia, confere o passo a passo com roteiro pronto, executa e segue sua rotina de atendimentos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
