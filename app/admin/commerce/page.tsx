import { listAdminResource } from "@/lib/admin";
import { AdminNotice, AdminResource, type AdminField, type AdminFieldGroup } from "../admin-ui";
import { mutateCommerce } from "../actions";

const fields: AdminField[] = [
  {
    name: "provider_product_id",
    label: "ID do Produto no Checkout (Cakto)",
    placeholder: "ex.: prod_98412",
    description: "Identificador exato do produto configurado na Cakto.",
  },
  {
    name: "provider_offer_id",
    label: "ID da Oferta no Checkout",
    placeholder: "ex.: off_12894",
    description: "Identificador do plano ou variação de preço.",
  },
  {
    name: "internal_product_code",
    label: "Código do Produto Interno",
    placeholder: "agenda_8020",
    description: "Identificador canônico interno (padrão: agenda_8020).",
  },
  {
    name: "access_days",
    label: "Dias de Acesso ao Agenda 80/20",
    type: "number",
    placeholder: "365",
    description: "Período em dias corridos concedido à pessoa compradora a partir da aprovação da compra única.",
  },
  {
    name: "belevy_benefit_days",
    label: "Dias de Benefício Belevy",
    type: "number",
    placeholder: "30",
    description: "Dias de cortesia de agendamento integrado no Belevy.",
  },
  {
    name: "active",
    label: "Mapeamento ativo para novas compras",
    type: "boolean",
    description: "Se desmarcado, webhooks para este produto não provisionarão novos acessos.",
  },
];

const fieldGroups: AdminFieldGroup[] = [
  {
    title: "1. Integração com o Checkout",
    description: "Vínculo entre o produto/oferta recebido no webhook e o sistema.",
    fields: fields.slice(0, 3),
  },
  {
    title: "2. Concessão de Direitos e Prazos",
    description: "Definição do período de vigência e benefícios atrelados à oferta.",
    fields: fields.slice(3, 6),
  },
];

export default async function CommercePage() {
  const result = await listAdminResource("admin_list_commerce_mappings");

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
          <span>Monetização & Checkout</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Mapeamento de Commerce
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Mantenha a correspondência entre os IDs de produto e oferta da Cakto e as regras de provisionamento de acesso, dias de vigência e benefícios do Belevy para compras únicas.
        </p>
      </div>

      <AdminNotice error={result.error} />

      <AdminResource
        title="Mapeamentos de Ofertas Vigentes"
        description="Cada compra aprovada é processada de acordo com as regras ativas cadastradas nesta tabela."
        rows={result.rows}
        columns={[
          "provider_product_id",
          "provider_offer_id",
          "internal_product_code",
          "access_days",
          "belevy_benefit_days",
          "active",
        ]}
        fields={fields}
        fieldGroups={fieldGroups}
        mutate={mutateCommerce}
        operations={["update"]}
        createButtonLabel="Criar mapeamento"
        editorTitle="mapeamento de oferta"
        editorDescription="Defina os identificadores de checkout e os direitos concedidos."
        warningBanner="Alterações afetam apenas novas compras processadas a partir da gravação do mapeamento. Acessos já provisionados mantêm sua vigência."
      />
    </div>
  );
}
