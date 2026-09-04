"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Lightbulb,
  Menu,
  Mic,
  Sparkles,
  Wifi,
} from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";
import { VARIANT_HERO_DATA, type LandingVariant } from "./types";

interface LandingHeroProps {
  variant?: LandingVariant;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function LandingHero({ variant = "cold" }: LandingHeroProps) {
  const config = VARIANT_HERO_DATA[variant] || VARIANT_HERO_DATA.cold;
  const [scriptMode, setScriptMode] = useState<"text" | "audio">("text");
  const [copied, setCopied] = useState(false);

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(config.heroMockupTextScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-12 sm:pb-20 text-center">
      {/* Background Subtle Organic Foliage (Bottom Left) */}
      <div className="absolute left-0 bottom-10 w-48 sm:w-64 pointer-events-none opacity-40 select-none -z-10">
        <Image
          src="/media/agenda8020/hero-plant.png"
          alt=""
          width={220}
          height={500}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      {/* Top Logo */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <Image
          src="/media/agenda8020/brand-logo.png"
          alt="agenda 80/20"
          width={220}
          height={42}
          className="h-8 sm:h-10 w-auto object-contain"
          priority
        />
      </div>

      {/* Eyebrow Badge */}
      <div className="flex justify-center mb-4 px-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0E3D36]/8 text-[#0E3D36] text-xs sm:text-sm font-semibold border border-[#0E3D36]/15">
          <Sparkles className="size-3.5 text-[#E07A5F]" />
          <span>{config.eyebrow}</span>
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.035em] text-[#0C2A26] leading-[1.18] max-w-xl mx-auto px-4 text-balance">
        {config.headline}
      </h1>

      {/* Subheadline */}
      <p className="mt-4 text-sm sm:text-base md:text-lg text-[#3D5650] max-w-md mx-auto px-4 leading-relaxed font-medium">
        {config.supportingHeadline}
      </p>

      {/* Primary CTA Button */}
      <div className="mt-7 sm:mt-8 flex justify-center px-4">
        <Link
          href="#oferta"
          className="inline-flex items-center justify-center gap-2.5 bg-[#E07A5F] hover:bg-[#D36A4F] text-white font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          <CalendarDays className="size-5 text-white" />
          <span>{config.primaryCta}</span>
        </Link>
      </div>

      {/* Realistic iPhone Mockup */}
      <div className="mt-10 sm:mt-12 flex justify-center px-4">
        <div className="w-full max-w-[340px] sm:max-w-[365px] rounded-[44px] bg-slate-900 p-2.5 sm:p-3 shadow-2xl ring-1 ring-slate-800/80">
          {/* Inner Phone Screen */}
          <div className="rounded-[36px] bg-[#FAF8F5] overflow-hidden text-left border border-slate-200/60 flex flex-col">
            {/* Status Bar */}
            <div className="pt-2.5 pb-1 px-6 flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>9:41</span>
              {/* Dynamic Island */}
              <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-1.5 gap-1">
                <div className="size-1.5 rounded-full bg-slate-800" />
                <div className="size-2 rounded-full bg-blue-950/40" />
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Wifi className="size-3" />
                <div className="w-4 h-2 border border-slate-700 rounded-xs flex items-center p-0.5">
                  <div className="w-2.5 h-1 bg-slate-700 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* App Internal Header */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-200/50">
              <button type="button" aria-label="Menu" className="text-slate-700">
                <Menu className="size-5" />
              </button>
              <Image
                src="/media/agenda8020/brand-logo.png"
                alt="agenda 80/20"
                width={110}
                height={22}
                className="h-4 w-auto object-contain"
              />
              <button type="button" aria-label="Notificações" className="text-slate-700">
                <Bell className="size-4" />
              </button>
            </div>

            {/* App Body */}
            <div className="p-4 space-y-3.5">
              {/* Greeting Date */}
              <div>
                <h2 className="text-sm font-bold text-slate-900">Hoje</h2>
                <p className="text-[11px] text-slate-500">Sexta-feira, 16 de maio</p>
              </div>

              {/* Main Card: Próximo Movimento */}
              <div className="rounded-2xl bg-[#0E3D36] p-4 text-white shadow-sm">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="size-7 rounded-full bg-emerald-700/50 flex items-center justify-center">
                    <Sparkles className="size-3.5 text-[#E07A5F]" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold leading-tight text-emerald-50">
                    Seu próximo movimento está pronto
                  </p>
                </div>

                {/* Box: Seu foco agora */}
                <div className="rounded-xl bg-emerald-900/40 p-2.5 mb-2.5 border border-emerald-700/30 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Seu foco agora
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-100 font-medium">
                    {config.heroMockupFocus}
                  </p>
                </div>

                {/* Inner Action Card */}
                <div className="rounded-xl bg-white p-3 text-slate-900 shadow-xs text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Ação sugerida
                    </p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEECE6] px-2 py-0.5 text-[10px] font-semibold text-[#D96B43]">
                      <Clock className="size-2.5" />
                      <span>{config.heroMockupDuration} min estimados</span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-[#0C2A26] leading-snug">
                    {config.heroMockupTitle}
                  </p>
                </div>

                {/* Card Action Button */}
                <Link
                  href="#oferta"
                  className="mt-3 flex items-center justify-center gap-1.5 w-full bg-[#E07A5F] hover:bg-[#D46B50] text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs"
                >
                  <span>Fazer essa ação</span>
                  <ArrowRight className="size-3.5" />
                </Link>

                {/* Roteiro de WhatsApp com abas Texto / Áudio */}
                <div className="mt-3 pt-2.5 border-t border-emerald-700/40 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                      Roteiro de WhatsApp:
                    </span>
                    <div className="inline-flex p-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/50">
                      <button
                        type="button"
                        onClick={() => setScriptMode("text")}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          scriptMode === "text"
                            ? "bg-white text-[#0E3D36] shadow-xs"
                            : "text-emerald-200"
                        }`}
                      >
                        Texto
                      </button>
                      <button
                        type="button"
                        onClick={() => setScriptMode("audio")}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          scriptMode === "audio"
                            ? "bg-white text-[#0E3D36] shadow-xs"
                            : "text-emerald-200"
                        }`}
                      >
                        <Mic className="size-2.5" />
                        <span>Áudio</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-950/50 p-2 text-[11px] text-emerald-100 leading-relaxed border border-emerald-800/40">
                    {scriptMode === "text" ? (
                      <p className="italic select-all">“{config.heroMockupTextScript}”</p>
                    ) : (
                      <div>
                        <p className="text-[9px] font-bold text-[#E07A5F] mb-1">
                          🎙️ Guia de Áudio (~20s) · Fale com voz calorosa e sem afobação:
                        </p>
                        <p className="italic select-all">“{config.heroMockupAudioScript}”</p>
                      </div>
                    )}
                  </div>

                  {/* Micro Action Buttons */}
                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3 text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 text-emerald-200" />
                          <span>Copiar Mensagem</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary Card: Por que agora? */}
              <div className="rounded-2xl bg-[#E8F2EE] p-3.5 text-slate-800 border border-emerald-900/10 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="size-6 rounded-full bg-emerald-700/20 flex items-center justify-center">
                    <Lightbulb className="size-3 text-[#0E3D36]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#0E3D36]">Por que agora?</h3>
                </div>
                <p className="text-[11px] text-[#2C4A43] leading-relaxed">
                  {config.heroMockupWhyNow}
                </p>
                <div className="mt-2">
                  <EditorialUnderline color="coral" className="text-[11px] font-bold text-[#0E3D36]">
                    É sobre foco, não sobre sorte.
                  </EditorialUnderline>
                </div>
              </div>
            </div>

            {/* Bottom Home Indicator */}
            <div className="pb-2 pt-1 flex justify-center">
              <div className="w-28 h-1 bg-slate-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
