import Image from "next/image";
import { Hand, Megaphone, MessageSquare, Calendar, Sparkles, AlertCircle, Target, Check, ArrowRight } from "lucide-react";

export function UpsellGap() {
  return (
    <section className="bg-[#0C2A26] text-white pt-2 pb-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4A373]/40 bg-[#D4A373]/10 text-[#D4A373] text-[11px] font-bold uppercase tracking-wider mb-3">
          <Sparkles className="size-3" />
          <span>Aprender é o primeiro passo</span>
        </div>

        {/* Headline */}
        <p className="text-xs sm:text-sm font-medium text-[#A8C5BD]">
          Mas depois vem a pergunta:
        </p>
        <h2 className="mt-1 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          E agora,{" "}
          <span className="relative inline-block text-[#E07A5F]">
            como começo?
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#E07A5F] rounded-full" />
          </span>
        </h2>

        {/* Workstation Photo with 4 Floating Attribute Pills */}
        <div className="relative mt-8 rounded-3xl overflow-hidden bg-[#0E3D36] border border-white/10 shadow-2xl">
          <div className="relative h-[340px] sm:h-[400px] w-full">
            <Image
              src="/media/agenda8020/upsell/nail-artist-workstation.jpg"
              alt="Profissional de unhas praticando soft gel na bancada"
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 100vw, 560px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C2A26] via-transparent to-[#0C2A26]/30" />
          </div>

          {/* Floating Pill Cards (Mobile 2x2 Grid, Tablet Overlay) */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
            {/* Top row */}
            <div className="flex justify-between items-start gap-2">
              <div className="pointer-events-auto rounded-xl bg-white/90 backdrop-blur-md p-2 sm:p-2.5 text-left border border-white/40 shadow-lg max-w-[155px] sm:max-w-[180px]">
                <div className="flex items-center gap-1.5 text-[#0C2A26]">
                  <div className="size-5 rounded-full bg-[#E8F2EE] flex items-center justify-center shrink-0">
                    <Hand className="size-3 text-[#3D7164]" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">Praticar</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 leading-tight">
                  Dominar a técnica no dia a dia
                </p>
              </div>

              <div className="pointer-events-auto rounded-xl bg-white/90 backdrop-blur-md p-2 sm:p-2.5 text-left border border-white/40 shadow-lg max-w-[155px] sm:max-w-[180px]">
                <div className="flex items-center gap-1.5 text-[#0C2A26]">
                  <div className="size-5 rounded-full bg-[#E8F2EE] flex items-center justify-center shrink-0">
                    <MessageSquare className="size-3 text-[#3D7164]" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">Conversar</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 leading-tight">
                  Conduzir conversas que geram conexão
                </p>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end gap-2 mb-2">
              <div className="pointer-events-auto rounded-xl bg-white/90 backdrop-blur-md p-2 sm:p-2.5 text-left border border-white/40 shadow-lg max-w-[155px] sm:max-w-[180px]">
                <div className="flex items-center gap-1.5 text-[#0C2A26]">
                  <div className="size-5 rounded-full bg-[#E8F2EE] flex items-center justify-center shrink-0">
                    <Megaphone className="size-3 text-[#3D7164]" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">Mostrar</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 leading-tight">
                  Compartilhar seu trabalho com clareza
                </p>
              </div>

              <div className="pointer-events-auto rounded-xl bg-white/90 backdrop-blur-md p-2 sm:p-2.5 text-left border border-white/40 shadow-lg max-w-[155px] sm:max-w-[180px]">
                <div className="flex items-center gap-1.5 text-[#0C2A26]">
                  <div className="size-5 rounded-full bg-[#E8F2EE] flex items-center justify-center shrink-0">
                    <Calendar className="size-3 text-[#3D7164]" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide">Marcar</span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-600 mt-1 leading-tight">
                  Conseguir agendar suas primeiras oportunidades
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calm Alert Card */}
        <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-4 flex items-start gap-3 text-left">
          <div className="size-7 rounded-full bg-[#4E7A6E]/30 flex items-center justify-center shrink-0 text-[#E8F2EE] mt-0.5">
            <AlertCircle className="size-4 text-[#A8C5BD]" />
          </div>
          <p className="text-xs sm:text-sm text-[#E8F2EE] leading-relaxed">
            Você pode aprender Soft Gel e ainda ficar sem saber o que fazer para mostrar seu trabalho, encontrar suas primeiras oportunidades e conduzir uma conversa.
          </p>
        </div>

        {/* Core Concept: Técnica + Direção */}
        <div className="mt-10">
          <div className="flex items-center justify-center gap-3 my-3">
            <div className="w-8 h-px bg-[#D4A373]/40" />
            <Sparkles className="size-3 text-[#D4A373]" />
            <div className="w-8 h-px bg-[#D4A373]/40" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-white text-balance">
            Aprender a técnica é uma parte.{" "}
            <span className="text-[#A8C5BD] block font-normal text-base sm:text-lg mt-1">
              Começar uma profissão exige um próximo movimento.
            </span>
          </h3>

          {/* Plus Connection Diagram */}
          <div className="mt-8 flex items-center justify-center gap-4 sm:gap-6">
            {/* Técnica */}
            <div className="flex flex-col items-center">
              <div className="relative size-16 sm:size-18 rounded-full border-2 border-[#D4A373] flex items-center justify-center bg-[#0E3D36]">
                <Hand className="size-7 text-[#D4A373]" />
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#D4A373] text-[#0C2A26] flex items-center justify-center">
                  <Check className="size-3 stroke-[3]" />
                </div>
              </div>
              <span className="mt-2 text-xs font-bold uppercase tracking-wider text-white">Técnica</span>
            </div>

            <span className="text-3xl font-light text-[#D4A373]">+</span>

            {/* Direção */}
            <div className="flex flex-col items-center">
              <div className="relative size-16 sm:size-18 rounded-full border-2 border-[#D4A373] flex items-center justify-center bg-[#0E3D36]">
                <Target className="size-7 text-[#D4A373]" />
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#D4A373] text-[#0C2A26] flex items-center justify-center">
                  <Check className="size-3 stroke-[3]" />
                </div>
              </div>
              <span className="mt-2 text-xs font-bold uppercase tracking-wider text-[#D4A373]">Direção</span>
            </div>
          </div>

          <p className="mt-4 text-sm sm:text-base font-bold text-white">
            Soft Gel Express <span className="text-[#D4A373]">+</span> Agenda 80/20
          </p>
          <p className="text-xs sm:text-sm text-[#A8C5BD]">
            O caminho completo para começar com segurança.
          </p>
        </div>

        {/* Direction Preview Mockup Snippet */}
        <div className="mt-8 rounded-2xl bg-[#0E3D36] border border-white/10 p-4 text-left flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-1/2 rounded-xl bg-[#FAF8F5] p-3 text-slate-900 shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
              <span className="font-bold">Hoje</span>
              <span>10 min</span>
            </div>
            <div className="rounded-lg bg-[#0C2A26] p-2.5 text-white">
              <p className="text-[10px] text-[#D4A373] font-bold uppercase tracking-wider">Ação sugerida</p>
              <p className="text-xs font-bold mt-0.5 leading-snug">
                Reative algumas clientes que já tiveram contato com seu serviço.
              </p>
              <div className="mt-2 flex items-center justify-between bg-[#E07A5F] text-white text-[10px] font-bold px-2 py-1 rounded-md">
                <span>Fazer essa ação</span>
                <ArrowRight className="size-3" />
              </div>
            </div>
          </div>

          <div className="w-full sm:w-1/2 text-left">
            <div className="inline-flex items-center gap-1 text-[#D4A373] text-xs font-bold mb-1">
              <Sparkles className="size-3" />
              <span>Comece com direcionamento</span>
            </div>
            <p className="text-xs text-[#E8F2EE] leading-relaxed">
              O Agenda 80/20 sugere seus primeiros passos práticos para você sair da técnica e começar a ser escolhida.
            </p>
            <div className="w-10 h-0.5 bg-[#E07A5F] rounded-full mt-2" />
          </div>
        </div>
      </div>
    </section>
  );
}
