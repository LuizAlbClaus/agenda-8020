import { Sparkles, Check, Clock, MessageSquare, Target, CheckCircle2, ChevronRight } from "lucide-react";

interface UpsellMechanismDemoProps {
  userName?: string;
}

export function UpsellMechanismDemo({ userName }: UpsellMechanismDemoProps = {}) {
  return (
    <section className="bg-[#FBF9F5] py-14 px-4 border-t border-[#0C2A26]/5">
      <div className="max-w-xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#4E7A6E]/40 bg-[#E8F2EE] text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="size-3 text-[#3D7164]" />
          <span>O Mecanismo na Prática</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-tight text-balance">
          Uma experiência simples:{" "}
          <span className="text-[#3D7164] block sm:inline">
            você abre e sabe o que fazer hoje.
          </span>
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-[#3D5650] max-w-md mx-auto leading-relaxed">
          Sem telas complicadas. Sem dezenas de tarefas concorrendo. O aplicativo responde todos os dias à pergunta:{" "}
          <strong className="text-[#0C2A26]">&ldquo;o que eu devo fazer hoje para construir meu caminho?&rdquo;</strong>
        </p>

        {/* Single Big Smartphone Mockup */}
        <div className="relative mt-8 max-w-[340px] sm:max-w-[360px] mx-auto rounded-[40px] bg-slate-900 p-2.5 shadow-2xl ring-1 ring-slate-800 text-slate-900 text-left">
          <div className="rounded-[32px] bg-[#FAF8F5] overflow-hidden border border-slate-200/80 flex flex-col">
            {/* Status Bar */}
            <div className="pt-2 pb-1 px-5 flex items-center justify-between text-[10px] font-bold text-slate-800 bg-white border-b border-slate-100">
              <span>9:41</span>
              <div className="w-16 h-3 bg-black rounded-full" />
              <div className="flex items-center gap-1 text-[9px] text-slate-700">
                <span>5G</span>
              </div>
            </div>

            {/* App Top Bar */}
            <div className="px-4 py-2.5 bg-[#0C2A26] text-white flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-[#3D7164]" />
                <span className="text-xs font-bold text-white tracking-tight">agenda <span className="text-[#D4A373]">80/20</span></span>
              </div>
              <span className="text-[10px] font-semibold text-[#D4A373] bg-[#0E3D36] border border-[#D4A373]/30 px-2 py-0.5 rounded-full">
                Modo Iniciante
              </span>
            </div>

            {/* App Body */}
            <div className="p-3.5 sm:p-4 space-y-3 bg-[#FAF8F5]">
              {/* Greeting */}
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Bom dia{userName ? `, ${userName}` : ""} 👋
                </p>
                <h3 className="text-sm font-black text-[#0C2A26] leading-tight">
                  Sua ação recomendada para hoje:
                </h3>
              </div>

              {/* Action Main Card */}
              <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-3.5 shadow-xs text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E07A5F] uppercase tracking-wider mb-1">
                  <Target className="size-3" />
                  <span>Preparação Inicial</span>
                </div>

                <h4 className="text-xs sm:text-sm font-extrabold text-[#0C2A26] leading-snug">
                  Fotografe e organize o resultado do seu treino de Soft Gel
                </h4>

                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FEECE6] px-2 py-0.5 text-[10px] font-bold text-[#E07A5F]">
                  <Clock className="size-2.5" />
                  <span>10 minutos</span>
                </div>
              </div>

              {/* Por que isso agora? */}
              <div className="rounded-xl bg-[#E8F2EE] border border-[#3D7164]/20 p-3 text-left">
                <p className="text-[10px] font-bold text-[#0C2A26] uppercase tracking-wider mb-0.5">
                  ✦ Por que fazer isso agora?
                </p>
                <p className="text-[11px] text-[#2C4A43] leading-relaxed">
                  Você está aprendendo a técnica. Registrar sua evolução na mão de treino ou em modelos cria suas primeiras fotos reais para apresentar quando abrir a agenda.
                </p>
              </div>

              {/* Mensagem Pronta Sugerida */}
              <div className="rounded-xl bg-white border border-slate-200 p-3 text-left">
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#0C2A26] mb-1">
                  <MessageSquare className="size-3 text-[#3D7164]" />
                  <span>Mensagem pronta (WhatsApp para modelo):</span>
                </div>
                <div className="rounded-lg bg-[#DCF8C6]/80 p-2.5 text-[11px] text-slate-800 font-medium leading-snug border border-emerald-300/30">
                  &ldquo;Oi Mi! Comecei meu curso prático de Soft Gel e em breve vou precisar de 2 modelos para treinar acabamento. Posso te chamar quando abrir os dias?&rdquo;
                </div>
              </div>

              {/* Marcar como Feita Button */}
              <div className="rounded-xl bg-[#0C2A26] text-white p-2.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                <Check className="size-3.5 text-[#3D7164] stroke-[3]" />
                <span>Marcar como feita hoje</span>
              </div>
            </div>

            {/* Bottom Bar Indicator */}
            <div className="py-2 flex justify-center bg-white border-t border-slate-100">
              <div className="w-20 h-1 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>

        {/* 3 Core Benefits Around (Clean Horizontal/Vertical Stack) */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-4 shadow-xs">
            <div className="size-7 rounded-lg bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] font-bold text-xs mb-2">
              1
            </div>
            <h4 className="text-xs font-bold text-[#0C2A26]">Uma ação clara por vez</h4>
            <p className="text-[11px] text-[#527068] mt-1 leading-snug">
              Sem tentar fazer tudo ao mesmo tempo. Você executa um passo simples de 10 minutos e segue seu dia.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-4 shadow-xs">
            <div className="size-7 rounded-lg bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] font-bold text-xs mb-2">
              2
            </div>
            <h4 className="text-xs font-bold text-[#0C2A26]">Roteiros e textos prontos</h4>
            <p className="text-[11px] text-[#527068] mt-1 leading-snug">
              Mensagens respeitosas para convidar modelos e primeiras clientes sem travar na frente da tela.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-4 shadow-xs">
            <div className="size-7 rounded-lg bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] font-bold text-xs mb-2">
              3
            </div>
            <h4 className="text-xs font-bold text-[#0C2A26]">No ritmo do seu aprendizado</h4>
            <p className="text-[11px] text-[#527068] mt-1 leading-snug">
              Ações de preparação e apresentação agora; ações de agendamento quando você estiver pronta para atender.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
