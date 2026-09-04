"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";
import type { LandingVariant } from "./types";

interface LandingClosingProps {
  variant?: LandingVariant;
}

export function LandingClosing({ variant = "cold" }: LandingClosingProps) {
  return (
    <section className="relative bg-[#082420] text-white pt-14 pb-16 px-4 rounded-t-[48px] -mt-4 text-center overflow-hidden">
      {/* Top Gold Seal */}
      <div className="flex justify-center mb-6">
        <div className="size-14 rounded-full border-2 border-[#D4A373] bg-[#0E3D36] flex items-center justify-center text-[#D4A373] shadow-lg">
          <Check className="size-7 stroke-[2.5]" />
        </div>
      </div>

      {/* Pre-headline */}
      <div className="max-w-md mx-auto mb-4">
        <p className="text-sm sm:text-base text-white/90 leading-relaxed font-medium">
          Você <span className="text-[#D4A373] font-bold">não precisa</span> sair daqui
          com mais 20 coisas para fazer.
        </p>
      </div>

      {/* Main Editorial Headline */}
      <div className="max-w-md mx-auto mb-8">
        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-[1.15]">
          Precisa sair sabendo qual é{" "}
          <span className="text-[#D4A373]">
            <EditorialUnderline color="gold">a próxima.</EditorialUnderline>
          </span>
        </h2>
      </div>

      {/* Sand/Gold CTA Button */}
      <div className="max-w-xs mx-auto mb-10">
        <Link
          href="#oferta"
          className="flex items-center justify-center gap-2 w-full bg-[#C9A66B] hover:bg-[#BD985B] text-[#082420] font-extrabold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-xl transition-all active:scale-98"
        >
          <span>Montar meu primeiro plano</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* Microcopy Guarantee Footer */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-emerald-100/80 font-medium max-w-md mx-auto pt-2 border-t border-emerald-900/40">
        <div className="flex items-center gap-1.5">
          <Lock className="size-3.5 text-[#D4A373]" />
          <span>Acesso completo</span>
        </div>
        <span className="text-emerald-700 select-none">•</span>
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5 text-[#D4A373]" />
          <span>12 meses</span>
        </div>
        <span className="text-emerald-700 select-none">•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-[#D4A373]" />
          <span>pagamento único</span>
        </div>
      </div>
    </section>
  );
}
