"use client";

import Image from "next/image";
import { Check, ArrowRight, Sparkles, GraduationCap, Compass, ShieldCheck } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellHeroProps {
  checkoutUrl: string;
}

export function UpsellHero({ checkoutUrl }: UpsellHeroProps) {
  const handleCtaClick = () => {
    trackFunnelEvent("upsell_primary_cta_click", { location: "hero" });
    trackFunnelEvent("upsell_accept", { location: "hero" });
    trackFunnelEvent("upsell_cta_click", { location: "hero" });
  };

  return (
    <section className="relative pt-6 pb-8 text-center bg-[#FBF9F5] px-4">
      {/* 01 • Confirmation Badge */}
      <div className="flex flex-col items-center justify-center mb-5 gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#3D7164]/30 bg-[#E8F2EE] text-[#0C2A26] shadow-xs">
          <div className="size-4 rounded-full bg-[#3D7164] flex items-center justify-center text-white shrink-0">
            <Check className="size-2.5 stroke-[3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            Sua inscrição no Soft Gel Express foi confirmada!
          </span>
        </div>
        <p className="text-[11px] text-[#4E7A6E] font-medium">
          O link de acesso às aulas já foi enviado para o seu e-mail.
        </p>
      </div>

      {/* 02 • Interruption "ESPERE." (Elegante e amigável) */}
      <div className="relative inline-block mb-3">
        <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 select-none pointer-events-none text-[#E07A5F]">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 4L22 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 8L27 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 11L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#E07A5F] leading-none">
          ESPERE.
        </span>
        <div className="w-full h-1 bg-[#E07A5F] rounded-full mt-1 mx-auto opacity-80" />
      </div>

      {/* 03 • Headline Principal */}
      <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.2] max-w-xl mx-auto text-balance">
        Você acabou de dar o primeiro passo para aprender Soft Gel.
      </h1>

      {/* 04 • Subheadline Focada na Oportunidade Congruente */}
      <p className="mt-3 text-sm sm:text-base text-[#3D5650] max-w-lg mx-auto leading-relaxed font-medium text-balance">
        Antes de acessar seu curso, existe uma decisão que evita você terminar as aulas pensando:{" "}
        <strong className="text-[#0C2A26] font-bold">
          &ldquo;agora que eu sei fazer a técnica, como começo a conseguir clientes?&rdquo;
        </strong>
      </p>

      {/* 05 • Apresentação Clara do Agenda 80/20 */}
      <div className="mt-5 max-w-lg mx-auto rounded-2xl bg-white border border-[#0C2A26]/10 p-4 shadow-xs text-left sm:text-center">
        <div className="flex items-center sm:justify-center gap-1.5 mb-1 text-xs font-bold uppercase tracking-wider text-[#3D7164]">
          <Sparkles className="size-3.5 text-[#D4A373]" />
          <span>Conheça o Agenda 80/20</span>
        </div>
        <p className="text-xs sm:text-sm text-[#0C2A26] leading-relaxed">
          Um aplicativo que mostra <strong>qual é a próxima ação mais importante</strong> para você começar a construir seu caminho até os primeiros atendimentos, enquanto ainda está aprendendo.
        </p>
      </div>

      {/* 06 • CTA Primário com Preço Claro no Hero */}
      <div className="mt-6 flex flex-col items-center justify-center max-w-md mx-auto">
        <a
          href={checkoutUrl}
          onClick={handleCtaClick}
          className="inline-flex min-h-[56px] w-full items-center justify-center gap-2 bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base px-6 py-4 rounded-2xl shadow-xl transition-all cursor-pointer uppercase tracking-wider"
        >
          <span>SIM, QUERO ADICIONAR O AGENDA 80/20</span>
          <ArrowRight className="size-4.5 stroke-[2.5]" />
        </a>

        {/* Microcopy e Condição Real */}
        <div className="mt-2.5 flex flex-col items-center gap-1 text-[11px] sm:text-xs text-[#527068]">
          <p className="font-semibold text-[#0C2A26]">
            Adicionar à minha compra · <span className="text-[#E07A5F] font-bold">12x de R$ 15,19</span> ou R$ 147 à vista
          </p>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#6B857E]">
            <ShieldCheck className="size-3 text-[#3D7164]" />
            <span>Condição exclusiva pós-compra · 12 meses de acesso · Garantia de 7 dias</span>
          </div>
        </div>
      </div>

      {/* 07 • Visual Lado a Lado Conciso (Soft Gel Express + Agenda 80/20) */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
        {/* Soft Gel Express */}
        <div className="w-full sm:w-1/2 rounded-2xl bg-white border border-[#0C2A26]/10 p-3 shadow-xs text-left flex items-center gap-3">
          <div className="relative size-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
            <Image
              src="/media/agenda8020/upsell/softgel-nails-hero.jpg"
              alt="Curso Soft Gel Express"
              fill
              className="object-cover"
              sizes="56px"
              priority
            />
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#3D7164]">
              <GraduationCap className="size-3" />
              <span>Você acabou de adquirir</span>
            </div>
            <p className="text-xs font-extrabold text-[#0C2A26] truncate">Soft Gel Express</p>
            <p className="text-[10px] text-[#527068]">Aprender a técnica</p>
          </div>
        </div>

        {/* Plus Sign */}
        <div className="size-7 rounded-full bg-[#E8F2EE] border border-[#3D7164]/30 flex items-center justify-center text-[#0C2A26] font-bold text-xs shrink-0 select-none">
          +
        </div>

        {/* Agenda 80/20 */}
        <div className="w-full sm:w-1/2 rounded-2xl bg-[#0C2A26] border border-white/10 p-3 shadow-xs text-left text-white flex items-center gap-3">
          <div className="size-14 rounded-xl bg-[#0E3D36] border border-[#D4A373]/30 flex items-center justify-center text-[#D4A373] shrink-0">
            <Compass className="size-7" />
          </div>
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#D4A373]">
              <Sparkles className="size-2.5" />
              <span>Oportunidade complementar</span>
            </div>
            <p className="text-xs font-extrabold text-white truncate">Agenda 80/20</p>
            <p className="text-[10px] text-[#A8C5BD]">Saber o próximo passo</p>
          </div>
        </div>
      </div>
    </section>
  );
}
