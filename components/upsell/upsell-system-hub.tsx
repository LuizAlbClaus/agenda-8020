import { Sparkles, Siren, HeartHandshake, Diamond, Flag, CalendarCheck, Target, ArrowRight, Clock, ChevronRight } from "lucide-react";

export function UpsellSystemHub() {
  return (
    <section className="bg-[#FBF9F5] py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Sparkle */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-px bg-[#D4A373]/60" />
          <Sparkles className="size-3.5 text-[#D4A373]" />
          <div className="w-8 h-px bg-[#D4A373]/60" />
        </div>

        {/* Headline */}
        <p className="text-sm font-bold text-[#3D7164] uppercase tracking-wider">
          E quando o problema mudar...
        </p>
        <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-[1.2]">
          VOCÊ NÃO PRECISA DESCOBRIR TUDO SOZINHA.
        </h2>

        {/* Underline */}
        <div className="w-16 h-1 bg-[#E07A5F] rounded-full mx-auto mt-3 mb-10" />

        {/* Hub Diagram & Phone Mockup Grid */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 text-left">
          {/* Left Diagram: Center + Satellites */}
          <div className="w-full sm:max-w-[340px] flex flex-col items-center gap-3">
            {/* Satellite Grid */}
            <div className="grid grid-cols-2 gap-2.5 w-full">
              {/* SOS Copiloto */}
              <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-3 shadow-xs flex flex-col items-center text-center">
                <div className="size-10 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] mb-1.5">
                  <Siren className="size-5 text-[#E07A5F]" />
                </div>
                <p className="text-xs font-bold text-[#0C2A26]">SOS Copiloto</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                  Respostas prontas para quem achou caro ou sumiu
                </p>
              </div>

              {/* Retenção */}
              <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-3 shadow-xs flex flex-col items-center text-center">
                <div className="size-10 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] mb-1.5">
                  <HeartHandshake className="size-5 text-[#3D7164]" />
                </div>
                <p className="text-xs font-bold text-[#0C2A26]">Retenção</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                  Lembrete no momento exato da manutenção
                </p>
              </div>

              {/* Diagnóstico de Valor */}
              <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-3 shadow-xs flex flex-col items-center text-center">
                <div className="size-10 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] mb-1.5">
                  <Diamond className="size-5 text-[#3D7164]" />
                </div>
                <p className="text-xs font-bold text-[#0C2A26]">Diagnóstico de Valor</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                  Fortaleça a percepção e evite dar descontos
                </p>
              </div>

              {/* Missões Práticas */}
              <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-3 shadow-xs flex flex-col items-center text-center">
                <div className="size-10 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] mb-1.5">
                  <Flag className="size-5 text-[#E07A5F]" />
                </div>
                <p className="text-xs font-bold text-[#0C2A26]">Missões Práticas</p>
                <p className="text-[9px] text-slate-500 leading-tight mt-0.5">
                  Micro-ações rápidas para movimentar a semana
                </p>
              </div>
            </div>

            {/* Central Node Card */}
            <div className="w-full rounded-2xl bg-[#0C2A26] border border-white/10 p-4 text-center text-white shadow-md relative overflow-hidden">
              <div className="size-11 rounded-full bg-[#0E3D36] border border-[#D4A373] flex items-center justify-center mx-auto mb-1.5">
                <Target className="size-5 text-[#D4A373]" />
              </div>
              <p className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest">
                Centro do Sistema
              </p>
              <h3 className="text-base font-extrabold text-white">Próximo Movimento</h3>
              <p className="text-[11px] text-[#A8C5BD] leading-tight mt-0.5">
                Quando travar, peça clareza na hora.
              </p>
            </div>

            {/* Bottom Node: Caminho de Agendamento */}
            <div className="w-full rounded-2xl bg-white border border-[#0C2A26]/10 p-3 shadow-xs flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0">
                <CalendarCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0C2A26]">Caminho de agendamento</p>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Envie serviço e horário sem enrolação quando a cliente quiser marcar.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Realistic Phone Mockup */}
          <div className="w-full sm:max-w-[310px] rounded-[38px] bg-slate-900 p-2.5 shadow-2xl ring-1 ring-slate-800 text-slate-900 shrink-0">
            <div className="rounded-[30px] bg-[#FAF8F5] p-3 text-left overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-slate-700 mb-2 pb-1 border-b border-slate-200">
                <span className="font-bold">9:41</span>
                <span className="text-[9px] text-[#0C2A26] font-bold">agenda 80/20</span>
              </div>

              {/* Recommendation Card */}
              <div className="rounded-xl bg-white p-3 border border-slate-200 shadow-xs">
                <div className="flex items-center gap-1 text-[9px] font-bold text-[#3D7164] uppercase">
                  <Sparkles className="size-2.5 text-[#D4A373]" />
                  <span>Recomendação para hoje</span>
                </div>
                <h4 className="text-xs font-bold text-[#0C2A26] mt-1 leading-snug">
                  Reforce sua agenda com retornos estratégicos
                </h4>
                <p className="text-[10px] text-slate-600 mt-1 leading-tight">
                  Algumas clientes precisam de acompanhamento para não se perder. Retomar conversas gera novos resultados.
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[8px] font-semibold text-[#E07A5F] bg-[#FEECE6] px-2 py-0.5 rounded-full">
                    <Clock className="size-2" /> 15 min
                  </span>
                </div>
                <div className="mt-2 w-full bg-[#E07A5F] text-white text-[10px] font-bold py-1.5 rounded-lg flex items-center justify-center gap-1">
                  <span>Fazer essa ação</span>
                  <ArrowRight className="size-3" />
                </div>
              </div>

              {/* Other Options List */}
              <div className="mt-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Outras opções para você
                </p>
                <div className="space-y-1.5 text-[10px]">
                  <div className="rounded-lg bg-white p-2 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag className="size-3 text-[#E07A5F]" />
                      <div>
                        <p className="font-bold text-[#0C2A26] leading-tight">Criar missão prática</p>
                        <p className="text-[8px] text-slate-500">Ação rápida para gerar resultado</p>
                      </div>
                    </div>
                    <ChevronRight className="size-3 text-slate-400" />
                  </div>

                  <div className="rounded-lg bg-white p-2 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Diamond className="size-3 text-[#3D7164]" />
                      <div>
                        <p className="font-bold text-[#0C2A26] leading-tight">Diagnóstico de valor</p>
                        <p className="text-[8px] text-slate-500">Entenda o que pode ser melhorado</p>
                      </div>
                    </div>
                    <ChevronRight className="size-3 text-slate-400" />
                  </div>

                  <div className="rounded-lg bg-white p-2 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="size-3 text-[#3D7164]" />
                      <div>
                        <p className="font-bold text-[#0C2A26] leading-tight">Organizar agenda</p>
                        <p className="text-[8px] text-slate-500">Abra espaço para o que importa</p>
                      </div>
                    </div>
                    <ChevronRight className="size-3 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Footnote */}
        <p className="mt-8 text-xs text-[#6B857E] font-medium">
          Cada módulo existe para apoiar o próximo passo.
        </p>
      </div>
    </section>
  );
}
