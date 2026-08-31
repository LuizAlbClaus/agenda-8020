import Link from "next/link";
import { listAdminResource } from "@/lib/admin";
import { AdminNotice, NAV_ITEMS } from "./admin-ui";
import { Users, CheckCircle2, ListTodo, Clock, ArrowRight } from "lucide-react";

export default async function AdminHome() {
  const metrics = await listAdminResource("admin_get_metrics");
  const first = metrics.rows[0] ?? {};

  const signalCards = [
    {
      label: "Usuários ativos (30 dias)",
      value: first.active_users,
      icon: Users,
      badge: "Logins recentes (30d)",
      color: "text-slate-950",
    },
    {
      label: "Onboarding concluído",
      value: first.onboarding_completed,
      icon: CheckCircle2,
      badge: "Diagnósticos finalizados",
      color: "text-emerald-700",
    },
    {
      label: "Ações concluídas",
      value: first.actions_completed,
      icon: ListTodo,
      badge: "Desfechos operados",
      color: "text-teal-800",
    },
    {
      label: "Pendências de retorno",
      value: first.pending_outcomes ?? first.pending,
      icon: Clock,
      badge: "Aguardando medição",
      color: "text-amber-700",
    },
  ];

  const adminModules = NAV_ITEMS.filter((item) => item.href !== "/admin");

  return (
    <div className="space-y-8">
      {/* Top Banner Operacional Neutro e Grounded */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:p-8">
        <div>
          <div className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <span>Operação do Sistema</span>
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Visão Geral Administrativa
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            Painel interno para gestão de conteúdo editorial, verificação de acessos, regras de recomendação e integridade operacional do Agenda 80/20.
          </p>
        </div>

        <Link
          href="/today"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-teal-300 bg-teal-50 px-5 text-sm font-semibold text-teal-950 transition hover:bg-teal-100 hover:border-teal-400 focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          <span>Abrir produto</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <AdminNotice error={metrics.error} />

      {/* Sinais Vitais em Cards */}
      <section aria-labelledby="signals-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="signals-heading" className="text-base font-bold text-slate-950">
            Sinais da Operação
          </h2>
          <span className="text-xs font-medium text-slate-500">Snapshot do banco transacional</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {signalCards.map((card) => {
            const Icon = card.icon;
            const displayVal = card.value === undefined ? "—" : String(card.value);

            return (
              <div
                key={card.label}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <p className={`text-3xl font-black tracking-tight ${card.color}`}>{displayVal}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.badge}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grid das Verticais Administrativas */}
      <section aria-labelledby="modules-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="modules-heading" className="text-base font-bold text-slate-950">
            Módulos de Gestão
          </h2>
          <span className="text-xs font-medium text-slate-500">8 verticais operacionais</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminModules.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex min-h-[48px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-slate-950"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800 transition group-hover:bg-slate-900 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-950 group-hover:text-teal-900">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
                </div>

                <div className="mt-5 flex items-center gap-1 text-xs font-bold text-teal-800 transition group-hover:translate-x-1">
                  <span>Acessar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
