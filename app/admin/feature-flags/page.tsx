import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource, type AdminField, type AdminFieldGroup } from "../admin-ui";
import { mutateFeatureFlags } from "../actions";

const fields: AdminField[] = [
  {
    name: "is_enabled",
    label: "Flag habilitada",
    type: "boolean",
    description: "Ativa ou desativa o comportamento no sistema.",
  },
  {
    name: "description",
    label: "Descrição da funcionalidade",
    placeholder: "Explicação sucinta do propósito da flag",
    description: "Texto descritivo gravado no registro da flag para referência operacional.",
  },
];

const fieldGroups: AdminFieldGroup[] = [
  {
    title: "Estado e Descrição da Flag",
    description: "Gerencie a ativação e o texto explicativo da flag selecionada.",
    fields: fields,
  },
];

export default async function FeatureFlagsPage() {
  const result = await listAdminResource("admin_list_feature_flags");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-900">
          <span>Controle de Ativação</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Feature Flags
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Gerencie o estado das flags de funcionalidade do sistema. Permite ativar ou desativar comportamentos de forma controlada e auditável.
        </p>
      </div>

      <AdminNotice error={result.error} />

      <AdminResource
        title="Flags Cadastradas no Sistema"
        description="Consulte o estado de ativação e a descrição de cada flag operacional retornada pelo banco de dados."
        rows={result.rows}
        columns={["flag_key", "description", "is_enabled", "updated_at"]}
        fields={fields}
        fieldGroups={fieldGroups}
        mutate={mutateFeatureFlags}
        operations={["update"]}
        allowCreate={false}
        editorTitle="flag operacional"
        editorDescription="Atualize a ativação ou descrição desta flag cadastrada."
        warningBanner="A alteração do estado de uma flag altera o comportamento das verificações no código."
      />
    </div>
  );
}
