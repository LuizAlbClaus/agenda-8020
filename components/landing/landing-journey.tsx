import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";

const journeySteps = [
  {
    step: "01",
    title: "Dúvida Comercial",
    subtitle: "Não sei o que fazer hoje",
    desc: "A sensação comum de acordar sem saber qual ação traz clientes.",
    icon: HelpCircle,
  },
  {
    step: "02",
    title: "Priorização 80/20",
    subtitle: "Agenda escolhe 1 ação",
    desc: "O sistema analisa seu momento, gargalo e tempo disponível.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Execução Rápida",
    subtitle: "Você executa em 5 min",
    desc: "Roteiro pronto em texto ou áudio com passo a passo claro.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Apoio de Conversa",
    subtitle: "Copiloto destrava objeção",
    desc: "Se a cliente achar caro ou hesitar, você sabe exatamente o que responder.",
    icon: MessageSquare,
  },
  {
    step: "05",
    title: "Agendamento & Sinais",
    subtitle: "Horário marcado e recalibração",
    desc: "A cliente agenda pelo link e o app acompanha o retorno para as próximas decisões.",
    icon: CheckCircle2,
  },
];

export function LandingJourney() {
  return (
    <section
      aria-labelledby="journey-heading"
      className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20 bg-[var(--color-surface-muted)]/30"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
          Sistema Integrado de Progresso
        </span>
        <h2
          id="journey-heading"
          className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-4xl"
        >
          Do interesse ao horário: como tudo se conecta no seu dia a dia.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          O Agenda 80/20 não é um amontoado de telas soltas. É um ciclo contínuo de decisão, execução e acompanhamento:
        </p>
      </div>

      <div className="mt-12 mx-auto max-w-5xl">
        <div className="grid gap-3 sm:grid-cols-5">
          {journeySteps.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === journeySteps.length - 1;

            return (
              <div
                key={item.step}
                className="relative rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-4 sm:p-5 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-action-primary)]">
                      Passo {item.step}
                    </span>
                    <Icon className="size-4 text-[var(--color-ink-muted)]" aria-hidden="true" />
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-[var(--color-ink-solid)]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-[var(--color-action-primary)]">
                    {item.subtitle}
                  </p>
                  <p className="mt-2 text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>

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
    </section>
  );
}
