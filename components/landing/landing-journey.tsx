"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Calendar,
  Check,
  Headphones,
  Menu,
  Play,
  Sparkles,
  Wifi,
} from "lucide-react";
import { EditorialUnderline } from "./editorial-highlight";
import { cn } from "@/lib/utils";

const journeySteps = [
  {
    num: "1",
    label: "Não sei o que priorizar",
    highlight: "",
    icon: (
      <div className="size-11 sm:size-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
        <span className="text-lg">🌀</span>
      </div>
    ),
  },
  {
    num: "2",
    label: "Agenda identifica um próximo movimento",
    highlight: "próximo movimento",
    icon: (
      <div className="size-11 sm:size-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0E3D36]">
        <Sparkles className="size-5" />
      </div>
    ),
  },
  {
    num: "3",
    label: "Você executa",
    highlight: "executa",
    icon: (
      <div className="size-11 sm:size-12 rounded-full bg-emerald-700 text-white flex items-center justify-center">
        <Play className="size-5 fill-white" />
      </div>
    ),
  },
  {
    num: "4",
    label: "Copiloto pode apoiar",
    highlight: "",
    icon: (
      <div className="size-11 sm:size-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#E07A5F]">
        <Headphones className="size-5" />
      </div>
    ),
  },
  {
    num: "5",
    label: "Cliente encontra um horário",
    highlight: "horário",
    icon: (
      <div className="size-11 sm:size-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#0E3D36]">
        <Calendar className="size-5" />
      </div>
    ),
  },
];

const days = [
  { day: "Qui", date: "22" },
  { day: "Sex", date: "23" },
  { day: "Seg", date: "26" },
  { day: "Ter", date: "27" },
  { day: "Qua", date: "28" },
];

const times = ["09:00", "10:30", "14:00", "15:30", "17:00", "18:30"];

export function LandingJourney() {
  const [selectedDay, setSelectedDay] = useState("22");
  const [selectedTime, setSelectedTime] = useState("10:30");

  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      {/* Badge: 7. JORNADA COMPLETA */}
      <div className="flex justify-start sm:justify-center px-4 mb-3">
        <span className="inline-flex items-center rounded-full bg-[#0E3D36] text-white px-4 py-1 text-xs font-bold tracking-wide">
          7. JORNADA COMPLETA
        </span>
      </div>

      {/* Headline */}
      <div className="text-left sm:text-center px-4 mb-10 max-w-xl sm:mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.18]">
          Do ‘não sei o que fazer’ até o{" "}
          <span className="text-[#1B5E4F]">
            <EditorialUnderline color="coral">horário marcado.</EditorialUnderline>
          </span>
        </h2>
      </div>

      {/* Main Grid: Journey Timeline (Left) + Phone Booking Mockup (Right) */}
      <div className="max-w-4xl mx-auto px-4 grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        {/* Left: 5 Timeline Steps */}
        <div className="relative pl-3 space-y-6 sm:space-y-7">
          <div className="absolute left-8 top-6 bottom-8 w-0.5 bg-[#0E3D36]/20" />

          {journeySteps.map((step, idx) => (
            <div key={idx} className="relative flex items-center gap-4 z-10">
              <div className="shrink-0">{step.icon}</div>
              <div className="flex items-center gap-2">
                <span className="size-5 rounded-full bg-[#0E3D36] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {step.num}
                </span>
                <p className="text-sm sm:text-base font-bold text-[#0C2A26] leading-snug">
                  {step.label}
                </p>
              </div>
            </div>
          ))}

          {/* End Checkmark Node */}
          <div className="relative flex items-center gap-4 pl-2 z-10">
            <div className="size-8 rounded-full border-2 border-[#D4A373] bg-[#FAF8F5] flex items-center justify-center text-[#D4A373]">
              <Check className="size-4 stroke-[3]" />
            </div>
          </div>

          {/* Bottom Left Brand Watermark */}
          <div className="pt-6 pl-2 hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-[#0E3D36]">
                AGENDA 80/20
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Menos esforço. Mais resultado.</p>
          </div>
        </div>

        {/* Right: Phone Client Booking Experience */}
        <div className="flex justify-center">
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

              {/* App Internal Header with Specialist Avatar */}
              <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-200/50">
                <Menu className="size-4 text-slate-700" />
                <div className="text-center">
                  <span className="text-[10px] font-black tracking-widest text-slate-400 block">
                    AGENDA
                  </span>
                  <span className="text-xs font-black tracking-tight text-[#0C2A26]">80/20</span>
                </div>
                <div className="size-7 rounded-full overflow-hidden border border-slate-300">
                  <Image
                    src="/media/agenda8020/specialist-avatar.png"
                    alt="Especialista"
                    width={28}
                    height={28}
                    className="size-full object-cover"
                  />
                </div>
              </div>

              {/* Booking Body */}
              <div className="p-4 space-y-3.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    Qual o melhor dia e horário?
                  </h3>
                  <p className="text-[10px] text-slate-500">Escolha uma opção disponível.</p>
                </div>

                {/* Day Chips */}
                <div className="grid grid-cols-5 gap-1.5">
                  {days.map((d) => {
                    const isSelected = d.date === selectedDay;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        onClick={() => setSelectedDay(d.date)}
                        className={cn(
                          "py-2 rounded-xl text-center transition-all cursor-pointer",
                          isSelected
                            ? "bg-[#0E3D36] text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200"
                        )}
                      >
                        <span className="text-[9px] block opacity-80">{d.day}</span>
                        <span className="text-xs font-extrabold">{d.date}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {times.map((t) => {
                    const isSelected = t === selectedTime;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={cn(
                          "py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer",
                          isSelected
                            ? "bg-[#256D60] text-white shadow-xs"
                            : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>

                {/* Service Card */}
                <div className="rounded-2xl bg-white p-3 border border-slate-200/80 flex items-center gap-3 shadow-xs">
                  <div className="size-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <Image
                      src="/media/agenda8020/specialist-avatar.png"
                      alt="Especialista"
                      width={40}
                      height={40}
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Sessão Estratégica</p>
                    <p className="text-[10px] text-slate-500">⏱ 60 minutos</p>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  type="button"
                  className="w-full bg-[#256D60] hover:bg-[#1E584D] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirmar horário
                </button>
              </div>

              {/* Bottom Home Indicator */}
              <div className="pb-2 pt-1 flex justify-center">
                <div className="w-28 h-1 bg-slate-300 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
