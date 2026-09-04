"use client";

import Image from "next/image";
import {
  CheckSquare,
  LineChart,
  Smartphone,
  Sparkles,
} from "lucide-react";

export function LandingPositioning() {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      {/* Badge: Seção 8 — FEITO PARA A VIDA REAL */}
      <div className="px-4 mb-2">
        <span className="text-xs sm:text-sm font-bold text-[#0E3D36] tracking-wide">
          Seção 8 — FEITO PARA A VIDA REAL
        </span>
        <div className="w-20 h-1 bg-gradient-to-r from-[#E07A5F] to-[#D4A373] rounded-full mt-1.5 mb-4" />
      </div>

      {/* Headline */}
      <div className="px-4 mb-10 max-w-xl">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.18]">
          Você não precisa virar especialista em marketing{" "}
          <span className="text-[#7FA898] block">para movimentar seu negócio.</span>
        </h2>
      </div>

      {/* Composition: 3 Connected Steps (Left) + Woman in Salon (Right) */}
      <div className="max-w-4xl mx-auto px-4 grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center">
        {/* Left: 3 Numbered Steps */}
        <div className="relative space-y-5 max-w-xs">
          {/* Step 1 */}
          <div className="relative flex items-center gap-3">
            <div className="size-8 rounded-full bg-[#7FA898] text-white font-bold text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1 rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="size-9 rounded-xl border border-slate-300 flex items-center justify-center text-[11px] font-black text-[#0E3D36] shrink-0">
                80/20
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#0C2A26]">Você abre</p>
            </div>
          </div>

          {/* Dotted connector */}
          <div className="w-0.5 h-3 border-l-2 border-dotted border-slate-300 ml-4" />

          {/* Step 2 */}
          <div className="relative flex items-center gap-3">
            <div className="size-8 rounded-full bg-[#7FA898] text-white font-bold text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1 rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="size-9 rounded-xl bg-emerald-50 text-[#0E3D36] flex items-center justify-center shrink-0">
                <LineChart className="size-5 text-[#0E3D36]" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#0C2A26] leading-tight">
                Entende o que merece atenção
              </p>
            </div>
          </div>

          {/* Dotted connector */}
          <div className="w-0.5 h-3 border-l-2 border-dotted border-slate-300 ml-4" />

          {/* Step 3 */}
          <div className="relative flex items-center gap-3">
            <div className="size-8 rounded-full bg-[#7FA898] text-white font-bold text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div className="flex-1 rounded-2xl bg-white p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="size-9 rounded-xl bg-orange-50 text-[#E07A5F] flex items-center justify-center shrink-0">
                <CheckSquare className="size-5 text-[#E07A5F]" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#0C2A26] leading-tight">
                Executa e segue seu dia
              </p>
            </div>
          </div>
        </div>

        {/* Right: Clean Editorial Photography of the Specialist in Salon */}
        <div className="relative flex justify-center">
          <div className="w-full max-w-[380px] rounded-3xl overflow-hidden shadow-xl border border-slate-200/80">
            <Image
              src="/media/agenda8020/woman-salon-perfect.png"
              alt="Profissional utilizando o Agenda 80/20 no ambiente real de salão"
              width={621}
              height={1220}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>

      {/* Bottom Dark Banner */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="rounded-2xl bg-[#082420] text-white p-4 sm:p-5 flex items-center gap-4 shadow-xl">
          <Sparkles className="size-6 text-[#D4A373] shrink-0" />
          <p className="text-xs sm:text-sm text-white leading-relaxed">
            O Agenda 80/20 traduz dados em{" "}
            <span className="text-[#7FA898] font-bold">decisões simples</span> para você
            crescer sem complicação.
          </p>
        </div>
      </div>
    </section>
  );
}
