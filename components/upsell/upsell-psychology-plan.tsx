import { Sparkles, Check, X, ShieldAlert, Compass } from "lucide-react";

export function UpsellPsychologyPlan() {
  return (
    <section className="bg-[#FBF9F5] py-14 px-4 border-t border-[#0C2A26]/5">
      <div className="max-w-xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4A373]/50 bg-[#D4A373]/10 text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="size-3 text-[#D4A373]" />
          <span>Psicologia da Decisão</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-tight text-balance">
          Do &ldquo;depois eu vejo isso&rdquo; para um plano de{" "}
          <span className="text-[#3D7164]">10 minutos por dia</span>.
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-[#3D5650] max-w-md mx-auto leading-relaxed">
          O padrão mais comum é guardar tudo para o final do curso. Veja o que acontece quando você decide ter direção desde o primeiro dia:
        </p>

        {/* Comparison Side-by-Side */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Without Agenda 80/20 */}
          <div className="rounded-3xl bg-white border border-rose-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                  <X className="size-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                  Sem o Agenda 80/20
                </span>
              </div>

              <div className="rounded-xl bg-rose-50/80 p-3 mb-4 border border-rose-100">
                <p className="text-xs italic text-rose-950 font-medium leading-snug">
                  &ldquo;Vou terminar o curso primeiro. Depois descubro como divulgar meu trabalho...&rdquo;
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">↓</span>
                  <span>Sem plano de ação estruturado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">↓</span>
                  <span>Procrastinação e sensação de estar travada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">↓</span>
                  <span>Termina as aulas sem saber por onde começar a conseguir clientes</span>
                </li>
              </ul>
            </div>

            <p className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-semibold text-rose-800">
              Resultado: Começar do zero após o curso.
            </p>
          </div>

          {/* With Agenda 80/20 */}
          <div className="rounded-3xl bg-[#0C2A26] border border-white/10 p-5 text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="size-6 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0">
                  <Check className="size-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#D4A373]">
                  Com o Agenda 80/20
                </span>
              </div>

              <div className="rounded-xl bg-[#0E3D36] p-3 mb-4 border border-white/10">
                <p className="text-xs italic text-[#E8F2EE] font-medium leading-snug">
                  &ldquo;Enquanto avanço nas aulas, já sei qual é a próxima ação adequada para hoje.&rdquo;
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#E8F2EE]">
                <li className="flex items-start gap-2">
                  <Check className="size-3.5 text-[#D4A373] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Preparação profissional sem ansiedade</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-3.5 text-[#D4A373] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Ações práticas e rápidas de 10 minutos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-3.5 text-[#D4A373] shrink-0 mt-0.5 stroke-[2.5]" />
                  <span>Quando estiver pronta para atender, seu caminho já está construído</span>
                </li>
              </ul>
            </div>

            <p className="mt-5 pt-3 border-t border-white/10 text-[11px] font-semibold text-[#D4A373]">
              Resultado: Clareza, direção e zero improviso.
            </p>
          </div>
        </div>

        {/* Reassurance Callout */}
        <div className="mt-6 rounded-2xl bg-white border border-[#0C2A26]/10 p-4 text-xs text-[#0C2A26] leading-relaxed max-w-md mx-auto shadow-xs text-left">
          <p className="font-bold text-[#0C2A26] mb-1">
            ⚠️ Você não precisa atender ninguém antes de estar pronta.
          </p>
          <p className="text-slate-600">
            O Agenda 80/20 não pressiona você a agendar clientes antes do tempo. O objetivo é realizar a preparação de bastidores para que, quando sua técnica estiver segura, você não comece do zero.
          </p>
        </div>
      </div>
    </section>
  );
}
