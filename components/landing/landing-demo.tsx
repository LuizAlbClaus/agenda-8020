"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Copy,
  HelpCircle,
  Lock,
  MessageSquare,
  Sparkles,
  Target,
  Users,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

const demoOptions = [
  {
    id: "reabrir",
    icon: Users,
    label: "Reabra uma conversa com duas clientes que já tiveram uma boa experiência",
    duration: "10 minutos",
    whyNow: "Clientes satisfeitas são suas melhores fontes de novos serviços, indicações e recorrência.",
    steps: [
      "Vamos identificar duas clientes que já tiveram uma boa experiência com seu trabalho.",
      "Você vai enviar uma mensagem curta e personalizada usando o modelo sugerido.",
      "Elas respondem, você retoma o relacionamento e abre espaço para um novo atendimento.",
    ],
    whatsappScript:
      "Oi, [cliente]! Tudo bem? Lembrei de você e de como foi especial trabalhar juntas da última vez. ✨\n\nQuero te contar que estou com novidades e agenda aberta para [serviço que você oferece].\n\nPosso te mostrar?",
  },
  {
    id: "preencher",
    icon: Calendar,
    label: "Preencha minha agenda com novos atendimentos",
    duration: "15 minutos",
    whyNow: "Antecipar a semana elimina o estresse do dia a dia e garante faturamento previsível.",
    steps: [
      "Identifique os horários que você mais quer preencher nesta semana.",
      "Selecione 3 contatos de alto potencial para um convite direto.",
      "Dispare a proposta e confirme as marcações na hora.",
    ],
    whatsappScript:
      "Oi, [cliente]! Estou finalizando a escala da semana e separei duas opções de horários especiais. Quer aproveitar um deles?",
  },
  {
    id: "orcamentos",
    icon: MessageSquare,
    label: "Transforme orçamentos em serviços contratados",
    duration: "8 minutos",
    whyNow: "Quem pediu orçamento tem interesse quente, mas esfria se não houver um retorno no momento certo.",
    steps: [
      "Localize os orçamentos enviados nos últimos 5 dias sem resposta.",
      "Envie uma mensagem curta quebrando a objeção principal.",
      "Conduza a conversa para a confirmação de data.",
    ],
    whatsappScript:
      "Oi, [cliente]! Passando rapidinho para saber se ficou alguma dúvida sobre o orçamento que te passei. Posso te ajudar a encaixar um horário?",
  },
  {
    id: "semana",
    icon: Target,
    label: "Organize minha semana com foco no que dá resultado",
    duration: "12 minutos",
    whyNow: "Ter clareza do objetivo da semana economiza horas de indecisão e evita esforço desperdiçado.",
    steps: [
      "Defina a sua única prioridade comercial da semana.",
      "Bloqueie horários de atendimento e reserve 15 minutos para prospecção.",
      "Execute as micro-tarefas sugeridas com tranquilidade.",
    ],
    whatsappScript:
      "Olá! Minha agenda da semana está aberta com foco especial em novos atendimentos. Vamos agendar seu momento?",
  },
];

export function LandingDemo() {
  const [selectedId, setSelectedId] = useState("reabrir");
  const [copied, setCopied] = useState(false);

  const active = demoOptions.find((o) => o.id === selectedId) ?? demoOptions[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(active.whatsappScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      {/* Badge: SEÇÃO 5 — DEMONSTRAÇÃO */}
      <div className="flex justify-center px-4 mb-3">
        <span className="inline-flex items-center rounded-full border border-[#E07A5F]/40 bg-white/60 px-4 py-1 text-xs font-bold text-[#E07A5F] tracking-wide">
          SEÇÃO 5 — DEMONSTRAÇÃO
        </span>
      </div>

      {/* Headline */}
      <div className="text-center px-4 mb-10 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.18]">
          Veja como seriam seus primeiros minutos no{" "}
          <span className="text-[#4E7A6E]">Agenda 80/20.</span>
        </h2>
      </div>

      {/* 2-Column Desktop / Stacked Mobile */}
      <div className="max-w-4xl mx-auto px-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        {/* Left Column: Selector & WhatsApp Message */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full border border-slate-300 flex items-center justify-center text-slate-600">
                <HelpCircle className="size-3.5" />
              </div>
              <p className="text-sm font-bold text-[#0C2A26]">
                Qual dessas situações mais parece com você?
              </p>
            </div>

            {/* 4 Cards Selector */}
            <div className="space-y-2.5">
              {demoOptions.map((item) => {
                const Icon = item.icon;
                const isSelected = item.id === selectedId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer",
                      isSelected
                        ? "bg-[#0E3D36] text-white border-[#0E3D36] shadow-sm"
                        : "bg-white text-slate-800 border-slate-200/80 hover:border-slate-300"
                    )}
                  >
                    <div
                      className={cn(
                        "size-9 rounded-full flex items-center justify-center shrink-0",
                        isSelected ? "bg-emerald-800 text-white" : "bg-emerald-50 text-[#0E3D36]"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold leading-snug">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WhatsApp Chat Bubble */}
          <div className="relative pt-2">
            <div className="relative rounded-2xl rounded-tl-xs bg-[#DCF7C5] p-4 text-slate-900 shadow-sm max-w-sm border border-emerald-300/40">
              <p className="text-xs whitespace-pre-line leading-relaxed font-sans text-slate-800">
                {active.whatsappScript}
              </p>
              <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-slate-500 font-medium">
                <span>09:41</span>
                <CheckCheck className="size-3.5 text-sky-600" />
              </div>
            </div>

            {/* Handwritten Note Annotation */}
            <div className="mt-2 text-center max-w-xs">
              <span className="text-xs font-serif italic text-[#3B6F63]">
                Mensagem pronta para enviar
              </span>
              <div className="w-16 h-0.5 border-b border-dashed border-[#3B6F63] mx-auto mt-0.5" />
            </div>
          </div>
        </div>

        {/* Right Column: Phone Mockup with Step by Step Execution */}
        <div className="flex justify-center">
          <div className="w-full max-w-[340px] sm:max-w-[365px] rounded-[44px] bg-slate-900 p-2.5 sm:p-3 shadow-2xl ring-1 ring-slate-800">
            <div className="rounded-[36px] bg-[#0E3D36] overflow-hidden text-left text-white border border-slate-200/20 flex flex-col">
              {/* Status Bar */}
              <div className="pt-2.5 pb-1 px-6 flex items-center justify-between text-[11px] font-bold text-emerald-100">
                <span>9:41</span>
                <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-1.5 gap-1">
                  <div className="size-1.5 rounded-full bg-slate-800" />
                  <div className="size-2 rounded-full bg-blue-950/40" />
                </div>
                <div className="flex items-center gap-1.5 text-emerald-200">
                  <Wifi className="size-3" />
                  <div className="w-4 h-2 border border-emerald-200 rounded-xs flex items-center p-0.5">
                    <div className="w-2.5 h-1 bg-emerald-200 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Screen Content */}
              <div className="p-4 space-y-3.5">
                {/* Top Nav inside phone */}
                <div className="flex items-center justify-between">
                  <ArrowLeft className="size-4 text-emerald-200" />
                  <div className="size-7 rounded-full bg-emerald-700/50 flex items-center justify-center text-emerald-100">
                    <Check className="size-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {active.label}
                </h3>

                {/* Time Tag */}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-800/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                  <Clock className="size-3" />
                  <span>{active.duration}</span>
                </span>

                {/* Main Instruction Card (White) */}
                <div className="rounded-2xl bg-white p-3.5 text-slate-800 space-y-3 shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#0E3D36] flex items-center gap-1">
                      <Sparkles className="size-3 text-[#E07A5F]" />
                      Por que agora?
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {active.whyNow}
                    </p>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* 3 Numbered Steps */}
                  <div className="space-y-2">
                    {active.steps.map((st, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <span className="size-4 rounded-full bg-[#0E3D36] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{st}</span>
                      </div>
                    ))}
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 bg-[#0E3D36] hover:bg-[#0A2E29] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-300" />
                        <span>Mensagem copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copiar mensagem</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="pb-2 pt-1 flex justify-center">
                <div className="w-28 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Banner */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="rounded-2xl bg-[#082420] text-white p-4 sm:p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full border border-[#D4A373]/60 bg-[#0E3D36] flex items-center justify-center text-[#D4A373] shrink-0">
              <Lock className="size-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                Simples, rápido e estratégico.
              </p>
              <p className="text-[11px] sm:text-xs text-[#7FA898]">
                Feito para quem vive da própria agenda.
              </p>
            </div>
          </div>
          <Sparkles className="size-5 text-[#D4A373] shrink-0" />
        </div>
      </div>
    </section>
  );
}
