"use client";

import { Check, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Gift } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellOfferProps {
  checkoutUrl: string;
}

export function UpsellOffer({ checkoutUrl }: UpsellOfferProps) {
  const handleCtaClick = () => {
    trackFunnelEvent("upsell_primary_cta_click", { location: "offer_section" });
    trackFunnelEvent("upsell_accept", { location: "offer_section" });
    trackFunnelEvent("upsell_cta_click", { location: "offer_section" });
    trackFunnelEvent("upsell_checkout_redirect", { location: "offer_section" });
  };

  return (
    <section id="oferta" className="bg-[#FBF9F5] py-14 px-4 border-t border-[#0C2A26]/5">
      <div className="max-w-xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#4E7A6E]/40 bg-[#E8F2EE] text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="size-3 text-[#3D7164]" />
          <span>Oferta Exclusiva de Boas-Vindas</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-tight text-balance">
          Adicione o Agenda 80/20 à sua jornada.
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-[#3D5650] max-w-md mx-auto leading-relaxed">
          Condição disponível nesta página imediatamente após sua compra do Soft Gel Express.
        </p>

        {/* Single Main Card with Generous Negative Space */}
        <div className="mt-8 rounded-3xl bg-[#0C2A26] border border-white/10 p-6 sm:p-8 text-white shadow-2xl text-left relative overflow-hidden">
          {/* Header */}
          <div className="text-center pb-4 border-b border-white/10">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle2 className="size-5 text-[#3D7164]" />
              <span className="text-lg font-black tracking-tight text-white uppercase">
                Agenda 80/20
              </span>
            </div>
            <p className="text-xs text-[#D4A373] font-semibold">
              Seu próximo passo após o Soft Gel Express · 12 meses de acesso
            </p>
          </div>

          {/* Pricing Block */}
          <div className="py-6 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-sm font-bold text-[#A8C5BD]">12x de</span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
                R$ 15,19
              </span>
            </div>
            <p className="text-xs text-[#A8C5BD] mt-1.5 font-medium">
              ou <strong className="text-white">R$ 147 à vista</strong> (pagamento único anual)
            </p>
            <p className="text-[11px] text-[#D4A373] font-bold mt-1">
              Apenas R$ 0,40 por dia para ter direção profissional o ano todo
            </p>
          </div>

          {/* Deliverables List */}
          <div className="space-y-3 pt-2 pb-6 border-t border-white/10 text-xs text-[#E8F2EE]">
            <div className="flex items-start gap-2.5">
              <div className="size-4.5 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                <Check className="size-3 stroke-[3]" />
              </div>
              <span className="leading-snug">
                <strong>Próxima ação orientada:</strong> saiba qual é a prioridade prática de cada dia em 10 minutos.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="size-4.5 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                <Check className="size-3 stroke-[3]" />
              </div>
              <span className="leading-snug">
                <strong>Mensagens e orientações prontas:</strong> textos respeitosos para convidar amigas e modelos sem parecer insistente.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="size-4.5 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                <Check className="size-3 stroke-[3]" />
              </div>
              <span className="leading-snug">
                <strong>Ações adaptadas ao seu momento:</strong> passos de preparação e posicionamento agora; de agendamento depois.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="size-4.5 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                <Check className="size-3 stroke-[3]" />
              </div>
              <span className="leading-snug">
                <strong>Acompanhamento simples de execução:</strong> marque ações feitas e acompanhe seu progresso sem complexidade.
              </span>
            </div>

            {/* Cortesia Belevy Pro */}
            <div className="mt-4 rounded-xl bg-[#0E3D36] border border-[#D4A373]/30 p-3 flex items-start gap-2.5">
              <Gift className="size-4 text-[#D4A373] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-[#D4A373]">
                  Cortesia Inclusa: 30 dias de Belevy Pro
                </p>
                <p className="text-[10px] text-[#A8C5BD] mt-0.5 leading-tight">
                  Seu link de agendamento na bio com confirmações e lembretes automáticos anti-falta no WhatsApp (ativação opcional, sem fidelidade).
                </p>
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="pt-2">
            <a
              href={checkoutUrl}
              onClick={handleCtaClick}
              className="w-full min-h-[56px] rounded-2xl bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base px-6 py-4 flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider text-center"
            >
              <span>SIM, QUERO ADICIONAR O AGENDA 80/20</span>
              <ArrowRight className="size-4.5 stroke-[2.5]" />
            </a>
          </div>

          {/* Microcopy */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#A8C5BD]">
            <ShieldCheck className="size-3.5 text-[#3D7164]" />
            <span>Adicionar à minha compra · Pagamento único · Garantia incondicional de 7 dias</span>
          </div>
        </div>
      </div>
    </section>
  );
}
