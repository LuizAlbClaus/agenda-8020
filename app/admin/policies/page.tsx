import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource, type AdminField, type AdminFieldGroup } from "../admin-ui";
import { mutatePolicies } from "../actions";

const fields: AdminField[] = [
  {
    name: "fit_weight",
    label: "Peso de Fit (Diagnóstico)",
    type: "number",
    placeholder: "35",
    description: "Importância do alinhamento entre estágio/gargalo e o protocolo.",
  },
  {
    name: "channel_weight",
    label: "Peso de Canais",
    type: "number",
    placeholder: "20",
    description: "Importância dos canais ativos da pessoa usuária (ex.: WhatsApp/Instagram).",
  },
  {
    name: "prior_weight",
    label: "Peso de Prior Editorial",
    type: "number",
    placeholder: "15",
    description: "Desempate baseado na recomendação curada do método.",
  },
  {
    name: "half_life_days",
    label: "Recência / Half-Life (Dias)",
    type: "number",
    placeholder: "60",
    description: "Meia-vida para decaimento de histórico de execução.",
  },
  {
    name: "exploration_rate",
    label: "Taxa de Exploração (0 a 1)",
    type: "number",
    placeholder: "0.1",
    description: "Percentual de chance de sugerir ações exploratórias elegíveis.",
  },
  {
    name: "params",
    label: "Parâmetros Avançados (JSON Completo)",
    type: "textarea",
    placeholder:
      '{\n  "score_weights": { "fit": 35, "channel": 20, "prior": 15, "evidence": 15, "exploration": 10, "viability": 5 },\n  "prior_weight": 8,\n  "recency_half_life_days": 60,\n  "exploration_rate": 0\n}',
    description:
      "Se preenchido, os campos numéricos acima serão combinados nesta estrutura JSON enviada ao motor de recomendação.",
  },
];

const fieldGroups: AdminFieldGroup[] = [
  {
    title: "1. Pesos do Motor de Recomendação",
    description: "Defina os pesos relativos aplicados no cálculo de pontuação das ações candidatas.",
    fields: fields.slice(0, 3),
  },
  {
    title: "2. Janelas Temporais e Exploração",
    description: "Controle a frequência de repetição e o percentual de descoberta de novos protocolos.",
    fields: fields.slice(3, 5),
  },
  {
    title: "3. Estrutura JSON Canônica",
    description: "Configuração de parâmetros do algoritmo para ajuste fino.",
    fields: fields.slice(5, 6),
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
          Ajuste os pesos, meias-vidas e taxas de exploração do algoritmo que seleciona a ação prioritária do dia. Cada alteração cria uma versão imutável.
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
        editorDescription="Defina os novos parâmetros do algoritmo para cálculo das recomendações."
        warningBanner="Ao ativar uma versão de política, ela assume o cálculo de novas recomendações."
      />
    </div>
  );
}
