import Image from "next/image";
import { Sparkles, Clock, CheckCircle2 } from "lucide-react";

export function UpsellRealLife() {
  return (
    <section className="bg-[#FBF9F5] py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#4E7A6E]/40 bg-[#E8F2EE] text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-2">
          <span>Feito para a vida real</span>
          <Sparkles className="size-2.5 text-[#D4A373]" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-[1.2]">
          Você não precisa virar{" "}
          <span className="text-[#3D7164]">especialista em marketing.</span>
        </h2>

        {/* Subhead */}
        <p className="mt-2 text-sm sm:text-base text-[#3D5650] font-medium">
          Precisa de{" "}
          <span className="relative inline-block font-bold text-[#0C2A26]">
            clareza
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E07A5F]" />
          </span>{" "}
          para dar o próximo passo.
        </p>

        {/* Main Composition: Steps + Photo */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center text-left">
          {/* Left Column: 1-2-3 Steps */}
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-3.5 shadow-xs flex items-center gap-3">
              <div className="size-9 rounded-full bg-[#0C2A26] text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#0C2A26]">Abra</p>
                <p className="text-xs text-slate-600">Abra o Agenda 80/20</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-3.5 shadow-xs flex items-center gap-3">
              <div className="size-9 rounded-full bg-[#3D7164] text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#3D7164]">Entenda</p>
                <p className="text-xs text-slate-600">Entenda o que merece atenção hoje</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-white border border-[#0C2A26]/10 p-3.5 shadow-xs flex items-center gap-3">
              <div className="size-9 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#E07A5F]">Execute</p>
                <p className="text-xs text-slate-600">Execute em poucos minutos e siga seu dia</p>
              </div>
            </div>

            {/* Handwritten Accent */}
            <div className="pt-2 pl-2">
              <p className="font-serif italic text-xs text-[#E07A5F] font-bold tracking-wide">
                E siga seu dia. ♡
              </p>
            </div>
          </div>

          {/* Right Column: Photo + Floating Pills */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 shadow-md border border-[#0C2A26]/10">
            <div className="relative h-[300px] w-full">
              <Image
                src="/media/agenda8020/woman-salon-perfect.png"
                alt="Profissional utilizando o celular no salão"
                fill
                className="object-cover object-center"
                sizes="(max-width: 640px) 100vw, 280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Floating Pills */}
            <div className="absolute bottom-3 left-3 right-3 space-y-2">
              <div className="rounded-xl bg-white/95 backdrop-blur-xs p-2 shadow-sm border border-white/40 flex items-center gap-2">
                <Clock className="size-3.5 text-[#3D7164] shrink-0" />
                <p className="text-[10px] font-medium text-slate-700 leading-tight">
                  Pensado para os <strong>minutos entre um treino e um atendimento</strong>.
                </p>
              </div>

              <div className="rounded-xl bg-white/95 backdrop-blur-xs p-2 shadow-sm border border-white/40 flex items-center gap-2">
                <Sparkles className="size-3.5 text-[#D4A373] shrink-0" />
                <p className="text-[10px] font-medium text-slate-700 leading-tight">
                  <strong>Mais direção.</strong> Menos improviso.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Card */}
        <div className="mt-8 rounded-3xl bg-[#0C2A26] border border-white/10 p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md text-left">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="size-3.5 text-[#3D7164]" />
              <span className="text-xs font-bold text-white">agenda 80/20</span>
            </div>
            <p className="text-sm font-bold text-white">
              O Agenda 80/20 transforma dúvidas em{" "}
              <span className="text-[#A8C5BD] underline decoration-[#E07A5F] decoration-2 underline-offset-4">
                decisões simples
              </span>
              .
            </p>
          </div>
          <Sparkles className="size-5 text-[#D4A373] shrink-0" />
        </div>
      </div>
    </section>
  );
}
