"use client";

import Link from "next/link";
import {
  Calendar,
  Compass,
  LineChart,
  LifeBuoy,
  MessageSquare,
  ShieldCheck,
  Star,
  Target,
  Users,
} from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";

interface LandingOfferProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export function LandingOffer({ searchParams }: LandingOfferProps) {
  // Checkout URL preservation
  const checkoutUrl = "/checkout";

  return (
    <section id="oferta" className="relative pt-12 pb-6 overflow-hidden text-center scroll-mt-10">
      {/* Badge: ✦ SEÇÃO 10 • OFERTA */}
      <div className="flex justify-center px-4 mb-3">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#0E3D36]/30 bg-white/60 px-4 py-1 text-xs font-bold text-[#0E3D36] tracking-wide">
          <span>✦ SEÇÃO 10 • OFERTA</span>
        </span>
      </div>

      {/* Headline */}
      <div className="px-4 mb-10 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.18]">
          Comece com seu{" "}
          <EditorialUnderline color="coral">primeiro plano 80/20.</EditorialUnderline>
        </h2>
      </div>

      {/* Pricing Card Container */}
      <div className="max-w-md mx-auto px-4">
        <div className="rounded-[36px] overflow-hidden shadow-2xl border border-slate-200/80 bg-white text-left">
          {/* Top Header (Dark Forest Green) */}
          <div className="bg-[#082420] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl border border-[#D4A373] bg-[#0E3D36] flex items-center justify-center text-[#D4A373]">
                <Calendar className="size-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Agenda 80/20
              </h3>
            </div>
            <div className="size-8 rounded-full bg-[#D4A373] text-[#082420] flex items-center justify-center shadow-xs">
              <Star className="size-4 fill-current" />
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Access Pill */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2EE] border border-emerald-900/10 px-3.5 py-1 text-xs font-bold text-[#0E3D36]">
                <Calendar className="size-3.5 text-[#0E3D36]" />
                <span>12 meses de acesso</span>
              </span>
            </div>

            {/* Price Display */}
            <div className="text-center relative py-1">
              <div className="inline-flex items-baseline justify-center gap-1.5 relative">
                <span className="text-lg font-bold text-[#0C2A26]">R$</span>
                <span className="text-6xl sm:text-7xl font-black tracking-tight text-[#0C2A26]">
                  147
                </span>
                {/* Coral excitement marks */}
                <div className="absolute -top-2 -right-6 flex flex-col gap-0.5 text-[#E07A5F] font-bold text-sm select-none">
                  <span>\\</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-800 mt-1">
                pagamento único
              </p>
            </div>

            <div className="h-px bg-slate-200" />

            {/* 2-Column Feature List (6 items) */}
            <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 sm:gap-x-4 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-[#082420] text-white flex items-center justify-center shrink-0">
                  <Compass className="size-3 text-[#D4A373]" />
                </div>
                <span>Próximo Movimento</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-[#082420] text-white flex items-center justify-center shrink-0">
                  <Users className="size-3 text-[#D4A373]" />
                </div>
                <span>Retenção</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-[#082420] text-white flex items-center justify-center shrink-0">
                  <MessageSquare className="size-3 text-[#D4A373]" />
                </div>
                <span>mensagens prontas</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-[#082420] text-white flex items-center justify-center shrink-0">
                  <Target className="size-3 text-[#D4A373]" />
                </div>
                <span>missões práticas</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-[#082420] text-white flex items-center justify-center shrink-0">
                  <LifeBuoy className="size-3 text-[#D4A373]" />
                </div>
                <span>SOS Copiloto</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-[#082420] text-white flex items-center justify-center shrink-0">
                  <LineChart className="size-3 text-[#D4A373]" />
                </div>
                <span>acompanhamento</span>
              </div>
            </div>

            {/* Coral CTA Button */}
            <Link
              href={checkoutUrl}
              className="mt-4 flex items-center justify-center gap-2 w-full bg-[#E07A5F] hover:bg-[#D46B50] text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl shadow-md transition-all active:scale-98"
            >
              <span>Montar meu primeiro plano</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
