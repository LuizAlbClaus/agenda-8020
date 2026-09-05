import { Check, Sparkles, ArrowDown } from "lucide-react";

export function UpsellGap() {
  return (
    <section className="bg-[#FBF9F5] py-12 px-4 border-t border-[#0C2A26]/5">
      <div className="max-w-xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4A373]/50 bg-[#D4A373]/10 text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="size-3 text-[#D4A373]" />
          <span>A jornada completa</span>
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-tight text-balance">
          Aprender a técnica é o primeiro passo.{" "}
          <span className="text-[#3D7164] block sm:inline">
            Saber o que fazer depois é outro.
          </span>
        </h2>

        {/* Explanatory text */}
        <p className="mt-3 text-xs sm:text-sm text-[#3D5650] max-w-md mx-auto leading-relaxed">
          Você já resolveu o que vai aprender. Agora pode também ter um plano simples para não terminar o curso perguntando: <em>&ldquo;e agora, por onde começo a divulgar?&rdquo;</em>
        </p>

        {/* Two Step Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {/* Card 1: Soft Gel Express */}
          <div className="rounded-3xl bg-white border border-[#0C2A26]/10 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#3D7164] bg-[#E8F2EE] px-2 py-0.5 rounded-md">
                  Passo 1 · Curso
                </span>
                <span className="text-xs font-bold text-slate-400">Técnica</span>
              </div>

              <h3 className="text-base font-extrabold text-[#0C2A26]">
                Soft Gel Express
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 mb-4">
                Ensina você a dominar a aplicação perfeita:
              </p>

              <ul className="space-y-2.5 text-xs text-[#0C2A26]">
                <li className="flex items-start gap-2">
                  <div className="size-4 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0 mt-0.5">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Aprender o método correto da aplicação</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-4 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0 mt-0.5">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Praticar com segurança e acabamento limpo</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-4 rounded-full bg-[#E8F2EE] flex items-center justify-center text-[#3D7164] shrink-0 mt-0.5">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Ficar pronta para oferecer o serviço</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-[#3D7164]">
              <span>✓ O que fazer nas unhas</span>
            </div>
          </div>

          {/* Card 2: Agenda 80/20 */}
          <div className="rounded-3xl bg-[#0C2A26] border border-white/10 p-5 text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0C2A26] bg-[#D4A373] px-2 py-0.5 rounded-md">
                  Passo 2 · Próxima Ação
                </span>
                <span className="text-xs font-bold text-[#A8C5BD]">Direção</span>
              </div>

              <h3 className="text-base font-extrabold text-white">
                Agenda 80/20
              </h3>
              <p className="text-xs text-[#A8C5BD] mt-0.5 mb-4">
                Mostra quais ações começar a construir hoje:
              </p>

              <ul className="space-y-2.5 text-xs text-[#E8F2EE]">
                <li className="flex items-start gap-2">
                  <div className="size-4 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Registrar fotos dos seus treinos para criar prova</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-4 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Convidar pessoas próximas como modelos com roteiros prontos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="size-4 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Ter pessoas esperando quando sua agenda abrir</span>
                </li>
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-bold text-[#D4A373]">
              <span>✓ O que fazer pelo seu negócio</span>
            </div>
          </div>
        </div>

        {/* Integration Callout */}
        <div className="mt-6 rounded-2xl bg-[#E8F2EE] border border-[#3D7164]/20 p-3.5 text-xs text-[#0C2A26] font-medium leading-relaxed max-w-md mx-auto">
          <strong>O Agenda 80/20 não substitui o curso e não ensina Soft Gel.</strong> Ele é o complemento que organiza seus passos para você não deixar sua captação de clientes para ser descoberta do zero depois.
        </div>
      </div>
    </section>
  );
}
