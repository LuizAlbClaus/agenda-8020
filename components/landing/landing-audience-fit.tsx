"use client";

import Image from "next/image";
import { ShieldCheck, Sparkles } from "lucide-react";

const audienceCards = [
  {
    image: "/media/agenda8020/audience-card-1.png",
    title: "Profissional começando",
    description: "Está construindo sua carteira e precisa de organização para crescer com consistência.",
  },
  {
    image: "/media/agenda8020/audience-card-2.png",
    title: "Agenda irregular",
    description: "Tem dias cheios e dias vazios e quer mais equilíbrio e previsibilidade.",
  },
  {
    image: "/media/agenda8020/audience-card-3.png",
    title: "Conversas que não viram marcação",
    description: "Recebe interesse, responde, mas não consegue converter em agendamentos.",
  },
  {
    image: "/media/agenda8020/audience-card-4.png",
    title: "Clientes que precisam retornar",
    description: "Sabe da importância do retorno, mas tem dificuldade de manter os clientes voltando.",
  },
];

export function LandingAudienceFit() {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden text-center">
      {/* Badge: SEÇÃO 9 — PARA QUEM É */}
      <div className="flex justify-center px-4 mb-3">
        <span className="inline-flex items-center rounded-full border border-[#E07A5F]/40 bg-white/60 px-4 py-1 text-xs font-bold text-[#E07A5F] tracking-wide">
          SEÇÃO 9 — PARA QUEM É
        </span>
      </div>

      {/* Headline */}
      <div className="px-4 mb-4 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.18]">
          Feito para quem trabalha atendendo pessoas e quer{" "}
          <span className="text-[#7FA898]">movimentar melhor o próprio serviço.</span>
        </h2>
      </div>

      {/* Gold Star Divider */}
      <div className="flex justify-center mb-8">
        <Sparkles className="size-4 text-[#D4A373]" />
      </div>

      {/* 2x2 Cards Grid */}
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {audienceCards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs text-left flex flex-col justify-between"
          >
            {/* Top Photo */}
            <div className="relative w-full aspect-[375/230] overflow-hidden">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>

            {/* Card Text */}
            <div className="p-4 sm:p-5">
              <h3 className="text-sm sm:text-base font-bold text-[#0C2A26] leading-snug">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Dark Banner with Botanical Leaves */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="relative rounded-3xl bg-[#082420] text-white p-6 sm:p-8 overflow-hidden shadow-xl text-center">
          {/* Botanical Leaves Overlay on Bottom Right */}
          <div className="absolute right-0 bottom-0 w-36 sm:w-44 pointer-events-none opacity-40 select-none">
            <Image
              src="/media/agenda8020/audience-leaves.png"
              alt=""
              width={180}
              height={250}
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="relative z-10 max-w-lg mx-auto space-y-3">
            {/* Gold Shield Badge with Checkmark */}
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="size-3.5 text-[#D4A373]" />
              <div className="size-9 rounded-full border border-[#D4A373] bg-[#0E3D36] flex items-center justify-center text-[#D4A373]">
                <ShieldCheck className="size-5" />
              </div>
              <Sparkles className="size-3.5 text-[#D4A373]" />
            </div>

            <h3 className="text-base sm:text-xl font-bold text-white leading-tight">
              Reduz improvisação.
              <span className="block font-semibold text-[#7FA898] text-sm sm:text-base mt-0.5">
                Não promete controlar o resultado.
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-md mx-auto">
              O Agenda 80/20 organiza seu tempo, suas conversas e seus retornos para você
              trabalhar com mais leveza e foco no que realmente importa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
