import Link from "next/link";
import { listAdminResource } from "@/lib/admin";
import { AdminNotice } from "./admin-ui";

const links = [["/admin/actions", "Ações", "Versões, elegibilidade e ativação"], ["/admin/messages", "Mensagens", "Templates ligados aos protocolos"], ["/admin/policies", "Policies", "Pesos, thresholds e exploração"], ["/admin/users", "Usuários", "Acesso e suporte"], ["/admin/commerce", "Commerce", "Produtos, ofertas e benefícios"], ["/admin/metrics", "Métricas", "Sinais essenciais do MVP"], ["/admin/audit", "Auditoria", "Registro das operações administrativas"], ["/admin/feature-flags", "Feature flags", "Ativações controladas"]];

export default async function AdminHome() {
  const metrics = await listAdminResource("admin_get_metrics");
  const first = metrics.rows[0] ?? {};
  const cards = [["Usuários ativos", first.active_users], ["Onboarding", first.onboarding_completed], ["Ações concluídas", first.actions_completed], ["Pendências", first.pending_outcomes]];
  return <><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-teal-800">Operação</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Visão geral</h1><p className="mt-2 max-w-2xl text-slate-600">Um ponto de controle enxuto para manter o conteúdo e o acesso do Agenda em ordem.</p></div><Link href="/today" className="text-sm font-semibold text-teal-800 underline">Abrir experiência da usuária →</Link></div><AdminNotice error={metrics.error} /><section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-2xl font-bold text-slate-950">{value === undefined ? "—" : String(value)}</p><p className="mt-1 text-sm text-slate-600">{String(label)}</p></div>)}</section><section className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{links.map(([href, title, description]) => <Link key={href} href={href} className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-700"><h2 className="font-semibold text-slate-950">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-600">{description}</p><span className="mt-4 inline-block text-sm font-semibold text-teal-800">Abrir →</span></Link>)}</section></>;
}
