"use client";

import Image from "next/image";
import { Check, ArrowRight, Clock, Target, CheckCircle2, GraduationCap, Link2, Sparkles, Home, Users, Plus, Calendar, Menu } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellHeroProps {
  checkoutUrl: string;
}

export function UpsellHero({ checkoutUrl }: UpsellHeroProps) {
  const handleCtaClick = () => {
    trackFunnelEvent("upsell_cta_click", { location: "hero" });
  };

  return (
    <section className="relative pt-6 pb-0 overflow-hidden text-center bg-[#FBF9F5]">
      {/* 01 • Top Confirmation Pill */}
      <div className="flex flex-col items-center justify-center px-4 mb-4 gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4E7A6E]/40 bg-[#E8F2EE]/80 text-[#0C2A26] shadow-xs">
          <div className="size-4 rounded-full bg-[#3D7164] flex items-center justify-center text-white">
            <Check className="size-2.5 stroke-[3]" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            Sua compra do Soft Gel Express foi confirmada! (Acesso enviado por e-mail)
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEECE6] border border-[#E07A5F]/40 text-[#E07A5F] text-[10px] sm:text-[11px] font-bold">
          <span>⚠️ NÃO FECHE OU ATUALIZE ESTA PÁGINA PARA NÃO DUPLICAR SEU PEDIDO</span>
        </div>
      </div>

      {/* 02 • Interruption "ESPERE." */}
      <div className="relative inline-block mb-3 px-4">
        {/* Dynamic hand-drawn accent lines top right */}
        <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 select-none pointer-events-none text-[#E07A5F]">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 4L22 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M22 8L27 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M16 11L21 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#E07A5F] leading-none">
          ESPERE.
        </h1>

        {/* Coral brush stroke underline */}
        <div className="w-full h-1.5 bg-[#E07A5F] rounded-full mt-1 mx-auto opacity-90" />
      </div>

      {/* 03 • Secondary Headline - Direct Response Hook */}
      <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.2] max-w-xl mx-auto px-4 text-balance">
        Como Recuperar 100% do Investimento do Soft Gel Express Logo na Sua{" "}
        <span className="relative inline-block text-[#3D7164]">
          Primeira Semana.
          <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#E07A5F] rounded-full" />
        </span>
      </h2>

      {/* Subtle Star Divider */}
      <div className="flex items-center justify-center gap-3 my-3 sm:my-4">
        <div className="w-8 h-px bg-[#D4A373]/60" />
        <Sparkles className="size-3 text-[#D4A373]" />
        <div className="w-8 h-px bg-[#D4A373]/60" />
      </div>

      {/* Body Copy with Price Anchor */}
      <p className="text-sm sm:text-base text-[#3D5650] max-w-lg mx-auto px-4 leading-relaxed font-medium">
        <strong>1 única cliente de Soft Gel paga este sistema pelo ano inteiro.</strong>{" "}
        Adicione o Copiloto <strong>Agenda 80/20</strong> hoje por apenas{" "}
        <span className="font-extrabold text-[#0C2A26] underline decoration-[#E07A5F] decoration-2 underline-offset-2">
          12x de R$ 15,19
        </span>{" "}
        (ou R$ 147 à vista) e saiba exatamente o que fazer em 10 minutos por dia para lotar sua agenda.
      </p>

      {/* 04 • Primary CTA Button */}
      <div className="mt-6 flex flex-col items-center justify-center px-4">
        <a
          href={checkoutUrl}
          onClick={handleCtaClick}
          className="inline-flex min-h-[56px] w-full sm:w-auto items-center justify-center gap-2 bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl transition-all cursor-pointer uppercase tracking-wider"
        >
          <span>SIM! ADICIONAR O AGENDA 80/20 AO MEU PEDIDO</span>
          <ArrowRight className="size-4.5 stroke-[2.5]" />
        </a>
        <p className="mt-2 text-[11px] sm:text-xs text-[#6B857E] font-medium">
          ✓ 1 cliente paga o ano todo · R$ 150 de desconto exclusivo de aluna · Garantia incondicional de 7 dias
        </p>
      </div>

      {/* 04.1 • ROI Highlight Pill Box */}
      <div className="mt-4 mx-4 max-w-md mx-auto rounded-xl bg-[#E8F2EE] border border-[#3D7164]/30 px-3.5 py-2 text-[11px] text-[#0C2A26] font-semibold flex items-center justify-center gap-2">
        <span>💰 <strong>Matemática Rápida:</strong> 1 aplicação de Soft Gel = R$ 150. O ano todo do Agenda 80/20 = R$ 147. O sistema se paga na sua primeira cliente!</span>
      </div>

      {/* 05 • Visual Side-by-Side: Soft Gel Express vs Agenda 80/20 */}
      <div className="mt-8 px-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
        {/* Soft Gel Express Card */}
        <div className="relative w-[210px] rounded-2xl bg-white border border-[#0C2A26]/10 p-2 shadow-[var(--shadow-card-resting)] flex flex-col shrink-0">
          <div className="relative h-[220px] w-full rounded-xl overflow-hidden bg-slate-100">
            <Image
              src="/media/agenda8020/upsell/softgel-nails-hero.jpg"
              alt="Unhas Soft Gel acabamento impecável"
              fill
              className="object-cover"
              sizes="210px"
              priority
            />
            {/* Concluído Badge */}
            <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#0C2A26] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              <GraduationCap className="size-3 text-[#D4A373]" />
              <span>CONCLUÍDO</span>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-2 left-2 right-2 text-left">
              <p className="font-serif italic font-bold text-xl text-white drop-shadow-md">
                Soft Gel
              </p>
              <p className="font-serif text-sm tracking-wider uppercase text-[#E8F2EE] drop-shadow-md">
                Express
              </p>
            </div>
          </div>

          <div className="mt-2 rounded-lg bg-[#0C2A26] px-2 py-1.5 text-white flex items-center gap-1.5 text-left">
            <CheckCircle2 className="size-3.5 text-[#4E7A6E] shrink-0" />
            <div>
              <p className="text-[10px] font-bold leading-tight">Soft Gel Express</p>
              <p className="text-[8px] text-[#A8C5BD] tracking-wider uppercase">Aprender a técnica</p>
            </div>
          </div>
        </div>

        {/* Curved Connecting Arrow on Desktop/Tablet */}
        <div className="hidden sm:flex flex-col items-center justify-center text-[#4E7A6E] -mx-2 z-10 select-none">
          <svg width="42" height="32" viewBox="0 0 42 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 24C12 8 28 8 36 14"
              stroke="#4E7A6E"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeLinecap="round"
            />
            <path d="M34 8L38 14L32 17" stroke="#4E7A6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <Sparkles className="size-3.5 text-[#D4A373] mt-1" />
        </div>

        {/* Agenda 80/20 iPhone Mockup */}
        <div className="w-[230px] rounded-[38px] bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-800 shrink-0">
          <div className="rounded-[30px] bg-[#FAF8F5] overflow-hidden text-left border border-slate-200/60 flex flex-col">
            {/* Status Bar */}
            <div className="pt-2 pb-1 px-4 flex items-center justify-between text-[9px] font-bold text-slate-800">
              <span>9:41</span>
              <div className="w-14 h-3 bg-black rounded-full" />
              <div className="flex items-center gap-1 text-[8px] text-slate-700">
                <span>5G</span>
              </div>
            </div>

            {/* App Header */}
            <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-200/50">
              <div className="text-[10px] font-bold text-[#0C2A26] flex items-center gap-1">
                <CheckCircle2 className="size-3 text-[#3D7164]" />
                <span>agenda <span className="text-[#D4A373]">80/20</span></span>
              </div>
            </div>

            {/* App Content */}
            <div className="p-3 bg-[#0C2A26] text-white">
              <p className="text-center text-[11px] font-bold text-[#E8F2EE]">
                Seu próximo movimento
              </p>
              <div className="w-6 h-0.5 bg-[#4E7A6E] rounded-full mx-auto my-1.5" />

              {/* White Action Card */}
              <div className="rounded-xl bg-white p-2.5 text-slate-900 shadow-xs text-center mt-2">
                <div className="size-8 rounded-full bg-[#E8F2EE] flex items-center justify-center mx-auto mb-1.5 text-[#0C2A26]">
                  <Target className="size-4 text-[#0C2A26]" />
                </div>
                <p className="text-[10px] font-bold text-[#0C2A26] leading-tight">
                  Comece construindo sua primeira prova
                </p>
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#FEECE6] px-2 py-0.5 text-[9px] font-semibold text-[#E07A5F]">
                  <Clock className="size-2.5" />
                  <span>10 min</span>
                </div>
              </div>
            </div>

            {/* Bottom Tab Bar (matching 1.png) */}
            <div className="pt-2 pb-1.5 px-2.5 flex items-center justify-between bg-white border-t border-slate-100 text-[8px] text-slate-500 font-medium">
              <div className="flex flex-col items-center gap-0.5 text-[#0C2A26] font-bold">
                <Home className="size-3 text-[#0C2A26]" />
                <span>Início</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Users className="size-3" />
                <span>Clientes</span>
              </div>
              <div className="size-5 rounded-full bg-[#0C2A26] text-white flex items-center justify-center -mt-1 shadow-xs">
                <Plus className="size-3 stroke-[3]" />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Calendar className="size-3" />
                <span>Agenda</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Menu className="size-3" />
                <span>Mais</span>
              </div>
            </div>

            {/* Bottom Bar Indicator */}
            <div className="py-1 flex justify-center bg-white">
              <div className="w-16 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#A8C5BD] uppercase tracking-wider">
              <Link2 className="size-2.5 text-[#3D7164]" />
              Agenda 80/20 · Colocar em movimento
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
