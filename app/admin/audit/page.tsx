import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource } from "../admin-ui";
import { mutateActions } from "../actions";

export default async function AuditPage() {
  const result = await listAdminResource("admin_list_audit_logs");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
          <span>Trilha de Rastreabilidade</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Log de Auditoria
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Registro das operações administrativas executadas no sistema. As mutações de protocolos, templates, políticas, flags e suporte ficam vinculadas à conta responsável.
        </p>
      </div>

      <AdminNotice error={result.error} />

      <AdminResource
        title="Histórico de Mutações Registradas"
        description="Esta visualização é estritamente somente leitura (read-only) para garantir a integridade dos registros de governança e suporte."
        rows={result.rows}
        columns={["created_at", "admin_user_id", "action", "entity_type", "entity_id"]}
        fields={[]}
        mutate={mutateActions}
        operations={[]}
        allowCreate={false}
        warningBanner="Os eventos administrativos são gravados com timestamp, identificação da conta que realizou a mutação e ID da entidade afetada."
      />
    </div>
  );
}
