import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource, type AdminField, type AdminFieldGroup } from "../admin-ui";
import { mutateMessages } from "../actions";

const fields: AdminField[] = [
  { name: "slug", label: "Slug do template", placeholder: "ex.: winback_30d" },
  { name: "category", label: "Categoria", placeholder: "general, acquisition ou retention" },
  { name: "title", label: "Título da versão", placeholder: "ex.: Reativação de clientes 30 dias" },
  {
    name: "body",
    label: "Corpo da mensagem (WhatsApp)",
    type: "textarea",
    placeholder: "Oi [nome], como você está? Estou organizando os horários desta semana…",
    description: "Utilize texto direto com placeholders naturais. Uma prévia do texto será exibida abaixo.",
  },
  {
    name: "eligible_professions",
    label: "Tipos de serviço elegíveis",
    placeholder: "all_services\nbeauty_other",
    description: "Um por linha ou em formato JSON.",
  },
];

const fieldGroups: AdminFieldGroup[] = [
  {
    title: "1. Identificação do Template",
    description: "Metadados estruturais do template de mensagem.",
    fields: fields.slice(0, 3),
  },
  {
    title: "2. Conteúdo e Elegibilidade",
    description: "Texto pré-escrito para envio rápido e compatibilidade de nichos.",
    fields: fields.slice(3, 5),
  },
];

export default async function MessagesPage() {
  const result = await listAdminResource("admin_list_messages");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900">
          <span>Comunicação Operacional</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Templates de Mensagens
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          As mensagens são conteúdos editoriais prontos para envio via WhatsApp. Edite rascunhos, visualize a prévia e publique versões imutáveis. A ativação do template é gerenciada separadamente pelo controle de status.
        </p>
      </div>

      <AdminNotice error={result.error} />

      <AdminResource
        title="Templates e Versões Cadastradas"
        description="Consulte os templates disponíveis para os protocolos de ação e gerencie suas versões publicadas e ativações."
        rows={result.rows}
        columns={["template_slug", "message_version_id", "title", "status", "version_number", "active"]}
        fields={fields}
        fieldGroups={fieldGroups}
        mutate={mutateMessages}
        operations={["update", "publish", "active"]}
        createButtonLabel="Criar novo rascunho"
        editorTitle="rascunho de mensagem"
        editorDescription="Edite o corpo e os nichos compatíveis antes da publicação."
        warningBanner="Publicar torna a versão do template imutável para rastreabilidade. Para que o template seja selecionado, certifique-se de que ele esteja ativado."
      />
    </div>
  );
}
