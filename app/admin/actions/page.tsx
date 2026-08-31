import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource, type AdminField, type AdminFieldGroup } from "../admin-ui";
import { mutateActions } from "../actions";

const fields: AdminField[] = [
  // 1. Identidade e Definição
  {
    name: "slug",
    label: "Slug do protocolo",
    placeholder: "ex.: first_clients",
    description: "Identificador único do protocolo (obrigatório para criação de novo protocolo).",
  },
  {
    name: "title",
    label: "Título da versão",
    placeholder: "ex.: Ativação de Primeiros Clientes",
    description: "Nome de exibição da ação recomendada à pessoa usuária.",
  },
  {
    name: "short_description",
    label: "Descrição curta",
    type: "textarea",
    placeholder: "Explicação objetiva do objetivo desta ação.",
    description: "Texto conciso apresentado no card da recomendação.",
  },
  {
    name: "steps",
    label: "Passos de execução (1 a 3 passos)",
    type: "textarea",
    placeholder: "Passo 1: Definir lista de contatos\nPasso 2: Enviar mensagem direta",
    description: "Instruções práticas de execução (um passo por linha, entre 1 e 3 passos).",
  },

  // 2. Elegibilidade e Sinais
  {
    name: "eligibility",
    label: "Regras de elegibilidade (texto ou JSON)",
    type: "textarea",
    placeholder: "nail_design, lash_design\nstarting, some_clients",
    description: "Critérios de perfil e nichos elegíveis para receber este protocolo.",
  },
  {
    name: "requires_context_signal",
    label: "Requer sinal de contexto ativo",
    type: "boolean",
    description: "Se marcado, exige sinais recentes de intenção ou histórico para recomendação.",
  },

  // 3. Prazos, Prioridade e Proteção
  {
    name: "cooldown_days",
    label: "Cooldown (dias)",
    type: "number",
    placeholder: "7",
    description: "Intervalo mínimo em dias para recomendar novamente este protocolo à mesma conta.",
  },
  {
    name: "maturity_hours",
    label: "Maturação (horas)",
    type: "number",
    placeholder: "24",
    description: "Tempo em horas após a conclusão para solicitar o retorno/desfecho da ação.",
  },
  {
    name: "priority",
    label: "Prioridade editorial (0 a 1)",
    type: "number",
    placeholder: "0.5",
    description: "Peso editorial base para desempate no motor de recomendação (0.0 a 1.0).",
  },
  {
    name: "guardrail",
    label: "Guardrail ético",
    type: "textarea",
    placeholder: "Não prometer retorno financeiro garantido; manter abordagem respeitosa.",
    description: "Diretriz ética e restrições de abordagem comunicacional.",
  },
];

const fieldGroups: AdminFieldGroup[] = [
  {
    title: "1. Identidade e Definição",
    description: "Definição do protocolo, títulos e passos de execução prática.",
    fields: fields.slice(0, 4),
  },
  {
    title: "2. Regras de Elegibilidade e Contexto",
    description: "Critérios de seleção para recomendação às pessoas usuárias.",
    fields: fields.slice(4, 6),
  },
  {
    title: "3. Prazos, Prioridade e Guardrail Ético",
    description: "Janelas de tempo, desempate editorial e diretrizes de proteção.",
    fields: fields.slice(6, 10),
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
        editorDescription="Preencha os campos para submissão auditável no motor."
        warningBanner="Atenção: A publicação torna a versão imutável. Para alterar um protocolo já publicado, crie um novo rascunho."
      />
    </div>
  );
}
