"use client";

import { useState } from "react";
import {
  Calendar,
  Crown,
  Home,
  Menu,
  MessageSquare,
  Plus,
  RefreshCw,
  Sprout,
  Target,
  Users,
  Wifi,
} from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";
import { cn } from "@/lib/utils";

const scenarios = [
  {
    id: "comecando",
    icon: Sprout,
    label: "Estou começando",
    recommendation: "Criar sua oferta inicial e atrair suas 3 primeiras clientes-teste.",
    highlight: "primeiras clientes-teste.",
  },
  {
    id: "pouca-gente",
    icon: Users,
    label: "Pouca gente conhece meu trabalho",
    recommendation: "Ativar um ciclo de indicações com as pessoas mais próximas.",
    highlight: "ciclo de indicações.",
  },
  {
    id: "perguntam-nao-marcam",
    icon: MessageSquare,
    label: "Perguntam, mas não marcam",
    recommendation: "Ajustar o roteiro de resposta rápida para fechar na hora da dúvida.",
    highlight: "fechar na hora da dúvida.",
  },
  {
    id: "horarios-vazios",
    icon: Calendar,
    label: "Tenho horários vazios",
    recommendation: "Abrir uma janela estratégica de encaixe com convite direto no WhatsApp.",
    highlight: "convite direto no WhatsApp.",
  },
  {
    id: "clientes-voltem",
    icon: RefreshCw,
    label: "Quero que minhas clientes voltem",
    recommendation: "Construir sua primeira prova e ativar uma oportunidade próxima.",
    highlight: "oportunidade próxima.",
  },
];

export function LandingScenarios() {
  const [selectedId, setSelectedId] = useState("clientes-voltem");
  const selectedScenario = scenarios.find((s) => s.id === selectedId) ?? scenarios[4];

  return (
    <section className="relative pt-12 pb-16 overflow-hidden text-center">
      {/* Badge: ✦ 4 • SITUAÇÕES REAIS */}
      <div className="flex justify-center px-4 mb-3">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#0E3D36]/30 bg-white/60 px-4 py-1 text-xs font-bold text-[#0E3D36] tracking-wide">
          <span>✦ 4 • SITUAÇÕES REAIS</span>
        </span>
      </div>

      {/* Headline */}
      <div className="px-4 mb-10 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.18]">
          Veja o que ele faria{" "}
          <span className="text-[#4E7A6E]">
            <EditorialUnderline color="coral">no seu caso.</EditorialUnderline>
          </span>
        </h2>
      </div>

      {/* iPhone Mockup with Interactive Selection */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-[340px] sm:max-w-[365px] rounded-[44px] bg-slate-900 p-2.5 sm:p-3 shadow-2xl ring-1 ring-slate-800">
          <div className="rounded-[36px] bg-[#FAF8F5] overflow-hidden text-left border border-slate-200 flex flex-col">
            {/* Status Bar */}
            <div className="pt-2.5 pb-1 px-6 flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>9:41</span>
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
              <div className="flex items-center gap-1.5">
                <div className="size-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-black">
                  ∞
                </div>
                <span className="text-xs font-black tracking-wider text-[#0C2A26]">AGENDA 80/20</span>
              </div>
              <Crown className="size-4 text-[#D4A373]" />
            </div>

            {/* App Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  Em qual situação você está?
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">
                  Selecione abaixo e veja a recomendação ideal para o seu momento.
                </p>
              </div>

              {/* 5 Selectable Options */}
              <div className="space-y-1.5">
                {scenarios.map((item) => {
                  const Icon = item.icon;
                  const isSelected = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer",
                        isSelected
                          ? "bg-[#0E3D36] text-white border-[#0E3D36] shadow-sm font-bold"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 font-medium"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={cn("size-4 shrink-0", isSelected ? "text-emerald-300" : "text-[#0E3D36]")} />
                        <span>{item.label}</span>
                      </div>
                      {isSelected ? (
                        <span className="size-4 rounded-full bg-white text-[#0E3D36] flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Recommendation Card */}
              <div className="rounded-2xl bg-[#EAF3EF] p-3.5 border border-emerald-900/10 text-center space-y-1 mt-3">
                <div className="size-8 rounded-full bg-[#0E3D36] text-white flex items-center justify-center mx-auto shadow-xs">
                  <Target className="size-4 text-[#E07A5F]" />
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#0E3D36]">
                  Recomendação para você
                </p>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  {selectedScenario.recommendation.replace(selectedScenario.highlight, "")}
                  <span className="text-[#E07A5F]">{selectedScenario.highlight}</span>
                </p>
              </div>
            </div>

            {/* Bottom Tab Bar */}
            <div className="border-t border-slate-200/60 px-4 py-2 flex items-center justify-between text-[9px] text-slate-500 font-medium bg-white">
              <div className="flex flex-col items-center gap-0.5 text-[#0E3D36]">
                <Home className="size-3.5" />
                <span>Início</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Users className="size-3.5" />
                <span>Clientes</span>
              </div>
              <div className="size-7 rounded-full bg-[#0E3D36] text-white flex items-center justify-center -mt-2 shadow-xs">
                <Plus className="size-4" />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Calendar className="size-3.5" />
                <span>Agenda</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Menu className="size-3.5" />
                <span>Mais</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
