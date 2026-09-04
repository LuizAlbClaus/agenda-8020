"use client";

import {
  Compass,
  Diamond,
  Flag,
  GitFork,
  HeartHandshake,
  Radio,
  Siren,
} from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";

const modulesList = [
  {
    icon: Siren,
    title: "SOS Copiloto",
    description: "Quando travar, peça clareza na hora.",
  },
  {
    icon: HeartHandshake,
    title: "Retenção",
    description: "Fortaleça vínculos e aumente a recorrência.",
  },
  {
    icon: Diamond,
    title: "Diagnóstico de Valor",
    description: "Descubra e comunique o valor que transforma.",
  },
  {
    icon: Flag,
    title: "Missões práticas",
    description: "Ações guiadas para gerar resultado real.",
  },
  {
    icon: GitFork,
    title: "Caminho de agendamento",
    description: "Estruture convites que viram compromissos.",
  },
];

export function LandingModules() {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden text-center">
      {/* Badge: SEÇÃO 6 • MÓDULOS */}
      <div className="flex justify-center px-4 mb-3">
        <span className="inline-flex items-center rounded-full border border-[#4E7A6E]/30 bg-white/60 px-4 py-1 text-xs font-bold text-[#4E7A6E] tracking-wide">
          SEÇÃO 6 • MÓDULOS
        </span>
      </div>

      {/* Headline */}
      <div className="px-4 mb-3 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.18]">
          E quando o problema muda, o{" "}
          <span className="text-[#4E7A6E]">Agenda 80/20</span> continua com você.
        </h2>
      </div>

      {/* Orange Accent Bar */}
      <div className="w-16 h-1 bg-[#E07A5F] rounded-full mx-auto mb-10" />

      {/* Flowchart Diagram */}
      <div className="max-w-md sm:max-w-lg mx-auto px-4">
        {/* Top Central Card */}
        <div className="rounded-3xl bg-[#082420] text-white p-6 shadow-xl relative z-10 max-w-sm mx-auto">
          <div className="size-11 rounded-full border-2 border-[#D4A373] bg-[#0E3D36] flex items-center justify-center text-[#D4A373] mx-auto mb-2.5">
            <Compass className="size-5" />
          </div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4A373]">
            CENTRO DO SISTEMA
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Próximo Movimento
          </h3>
          <p className="text-xs text-emerald-100/70 mt-1 max-w-xs mx-auto leading-relaxed">
            O sistema analisa e indica sua melhor próxima ação.
          </p>
          <div className="mt-4 flex justify-center">
            <div className="size-8 rounded-full bg-[#D4A373] text-[#082420] flex items-center justify-center font-bold text-sm shadow-sm">
              ↓
            </div>
          </div>
        </div>

        {/* Modular Cards List with Connector Lines */}
        <div className="relative pt-6 space-y-3.5 max-w-md mx-auto">
          {/* Vertical Trunk Line */}
          <div className="absolute left-6 top-0 bottom-6 w-0.5 bg-[#0E3D36]/40" />

          {modulesList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative flex items-center gap-3 pl-6">
                {/* Horizontal Connector Branch */}
                <div className="absolute left-6 top-1/2 w-4 h-0.5 bg-[#0E3D36]/40 -translate-y-1/2" />
                <div className="absolute left-5 top-1/2 size-2.5 rounded-full bg-[#D4A373] -translate-y-1/2" />

                {/* Module Card */}
                <div className="flex-1 rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5 text-left">
                  <div className="size-10 rounded-full bg-emerald-50 text-[#0E3D36] flex items-center justify-center shrink-0">
                    <Icon className="size-5 text-[#0E3D36]" />
                  </div>
                  <div className="flex-1 grid grid-cols-[auto_1fr] items-center gap-3">
                    <h4 className="text-xs sm:text-sm font-bold text-[#0C2A26] pr-3 border-r border-slate-200">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Phrase */}
      <div className="mt-10 px-4 max-w-md mx-auto">
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          Módulos que se conectam ao que importa: sua próxima ação com{" "}
          <EditorialUnderline color="sage" className="font-bold text-[#0C2A26]">
            direção e foco.
          </EditorialUnderline>
        </p>
      </div>
    </section>
  );
}
