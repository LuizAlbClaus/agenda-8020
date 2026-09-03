import { Check, X } from "lucide-react";

const competingOptions = [
  "Postar no feed",
  "Gravar Stories",
  "Fazer dancinha de Reels",
  "Chamar clientes antigas",
  "Pedir indicações",
  "Criar promoção relâmpago",
  "Mudar bio do perfil",
  "Correr atrás de parceria",
  "Responder quem sumiu",
  "Divulgar vagas da semana",
  "Fazer caixinha de perguntas",
  "Produzir conteúdo técnico",
];

export function LandingProblem() {
  return (
    <section
      aria-labelledby="problem-heading"
      className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-3xl text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
          O Paradoxo da Escolha no Seu Dia a Dia
        </span>
        <h2
          id="problem-heading"
          className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-4xl"
        >
          Você provavelmente já sabe coisas demais para fazer.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          Se você abrir a internet agora, vai encontrar centenas de conselhos sobre o que uma profissional autônoma “deveria” estar fazendo:
        </p>
      </div>

      {/* Visual Contrast: Overwhelming list vs 1 Focused Action */}
      <div className="mt-10 mx-auto max-w-4xl grid gap-6 md:grid-cols-2 md:items-stretch">
        {/* Left Card: The Overwhelm */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)]/60 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-danger-subtle)] text-[var(--color-danger-primary)] font-bold text-xs">
                <X className="size-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                O que acontece hoje
              </p>
            </div>
            <h3 className="mt-2 text-lg font-bold text-[var(--color-ink-solid)]">
              20 opções competindo pela sua atenção
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
              No intervalo corrido entre atendimentos, você tenta pensar em tudo ao mesmo tempo e acaba paralisada:
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {competingOptions.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-[var(--radius-pill)] border border-[var(--color-border-subtle)] bg-white px-2.5 py-1 text-xs text-[var(--color-ink-muted)] opacity-85"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[var(--radius-sm)] bg-white/80 p-3 border border-[var(--color-border-subtle)] text-xs text-[var(--color-danger-primary)] font-semibold">
            Resultado: Cansaço mental, sensação de culpa e nenhuma ação concluída.
          </div>
        </div>

        {/* Right Card: The 80/20 Solution */}
        <div className="rounded-[var(--radius-card)] border-2 border-[var(--color-revenue-primary)] bg-[var(--color-surface-card)] p-6 sm:p-8 flex flex-col justify-between shadow-[var(--shadow-card-resting)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)] font-bold text-xs">
                <Check className="size-3.5" />
              </span>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-revenue-primary)]">
                Com o Agenda 80/20
              </p>
            </div>
            <h3 className="mt-2 text-lg font-bold text-[var(--color-ink-solid)]">
              Apenas 1 ação que faz sentido agora
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
              O sistema avalia onde você está travando, descarta o que não importa hoje e coloca UMA única decisão prática na sua frente:
            </p>

            <div className="mt-5 rounded-[var(--radius-sm)] border border-[var(--color-action-primary)]/20 bg-[var(--color-action-subtle)] p-4">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--color-action-primary)]">
                <span>Próximo movimento filtrado</span>
                <span>10 min</span>
              </div>
              <p className="mt-2 text-sm sm:text-base font-bold text-[var(--color-ink-solid)]">
                Reative clientes na janela de 25 dias com mensagem pronta.
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                Passo a passo mastigado + áudio e texto para WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-[var(--radius-sm)] bg-[var(--color-revenue-subtle)] p-3 border border-[var(--color-revenue-primary)]/20 text-xs text-[var(--color-revenue-primary)] font-bold">
            Resultado: Execução em 3 minutos, postura de especialista e mente tranquila.
          </div>
        </div>
      </div>

      {/* Strategic Takeaway Conclusion */}
      <div className="mt-12 mx-auto max-w-2xl text-center rounded-[var(--radius-card)] bg-[var(--color-surface-muted)] p-6 border border-[var(--color-border-subtle)]">
        <p className="text-sm sm:text-base font-semibold text-[var(--color-ink-solid)] leading-relaxed text-balance">
          O problema nunca foi não existir estratégia. O problema é não saber{" "}
          <span className="text-[var(--color-action-primary)] font-bold">
            qual delas merece a sua energia agora.
          </span>
        </p>
        <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)]">
          Foi exatamente para resolver essa decisão diária que o <strong>Agenda 80/20</strong> foi criado.
        </p>
      </div>
    </section>
  );
}
