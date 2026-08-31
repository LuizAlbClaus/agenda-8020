import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource, type AdminField, type AdminFieldGroup } from "../admin-ui";
import { mutatePolicies } from "../actions";

const fields: AdminField[] = [
  {
    name: "params",
    label: "Parâmetros do Algoritmo (JSON Canônico)",
    type: "textarea",
    placeholder:
      '{\n  "score_weights": {\n    "fit": 35,\n    "channel": 20,\n    "prior": 15,\n    "evidence": 15,\n    "exploration": 10,\n    "viability": 5\n  },\n  "prior_weight": 8,\n  "recency_half_life_days": 60,\n  "exploration_rate": 0.1\n}',
    description:
      "Objeto JSON completo contendo pesos (score_weights), prior_weight, recency_half_life_days e exploration_rate. Não são aplicados defaults inventados.",
  },
];

const fieldGroups: AdminFieldGroup[] = [
  {
    title: "1. Estrutura de Parâmetros Canônica (JSON)",
    description: "Configuração íntegra e auditável dos pesos, meias-vidas e taxas de exploração do algoritmo.",
    fields: fields,
  },
];

export default async function PoliciesPage() {
  const result = await listAdminResource("admin_list_policies");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-900">
          <span>Algoritmo de Recomendação</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Políticas de Recomendação
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Rascunhos podem ser revisados; ao ativar uma versão, ela passa a orientar novas recomendações e deixa de ser editável.
        </p>
      </div>

      <AdminNotice error={result.error} />

      <AdminResource
        title="Histórico de Versões da Política"
        description="A versão com status 'active' determina o cálculo de novas recomendações. Versões anteriores permanecem gravadas para fins de auditoria."
        rows={result.rows}
        columns={["version", "status", "params", "created_at", "activated_at"]}
        fields={fields}
        fieldGroups={fieldGroups}
        mutate={mutatePolicies}
        operations={["update", "activate"]}
        createButtonLabel="Criar novo rascunho"
        editorTitle="rascunho de política"
        editorDescription="Defina o objeto JSON com os parâmetros do algoritmo para cálculo das recomendações."
        warningBanner="Ao ativar uma versão de política, ela assume o cálculo de novas recomendações."
      />
    </div>
  );
}
