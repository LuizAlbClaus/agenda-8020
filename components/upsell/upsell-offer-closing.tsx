"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Target, Footprints, MessageCircle, Sprout, ChevronDown, Check, ShieldCheck } from "lucide-react";
import { UPSELL_FAQS } from "./upsell-types";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellOfferClosingProps {
  checkoutUrl: string;
  declineUrl?: string;
}

export function UpsellOfferClosing({ checkoutUrl, declineUrl = "/checkout/sucesso" }: UpsellOfferClosingProps) {
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndices((prev) => {
      const exists = prev.includes(index);
      if (!exists) {
        trackFunnelEvent("upsell_faq_open", { faqIndex: index, question: UPSELL_FAQS[index].question });
        return [...prev, index];
      }
      return prev.filter((i) => i !== index);
    });
  };

  const handleCtaClick = (location: string) => {
    trackFunnelEvent("upsell_cta_click", { location });
    trackFunnelEvent("upsell_checkout_redirect", { location });
  };

  const handleDeclineClick = () => {
    trackFunnelEvent("upsell_decline_click", { location: "closing_footer" });
  };

  return (
    <section id="oferta" className="bg-[#FBF9F5] pt-12 text-center">
      <div className="max-w-xl mx-auto px-4">
        {/* Pre-headline */}
        <p className="text-xs sm:text-sm font-bold text-[#0C2A26] uppercase tracking-wider">
          Você já decidiu aprender a técnica.
        </p>

        {/* Headline */}
        <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-[1.2]">
          Agora pode começar a colocar essa nova habilidade{" "}
          <span className="relative inline-block text-[#3D7164]">
            em movimento.
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#E07A5F] rounded-full" />
          </span>
        </h2>

        {/* Main Offer Card (Dark Pine / Forest Teal) */}
        <div className="mt-10 rounded-3xl bg-[#0C2A26] border border-white/10 p-6 sm:p-8 text-white shadow-2xl text-center relative overflow-hidden">
          {/* Brand Header */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <CheckCircle2 className="size-5 text-[#3D7164]" />
            <span className="text-lg font-black tracking-tight text-white uppercase">Agenda 80/20</span>
          </div>

          <p className="text-xs sm:text-sm text-[#D4A373] font-medium">
            Seu próximo passo depois do Soft Gel Express
          </p>

          {/* Access Pill Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 text-[#D4A373] text-xs font-bold">
            <span>📅 12 meses de acesso</span>
          </div>

          {/* Price Block */}
          <div className="mt-6 mb-2">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl font-bold text-[#A8C5BD]">R$</span>
              <span className="text-6xl sm:text-7xl font-black text-white tracking-tight leading-none">
                147
              </span>
            </div>
            <p className="text-xs text-[#A8C5BD] uppercase tracking-wider mt-1">
              pagamento único · ou 12x de R$ 15,19
            </p>
          </div>

          <div className="w-16 h-0.5 bg-[#D4A373]/50 rounded-full mx-auto my-6" />

          {/* Key Value Items with Icons */}
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center shrink-0">
                <Target className="size-5 text-[#D4A373]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Saiba o que priorizar</p>
                <p className="text-xs text-[#A8C5BD]">Uma próxima ação adequada ao seu momento.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center shrink-0">
                <Footprints className="size-5 text-[#D4A373]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Saiba como começar</p>
                <p className="text-xs text-[#A8C5BD]">Passos curtos e orientações práticas.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="size-10 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center shrink-0">
                <MessageCircle className="size-5 text-[#D4A373]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Tenha o que dizer</p>
                <p className="text-xs text-[#A8C5BD]">Mensagens prontas para algumas conversas.</p>
              </div>
            </div>
          </div>

          {/* Big Primary CTA */}
          <div className="mt-8">
            <a
              href={checkoutUrl}
              onClick={() => handleCtaClick("offer_card")}
              className="w-full min-h-[54px] rounded-2xl bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base px-6 py-4 flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>SIM, QUERO ADICIONAR O AGENDA 80/20</span>
              <ArrowRight className="size-4.5 stroke-[2.5]" />
            </a>
          </div>

          <p className="mt-3 text-[11px] text-[#A8C5BD]">
            Acesso por 12 meses · Pagamento único · Garantia incondicional de 7 dias
          </p>
        </div>

        {/* Belevy Optional Callout */}
        <div className="mt-8 rounded-2xl bg-white border border-[#0C2A26]/10 p-4 shadow-xs flex items-center gap-3.5 text-left">
          <div className="size-10 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0">
            <Sprout className="size-5" />
          </div>
          <div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Quando sua operação pedir mais estrutura, o <strong>Belevy pode ser uma continuação opcional</strong>.{" "}
              <span className="text-[#3D7164] font-semibold">(30 dias de cortesia inclusos para você experimentar).</span>
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-left">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D7164]">
              Perguntas Frequentes
            </span>
            <h3 className="mt-1 text-2xl font-extrabold text-[#0C2A26]">
              Dúvidas comuns sobre o Agenda 80/20
            </h3>
          </div>

          <div className="space-y-3">
            {UPSELL_FAQS.map((faq, index) => {
              const isOpen = openFaqIndices.includes(index);
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-[#0C2A26]/10 overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full min-h-[52px] p-4 text-left font-bold text-xs sm:text-sm text-[#0C2A26] flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#E07A5F]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Curved Dark Teal Closing Banner (Ref: 10.png Bottom) */}
      <div className="mt-16 bg-[#0C2A26] text-white pt-12 pb-16 px-4 relative overflow-hidden">
        {/* Top Wave Divider */}
        <div className="max-w-xl mx-auto text-center">
          {/* Check Circle */}
          <div className="size-14 rounded-full border-2 border-[#D4A373] bg-[#0E3D36] flex items-center justify-center mx-auto mb-4 text-[#D4A373] shadow-md">
            <Check className="size-7 stroke-[2.5]" />
          </div>

          <p className="text-xs sm:text-sm text-[#A8C5BD] font-medium max-w-md mx-auto">
            Você pode esperar terminar o curso.
            <br />
            Ou pode começar essa parte <strong className="text-[#D4A373]">junto com ele</strong>.
          </p>

          <h3 className="mt-4 text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
            Não saia com mais 20 coisas para fazer.
            <br />
            Saia sabendo <span className="text-[#D4A373] italic">qual é a próxima.</span>
          </h3>

          <div className="w-12 h-0.5 bg-[#D4A373] rounded-full mx-auto my-6" />

          {/* Final Gold CTA Button */}
          <div className="max-w-md mx-auto">
            <a
              href={checkoutUrl}
              onClick={() => handleCtaClick("closing_bottom")}
              className="w-full min-h-[54px] rounded-2xl bg-[#C9A66B] hover:bg-[#BD985A] active:scale-[0.98] text-[#0C2A26] font-black text-sm sm:text-base px-6 py-4 flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider"
            >
              <span>QUERO COMEÇAR OS DOIS JUNTOS</span>
              <ArrowRight className="size-4.5 stroke-[2.5]" />
            </a>
          </div>

          {/* Secondary Decline Link */}
          <div className="mt-5">
            <Link
              href={declineUrl}
              onClick={handleDeclineClick}
              className="text-xs text-[#A8C5BD] hover:text-white underline underline-offset-4 transition-colors font-medium cursor-pointer"
            >
              Não quero adicionar o Agenda 80/20 agora
            </Link>
          </div>

          {/* Security footnote */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-[#A8C5BD]">
            <ShieldCheck className="size-4 text-[#3D7164]" />
            <span>Compra protegida · Garantia incondicional de 7 dias</span>
          </div>
        </div>
      </div>
    </section>
  );
}
