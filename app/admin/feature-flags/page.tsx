import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource, type AdminField } from "../admin-ui";
import { mutateFeatureFlags } from "../actions";
const fields: AdminField[] = [{ name: "key", label: "Chave" }, { name: "enabled", label: "Ativa", type: "boolean" }, { name: "config", label: "Configuração (JSON)", type: "textarea" }];
export default async function FeatureFlagsPage() { const result = await listAdminResource("admin_list_feature_flags"); return <><h1 className="text-2xl font-bold tracking-tight text-slate-950">Feature flags</h1><AdminNotice error={result.error} /><AdminResource title="Ativações controladas" description="Flags servem para liberar mudanças de forma explícita e reversível. Não use este espaço para criar funcionalidades fora do MVP." rows={result.rows} columns={["key", "enabled", "config", "updated_at"]} fields={fields} mutate={mutateFeatureFlags} operations={["update"]} /></>; }
