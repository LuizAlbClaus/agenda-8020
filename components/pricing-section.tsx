import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CHECKOUT_PLANS, getCheckoutUrl } from "@/lib/checkout";

interface PricingSectionProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const faqs = [
  {
    q: "Como recebo meu acesso após o pagamento?",
    a: "Assim que a compra for confirmada pela Cakto, você receberá um e-mail com seu link mágico de entrada. Sem senhas para criar ou memorizar: basta um clique para acessar seu painel no celular ou computador.",
  },
  {
    q: "É uma assinatura com cobrança recorrente no cartão?",
    a: "Não. É um pagamento único com período de acesso garantido (365 dias no plano Anual ou 180 dias no Semestral). Não há renovação automática surpresa.",
  },
  {
    q: "Quanto tempo preciso dedicar por dia?",
    a: "De 2 a 5 minutos. O Agenda 80/20 foi desenhado exatamente para a rotina de quem atende: você abre no intervalo entre atendimentos, vê uma única ação prática e executa.",
  },
  {
    q: "O que é o bônus de 30 dias do Belevy?",
    a: "O Belevy é uma plataforma parceira opcional para automações avançadas (lembretes automáticos no WhatsApp e CRM de clientes). Você ganha 30 dias de cortesia, mas o Agenda 80/20 funciona 100% de forma independente mesmo se não quiser usá-lo.",
  },
  {
    q: "Funciona para serviços fora da estética e beleza?",
    a: "Sim. O método de priorização diária e o link público de agendamento atendem qualquer negócio de serviços com hora marcada: saúde, bem-estar, terapias, aulas, consultorias e serviços locais.",
  },
  {
    q: "Como funciona a garantia de 7 dias?",
    a: "Você tem 7 dias corridos para testar na prática. Se achar que o produto não se encaixa na sua rotina, basta solicitar o cancelamento e devolvemos 100% do seu pagamento sem burocracia.",
  },
] as const;

export function PricingSection({ searchParams }: PricingSectionProps) {
  const annualUrl = getCheckoutUrl("annual", searchParams);
  const semiannualUrl = getCheckoutUrl("semiannual", searchParams);
  const annualPlan = CHECKOUT_PLANS.annual;
  const semiannualPlan = CHECKOUT_PLANS.semiannual;

  return (
    <section
      id="planos"
      aria-labelledby="pricing-heading"
      className="scroll-mt-12 border-t border-[var(--color-border-subtle)] py-16 sm:py-24"
    >
      {/* Section Header */}
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="action" className="px-3 py-1 text-xs">
          Acesso Transparente
        </Badge>
        <h2
          id="pricing-heading"
          className="mt-4 text-3xl font-bold leading-tight tracking-[-0.035em] text-balance text-[var(--color-ink-solid)] sm:text-4xl lg:text-5xl"
        >
          Um investimento acessível para parar de improvisar.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          Escolha o período ideal para sua rotina. Pagamento único, sem mensalidades surpresas e com acesso imediato.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-8">
        {/* Card Plano Anual (Featured) */}
        <div className="relative flex flex-col justify-between rounded-[var(--radius-card)] border-2 border-[var(--color-revenue-primary)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-elevated)] sm:p-8">
          <div className="absolute -top-3.5 right-6 sm:right-8">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-revenue-primary)] px-3 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Melhor Custo-Benefício
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--color-ink-solid)]">
                  {annualPlan.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  365 dias de tranquilidade e foco diário
                </p>
              </div>
              <Badge variant="revenue" className="text-xs">
                {annualPlan.durationLabel}
              </Badge>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-[var(--color-ink-solid)] sm:text-5xl">
                {annualPlan.priceFormatted}
              </span>
              <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                {annualPlan.billingFrequency}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Equivalente a menos de R$ 0,41 por dia para guiar suas ações.
            </p>

            <ul className="mt-8 space-y-3.5 border-t border-[var(--color-border-subtle)] pt-6 text-sm text-[var(--color-ink-solid)]">
              {annualPlan.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]"
                    aria-hidden="true"
                  />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <Link
              href={annualUrl}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-none"
            >
              <span>Garantir plano anual (365 dias)</span>
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
            <p className="mt-2.5 text-center text-xs text-[var(--color-ink-muted)]">
              Pagamento 100% seguro via Cakto · 7 dias de garantia
            </p>
          </div>
        </div>

        {/* Card Plano Semestral */}
        <div className="flex flex-col justify-between rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-resting)] sm:p-8">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[var(--color-ink-solid)]">
                  {semiannualPlan.name}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  180 dias para validar seu fluxo no seu ritmo
                </p>
              </div>
              <Badge variant="neutral" className="text-xs">
                {semiannualPlan.durationLabel}
              </Badge>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-[var(--color-ink-solid)] sm:text-5xl">
                {semiannualPlan.priceFormatted}
              </span>
              <span className="text-sm font-medium text-[var(--color-ink-muted)]">
                {semiannualPlan.billingFrequency}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              Acesso completo com todas as ferramentas incluídas.
            </p>

            <ul className="mt-8 space-y-3.5 border-t border-[var(--color-border-subtle)] pt-6 text-sm text-[var(--color-ink-solid)]">
              {semiannualPlan.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check
                    className="mt-0.5 size-4 shrink-0 text-[var(--color-ink-muted)]"
                    aria-hidden="true"
                  />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <Link
              href={semiannualUrl}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border-strong)] bg-[var(--color-surface-card)] px-6 text-sm font-bold text-[var(--color-ink-solid)] transition-all hover:bg-[var(--color-surface-muted)] focus-visible:outline-none"
            >
              <span>Escolher plano semestral (180 dias)</span>
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
            <p className="mt-2.5 text-center text-xs text-[var(--color-ink-muted)]">
              Pagamento 100% seguro via Cakto · 7 dias de garantia
            </p>
          </div>
        </div>
      </div>

      {/* Guarantee Banner */}
      <div className="mx-auto mt-12 max-w-4xl rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] text-[var(--color-revenue-primary)]">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[var(--color-ink-solid)] sm:text-lg">
              Garantia incondicional de 7 dias
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-muted)] text-pretty">
              Teste o Agenda 80/20 na prática. Monte seu primeiro plano e compartilhe seus horários. Se você achar que o método não se encaixa na sua rotina de atendimento, devolvemos 100% do seu pagamento com um simples contato.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mx-auto mt-16 max-w-4xl">
        <div className="text-center">
          <Badge variant="opportunity" className="px-3 py-1 text-xs">
            Tire suas dúvidas
          </Badge>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-ink-solid)] sm:text-3xl">
            Perguntas Frequentes
          </h3>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-[var(--radius-card)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5 shadow-[var(--shadow-card-resting)]"
            >
              <h4 className="flex items-start gap-2.5 text-sm font-bold text-[var(--color-ink-solid)]">
                <HelpCircle className="mt-0.5 size-4 shrink-0 text-[var(--color-action-primary)]" />
                <span>{faq.q}</span>
              </h4>
              <p className="mt-2.5 text-xs leading-relaxed text-[var(--color-ink-muted)] sm:text-sm">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
