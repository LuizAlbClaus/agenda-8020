import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminClient } from "@/lib/admin";
import { AdminNav } from "./admin-ui";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminClient();

  if (!access.userId && access.error?.startsWith("Faça login")) {
    redirect("/login");
  }

  if (!access.userId) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700">
            <span className="text-xl font-black">!</span>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">Acesso Restrito</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {access.error ?? "Você não tem permissão para acessar o painel de operação do Agenda 80/20."}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Fazer login
            </Link>
            <Link
              href="/today"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Ir para o produto
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.985_0.005_250)] text-slate-900 antialiased">
      <AdminNav />
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
