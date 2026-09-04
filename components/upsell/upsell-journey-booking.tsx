import Image from "next/image";
import { Sparkles, GraduationCap, Target, Send, MessageSquare, CalendarCheck } from "lucide-react";

export function UpsellJourneyBooking() {
  return (
    <section className="bg-[#FBF9F5] py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-[#D4A373]/40 bg-[#D4A373]/10 text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-2">
          <span>Da técnica à primeira oportunidade</span>
          <Sparkles className="size-2.5 text-[#D4A373]" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0C2A26] leading-[1.2]">
          Você aprende. Se prepara.
          <span className="block relative inline-block text-[#3D7164] mt-1">
            Começa a se movimentar.
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#E07A5F] rounded-full" />
          </span>
        </h2>

        {/* Stepper + Phone Grid */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          {/* Left Stepper (5 Nodes) */}
          <div className="w-full md:w-1/2 space-y-4">
            {/* Step 1 with Soft Gel Card */}
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 size-8 rounded-full bg-[#0C2A26] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <GraduationCap className="size-4 text-[#D4A373]" />
              </div>
              <p className="text-xs sm:text-sm font-black text-[#0C2A26] uppercase">
                1. Aprenda a técnica
              </p>

              {/* Small Visual Card */}
              <div className="mt-2 rounded-2xl bg-[#0C2A26] p-2 text-white flex items-center gap-2.5 shadow-sm max-w-[240px]">
                <div className="relative size-12 rounded-xl overflow-hidden shrink-0 bg-white">
                  <Image
                    src="/media/agenda8020/upsell/softgel-application.jpg"
                    alt="Soft Gel Aplicação"
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <span className="inline-block text-[8px] font-bold bg-[#3D7164] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    Curso Concluído
                  </span>
                  <p className="text-[11px] font-bold mt-0.5 leading-tight">Soft Gel Express</p>
                  <p className="text-[9px] text-[#A8C5BD]">Técnica dominada.</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 size-8 rounded-full bg-[#3D7164] text-white flex items-center justify-center font-bold text-xs">
                <Target className="size-4 text-[#D4A373]" />
              </div>
              <p className="text-xs sm:text-sm font-black text-[#0C2A26] uppercase">
                2. Escolha o próximo movimento
              </p>
              <p className="text-[11px] text-slate-500">O app orienta a ação exata para a sua semana.</p>
            </div>

            {/* Step 3 */}
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 size-8 rounded-full bg-[#3D7164] text-white flex items-center justify-center font-bold text-xs">
                <Send className="size-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-black text-[#0C2A26] uppercase">
                3. Execute uma ação simples
              </p>
              <p className="text-[11px] text-slate-500">10 a 15 minutos no intervalo entre treinos.</p>
            </div>

            {/* Step 4 */}
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 size-8 rounded-full bg-[#3D7164] text-white flex items-center justify-center font-bold text-xs">
                <MessageSquare className="size-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-black text-[#0C2A26] uppercase">
                4. Conduza a conversa
              </p>
              <p className="text-[11px] text-slate-500">Respostas prontas para segurança no WhatsApp.</p>
            </div>

            {/* Step 5 */}
            <div className="relative pl-10">
              <div className="absolute left-0 top-1 size-8 rounded-full bg-[#E07A5F] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <CalendarCheck className="size-4 text-white" />
              </div>
              <p className="text-xs sm:text-sm font-black text-[#E07A5F] uppercase">
                5. Ofereça um horário
              </p>
              <p className="text-[11px] text-slate-500">Link direto de agendamento pronto para enviar.</p>
            </div>
          </div>

          {/* Right Phone Mockup (Booking Screen) */}
          <div className="w-full sm:max-w-[300px] rounded-[38px] bg-slate-900 p-2.5 shadow-2xl ring-1 ring-slate-800 text-slate-900 shrink-0">
            <div className="rounded-[30px] bg-[#FAF8F5] p-3 text-left overflow-hidden">
              <div className="flex items-center justify-between text-[10px] text-slate-700 mb-2 pb-1 border-b border-slate-200">
                <span className="font-bold">9:41</span>
                <span className="text-[9px] text-[#0C2A26] font-bold">AGENDA 80/20</span>
              </div>

              <div className="px-1 py-1">
                <h3 className="text-xs font-bold text-[#0C2A26]">Escolha um horário</h3>
                <p className="text-[9px] text-slate-500">Selecione a melhor opção para você:</p>
              </div>

              {/* Days row */}
              <div className="mt-2 grid grid-cols-5 gap-1 text-center">
                <div className="rounded-lg bg-[#0C2A26] p-1 text-white">
                  <p className="text-[8px] text-[#A8C5BD]">Qui</p>
                  <p className="text-xs font-bold">22</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-1 text-slate-700">
                  <p className="text-[8px] text-slate-400">Sex</p>
                  <p className="text-xs font-bold">23</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-1 text-slate-700">
                  <p className="text-[8px] text-slate-400">Seg</p>
                  <p className="text-xs font-bold">26</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-1 text-slate-700">
                  <p className="text-[8px] text-slate-400">Ter</p>
                  <p className="text-xs font-bold">27</p>
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-1 text-slate-700">
                  <p className="text-[8px] text-slate-400">Qua</p>
                  <p className="text-xs font-bold">28</p>
                </div>
              </div>

              {/* Hours Grid */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                <div className="rounded-md bg-white border border-slate-200 py-1.5 text-slate-700">09:00</div>
                <div className="rounded-md bg-white border border-slate-200 py-1.5 text-slate-700">10:00</div>
                <div className="rounded-md bg-white border border-slate-200 py-1.5 text-slate-700">11:00</div>
                <div className="rounded-md bg-white border border-slate-200 py-1.5 text-slate-700">13:00</div>
                <div className="rounded-md bg-[#0C2A26] py-1.5 text-white">14:00</div>
                <div className="rounded-md bg-white border border-slate-200 py-1.5 text-slate-700">15:00</div>
                <div className="rounded-md bg-white border border-slate-200 py-1.5 text-slate-700">16:30</div>
                <div className="rounded-md bg-white border border-slate-200 py-1.5 text-slate-700">17:30</div>
                <div className="rounded-md bg-white border border-slate-200 py-1.5 text-slate-700">18:30</div>
              </div>

              {/* Service Summary Card */}
              <div className="mt-3 rounded-xl bg-white border border-slate-200 p-2 flex items-center gap-2">
                <div className="relative size-8 rounded-full overflow-hidden shrink-0 bg-slate-200">
                  <Image
                    src="/media/agenda8020/woman-salon-perfect.png"
                    alt="Profissional"
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400">Serviço</p>
                  <p className="text-[10px] font-bold text-[#0C2A26] leading-tight">Alongamento Soft Gel</p>
                  <p className="text-[8px] text-slate-500">⏱ 90 minutos</p>
                </div>
              </div>

              {/* Confirm button */}
              <div className="mt-3 w-full bg-[#E07A5F] text-white text-[11px] font-bold py-2 rounded-xl text-center shadow-xs">
                Confirmar horário
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-10 max-w-md mx-auto">
          <Sparkles className="size-3 text-[#D4A373] mx-auto mb-2" />
          <p className="text-xs sm:text-sm font-bold text-[#0C2A26]">
            Você não precisa descobrir tudo de uma vez.
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            O Agenda 80/20 não promete controlar o resultado do seu negócio. Ele ajuda você a reduzir a improvisação e tomar melhores decisões sobre o próximo movimento.
          </p>
        </div>
      </div>
    </section>
  );
}
