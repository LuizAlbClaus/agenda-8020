import Link from "next/link";

const steps = [
  ["1", "Conte seu momento", "Serviço, gargalo, canais e o tempo que você tem hoje."],
  ["2", "Veja o próximo movimento", "Uma ação simples e compatível com a sua realidade."],
  ["3", "Receba horários", "Um caminho público para a pessoa escolher o serviço e marcar."],
] as const;

const benefits = [
  "Pare de tentar fazer tudo para movimentar seu serviço.",
  "Use o tempo que você realmente tem disponível.",
  "Dê uma próxima etapa clara para quem demonstrar interesse.",
  "Acompanhe ações, sinais e agendamentos sem depender de improviso.",
] as const;

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-6 sm:px-10 sm:py-10">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-teal-800">Agenda 80/20</Link>
        <Link href="/login" className="rounded-full border border-teal-800 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50">Entrar</Link>
      </header>
      <section className="grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Para quem vive de atendimento e agendamento</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">Pare de tentar fazer tudo para movimentar seu serviço.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Conte como está seu serviço, seu tempo e seus canais. O Agenda 80/20 organiza uma próxima ação possível e ajuda você a receber agendamentos por um link simples.</p>
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center"><Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-full bg-teal-800 px-6 font-semibold text-white hover:bg-teal-900">Montar meu primeiro plano</Link><span className="text-sm text-slate-500">Sem promessa de agenda cheia. Com um próximo passo claro.</span></div>
        </div>
        <div className="rounded-3xl border border-teal-200 bg-teal-50 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Seu foco agora</p>
          <p className="mt-4 text-2xl font-bold leading-tight text-teal-950">Uma ação possível para o momento real do seu serviço.</p>
          <div className="mt-6 grid gap-3">
            {steps.map(([number, title, description]) => <div key={number} className="flex gap-3 rounded-2xl bg-white/80 p-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-800 text-sm font-bold text-white">{number}</span><div><p className="font-semibold text-slate-900">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p></div></div>)}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 py-14 sm:py-20">
        <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Como começa</p><h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Você não precisa montar um plano de marketing inteiro.</h2><p className="mt-4 leading-7 text-slate-600">O produto começa com perguntas simples e transforma seu contexto em uma única próxima ação. Depois, você registra o que aconteceu e ajusta o caminho.</p></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{steps.map(([number, title, description]) => <div key={number} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-teal-700">{number}</p><h3 className="mt-5 font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p></div>)}</div>
      </section>

      <section className="grid gap-10 border-t border-slate-200 py-14 sm:py-20 lg:grid-cols-2 lg:items-start">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">O que muda</p><h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">Menos improviso. Mais clareza para agir.</h2></div>
        <ul className="grid gap-4">{benefits.map((benefit) => <li key={benefit} className="flex gap-3 text-lg leading-7 text-slate-700"><span className="mt-1 text-teal-700" aria-hidden="true">✓</span><span>{benefit}</span></li>)}</ul>
      </section>

      <section className="rounded-3xl bg-slate-900 px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-300">Para começar sem travar</p><h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">Você não precisa dominar uma ferramenta grande.</h2><p className="mt-4 max-w-2xl leading-7 text-slate-300">Você informa o que oferece, onde conversa com pessoas e quanto tempo tem. O Agenda 80/20 ajuda a escolher o próximo movimento; você revisa e decide o que faz sentido para a sua realidade.</p><Link href="/login" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-teal-400 px-6 font-semibold text-slate-950 hover:bg-teal-300">Montar meu primeiro plano</Link>
      </section>

      <section className="grid gap-8 border-t border-slate-200 py-14 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Belevy opcional</p><h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900">O método continua sendo seu, com ou sem outra ferramenta.</h2></div>
        <div><p className="leading-7 text-slate-600">Você pode usar o Agenda 80/20 de forma independente para organizar sua rotina, executar ações e acompanhar seu progresso. Se quiser automatizar horários, clientes, confirmações, lembretes e operação, o Belevy pode ser ativado como uma camada adicional.</p><p className="mt-4 text-sm font-semibold text-teal-800">O Belevy amplia o Agenda 80/20; não é obrigatório para começar.</p></div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-slate-200 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>O Agenda 80/20 apoia sua decisão, mas não promete clientes, renda ou agenda cheia.</span><span className="flex gap-4"><Link href="/privacy" className="underline">Privacidade</Link><Link href="/terms" className="underline">Termos</Link></span></footer>
    </main>
  );
}
