import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource } from "../admin-ui";
import { mutateActions } from "../actions";
export default async function AuditPage() { const result = await listAdminResource("admin_list_audit_logs"); return <><h1 className="text-2xl font-bold tracking-tight text-slate-950">Auditoria</h1><AdminNotice error={result.error} /><AdminResource title="Log de operações" description="Cada mutação administrativa deve ser auditável, especialmente operações de suporte relacionadas a acesso." rows={result.rows} columns={["created_at", "admin_user_id", "action", "entity_type", "entity_id"]} fields={[]} mutate={mutateActions} operations={[]} /></>; }
