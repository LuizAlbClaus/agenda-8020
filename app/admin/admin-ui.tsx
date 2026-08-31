"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition, useRef, useEffect, useCallback, useId } from "react";
import { readableValue, type AdminResult, type AdminRow } from "@/lib/admin-types";
import {
  Layers,
  MessageSquare,
  Sliders,
  Users,
  ShoppingBag,
  BarChart3,
  ShieldCheck,
  Flag,
  ArrowUpRight,
  Plus,
  X,
  Check,
  AlertTriangle,
  FileEdit,
  Send,
  Power,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export type AdminField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  group?: string;
  description?: string;
};

export type AdminFieldGroup = {
  title: string;
  description?: string;
  fields: AdminField[];
};

export type AdminMutation = (input: { operation: string; id?: string; values?: AdminRow }) => Promise<AdminResult>;

const COLUMN_LABELS: Record<string, string> = {
  protocol_slug: "Slug do protocolo",
  action_version_id: "ID da versão",
  title: "Título",
  status: "Status",
  version_number: "Versão",
  version: "Versão",
  exposure_mode: "Modo de exposição",
  cooldown_hours: "Cooldown (h)",
  maturation_hours: "Maturação (h)",
  finalization_hours: "Finalização (h)",
  template_slug: "Slug do template",
  message_version_id: "ID da versão",
  active: "Ativo",
  is_active: "Ativo",
  params: "Parâmetros (JSON)",
  created_at: "Criado em",
  activated_at: "Ativado em",
  updated_at: "Atualizado em",
  email: "E-mail",
  access_status: "Status de acesso",
  expires_at: "Expira em",
  onboarding_completed_at: "Onboarding concluído em",
  last_used_at: "Último uso",
  purchase_id: "ID da compra",
  provider_product_id: "Produto Cakto (ID)",
  provider_offer_id: "Oferta Cakto (ID)",
  internal_product_code: "Produto interno",
  access_days: "Dias de acesso",
  belevy_benefit_days: "Benefício Belevy (dias)",
  admin_user_id: "Admin responsável",
  action: "Operação",
  entity_type: "Tipo de entidade",
  entity_id: "ID da entidade",
  key: "Chave da flag",
  flag_key: "Chave da flag",
  enabled: "Ativa",
  is_enabled: "Ativa",
  description: "Descrição",
  category: "Categoria",
  action_type: "Tipo de ação",
  measurement_class: "Classe de medição",
};

export const NAV_ITEMS = [
  { href: "/admin", label: "Visão geral", icon: BarChart3, description: "Sinais operacionais e atalhos de controle" },
  { href: "/admin/actions", label: "Ações", icon: Layers, description: "Protocolos e versões editoriais" },
  { href: "/admin/messages", label: "Mensagens", icon: MessageSquare, description: "Templates para comunicação" },
  { href: "/admin/policies", label: "Policies", icon: Sliders, description: "Pesos e taxas de exploração" },
  { href: "/admin/users", label: "Usuários", icon: Users, description: "Acesso e suporte operacional" },
  { href: "/admin/commerce", label: "Commerce", icon: ShoppingBag, description: "Produtos e ofertas mapeadas" },
  { href: "/admin/metrics", label: "Métricas", icon: BarChart3, description: "Sinais do banco operacional" },
  { href: "/admin/audit", label: "Auditoria", icon: ShieldCheck, description: "Log de rastreabilidade" },
  { href: "/admin/feature-flags", label: "Feature flags", icon: Flag, description: "Controle de ativação de flags" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex min-h-[48px] items-center gap-2 text-base font-bold tracking-tight text-slate-950 transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white shadow-xs">
                80
              </span>
              <span>
                Agenda 80/20 <span className="font-normal text-slate-500">/ operação</span>
              </span>
            </Link>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
              Painel Interno
            </span>
          </div>

          <Link
            href="/today"
            className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3.5 text-xs font-semibold text-teal-950 transition hover:bg-teal-100 lg:hidden focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <span>Abrir produto</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 lg:justify-end lg:pb-0">
          <nav aria-label="Navegação administrativa" className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-[48px] items-center gap-2 whitespace-nowrap rounded-xl px-3.5 text-xs font-semibold transition sm:text-sm focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Link
            href="/today"
            className="hidden min-h-[48px] items-center gap-1.5 whitespace-nowrap rounded-xl border border-teal-300 bg-teal-50 px-4 text-xs font-semibold text-teal-950 transition hover:bg-teal-100 lg:inline-flex focus-visible:ring-2 focus-visible:ring-teal-700"
            title="Abrir o produto no ambiente da pessoa usuária"
          >
            <span>Abrir produto</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function AdminNotice({
  error,
  notice,
  warning,
}: {
  error?: string | null;
  notice?: string | null;
  warning?: string | null;
}) {
  if (!error && !notice && !warning) return null;

  return (
    <div className="mt-4 space-y-2">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950 shadow-xs"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
          <div>
            <p className="font-semibold text-red-900">Atenção na operação</p>
            <p className="mt-0.5 text-red-800">{error}</p>
          </div>
        </div>
      )}
      {warning && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 shadow-xs">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="font-semibold text-amber-900">Aviso de governança</p>
            <p className="mt-0.5 text-amber-800">{warning}</p>
          </div>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 shadow-xs"
        >
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <p className="font-semibold text-emerald-900">Sucesso</p>
            <p className="mt-0.5 text-emerald-800">{notice}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ value }: { value: unknown }) {
  const str = String(value ?? "").toLowerCase();
  if (value === true || str === "sim" || str === "active" || str === "published" || str === "ativa" || str === "publicada") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        {value === true ? "Sim" : String(value)}
      </span>
    );
  }
  if (value === false || str === "não" || str === "inactive" || str === "expired" || str === "inativa" || str === "expirada") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {value === false ? "Não" : String(value)}
      </span>
    );
  }
  if (str === "draft" || str === "rascunho") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Rascunho
      </span>
    );
  }
  if (str === "archived" || str === "arquivada" || str === "retired") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">
        {str === "retired" ? "Retirada" : "Arquivada"}
      </span>
    );
  }
  return <span>{readableValue(value)}</span>;
}

function JsonModalCell({ value }: { value: unknown }) {
  const [open, setOpen] = useState(false);
  const jsonStr = typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? "");

  if (value === null || value === undefined || value === "") return <span className="text-slate-400">—</span>;

  let preview = jsonStr;
  if (preview.length > 40) preview = preview.slice(0, 38) + "…";

  return (
    <div className="relative font-mono text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-slate-700 transition hover:border-teal-600 hover:bg-white focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
        title="Clique para expandir o JSON completo"
        aria-expanded={open}
      >
        <span className="max-w-[180px] truncate">{preview}</span>
        {open ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
      </button>

      {open && (
        <div className="mt-2 rounded-2xl border border-slate-300 bg-slate-950 p-4 text-slate-100 shadow-xl">
          <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Payload JSON</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Fechar payload JSON"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-teal-300">
            {jsonStr}
          </pre>
        </div>
      )}
    </div>
  );
}

function WhatsAppPreview({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-[#ECE5DD] p-4 text-slate-900 shadow-inner">
      <div className="mb-2.5 flex items-center justify-between border-b border-slate-300/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">Prévia do Texto</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">{title || "Template"}</span>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-[#E7FFDB] p-3.5 text-xs leading-relaxed text-slate-900 shadow-xs">
          <p className="whitespace-pre-wrap">{body || "Escreva o texto da mensagem no editor para visualizar a prévia aqui…"}</p>
        </div>
      </div>
    </div>
  );
}

function AccessibleConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  pending,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const baseId = useId();
  const titleId = `dialog-title-${baseId}`;
  const descId = `dialog-desc-${baseId}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        confirmBtnRef.current?.focus();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-slate-950/60 backdrop:backdrop-blur-xs"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 id={titleId} className="mt-4 text-lg font-bold text-slate-950">
        {title}
      </h3>
      <p id={descId} className="mt-2 text-sm leading-relaxed text-slate-600">
        {message}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          ref={confirmBtnRef}
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 disabled:opacity-50"
        >
          {pending ? "Processando…" : "Confirmar operação"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400"
        >
          Cancelar
        </button>
      </div>
    </dialog>
  );
}

export function AdminResource({
  title,
  description,
  rows,
  columns,
  fields,
  fieldGroups,
  mutate,
  operations = ["update", "publish"],
  rowActions,
  warningBanner,
  allowCreate = true,
  createButtonLabel = "Criar novo rascunho",
  editorTitle,
  editorDescription,
}: {
  title: string;
  description: string;
  rows: AdminRow[];
  columns: string[];
  fields: AdminField[];
  fieldGroups?: AdminFieldGroup[];
  mutate: AdminMutation;
  operations?: string[];
  rowActions?: (row: AdminRow, id: string) => ReactNode;
  warningBanner?: string;
  allowCreate?: boolean;
  createButtonLabel?: string;
  editorTitle?: string;
  editorDescription?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [values, setValues] = useState<AdminRow>({});
  const [editing, setEditing] = useState<string | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    operation: string;
    id?: string;
    label: string;
    message: string;
  }>({ open: false, operation: "", label: "", message: "" });

  const hasEditor = fields.length > 0;
  const hasOperations = (operations && operations.length > 0) || Boolean(rowActions);

  const run = useCallback(
    (operation: string, id?: string, input?: AdminRow) =>
      startTransition(async () => {
        setError("");
        setNotice("");
        const result = await mutate({ operation, id, values: input });
        if (!result.ok) {
          setError(result.error ?? "Não foi possível concluir a operação.");
        } else {
          setNotice("Operação concluída com sucesso e auditada no sistema.");
          setValues({});
          setEditing(undefined);
          setFormOpen(false);
          router.refresh();
        }
      }),
    [mutate, router]
  );

  const submit = () => run(editing ? "update" : "create", editing, values);

  const requestAction = (operation: string, id?: string, row?: AdminRow, triggerEl?: HTMLElement) => {
    if (triggerEl) {
      lastTriggerRef.current = triggerEl;
    }

    if (operation === "update") {
      setEditing(id);
      // Safe extraction: only extract declared fields and standard aliases
      const sanitizedValues: AdminRow = {};
      if (row) {
        for (const field of fields) {
          if (row[field.name] !== undefined) {
            sanitizedValues[field.name] = row[field.name];
          }
        }
        // Specific alias mapping for actions, messages, policies, flags
        if (row.flag_key && sanitizedValues.flag_key === undefined) sanitizedValues.flag_key = row.flag_key;
        if (row.is_enabled !== undefined && sanitizedValues.is_enabled === undefined) sanitizedValues.is_enabled = row.is_enabled;
        if (row.description !== undefined && sanitizedValues.description === undefined) sanitizedValues.description = row.description;
        if (row.slug && sanitizedValues.slug === undefined) sanitizedValues.slug = row.slug;
        if (row.protocol_slug && sanitizedValues.slug === undefined) sanitizedValues.slug = row.protocol_slug;
        if (row.template_slug && sanitizedValues.slug === undefined) sanitizedValues.slug = row.template_slug;
        if (row.requires_context_signal !== undefined && sanitizedValues.requires_context_signal === undefined) sanitizedValues.requires_context_signal = Boolean(row.requires_context_signal);
        if (row.cooldown_days !== undefined && sanitizedValues.cooldown_days === undefined) sanitizedValues.cooldown_days = row.cooldown_days;
        else if (row.cooldown_hours !== undefined && sanitizedValues.cooldown_days === undefined) sanitizedValues.cooldown_days = Number(row.cooldown_hours) / 24;
        if (row.maturity_hours !== undefined && sanitizedValues.maturity_hours === undefined) sanitizedValues.maturity_hours = row.maturity_hours;
        else if (row.maturation_hours !== undefined && sanitizedValues.maturity_hours === undefined) sanitizedValues.maturity_hours = row.maturation_hours;
        if (row.priority !== undefined && sanitizedValues.priority === undefined) sanitizedValues.priority = row.priority;
        else if (row.prior !== undefined && sanitizedValues.priority === undefined) sanitizedValues.priority = row.prior;
        else if (row.editorial_prior !== undefined && sanitizedValues.priority === undefined) sanitizedValues.priority = row.editorial_prior;
        if (row.guardrail !== undefined && sanitizedValues.guardrail === undefined) sanitizedValues.guardrail = row.guardrail;
        else if (row.ethical_guardrail !== undefined && sanitizedValues.guardrail === undefined) sanitizedValues.guardrail = row.ethical_guardrail;
        if (row.eligibility !== undefined && sanitizedValues.eligibility === undefined) {
          sanitizedValues.eligibility = typeof row.eligibility === "object" ? JSON.stringify(row.eligibility, null, 2) : String(row.eligibility);
        }
        if (row.params !== undefined && sanitizedValues.params === undefined) {
          sanitizedValues.params = typeof row.params === "object" ? JSON.stringify(row.params, null, 2) : String(row.params);
        }
        if (row.steps !== undefined && sanitizedValues.steps === undefined) {
          sanitizedValues.steps = Array.isArray(row.steps) ? row.steps.join("\n") : String(row.steps);
        }
      }
      setValues(sanitizedValues);
      setFormOpen(true);
      return;
    }

    if (operation === "publish") {
      setConfirmDialog({
        open: true,
        operation: "publish",
        id,
        label: "Publicar versão imutável",
        message:
          "Tem certeza de que deseja publicar esta versão? Versões publicadas tornam-se imutáveis para manter a rastreabilidade.",
      });
      return;
    }

    if (operation === "activate") {
      setConfirmDialog({
        open: true,
        operation: "activate",
        id,
        label: "Ativar versão de política",
        message:
          "Esta política passará a ser a referência ativa para novas recomendações. O histórico permanece gravado.",
      });
      return;
    }

    if (operation === "active") {
      const currentActive = Boolean(row?.active ?? row?.is_active);
      setConfirmDialog({
        open: true,
        operation: "active",
        id,
        label: currentActive ? "Desativar item" : "Ativar item",
        message: currentActive
          ? "Deseja desativar este item? Ele não será mais selecionado pelo motor de recomendação."
          : "Deseja ativar este item para uso no motor de recomendação?",
      });
      return;
    }

    if (operation === "resend") {
      setConfirmDialog({
        open: true,
        operation: "resend",
        id,
        label: "Reenviar e-mail de acesso",
        message: "Será emitido um novo link seguro de acesso enviado ao e-mail cadastrado.",
      });
      return;
    }

    run(operation, id, row);
  };

  const handleConfirmAction = () => {
    const { operation, id } = confirmDialog;
    setConfirmDialog({ open: false, operation: "", label: "", message: "" });
    const targetRow = rows.find(
      (r, idx) =>
        String(r.action_version_id ?? r.version_id ?? r.id ?? r.protocol_id ?? r.user_id ?? r.flag_key ?? idx) === id
    );
    run(operation, id, targetRow);
    lastTriggerRef.current?.focus();
  };

  const handleCancelDialog = () => {
    setConfirmDialog({ open: false, operation: "", label: "", message: "" });
    lastTriggerRef.current?.focus();
  };

  const groups = fieldGroups ?? [
    {
      title: "Configuração",
      fields: fields,
    },
  ];

  return (
    <section className="mt-6 space-y-6" aria-busy={pending}>
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{description}</p>
        </div>

        {hasEditor && allowCreate && !formOpen && (
          <button
            type="button"
            onClick={(e) => {
              lastTriggerRef.current = e.currentTarget;
              setEditing(undefined);
              setValues({});
              setFormOpen(true);
            }}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>{createButtonLabel}</span>
          </button>
        )}
      </div>

      <AdminNotice error={error} notice={notice} warning={warningBanner} />

      {/* Editor Inline Intencional */}
      {hasEditor && formOpen && (
        <div className="relative rounded-2xl border border-slate-300 bg-white p-5 shadow-md sm:p-6">
          <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                <FileEdit className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-950">
                  {editing
                    ? `Editar ${editorTitle ?? "registro"} (${editing})`
                    : (editorTitle ?? "Novo rascunho")}
                </h3>
                <p className="text-xs text-slate-500">
                  {editing
                    ? (editorDescription ?? "Altere os parâmetros permitidos e salve.")
                    : "Preencha os campos conhecidos para submissão auditável."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditing(undefined);
                setValues({});
                setFormOpen(false);
                lastTriggerRef.current?.focus();
              }}
              className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <X className="h-4 w-4" />
              <span>Fechar editor</span>
            </button>
          </div>

          {/* Renderização de Grupos de Campos */}
          <div className="mt-5 space-y-6">
            {groups.map((group, groupIdx) => (
              <div key={groupIdx} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">{group.title}</h4>
                {group.description && <p className="mt-1 text-xs text-slate-500">{group.description}</p>}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {group.fields.map((field) => {
                    const rawValue = values[field.name];
                    const isTextarea = field.type === "textarea";
                    const isBoolean = field.type === "boolean";
                    const isNumber = field.type === "number";
                    const isSelect = field.type === "select";

                    const formattedValue =
                      typeof rawValue === "object" && rawValue !== null
                        ? JSON.stringify(rawValue, null, 2)
                        : String(rawValue ?? "");

                    return (
                      <div
                        key={field.name}
                        className={`flex flex-col justify-start ${
                          isTextarea || field.name === "title" || field.name === "params" || field.name === "body"
                            ? "sm:col-span-2"
                            : ""
                        }`}
                      >
                        <label htmlFor={`field-${field.name}`} className="text-xs font-bold text-slate-800">
                          {field.label}
                        </label>
                        {field.description && <span className="mt-0.5 text-[11px] text-slate-500">{field.description}</span>}

                        {isTextarea ? (
                          <textarea
                            id={`field-${field.name}`}
                            value={formattedValue}
                            placeholder={field.placeholder}
                            rows={field.name === "body" || field.name === "params" ? 5 : 3}
                            onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                            className="mt-1.5 min-h-[96px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-xs leading-relaxed text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          />
                        ) : isBoolean ? (
                          <label
                            htmlFor={`field-${field.name}`}
                            className="mt-2 flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 transition hover:bg-slate-50"
                          >
                            <input
                              id={`field-${field.name}`}
                              type="checkbox"
                              checked={Boolean(rawValue)}
                              onChange={(e) => setValues({ ...values, [field.name]: e.target.checked })}
                              className="h-5 w-5 rounded border-slate-300 accent-teal-700 focus:ring-teal-700"
                            />
                            <span className="text-xs font-semibold text-slate-800">
                              {field.label} ({Boolean(rawValue) ? "Ativo" : "Inativo"})
                            </span>
                          </label>
                        ) : isSelect && field.options ? (
                          <select
                            id={`field-${field.name}`}
                            value={formattedValue}
                            onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                            className="mt-1.5 min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          >
                            <option value="">Selecione…</option>
                            {field.options.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`field-${field.name}`}
                            type={isNumber ? "number" : "text"}
                            value={formattedValue}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              setValues({
                                ...values,
                                [field.name]: isNumber ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value,
                              })
                            }
                            className="mt-1.5 min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3.5 text-xs text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Preview de Mensagem se houver campo body */}
            {fields.some((f) => f.name === "body") && (
              <WhatsAppPreview body={String(values.body ?? "")} title={String(values.title ?? values.slug ?? "")} />
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-teal-800 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-900 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-800"
            >
              {pending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Salvando…</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{editing ? "Salvar alterações" : (createButtonLabel.replace("+ ", "") || "Criar rascunho")}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(undefined);
                setValues({});
                setFormOpen(false);
                lastTriggerRef.current?.focus();
              }}
              disabled={pending}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmação Acessível */}
      <AccessibleConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.label}
        message={confirmDialog.message}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelDialog}
        pending={pending}
      />

      {/* Tabela Operacional */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3.5 whitespace-nowrap">
                    {COLUMN_LABELS[column] ?? column.replaceAll("_", " ")}
                  </th>
                ))}
                {hasOperations && (
                  <th className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">Ações operacionais</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, index) => {
                const id = String(
                  row.action_version_id ??
                    row.version_id ??
                    row.id ??
                    row.protocol_id ??
                    row.user_id ??
                    row.flag_key ??
                    row.key ??
                    index
                );

                const isDraftOrMutable =
                  row.status === undefined ||
                  row.status === "draft" ||
                  row.status === "rascunho" ||
                  row.flag_key !== undefined ||
                  row.provider_product_id !== undefined;

                return (
                  <tr key={id} className="transition hover:bg-slate-50/70">
                    {columns.map((column) => {
                      const value = row[column];
                      const isJson = typeof value === "object" && value !== null;
                      const isStatus =
                        column === "status" ||
                        column === "active" ||
                        column === "is_active" ||
                        column === "enabled" ||
                        column === "is_enabled" ||
                        column === "access_status";

                      return (
                        <td key={column} className="max-w-xs px-4 py-3.5 align-top text-slate-800">
                          {isJson ? (
                            <JsonModalCell value={value} />
                          ) : isStatus ? (
                            <StatusBadge value={value} />
                          ) : (
                            <span className="font-mono text-xs">{readableValue(value)}</span>
                          )}
                        </td>
                      );
                    })}

                    {hasOperations && (
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {operations?.map((op) => {
                            if (op === "update") {
                              if (!isDraftOrMutable) {
                                return (
                                  <span
                                    key={op}
                                    className="inline-flex min-h-[48px] items-center px-3 py-2 text-xs text-slate-400"
                                    title="Versões publicadas ou ativas são imutáveis. Crie um novo rascunho para alterações."
                                  >
                                    Imutável
                                  </span>
                                );
                              }
                              return (
                                <button
                                  key={op}
                                  type="button"
                                  disabled={pending}
                                  onClick={(e) => requestAction("update", id, row, e.currentTarget)}
                                  className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-900 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-700"
                                >
                                  <FileEdit className="h-4 w-4 text-slate-500" />
                                  <span>Editar</span>
                                </button>
                              );
                            }
                            if (op === "publish") {
                              return (
                                <button
                                  key={op}
                                  type="button"
                                  disabled={pending || String(row.status) === "published"}
                                  onClick={(e) => requestAction("publish", id, row, e.currentTarget)}
                                  className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl bg-teal-800 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-teal-900 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-teal-700"
                                >
                                  <Send className="h-4 w-4" />
                                  <span>Publicar</span>
                                </button>
                              );
                            }
                            if (op === "activate") {
                              return (
                                <button
                                  key={op}
                                  type="button"
                                  disabled={pending || Boolean(row.status === "active")}
                                  onClick={(e) => requestAction("activate", id, row, e.currentTarget)}
                                  className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-700"
                                >
                                  <Check className="h-4 w-4" />
                                  <span>Ativar</span>
                                </button>
                              );
                            }
                            if (op === "active") {
                              const isActive = Boolean(row.active ?? row.is_active);
                              return (
                                <button
                                  key={op}
                                  type="button"
                                  disabled={pending}
                                  onClick={(e) => requestAction("active", id, row, e.currentTarget)}
                                  className={`inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-slate-950 ${
                                    isActive
                                      ? "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
                                      : "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                                  }`}
                                >
                                  <Power className="h-4 w-4" />
                                  <span>{isActive ? "Desativar" : "Ativar"}</span>
                                </button>
                              );
                            }
                            if (op === "resend") {
                              return (
                                <button
                                  key={op}
                                  type="button"
                                  disabled={pending}
                                  onClick={(e) => requestAction("resend", id, row, e.currentTarget)}
                                  className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-slate-400"
                                >
                                  <RotateCcw className="h-4 w-4 text-slate-500" />
                                  <span>Reenviar acesso</span>
                                </button>
                              );
                            }
                            return null;
                          })}
                          {rowActions?.(row, id)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Info className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">Nenhum registro encontrado</p>
            <p className="mt-1 text-xs text-slate-500">
              Não há dados cadastrados para os parâmetros atuais.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
