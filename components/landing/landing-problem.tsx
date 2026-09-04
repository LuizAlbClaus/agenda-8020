"use client";

import Image from "next/image";
import {
  ArrowDown,
  Calendar,
  Handshake,
  Radio,
  Tag,
  Target,
  User,
  Users,
} from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function LandingProblem() {
  return (
    <section className="relative pt-8 pb-0 overflow-hidden text-center">
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

      {/* Visual Composition: Generated Overwhelmed Woman + 7 HTML/CSS Floating Frosted Glass Cards */}
      <div className="relative max-w-[440px] mx-auto px-2 overflow-hidden">
        {/* Woman Photo (Pure Photography from Nano Banana) */}
        <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-sm">
          <Image
            src="/media/agenda8020/problem-woman.png"
            alt="Profissional sobrecarregada com múltiplas tarefas concorrentes"
            fill
            className="object-cover object-top"
            priority
          />

          {/* Frosted Glass Overlay Cards */}
          {/* 1. Postar (Top Left) */}
          <div className="absolute left-[3%] top-[10%] backdrop-blur-md bg-white/85 border border-white/90 shadow-md rounded-xl p-2 sm:p-2.5 flex items-center gap-2 text-left transition-transform hover:scale-105 select-none max-w-[170px]">
            <div className="size-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0">
              <InstagramIcon className="size-3.5" />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-extrabold tracking-wider text-slate-800 leading-none">POSTAR</p>
              <p className="text-[9px] text-slate-500 leading-tight truncate">Ideia de post</p>
            </div>
            <span className="text-[8px] text-slate-400 font-medium ml-auto">09:30</span>
          </div>

          {/* 2. Stories (Mid Left) */}
          <div className="absolute left-[2%] top-[29%] backdrop-blur-md bg-white/85 border border-white/90 shadow-md rounded-xl p-2 sm:p-2.5 flex items-center gap-2 text-left transition-transform hover:scale-105 select-none max-w-[160px]">
            <div className="size-6 rounded-full border-2 border-dashed border-[#E07A5F] flex items-center justify-center text-[#E07A5F] shrink-0">
              <Radio className="size-3" />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-extrabold tracking-wider text-slate-800 leading-none">STORIES</p>
              <p className="text-[9px] text-slate-500 leading-tight truncate">Nova ideia</p>
            </div>
            <span className="text-[8px] text-slate-400 font-medium ml-auto">10:15</span>
          </div>

          {/* 3. Indicação (Lower Left) */}
          <div className="absolute left-[2%] top-[48%] backdrop-blur-md bg-white/85 border border-white/90 shadow-md rounded-xl p-2 sm:p-2.5 flex items-center gap-2 text-left transition-transform hover:scale-105 select-none max-w-[185px]">
            <div className="size-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <Users className="size-3.5" />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-extrabold tracking-wider text-slate-800 leading-none">INDICAÇÃO</p>
              <p className="text-[9px] text-slate-500 leading-tight truncate">Cliente indicou amiga</p>
            </div>
            <span className="text-[8px] text-slate-400 font-medium ml-auto">11:20</span>
          </div>

          {/* 4. Promoção (Bottom Left) */}
          <div className="absolute left-[4%] top-[68%] backdrop-blur-md bg-white/85 border border-white/90 shadow-md rounded-xl p-2 sm:p-2.5 flex items-center gap-2 text-left transition-transform hover:scale-105 select-none max-w-[170px]">
            <div className="size-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Tag className="size-3.5" />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-extrabold tracking-wider text-slate-800 leading-none">PROMOÇÃO</p>
              <p className="text-[9px] text-slate-500 leading-tight truncate">Criar oferta</p>
            </div>
            <span className="text-[8px] text-slate-400 font-medium ml-auto">13:45</span>
          </div>

          {/* 5. Parceria (Top Right) */}
          <div className="absolute right-[3%] top-[14%] backdrop-blur-md bg-white/85 border border-white/90 shadow-md rounded-xl p-2 sm:p-2.5 flex items-center gap-2 text-left transition-transform hover:scale-105 select-none max-w-[175px]">
            <div className="size-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Handshake className="size-3.5" />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-extrabold tracking-wider text-slate-800 leading-none">PARCERIA</p>
              <p className="text-[9px] text-slate-500 leading-tight truncate">Proposta colab</p>
            </div>
            <span className="text-[8px] text-slate-400 font-medium ml-auto">14:20</span>
          </div>

          {/* 6. Clientes Antigas (Mid Right) */}
          <div className="absolute right-[2%] top-[38%] backdrop-blur-md bg-white/85 border border-white/90 shadow-md rounded-xl p-2 sm:p-2.5 flex items-center gap-2 text-left transition-transform hover:scale-105 select-none max-w-[185px]">
            <div className="size-6 rounded-lg bg-[#E07A5F] text-white flex items-center justify-center shrink-0">
              <User className="size-3.5" />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-extrabold tracking-wider text-slate-800 leading-none">CLIENTES ANTIGAS</p>
              <p className="text-[9px] text-slate-500 leading-tight truncate">Reativar contato</p>
            </div>
            <span className="text-[8px] text-slate-400 font-medium ml-auto">15:10</span>
          </div>

          {/* 7. Horários (Lower Right) */}
          <div className="absolute right-[3%] top-[64%] backdrop-blur-md bg-white/85 border border-white/90 shadow-md rounded-xl p-2 sm:p-2.5 flex items-center gap-2 text-left transition-transform hover:scale-105 select-none max-w-[175px]">
            <div className="size-6 rounded-lg bg-[#0E3D36] text-white flex items-center justify-center shrink-0">
              <Calendar className="size-3.5" />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-extrabold tracking-wider text-slate-800 leading-none">HORÁRIOS</p>
              <p className="text-[9px] text-slate-500 leading-tight truncate">Abrir agenda</p>
            </div>
            <span className="text-[8px] text-slate-400 font-medium ml-auto">16:30</span>
          </div>
        </div>
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
          <p className="text-xs uppercase tracking-wider text-emerald-300 font-bold">
            De 20 opções competindo pela sua atenção para
          </p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
            Apenas 1 ação que faz sentido agora.
          </p>
          <p className="text-sm text-[#7FA898] leading-relaxed pt-1">
            O problema não é falta de estratégia. É não saber qual merece sua atenção{" "}
            <EditorialUnderline color="gold" className="text-[#E28A52]">
              agora.
            </EditorialUnderline>
          </p>
        </div>
      </div>
    </section>
  );
}
