"use client";

import { useState, useTransition } from "react";
import { AdminResource, type AdminMutation } from "../admin-ui";
import type { AdminRow } from "@/lib/admin-types";
import { searchUsers } from "../actions";
import SupportEmailCorrection from "./support-email-correction";

export default function UsersSearch({ initialRows, initialError, mutate }: { initialRows: AdminRow[]; initialError?: string | null; mutate: AdminMutation }) {
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState(initialRows);
  const [error, setError] = useState(initialError ?? "");
  const [pending, startTransition] = useTransition();
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      setError("");
      const result = await searchUsers(email);
      setRows(result.rows);
      if (result.error) setError(result.error);
    });
  }
  return <>
    <form onSubmit={submit} className="mt-7 flex flex-col gap-2 sm:flex-row" role="search">
      <label htmlFor="admin-user-email" className="sr-only">Buscar por e-mail</label>
      <input id="admin-user-email" type="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="buscar por e-mail" className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-teal-700" />
      <button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-teal-800 px-5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Buscando…" : "Buscar"}</button>
      {email && <button type="button" disabled={pending} onClick={() => { setEmail(""); startTransition(async () => { const result = await searchUsers(""); setRows(result.rows); setError(result.error ?? ""); }); }} className="min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Limpar</button>}
    </form>
    {error && <p className="mt-3 text-sm text-amber-900" role="alert">{error}</p>}
    <AdminResource title="Acesso e suporte" description="Consulte apenas o necessário para suporte: email, acesso, expiração, onboarding, último uso, benefícios e purchase ID." rows={rows} columns={["email", "access_status", "expires_at", "onboarding_completed_at", "last_used_at", "benefits", "purchase_id"]} fields={[]} mutate={mutate} operations={["resend"]} rowActions={(row) => <SupportEmailCorrection purchaseId={typeof row.purchase_id === "string" ? row.purchase_id : undefined} currentEmail={String(row.email ?? "")} mutate={mutate} />} />
  </>;
}
