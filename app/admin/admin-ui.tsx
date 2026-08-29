"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState, useTransition } from "react";
import { readableValue, type AdminResult, type AdminRow } from "@/lib/admin-types";

export type AdminField = { name: string; label: string; type?: "text" | "textarea" | "number" | "boolean"; placeholder?: string };
export type AdminMutation = (input: { operation: string; id?: string; values?: AdminRow }) => Promise<AdminResult>;

const button = "inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 transition hover:border-teal-700 hover:text-teal-800 disabled:opacity-50";

export function AdminResource({ title, description, rows, columns, fields, mutate, operations = ["update", "publish"], rowActions }: { title: string; description: string; rows: AdminRow[]; columns: string[]; fields: AdminField[]; mutate: AdminMutation; operations?: string[]; rowActions?: (row: AdminRow, id: string) => ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [values, setValues] = useState<AdminRow>({});
  const [editing, setEditing] = useState<string | undefined>();
  const run = (operation: string, id?: string, input?: AdminRow) => startTransition(async () => { setError(""); setNotice(""); const result = await mutate({ operation, id, values: input }); if (!result.ok) setError(result.error ?? "Não foi possível concluir."); else { setNotice("Alteração registrada."); setValues({}); setEditing(undefined); router.refresh(); } });
  const submit = () => run(editing ? "update" : "create", editing, values);
  return <section className="mt-7">
    <div className="mb-4"><h2 className="text-lg font-semibold text-slate-950">{title}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p></div>
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">{editing ? "Editar rascunho" : "Novo rascunho"}</h3>{editing && <button type="button" className={button} onClick={() => { setEditing(undefined); setValues({}); }}>Cancelar</button>}</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{fields.map((field) => <label key={field.name} className="text-sm font-medium text-slate-700">{field.label}{field.type === "textarea" ? <textarea value={String(values[field.name] ?? "")} placeholder={field.placeholder} onChange={(e) => setValues({ ...values, [field.name]: e.target.value })} className="mt-1 min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-teal-700" /> : field.type === "boolean" ? <input type="checkbox" checked={Boolean(values[field.name])} onChange={(e) => setValues({ ...values, [field.name]: e.target.checked })} className="ml-2 align-middle accent-teal-700" /> : <input type={field.type ?? "text"} value={String(values[field.name] ?? "")} placeholder={field.placeholder} onChange={(e) => setValues({ ...values, [field.name]: field.type === "number" ? Number(e.target.value) : e.target.value })} className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 px-3 outline-none focus:border-teal-700" />}</label>)}</div>
      <button type="button" onClick={submit} disabled={pending} className="mt-4 min-h-10 rounded-lg bg-teal-800 px-4 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Salvando…" : editing ? "Salvar rascunho" : "Criar rascunho"}</button>
      {notice && <p className="mt-3 text-sm text-teal-800" role="status">{notice}</p>}{error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
    </div>
    <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map((column) => <th key={column} className="px-4 py-3 font-semibold">{column.replaceAll("_", " ")}</th>)}<th className="px-4 py-3 font-semibold">Operação</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => { const id = String(row.action_version_id ?? row.version_id ?? row.id ?? row.protocol_id ?? row.user_id ?? row.flag_key ?? index); return <tr key={id}><>{columns.map((column) => <td key={column} className="max-w-xs px-4 py-3 align-top text-slate-700">{readableValue(row[column])}</td>)}</><td className="px-4 py-3 align-top"><div className="flex flex-wrap gap-2">{operations.map((operation) => <button key={operation} type="button" disabled={pending} className={button} onClick={() => operation === "update" ? (setEditing(id), setValues(row)) : run(operation, id, row)}>{operation === "active" ? "Ativar/desativar" : operation === "publish" ? "Publicar" : operation === "activate" ? "Ativar" : operation === "resend" ? "Reenviar acesso" : operation}</button>)}{rowActions?.(row, id)}</div></td></tr>; })}</tbody></table>{rows.length === 0 && <div className="px-4 py-10 text-center text-sm text-slate-500">Nenhum registro disponível ainda.</div>}</div>
  </section>;
}

export function AdminNotice({ error }: { error?: string | null }) { return error ? <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{error}</div> : null; }
