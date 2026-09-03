"use client";

import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CHECKOUT_PLANS, getCheckoutUrl } from "@/lib/checkout";
import { ExitDownsellModal } from "@/components/exit-downsell-modal";
import { trackFunnelEvent } from "@/lib/client-analytics";

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
    a: "Não. Você tem a flexibilidade de parcelar em até 12x de R$ 15,19 no cartão de crédito, ou pagar apenas R$ 147 à vista (via PIX ou cartão) com desconto especial. É um pagamento único referente a 12 meses inteiros de acesso (365 dias), sem renovação automática surpresa nem mensalidades ocultas.",
  },
  {
    q: "Quanto tempo preciso dedicar por dia?",
    a: "De 2 a 5 minutos. O Agenda 80/20 foi desenhado para a rotina real de quem atende: você abre no intervalo entre atendimentos, vê uma única ação prática, copia o script pronto e executa.",
  },
  {
    q: "O que é o benefício de 30 dias do Belevy?",
    a: "O Belevy é a plataforma oficial de agenda inteligente e lembretes automáticos por WhatsApp do nosso ecossistema. O Agenda 80/20 atrai suas clientes e destrava conversas; o Belevy organiza seus horários para ninguém faltar. Você ganha 30 dias de cortesia para ativar quando sua primeira oportunidade aparecer.",
  },
  {
    q: "Posso adicionar mais tempo de Belevy no momento da compra?",
    a: "Sim! Na página de pagamento da Cakto, você pode marcar a opção de order bump (+30 dias por apenas R$ 19,90) e totalizar 60 dias de Belevy Pro sem nenhuma mensalidade inicial.",
  },
  {
    q: "Funciona para quem está começando do absoluto zero?",
    a: "Sim. O aplicativo possui ações específicas de aquisição fria para quem ainda não tem clientes nem seguidores, orientando como conseguir suas primeiras modelos e abrir agenda no bairro de forma ética.",
  },
  {
    q: "Como funciona a garantia de 7 dias?",
    a: "Você tem 7 dias corridos para testar na prática. Se achar que o produto não se encaixa na sua rotina, basta solicitar o cancelamento e devolvemos 100% do seu pagamento sem burocracia.",
  },
] as const;

export function PricingSection({ searchParams }: PricingSectionProps) {
  const annualUrl = getCheckoutUrl("annual", searchParams);

  const handleAnnualCheckout = () => {
    trackFunnelEvent("checkout_redirect_clicked", { plan: "annual", price: 147 });
  };

  return (
    <section
      id="planos"
      aria-labelledby="pricing-heading"
      className="scroll-mt-12 border-t border-[var(--color-border-subtle)] py-16 sm:py-24"
    >
      {/* Section Header */}
      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="action" className="px-3 py-1 text-xs">
          Investimento Inteligente · Alto Retorno
        </Badge>
        <h2
          id="pricing-heading"
          className="mt-4 text-3xl font-bold leading-tight tracking-[-0.035em] text-balance text-[var(--color-ink-solid)] sm:text-4xl lg:text-5xl"
        >
          Menos de R$ 0,50 por dia para ter um copiloto de vendas no seu bolso.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-muted)] text-pretty sm:text-lg">
          Apenas 1 procedimento agendado a mais no ano inteiro já paga o seu acesso com sobra. Escolha entre parcelar suavemente ou garantir o desconto à vista.
        </p>
      </div>

      {/* Hero Pricing Card (Destacado e Único) */}
      <div className="mx-auto mt-12 max-w-xl">
        <div className="relative flex flex-col justify-between rounded-[var(--radius-card)] border-2 border-[var(--color-revenue-primary)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-card-elevated)] sm:p-8">
          <div className="absolute -top-3.5 right-6 sm:right-8">
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-revenue-primary)] px-3 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Oferta Especial · 12 Meses
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[var(--color-ink-solid)]">
                  Plano Anual Completo
                </h3>
                <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                  365 dias de tranquilidade, clientes e autoridade
                </p>
              </div>
              <Badge variant="revenue" className="text-xs">
                12 meses
              </Badge>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-[var(--color-ink-solid)] sm:text-5xl lg:text-6xl">
                  12x de R$ 15,19
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--color-ink-muted)]">
                  no cartão
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-revenue-primary)]">
                  Desconto especial à vista
                </span>
                <span className="text-sm font-bold text-[var(--color-ink-solid)]">
                  ou R$ 147 à vista (PIX ou cartão)
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-[var(--color-revenue-primary)]">
                Equivalente a menos de R$ 0,50 por dia. 1 procedimento extra já paga o ano todo!
              </p>
            </div>

            <ul className="mt-8 space-y-3.5 border-t border-[var(--color-border-subtle)] pt-6 text-sm text-[var(--color-ink-solid)]">
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]" />
                <span><strong>365 dias de acesso irrestrito</strong> ao Agenda 80/20</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]" />
                <span><strong>SOS Copiloto de Fechamento:</strong> respostas magnéticas em áudio e texto para WhatsApp</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]" />
                <span><strong>Teleprompter com Guia de Tom de Voz:</strong> saiba exatamente como soar firme e profissional</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]" />
                <span><strong>Radar de Retenção Biológica:</strong> saiba o dia exato (21-28 dias) de convidar a cliente antes que ela vá na concorrência</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]" />
                <span><strong>Bússola Diária 80/20:</strong> 1 micro-ação de 3 minutos no intervalo para trazer horários reais</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]" />
                <span><strong>Diagnóstico Anti-Desconto em 45s:</strong> blinde seu preço e nunca mais sangre dinheiro</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-revenue-primary)]" />
                <span><strong>30 dias inclusos de Belevy Pro:</strong> sua agenda oficial com lembretes automáticos anti-falta</span>
              </li>
            </ul>

            {/* Order bump callout box */}
            <div className="mt-6 rounded-[var(--radius-sm)] border border-[var(--color-opportunity-primary)]/30 bg-[var(--color-opportunity-subtle)] p-3.5 text-xs text-[var(--color-ink-solid)] flex items-start gap-2.5">
              <CalendarDays className="size-4 shrink-0 text-[var(--color-opportunity-primary)] mt-0.5" />
              <span>
                <strong>Quer 60 dias de Belevy?</strong> No checkout da Cakto você pode adicionar +30 dias por apenas R$ 19,90.
              </span>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <Link
              href={annualUrl}
              onClick={handleAnnualCheckout}
              className="inline-flex min-h-[50px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-all hover:bg-[var(--color-action-hover)] focus-visible:outline-none"
            >
              <span>Garantir por 12x de R$ 15,19 (ou R$ 147 à vista)</span>
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
            </Link>
            <p className="mt-2.5 text-center text-xs text-[var(--color-ink-muted)]">
              Pagamento 100% seguro via Cakto · 7 dias de garantia incondicional
            </p>
          </div>
        </div>

        {/* Modal de Downsell sutil para quem prefere período menor */}
        <ExitDownsellModal searchParams={searchParams} />
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
              Teste o Agenda 80/20 na sua rotina. Use o SOS Copiloto, execute as recomendações e veja o movimento das suas clientes. Se você sentir que o método não se encaixa no seu dia a dia, devolvemos 100% do seu pagamento com um simples contato.
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
