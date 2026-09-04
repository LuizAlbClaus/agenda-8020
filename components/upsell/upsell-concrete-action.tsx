"use client";

import { useState } from "react";
import { Users, Clock, Copy, Check, Sparkles, CheckCircle2 } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

export function UpsellConcreteAction() {
  const [copied, setCopied] = useState(false);

  const messageText =
    "Oi! Estou aprendendo Soft Gel e começando uma nova fase profissional. Em breve vou abrir alguns horários. Posso te contar quando estiver pronta?";

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(messageText);
    }
    setCopied(true);
    trackFunnelEvent("demo_script_copied", { scriptType: "first_concrete_action" });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="bg-[#FBF9F5] py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Brand mark header */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <CheckCircle2 className="size-4 text-[#3D7164]" />
          <span className="text-sm font-bold text-[#0C2A26]">agenda</span>
          <span className="text-sm font-bold text-[#D4A373]">80/20</span>
        </div>

        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4A373]/30 bg-[#D4A373]/10 text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-2">
          <span>Seção 6</span>
          <Sparkles className="size-2.5 text-[#D4A373]" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-[1.2]">
          UMA ORIENTAÇÃO PRÁTICA PARA COMEÇAR HOJE
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-sm sm:text-base text-[#3D5650] font-medium">
          Uma próxima ação pequena.{" "}
          <span className="relative inline-block font-bold text-[#0C2A26]">
            Um passo mais claro.
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E07A5F]" />
          </span>
        </p>

        {/* Action Header Pill Bar */}
        <div className="mt-6 rounded-2xl bg-white border border-[#0C2A26]/10 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0">
              <Users className="size-4.5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#0C2A26]">
              Avise pessoas próximas que você está começando uma nova fase.
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-[#E8F2EE] px-3 py-1 text-xs font-bold text-[#3D7164] shrink-0">
            <Clock className="size-3" />
            <span>10 minutos</span>
          </div>
        </div>

        {/* Visual Mockup & Side Stepper (Flex container) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* Phone Mockup with WhatsApp Message */}
          <div className="w-full sm:w-[280px] rounded-[36px] bg-slate-900 p-2.5 shadow-2xl ring-1 ring-slate-800 shrink-0 text-left">
            <div className="rounded-[28px] bg-[#0E3D36] p-4 text-white overflow-hidden flex flex-col justify-between min-h-[380px]">
              {/* Phone Top Status */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-[#A8C5BD] mb-4">
                  <span>9:41</span>
                  <div className="w-14 h-3 bg-black/60 rounded-full" />
                  <span>5G</span>
                </div>

                {/* Card Title */}
                <div className="text-center">
                  <Sparkles className="size-3 text-[#D4A373] mx-auto mb-1" />
                  <p className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest">
                    Seu próximo movimento
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-white leading-tight mt-0.5">
                    Avise pessoas próximas que você está começando.
                  </p>
                  <div className="w-8 h-0.5 bg-[#D4A373] rounded-full mx-auto my-2" />
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="mt-4 rounded-2xl bg-[#DCF8C6]/90 p-3 text-slate-800 shadow-sm border border-emerald-300/40 relative">
                  <p className="text-[11px] sm:text-xs leading-relaxed text-slate-900 font-medium">
                    &ldquo;{messageText}&rdquo;
                  </p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-500 font-mono">
                    <span>09:41</span>
                    <span className="text-sky-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Copy Message Button */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full min-h-[48px] rounded-xl bg-[#0C2A26] hover:bg-[#071916] text-white text-xs font-bold py-3 px-4 flex items-center justify-center gap-2 border border-white/20 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="size-4 text-emerald-400 stroke-[3]" />
                      <span className="text-emerald-300">Mensagem copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 text-[#D4A373]" />
                      <span>COPIAR MENSAGEM</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Side Coral Step Card */}
          <div className="w-full sm:w-[220px] rounded-3xl bg-[#E07A5F] p-5 text-white shadow-md text-left flex flex-col justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Clock className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight uppercase tracking-wider">
                    Faça em 10 minutos
                  </p>
                </div>
              </div>

              {/* Steps with vertical dots */}
              <div className="relative space-y-4 text-xs font-medium pl-2">
                <div className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-white text-[#E07A5F] flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <span className="leading-snug">Escolha 3 pessoas</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-white text-[#E07A5F] flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <span className="leading-snug">Envie a mensagem</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-white text-[#E07A5F] flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <span className="leading-snug">Anote quem respondeu</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-white/20">
              <a
                href="#oferta"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-white underline underline-offset-2 hover:opacity-90"
              >
                Quero ver mais ações como essa →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
