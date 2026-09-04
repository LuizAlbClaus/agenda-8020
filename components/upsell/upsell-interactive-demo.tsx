"use client";

import { useState } from "react";
import { Sparkles, GraduationCap, Paintbrush, User, Users, CalendarCheck, Check, Target, Clock, ArrowRight, Lightbulb } from "lucide-react";
import { DEMO_PHASES, type DemoPhase } from "./upsell-types";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellInteractiveDemoProps {
  checkoutUrl?: string;
}

export function UpsellInteractiveDemo({ checkoutUrl = "#oferta" }: UpsellInteractiveDemoProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>("learning");

  const currentPhase: DemoPhase =
    DEMO_PHASES.find((p) => p.id === selectedPhaseId) ?? DEMO_PHASES[0];

  const handleSelect = (phaseId: string) => {
    setSelectedPhaseId(phaseId);
    trackFunnelEvent("upsell_demo_interaction", { phaseId });
  };

  const iconsMap: Record<string, typeof GraduationCap> = {
    learning: GraduationCap,
    practicing: Paintbrush,
    seeking_clients: User,
    has_some_clients: Users,
    irregular_schedule: CalendarCheck,
  };

  return (
    <section className="bg-[#FBF9F5] py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4A373]/40 bg-[#D4A373]/10 text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="size-3 text-[#D4A373]" />
          <span>Se você entrasse agora</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-[1.2]">
          O AGENDA COMEÇARIA
          <span className="block text-[#3D7164]">PELO SEU MOMENTO.</span>
        </h2>

        {/* Sparkle Divider */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="w-8 h-px bg-[#D4A373]/60" />
          <Sparkles className="size-3 text-[#D4A373]" />
          <div className="w-8 h-px bg-[#D4A373]/60" />
        </div>

        {/* Interactive Phone Mockup */}
        <div className="relative mt-8 max-w-[375px] mx-auto rounded-[42px] bg-slate-900 p-3 shadow-2xl ring-1 ring-slate-800 text-slate-900 text-left">
          {/* Side Floating Badge (Visible on desktop/tablet) */}
          <div className="hidden md:flex absolute -left-44 top-28 w-36 rounded-2xl bg-white border border-[#0C2A26]/10 p-3 shadow-md text-left text-xs text-[#0C2A26]">
            <p className="font-semibold leading-snug">
              <span className="text-[#D4A373] font-bold">✦</span> Você não recebe uma lista igual à de todo mundo.
            </p>
          </div>

          {/* Inner Phone Screen */}
          <div className="rounded-[34px] bg-[#FAF8F5] overflow-hidden border border-slate-200/70 flex flex-col">
            {/* Status Bar */}
            <div className="pt-2.5 pb-1 px-5 flex items-center justify-between text-[10px] font-bold text-slate-800">
              <span>9:41</span>
              <div className="w-18 h-3.5 bg-black rounded-full" />
              <div className="flex items-center gap-1 text-[9px] text-slate-700">
                <span>5G</span>
              </div>
            </div>

            {/* App Header */}
            <div className="px-4 py-2 flex items-center justify-between border-b border-slate-200/50 bg-white">
              <div className="flex items-center gap-1.5">
                <div className="size-5 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#0C2A26]">
                  <Check className="size-3 text-[#3D7164] stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-[#0C2A26] uppercase tracking-wider">
                  Agenda 80/20
                </span>
              </div>
              <Sparkles className="size-4 text-[#D4A373]" />
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0C2A26] leading-snug">
                  Em que situação você está?
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                  Selecione uma opção e veja a recomendação ideal para você:
                </p>
              </div>

              {/* 5 Selectable Options */}
              <div className="space-y-2">
                {DEMO_PHASES.map((phase) => {
                  const Icon = iconsMap[phase.id] || GraduationCap;
                  const isSelected = selectedPhaseId === phase.id;

                  return (
                    <button
                      key={phase.id}
                      type="button"
                      onClick={() => handleSelect(phase.id)}
                      className={`w-full min-h-[48px] px-3 py-2.5 rounded-xl text-left font-bold text-[11px] sm:text-xs transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#0C2A26] text-white border-2 border-[#E07A5F] shadow-sm scale-[1.01]"
                          : "bg-white text-[#0C2A26] border border-slate-200/80 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`size-4 ${isSelected ? "text-[#E07A5F]" : "text-[#3D7164]"}`} />
                        <span className="uppercase tracking-tight">{phase.label}</span>
                      </div>
                      {isSelected && (
                        <div className="size-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Recommendation Card (Bottom of the phone screen) */}
              <div className="mt-4 rounded-2xl bg-[#E8F2EE] border border-[#3D7164]/20 p-3.5 text-center text-[#0C2A26] transition-all">
                <div className="size-8 rounded-full bg-white flex items-center justify-center mx-auto shadow-2xs text-[#0C2A26]">
                  <Target className="size-4 text-[#0C2A26]" />
                </div>

                <p className="mt-1.5 text-[9px] font-extrabold uppercase tracking-widest text-[#3D7164]">
                  Recomendação para você
                </p>

                <div className="w-8 h-0.5 bg-[#D4A373] rounded-full mx-auto my-1" />

                <h4 className="text-xs sm:text-sm font-black text-[#0C2A26] leading-tight">
                  {currentPhase.actionTitle}
                </h4>

                <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#FEECE6] px-2 py-0.5 text-[10px] font-bold text-[#E07A5F]">
                  <Clock className="size-2.5" />
                  <span>{currentPhase.durationMinutes} min</span>
                </div>

                {/* Por que agora? */}
                <div className="mt-2.5 rounded-xl bg-white p-2.5 text-left border border-slate-200/60 text-[10px]">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-[#0C2A26] uppercase">
                    <Lightbulb className="size-2.5 text-[#E07A5F]" />
                    <span>Por que agora?</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    {currentPhase.whyNow}
                  </p>
                </div>

                {/* Micro Steps */}
                <div className="mt-2 space-y-1 text-left text-[9px] text-[#0C2A26] font-medium">
                  {currentPhase.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="size-3.5 rounded-full bg-[#0C2A26] text-white flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-tight">{step}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={checkoutUrl}
                  className="mt-3 w-full bg-[#E07A5F] hover:bg-[#D36A4F] text-white text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Fazer essa ação</span>
                  <ArrowRight className="size-3" />
                </a>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="py-2 flex justify-center bg-white border-t border-slate-100">
              <div className="w-24 h-1 bg-slate-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
