import { Check, ShieldAlert } from "lucide-react";

const fitItems = [
  "Profissionais autônomas que atendem com as próprias mãos (estética, unhas, sobrancelhas, massagem, saúde e serviços locais).",
  "Quem está começando agora e precisa das primeiras clientes e fotos de trabalho.",
  "Quem já atende, mas sofre com grade semanal irregular e buracos na agenda.",
  "Quem recebe perguntas de orçamento no WhatsApp que esfriam e nunca viram agendamento.",
  "Quem quer fazer clientes antigas voltarem sem parecer chata ou insistente.",
  "Quem não tem tempo nem paciência para virar blogueira ou estudar marketing digital o dia todo.",
];

export function LandingAudienceFit() {
  return (
    <section
      aria-labelledby="audience-heading"
      className="border-t border-[var(--color-border-subtle)] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-4xl grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        {/* Left: Para quem faz sentido */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-action-primary)]">
            Qualificação Direta
          </span>
          <h2
            id="audience-heading"
            className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[var(--color-ink-solid)] sm:text-3xl"
          >
            Para quem o Agenda 80/20 foi pensado:
          </h2>
          <p className="mt-3 text-sm text-[var(--color-ink-muted)] leading-relaxed">
            Se você se identifica com uma ou mais dessas realidades, o aplicativo vai destravar seu dia:
          </p>

          <ul className="mt-6 space-y-3 text-xs sm:text-sm text-[var(--color-ink-solid)]">
            {fitItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-revenue-subtle)] text-[var(--color-revenue-primary)] mt-0.5">
                  <Check className="size-3.5" />
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Bloco de Credibilidade — O que ele NÃO promete */}
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
            <ShieldAlert className="size-4 text-[var(--color-action-primary)]" />
            <span>Transparência e Credibilidade</span>
          </div>

          <h3 className="mt-3 text-lg font-bold text-[var(--color-ink-solid)]">
            O que o Agenda 80/20 não promete
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-[var(--color-ink-muted)] leading-relaxed">
            Nenhum aplicativo honesto pode prometer faturamento milagroso, conversão garantida ou controlar a decisão de uma cliente.
          </p>

          <div className="mt-4 space-y-2 border-t border-[var(--color-border-subtle)] pt-4 text-xs text-[var(--color-ink-muted)]">
            <p className="flex items-start gap-2">
              <span className="text-[var(--color-danger-primary)] font-bold">✕</span>
              <span>Não prometemos faturamento ou renda fixa automática.</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-[var(--color-danger-primary)] font-bold">✕</span>
              <span>Não prometemos que toda cliente abordada vai marcar.</span>
            </p>
          </div>

          <div className="mt-5 rounded-[var(--radius-sm)] bg-white p-3.5 border border-[var(--color-border-subtle)] text-xs text-[var(--color-ink-solid)] font-medium leading-relaxed">
            <strong>O que garantimos:</strong> Reduzir sua improvisação a zero, tirar a paralisia da sua cabeça e colocar uma próxima decisão clara e executável diante de você todo santo dia.
          </div>
        </div>
      </div>
    </section>
  );
}
