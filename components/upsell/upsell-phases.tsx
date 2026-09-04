import { Sprout, Hand, MessageSquare, RotateCcw, Sparkles, Check } from "lucide-react";

export function UpsellPhases() {
  return (
    <section className="bg-[#FBF9F5] py-14 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#4E7A6E]/40 bg-[#E8F2EE] text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-3">
          <span className="font-mono text-[10px] bg-[#0C2A26] text-white px-1.5 py-0.5 rounded-sm">04</span>
          <span>Acompanha cada fase</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-[1.2]">
          VOCÊ COMEÇA AGORA.
          <span className="block text-[#3D7164]">O AGENDA ACOMPANHA CADA FASE.</span>
        </h2>

        {/* Sparkle Divider */}
        <div className="flex items-center justify-center gap-3 my-4">
          <div className="w-8 h-px bg-[#D4A373]/60" />
          <Sparkles className="size-3 text-[#D4A373]" />
          <div className="w-8 h-px bg-[#D4A373]/60" />
        </div>

        {/* Vertical Timeline Structure */}
        <div className="relative mt-8 pl-8 sm:pl-10 text-left space-y-4">
          {/* Vertical Connecting Line */}
          <div className="absolute left-3.5 sm:left-4 top-4 bottom-4 w-0.5 bg-[#0C2A26]/30" />

          {/* Phase 1: Em Destaque (Ainda estou aprendendo) */}
          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-8 sm:-left-10 top-6 size-7 rounded-full border-2 border-[#E07A5F] bg-[#FBF9F5] flex items-center justify-center">
              <div className="size-3 rounded-full bg-[#E07A5F]" />
            </div>

            {/* Featured Card */}
            <div className="rounded-3xl border-2 border-[#E07A5F] bg-[#FFF9F7] p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="size-12 rounded-2xl bg-[#FEECE6] flex items-center justify-center text-[#E07A5F] shrink-0">
                    <Sprout className="size-6 text-[#E07A5F]" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#E07A5F] uppercase tracking-wide">
                      Ainda estou aprendendo
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#0C2A26]">
                      <Sparkles className="size-3 text-[#D4A373]" />
                      <span>Recomendação para você:</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#E07A5F] mt-0.5">
                      prepare sua primeira prova
                    </p>
                  </div>
                </div>

                {/* Mini Phone Preview */}
                <div className="w-full sm:w-[170px] rounded-xl bg-white border border-[#E07A5F]/20 p-2.5 shadow-xs shrink-0 text-slate-800">
                  <p className="text-[9px] font-bold text-[#0C2A26]">Agenda 80/20</p>
                  <p className="text-[8px] text-slate-400">Recomendação para você</p>
                  <div className="mt-1.5 rounded-md bg-[#FAF8F5] p-1.5 border border-slate-100 flex items-center gap-1.5">
                    <Sprout className="size-3 text-[#E07A5F] shrink-0" />
                    <span className="text-[9px] font-bold text-[#0C2A26] leading-tight">Prepare sua primeira prova</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[8px] text-emerald-800 font-medium">
                    <Check className="size-2.5 text-emerald-600" />
                    <span>Praticar técnica por 30m</span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[8px] text-slate-500">
                    <span>Disponível hoje</span>
                    <span className="font-bold text-[#0C2A26]">1h 30m</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-0.5 overflow-hidden">
                    <div className="w-2/3 h-full bg-[#3D7164] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2: Estou Praticando */}
          <div className="relative">
            <div className="absolute -left-8 sm:-left-10 top-5 size-7 rounded-full border-2 border-[#3D7164] bg-[#FBF9F5] flex items-center justify-center">
              <div className="size-2.5 rounded-full bg-[#3D7164]" />
            </div>

            <div className="rounded-2xl border border-[#0C2A26]/10 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0">
                  <Hand className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0C2A26] uppercase tracking-wide">
                    Estou praticando
                  </h3>
                  <p className="text-xs text-[#3D5650] mt-0.5">
                    <span className="text-[#D4A373] font-bold">✦ Recomendação:</span> registre e mostre seu trabalho
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3: Procurando Minhas Primeiras Clientes */}
          <div className="relative">
            <div className="absolute -left-8 sm:-left-10 top-5 size-7 rounded-full border-2 border-[#3D7164] bg-[#FBF9F5] flex items-center justify-center">
              <div className="size-2.5 rounded-full bg-[#3D7164]" />
            </div>

            <div className="rounded-2xl border border-[#0C2A26]/10 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0C2A26] uppercase tracking-wide">
                    Procurando minhas primeiras clientes
                  </h3>
                  <p className="text-xs text-[#3D5650] mt-0.5">
                    <span className="text-[#D4A373] font-bold">✦ Recomendação:</span> ative sua rede próxima
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 4: Quero Que Elas Voltem */}
          <div className="relative">
            <div className="absolute -left-8 sm:-left-10 top-5 size-7 rounded-full border-2 border-[#3D7164] bg-[#FBF9F5] flex items-center justify-center">
              <div className="size-2.5 rounded-full bg-[#3D7164]" />
            </div>

            <div className="rounded-2xl border border-[#0C2A26]/10 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0">
                  <RotateCcw className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0C2A26] uppercase tracking-wide">
                    Quero que elas voltem
                  </h3>
                  <p className="text-xs text-[#3D5650] mt-0.5">
                    <span className="text-[#D4A373] font-bold">✦ Recomendação:</span> retome o contato no momento certo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 rounded-2xl bg-[#0C2A26] p-4 text-white flex items-center justify-center gap-3 shadow-sm">
          <Sparkles className="size-4 text-[#D4A373] shrink-0" />
          <div className="w-px h-5 bg-[#4E7A6E]" />
          <p className="text-xs sm:text-sm font-medium text-[#E8F2EE]">
            Seu próximo movimento <strong className="text-[#D4A373]">muda conforme o seu momento</strong>.
          </p>
        </div>

        <p className="mt-6 text-xs sm:text-sm text-[#3D5650] max-w-md mx-auto italic">
          &ldquo;Você não começa a usar o Agenda 80/20 porque já tem clientes. Você começa a usar porque está construindo o caminho para tê-los.&rdquo;
        </p>
      </div>
    </section>
  );
}
