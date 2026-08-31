import { listAdminResource } from "@/lib/admin";
import { AdminNotice } from "../admin-ui";
import { mutateUsers } from "../actions";
import UsersSearch from "./users-search";

export default async function UsersPage() {
  const result = await listAdminResource("admin_list_users", { p_email: null });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-900">
          <span>Suporte & Acesso</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Gestão de Usuários
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Pesquise por e-mail de compra, verifique o status de vigência, reenvie acessos e realize correções auditadas de e-mail de suporte com justificativa registrada.
        </p>
      </div>

      <AdminNotice error={result.error} />

      <UsersSearch initialRows={result.rows} initialError={result.error} mutate={mutateUsers} />
    </div>
  );
}
