"use client";

import { Check, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellHeroProps {
  checkoutUrl: string;
}

export function UpsellHero({ checkoutUrl }: UpsellHeroProps) {
  const handleCtaClick = () => {
    trackFunnelEvent("hero_cta_click", { location: "hero" });
    trackFunnelEvent("upsell_primary_cta_click", { location: "hero" });
    trackFunnelEvent("upsell_accept", { location: "hero" });
    trackFunnelEvent("upsell_cta_click", { location: "hero" });
  };

  return (
    <section className="relative pt-5 pb-8 sm:pt-8 sm:pb-12 text-center bg-[#FBF9F5] px-4 sm:px-6">
      {/* 01 • Confirmação da Compra (Pequeno bloco visual de confiança) */}
      <div className="flex items-center justify-center">
        <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-3.5 py-1.5 rounded-2xl sm:rounded-full bg-[#E8F2EE] border border-[#3D7164]/25 text-[11px] sm:text-xs text-[#0C2A26] shadow-xs text-center">
          <div className="inline-flex items-center gap-1.5">
            <div className="size-3.5 rounded-full bg-[#3D7164] flex items-center justify-center text-white shrink-0">
              <Check className="size-2 stroke-[3]" />
            </div>
            <span className="font-bold text-[#18453B] tracking-tight">
              Compra confirmada:
            </span>
          </div>
          <span className="text-[#3D7164] font-medium">
            Seu Soft Gel Express já está garantido.
          </span>
        </div>
      </div>

      {/* 02 • Pattern Interrupt (Secundário e elegante) */}
      <div className="mt-3 sm:mt-3.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#E07A5F] px-3 py-1 rounded-full bg-[#FEECE6] border border-[#E07A5F]/20">
          ESPERE — ANTES DE ACESSAR SEU CURSO
        </span>
      </div>

      {/* 03 • Headline Principal */}
      <h1 className="mt-3.5 text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#0C2A26] leading-[1.18] max-w-xl mx-auto text-balance">
        Não espere terminar o curso para descobrir como transformar o que você vai aprender em clientes.
      </h1>

      {/* 04 • Subheadline Focada na Complementaridade */}
      <p className="mt-3 text-xs sm:text-sm md:text-base text-[#3D5650] max-w-lg mx-auto leading-relaxed font-medium text-balance">
        O Soft Gel Express vai te ensinar a técnica. O Agenda 80/20 mostra quais são as próximas ações para você se preparar e começar a buscar clientes no momento certo.
      </p>

      {/* 05 • Apresentação do Produto */}
      <div className="mt-3.5 sm:mt-4 max-w-md mx-auto rounded-2xl bg-white border border-[#0C2A26]/10 p-3 sm:p-3.5 shadow-xs text-center">
        <div className="flex items-center justify-center gap-1.5 mb-0.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#3D7164]">
          <Sparkles className="size-3 text-[#D4A373]" />
          <span>Conheça o Agenda 80/20</span>
        </div>
        <p className="text-xs sm:text-sm text-[#0C2A26] font-medium leading-snug">
          Um aplicativo que mostra <strong>qual é a próxima ação mais importante</strong> para o seu momento.
        </p>
      </div>

      {/* 06 • CTA Primário com Preço Claro no Hero */}
      <div className="mt-4 sm:mt-5 flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <a
          href={checkoutUrl}
          onClick={handleCtaClick}
          className="inline-flex min-h-[54px] sm:min-h-[56px] w-full items-center justify-center gap-2 bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base px-6 py-3.5 rounded-2xl shadow-xl transition-all cursor-pointer uppercase tracking-wider"
        >
          <span>SIM, QUERO ADICIONAR O AGENDA 80/20</span>
          <ArrowRight className="size-4.5 stroke-[2.5]" />
        </a>

        {/* 07 • Microcopy e Condição Real */}
        <div className="mt-2 flex flex-col items-center gap-0.5 text-center w-full px-2">
          <p className="text-[11px] sm:text-xs text-[#0C2A26] font-semibold">
            Seu Soft Gel Express já está comprado e garantido. Esta oferta adiciona apenas o Agenda 80/20.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-[#527068]">
            <span><strong className="text-[#0C2A26]">12x de R$ 15,19</strong> ou R$ 147 à vista</span>
            <span className="text-slate-300">·</span>
            <div className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3 text-[#3D7164]" />
              <span>12 meses de acesso · Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
