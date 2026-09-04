"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    question: "Serve para quem ainda não tem clientes?",
    answer:
      "Sim. Se você está começando, o sistema identifica que sua prioridade não é retenção, e sim construir sua primeira prova social e atrair clientes iniciais sem complicação.",
  },
  {
    question: "Preciso usar Instagram?",
    answer:
      "Não necessariamente. O Agenda 80/20 foca nos canais mais diretos e de maior conversão para o seu momento, como contatos anteriores, indicações ativas e conversas de WhatsApp.",
  },
  {
    question: "Ele manda mensagens automaticamente?",
    answer:
      "Não, e isso é intencional. O sistema entrega mensagens prontas e personalizadas para você copiar e enviar pelo seu próprio WhatsApp, mantendo o toque humano que gera confiança.",
  },
  {
    question: "Preciso usar o Belevy?",
    answer:
      "Não. O Agenda 80/20 funciona de forma 100% independente para você gerar caixa e organizar suas ações. O Belevy é apenas uma opção futura para quem quiser expandir gestão de agendamentos.",
  },
];

export function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="relative pt-12 pb-16 overflow-hidden text-center">
      {/* Editorial Serif Headline */}
      <div className="px-4 mb-3 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#0C2A26] leading-[1.18]">
          Ainda ficou com alguma dúvida?
        </h2>
      </div>

      {/* Gold Horizontal Bar */}
      <div className="w-16 h-1 bg-[#D4A373] rounded-full mx-auto mb-10" />

      {/* Accordion Container */}
      <div className="max-w-md mx-auto px-4 space-y-3 text-left">
        {faqItems.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-4.5 cursor-pointer text-left gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-[#082420] text-white flex items-center justify-center shrink-0 text-sm font-bold">
                    ?
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#0C2A26] leading-snug">
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 text-slate-500 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pl-14">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
