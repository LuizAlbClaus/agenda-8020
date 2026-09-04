"use client";

import {
  Bell,
  Clock,
  Compass,
  Gauge,
  LineChart,
  Menu,
  Sparkles,
  Target,
  TrendingDown,
  User,
  Users,
} from "lucide-react";

const steps = [
  {
    icon: User,
    title: "Seu momento",
    description: "Entendemos onde você está e o que mais importa agora.",
  },
  {
    icon: Gauge,
    title: "Seu gargalo",
    description: "Identificamos o que está travando seus resultados.",
  },
  {
    icon: Bell,
    title: "Seus sinais",
    description: "Capturamos mudanças, oportunidades e alertas do seu negócio.",
  },
  {
    icon: Clock,
    title: "Seu tempo disponível",
    description: "Calculamos o tempo real que você tem para agir com impacto.",
  },
];

export function LandingMechanism() {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden">
      {/* Badge: 03 MECANISMO 80/20 */}
      <div className="flex justify-start sm:justify-center px-4 mb-3">
        <span className="inline-flex items-center rounded-full border border-[#0E3D36]/30 bg-white/60 px-4 py-1 text-xs font-bold text-[#0E3D36] tracking-wide">
          03 MECANISMO 80/20
        </span>
      </div>

      {/* Headline */}
      <div className="text-left sm:text-center px-4 mb-10 max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0C2A26] leading-[1.18]">
          Seu negócio muda.
        </h2>
        <p className="mt-1 text-2xl sm:text-4xl md:text-5xl font-serif italic text-[#4E7A6E] tracking-tight">
          Sua próxima ação também deveria mudar.
        </p>
      </div>

      {/* Main Grid: Steps on Left + Mockup on Right */}
      <div className="max-w-4xl mx-auto px-4 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        {/* Timeline Steps (Left) */}
        <div className="relative pl-3 sm:pl-4 space-y-7 sm:space-y-8">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[26px] sm:left-[30px] top-6 bottom-6 w-0.5 bg-[#4E7A6E]/30" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative flex items-start gap-4 z-10">
                <div className="size-11 sm:size-12 rounded-full bg-[#0E3D36] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="size-5" />
                </div>
                <div className="pt-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#0C2A26] leading-tight">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#4A605A] leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Phone Simulation + Overlapping Action Card */}
        <div className="relative pt-2">
          {/* Phone Frame */}
          <div className="w-full max-w-[340px] sm:max-w-[360px] mx-auto rounded-[38px] bg-slate-900 p-2.5 shadow-xl ring-1 ring-slate-800">
            <div className="rounded-[30px] bg-white overflow-hidden p-3.5 space-y-3 text-slate-800">
              {/* Phone Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#0C2A26]">Agenda 80/20</span>
                <Menu className="size-4 text-slate-600" />
              </div>

              {/* Visão do Momento Header */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">Visão do momento</p>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Ao vivo
                </span>
              </div>

              {/* Foco Atual */}
              <div className="rounded-xl bg-[#FBF9F5] p-2.5 border border-slate-200/60 flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-emerald-700/15 flex items-center justify-center text-emerald-800 shrink-0">
                  <Target className="size-3.5" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Foco atual
                  </p>
                  <p className="text-xs font-bold text-[#0C2A26] leading-snug">
                    Lançamento da nova oferta e expansão comercial
                  </p>
                </div>
              </div>

              {/* Sinais Recentes */}
              <div className="rounded-xl border border-slate-200/60 p-2.5 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Sinais recentes
                </p>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-rose-800">
                    <TrendingDown className="size-3.5 text-rose-500 shrink-0" />
                    <span>Queda de 18% nas conversões em campanhas</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-900">
                    <Users className="size-3.5 text-emerald-600 shrink-0" />
                    <span>3 leads estratégicos aguardando retorno</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-800">
                    <span className="size-3.5 flex items-center justify-center font-bold text-amber-600 text-xs shrink-0">$</span>
                    <span>Desvio de 12% no orçamento de anúncios</span>
                  </div>
                </div>
              </div>

              {/* Tempo Disponível Hoje */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Tempo disponível hoje</span>
                  <span className="font-extrabold text-[#0E3D36]">2h 15m</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div className="w-[56%] bg-[#0E3D36] rounded-full" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                  <span>0h</span>
                  <span>2h</span>
                  <span>4h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Overlapping Floating "Próximo Movimento" Dark Card */}
          <div className="relative -mt-10 sm:-mt-14 max-w-[340px] sm:max-w-[360px] mx-auto rounded-2xl bg-[#082420] text-white p-4 shadow-2xl border border-emerald-900/40 z-20">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full border-2 border-[#D4A373] bg-[#0E3D36] flex items-center justify-center text-[#D4A373]">
                  <Compass className="size-4" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4A373]">
                  PRÓXIMO MOVIMENTO
                </span>
              </div>
              <Sparkles className="size-4 text-[#D4A373]" />
            </div>

            <p className="text-sm sm:text-base font-bold leading-snug text-white">
              Focar na oferta principal e reativar 3 leads quentes.
            </p>

            <div className="my-2.5 h-px bg-emerald-800/40" />

            <p className="text-[11px] text-emerald-100/70 leading-relaxed">
              Essa ação tem o maior potencial de impacto agora, com o tempo que você tem disponível.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                <LineChart className="size-3" />
                <span>Impacto alto</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/60 border border-emerald-700/50 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                <Clock className="size-3" />
                <span>Viável em 2h</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
