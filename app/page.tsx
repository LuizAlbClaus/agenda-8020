import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8 sm:px-10 sm:py-14">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-teal-800">Agenda 80/20</Link>
        <Link href="/login" className="rounded-full border border-teal-800 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50">Entrar</Link>
      </header>
      <section className="flex flex-1 flex-col justify-center py-16 sm:max-w-2xl">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Para profissionais que vivem de atendimento e agendamento</p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-6xl">Transforme o tempo disponível em conversas, clientes e agendamentos.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">O Agenda 80/20 entende o momento do seu serviço, escolhe a próxima ação mais simples e ajuda você a preencher horários sem depender de tentativa e erro.</p>
        <div className="mt-8"><Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-full bg-teal-800 px-6 font-semibold text-white hover:bg-teal-900">Montar meu primeiro plano</Link></div>
      </section>
    </main>
  );
}
