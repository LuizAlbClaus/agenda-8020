"use client";

import Image from "next/image";
import { ArrowDown, Target } from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";

export function LandingProblem() {
  return (
    <section className="relative pt-6 pb-0 overflow-hidden text-center">
      {/* Badge: 02 • O PROBLEMA */}
      <div className="flex justify-start sm:justify-center px-4 mb-4">
        <span className="inline-flex items-center rounded-full border border-[#0E3D36]/30 bg-white/60 px-4 py-1 text-xs font-bold text-[#0E3D36] tracking-wide">
          02 • O PROBLEMA
        </span>
      </div>

      {/* Headline */}
      <div className="text-left sm:text-center px-4 mb-6">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.15] max-w-xl sm:mx-auto">
          Você provavelmente já sabe{" "}
          <span className="text-[#E07A5F]">coisas demais</span> para fazer.
        </h2>
      </div>

      {/* Visual Composition: Woman + 7 Frosted Floating Cards */}
      <div className="relative max-w-[430px] mx-auto px-2">
        <Image
          src="/media/agenda8020/problem-visual.png"
          alt="Profissional sobrecarregada com múltiplas tarefas concorrentes"
          width={941}
          height={715}
          className="w-full h-auto object-contain"
          priority
        />
      </div>

      {/* Curved Dark Forest Green Transition Section */}
      <div className="relative bg-[#082420] text-white pt-10 pb-16 px-6 rounded-t-[48px] -mt-6 sm:-mt-10">
        {/* Down Arrow Button */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <div className="size-11 rounded-full bg-white shadow-lg flex items-center justify-center text-[#082420]">
            <ArrowDown className="size-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Bullseye Icon with Horizontal Accent Line */}
        <div className="flex items-center justify-center gap-4 max-w-xs mx-auto mb-6 pt-3">
          <div className="h-px bg-emerald-700/40 flex-1" />
          <div className="size-12 rounded-full border-2 border-[#E07A5F]/60 bg-[#0E3D36] flex items-center justify-center shadow-inner">
            <Target className="size-6 text-[#E07A5F]" />
          </div>
          <div className="h-px bg-emerald-700/40 flex-1" />
        </div>

        {/* Conclusion Punchline */}
        <div className="max-w-md mx-auto space-y-2 text-center">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            O problema não é falta de estratégia.
          </p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#7FA898] leading-tight">
            É não saber qual merece sua atenção{" "}
            <EditorialUnderline color="gold" className="text-[#E28A52]">
              agora.
            </EditorialUnderline>
          </p>
        </div>
      </div>
    </section>
  );
}
