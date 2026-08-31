import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource, type AdminField, type AdminFieldGroup } from "../admin-ui";
import { mutateActions } from "../actions";

const fields: AdminField[] = [
  // 1. Identidade
  { name: "slug", label: "Slug do protocolo", placeholder: "ex.: first_clients" },
  { name: "category", label: "Categoria", placeholder: "foundation, acquisition ou retention" },
  { name: "action_type", label: "Tipo de ação", placeholder: "foundation ou acquisition" },
  { name: "measurement_class", label: "Classe de medição", placeholder: "direct_outreach, broadcast, return…" },
  { name: "title", label: "Título da versão" },
  { name: "short_description", label: "Descrição curta", type: "textarea" },

  // 2. Elegibilidade
  { name: "eligible_professions", label: "Tipos de serviço elegíveis", placeholder: "all_services\nbeauty_other" },
  { name: "eligible_stages", label: "Estágios elegíveis", placeholder: "starting\nsome_clients" },
  { name: "eligible_bottlenecks", label: "Gargalos elegíveis", placeholder: "first_clients" },
  { name: "required_channels", label: "Canais necessários", placeholder: "instagram\nwhatsapp" },
  { name: "requirements", label: "Elegibilidade e sinais (JSON)", type: "textarea", placeholder: '{\n  "min_history": 0\n}' },
  { name: "when_to_use", label: "Quando usar", type: "textarea" },
  { name: "when_not_to_use", label: "Quando não usar", type: "textarea" },

  // 3. Execução & Maturação
  { name: "exposure_mode", label: "Modo de exposição", placeholder: "none, direct, broadcast…" },
  { name: "max_exposure", label: "Máximo de exposições", type: "number" },
  { name: "cooldown_hours", label: "Cooldown (horas)", type: "number" },
  { name: "maturation_hours", label: "Maturação (horas)", type: "number" },
  { name: "finalization_hours", label: "Finalização (horas)", type: "number" },
  { name: "editorial_prior", label: "Prior editorial", type: "number" },

  // 4. Ética & Conteúdo
  { name: "ethical_guardrail", label: "Guardrail ético", type: "textarea" },
  { name: "message_template", label: "Template de mensagem", type: "textarea" },
];

const fieldGroups: AdminFieldGroup[] = [
  {
    title: "1. Identidade e Definição",
    description: "Metadados estruturais do protocolo e títulos de exibição.",
    fields: fields.slice(0, 6),
  },
  {
    title: "2. Regras de Elegibilidade",
    description: "Condições de recomendação por serviço, estágio, gargalos e canais.",
    fields: fields.slice(6, 13),
  },
  {
    title: "3. Execução, Cooldown e Maturação",
    description: "Janelas de tempo para exibição, repetição e medição de retorno.",
    fields: fields.slice(13, 19),
  },
  {
    title: "4. Guardrail Ético e Mensagem",
    description: "Diretrizes de proteção e template padrão de comunicação.",
    fields: fields.slice(19, 21),
  },
];

export default async function ActionsPage() {
  const result = await listAdminResource("admin_list_actions");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-900">
          <span>Catálogo Editorial</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Ações e Protocolos
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Gerencie os protocolos e suas versões editoriais. Versões publicadas permanecem imutáveis para manter a rastreabilidade das recomendações entregues às pessoas usuárias.
        </p>
      </div>

      <AdminNotice error={result.error} />

      <AdminResource
        title="Protocolos e Versões Cadastradas"
        description="Consulte o estado de cada versão (rascunho ou publicada) e controle a ativação dos protocolos no motor de recomendação."
        rows={result.rows}
        columns={[
          "protocol_slug",
          "action_version_id",
          "title",
          "status",
          "version_number",
          "exposure_mode",
          "cooldown_hours",
          "maturation_hours",
        ]}
        fields={fields}
        fieldGroups={fieldGroups}
        mutate={mutateActions}
        operations={["update", "publish", "active"]}
        createButtonLabel="Criar novo rascunho"
        editorTitle="rascunho de protocolo"
        editorDescription="Preencha os campos conhecidos para submissão auditável."
        warningBanner="Atenção: A publicação torna a versão imutável. Para alterar um protocolo já publicado, crie um novo rascunho."
      />
    </div>
  );
}
