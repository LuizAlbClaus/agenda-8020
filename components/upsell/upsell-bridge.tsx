import Image from "next/image";
import { Sparkles, ArrowDown, CheckCircle2, Clock, Lightbulb, ArrowRight, Send, Check } from "lucide-react";

export function UpsellBridge() {
  return (
    <section className="bg-[#FBF9F5] py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Sparkle Accent */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-px bg-[#D4A373]/60" />
          <Sparkles className="size-3.5 text-[#D4A373]" />
          <div className="w-8 h-px bg-[#D4A373]/60" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0C2A26] leading-[1.15]">
          DOIS PASSOS.
          <span className="block text-[#3D7164]">UM CAMINHO MAIS CLARO.</span>
        </h2>

        {/* 01 • Card: Soft Gel Express */}
        <div className="mt-10 rounded-3xl bg-white border border-[#0C2A26]/10 p-5 sm:p-6 shadow-[var(--shadow-card-elevated)] text-left flex flex-col sm:flex-row items-center gap-6">
          <div className="w-full sm:w-1/2 flex flex-col justify-between">
            <div>
              {/* SGE Brand Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="size-9 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#0C2A26] font-serif font-bold text-lg border border-[#4E7A6E]/30">
                  S
                </div>
                <div>
                  <p className="text-base font-serif font-bold text-[#0C2A26] leading-tight">
                    Soft Gel Express
                  </p>
                </div>
              </div>

              <div className="w-10 h-0.5 bg-[#D4A373] rounded-full mb-3" />

              <p className="text-sm text-[#3D5650] font-medium leading-snug mb-4">
                O <strong>Soft Gel Express</strong> ensina o que fazer nas unhas.
              </p>

              {/* Steps list */}
              <ul className="space-y-2.5 text-xs text-[#0C2A26] font-medium">
                <li className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#3D7164]">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <span>preparar</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#3D7164]">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <span>aplicar</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#3D7164]">
                    <Sparkles className="size-3 text-[#D4A373]" />
                  </div>
                  <span>evoluir</span>
                </li>
              </ul>
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#0C2A26] px-3 py-1.5 text-[11px] font-bold text-white uppercase tracking-wider">
                <CheckCircle2 className="size-3 text-[#D4A373]" />
                Aprender a técnica
              </span>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full sm:w-1/2 h-[220px] rounded-2xl overflow-hidden bg-slate-100 shrink-0">
            <Image
              src="/media/agenda8020/upsell/softgel-nails-hero.jpg"
              alt="Unhas com aplicação de Soft Gel"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 250px"
            />
          </div>
        </div>

        {/* Connecting Downward Arrow */}
        <div className="flex justify-center my-4">
          <div className="size-10 rounded-full bg-[#D4A373] text-white flex items-center justify-center shadow-md">
            <ArrowDown className="size-5 stroke-[2.5]" />
          </div>
        </div>

        {/* 02 • Card: Agenda 80/20 */}
        <div className="rounded-3xl bg-[#0C2A26] border border-white/10 p-5 sm:p-6 shadow-2xl text-left flex flex-col sm:flex-row items-center gap-6 text-white">
          <div className="w-full sm:w-1/2 flex flex-col justify-between">
            <div>
              {/* Brand */}
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="size-4 text-[#3D7164]" />
                <span className="text-base font-bold text-white">agenda</span>
                <span className="text-base font-bold text-[#D4A373]">80/20</span>
              </div>

              <div className="w-10 h-0.5 bg-[#D4A373] rounded-full mb-3" />

              <p className="text-sm text-[#E8F2EE] font-medium leading-relaxed mb-6">
                O <strong>Agenda 80/20</strong> ajuda você a decidir o que fazer pelo seu negócio.
              </p>

              {/* Callout */}
              <div className="flex items-start gap-2.5 rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="size-7 rounded-full bg-[#E07A5F]/20 flex items-center justify-center text-[#E07A5F] shrink-0 mt-0.5">
                  <Send className="size-3.5" />
                </div>
                <p className="text-xs text-[#E8F2EE] leading-snug">
                  Depois da técnica, vem o{" "}
                  <span className="relative inline-block font-bold text-[#E07A5F]">
                    próximo movimento.
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E07A5F]" />
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Phone Mockup */}
          <div className="w-full sm:w-1/2 rounded-[28px] bg-slate-900 p-2 shadow-xl ring-1 ring-slate-800 text-slate-900">
            <div className="rounded-[22px] bg-[#FAF8F5] p-3 text-left overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 pb-1 border-b border-slate-200">
                <span className="font-bold text-slate-800">Hoje</span>
                <span className="text-[9px]">Sexta-feira, 16 de maio</span>
              </div>

              <div className="rounded-xl bg-[#0E3D36] p-2.5 text-white shadow-xs">
                <p className="text-[10px] font-bold text-[#E8F2EE]">Seu próximo movimento</p>
                <div className="mt-1.5 rounded-lg bg-white p-2 text-slate-900">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">Ação sugerida</span>
                  <p className="text-[10px] font-bold text-[#0C2A26] leading-tight mt-0.5">
                    Reative algumas clientes que já tiveram contato com seu serviço.
                  </p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-semibold text-[#E07A5F] bg-[#FEECE6] px-1.5 py-0.5 rounded-full">
                      <Clock className="size-2" /> 10 min
                    </span>
                  </div>
                </div>

                <div className="mt-2 w-full bg-[#E07A5F] text-white text-[9px] font-bold py-1.5 rounded-md flex items-center justify-center gap-1">
                  <span>Fazer essa ação</span>
                  <ArrowRight className="size-2.5" />
                </div>
              </div>

              <div className="mt-2 rounded-xl bg-[#E8F2EE] p-2 text-[#0C2A26] border border-[#0E3D36]/10">
                <div className="flex items-center gap-1 text-[9px] font-bold text-[#0E3D36]">
                  <Lightbulb className="size-2.5 text-[#E07A5F]" />
                  <span>Por que agora?</span>
                </div>
                <p className="text-[9px] text-[#2C4A43] leading-tight mt-0.5">
                  Essas clientes já demonstraram interesse antes. Um novo contato fecha com menos esforço.
                </p>
                <p className="text-[8px] font-bold text-[#0E3D36] underline mt-1">
                  É sobre foco, não sobre sorte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
