import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/admin";

const nav = [["/admin", "Visão geral"], ["/admin/actions", "Ações"], ["/admin/messages", "Mensagens"], ["/admin/policies", "Policies"], ["/admin/users", "Usuários"], ["/admin/commerce", "Commerce"], ["/admin/metrics", "Métricas"], ["/admin/audit", "Auditoria"], ["/admin/feature-flags", "Feature flags"]];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminClient();
  if (!access.userId && access.error?.startsWith("Faça login")) redirect("/login");
  if (!access.userId) return <main className="mx-auto min-h-screen max-w-xl px-5 py-12"><h1 className="text-2xl font-bold text-slate-950">Painel indisponível</h1><p className="mt-3 text-slate-600">{access.error ?? "Você não tem permissão para acessar esta área."}</p></main>;
  return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1380px] flex-col gap-4 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between"><div><Link href="/admin" className="text-lg font-bold tracking-tight text-slate-950">Agenda 80/20 <span className="font-normal text-slate-500">/ operação</span></Link><p className="mt-1 text-xs text-slate-500">Conteúdo, acesso e sinais do produto</p></div><nav aria-label="Administração" className="flex gap-1 overflow-x-auto pb-1 text-sm">{nav.map(([href, label]) => <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-100 hover:text-teal-800">{label}</Link>)}</nav></div></header><main className="mx-auto max-w-[1380px] px-5 py-8 sm:px-8">{children}</main></div>;
}
