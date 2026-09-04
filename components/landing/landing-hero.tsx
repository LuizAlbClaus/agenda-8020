"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Clock,
  Lightbulb,
  Menu,
  Sparkles,
  Wifi,
} from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";
import type { LandingVariant } from "./types";

interface LandingHeroProps {
  variant?: LandingVariant;
  searchParams?: Record<string, string | string[] | undefined>;
}

export function LandingHero({ variant = "cold" }: LandingHeroProps) {
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

      {/* Headline */}
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.035em] text-[#0C2A26] leading-[1.18] max-w-xl mx-auto px-4 text-balance">
        Pare de tentar fazer tudo para movimentar seu serviço.
      </h1>

      {/* Subheadline */}
      <p className="mt-4 text-sm sm:text-base md:text-lg text-[#3D5650] max-w-md mx-auto px-4 leading-relaxed font-medium">
        Descubra qual é a próxima ação que realmente faz sentido fazer{" "}
        <EditorialUnderline color="coral">agora.</EditorialUnderline>
      </p>

      {/* Primary CTA Button */}
      <div className="mt-7 sm:mt-8 flex justify-center px-4">
        <Link
          href="#oferta"
          className="inline-flex items-center justify-center gap-2.5 bg-[#0E3D36] hover:bg-[#0A2E29] text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-2xl shadow-md transition-all active:scale-98"
        >
          <CalendarDays className="size-5 text-[#E07A5F]" />
          <span>Montar meu primeiro plano</span>
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
                <div className="w-8 h-0.5 bg-emerald-600/60 rounded-full mx-auto mb-3" />

                {/* Inner Action Card */}
                <div className="rounded-xl bg-white p-3 text-slate-900 shadow-xs">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Ação sugerida
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#0C2A26] leading-snug">
                    Reative algumas clientes que já tiveram contato com seu serviço.
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FEECE6] px-2 py-0.5 text-[10px] font-semibold text-[#D96B43]">
                      <Clock className="size-2.5" />
                      <span>10 min</span>
                    </span>
                  </div>
                </div>

                {/* Card Action Button */}
                <Link
                  href="#oferta"
                  className="mt-3 flex items-center justify-center gap-1.5 w-full bg-[#E07A5F] hover:bg-[#D46B50] text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs"
                >
                  <span>Fazer essa ação</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Secondary Card: Por que agora? */}
              <div className="rounded-2xl bg-[#E8F2EE] p-3.5 text-slate-800 border border-emerald-900/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="size-6 rounded-full bg-emerald-700/20 flex items-center justify-center">
                    <Lightbulb className="size-3 text-[#0E3D36]" />
                  </div>
                  <h3 className="text-xs font-bold text-[#0E3D36]">Por que agora?</h3>
                </div>
                <p className="text-[11px] text-[#2C4A43] leading-relaxed">
                  Essas clientes já demonstraram interesse no seu serviço antes. Um novo contato aumenta suas chances de fechar negócio com muito menos esforço.
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
