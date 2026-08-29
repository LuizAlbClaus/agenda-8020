"use client";

import { useState, useTransition } from "react";
import type { AdminMutation } from "../admin-ui";

export default function SupportEmailCorrection({ purchaseId, currentEmail, mutate }: { purchaseId?: string; currentEmail: string; mutate: AdminMutation }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(currentEmail);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    startTransition(async () => {
      if (!purchaseId) { setMessage("Não há uma compra registrada para corrigir."); return; }
      const result = await mutate({ operation: "correct_email", id: purchaseId, values: { new_email: email, reason } });
      setMessage(result.ok ? "Correção registrada e auditada." : result.error ?? "Não foi possível corrigir o e-mail.");
      if (result.ok) { setOpen(false); setReason(""); }
    });
  }
  if (!purchaseId) return null;
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700">Corrigir e-mail</button>;
  return <form onSubmit={submit} className="mt-2 grid min-w-64 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
    <label className="text-xs font-semibold text-slate-700">Novo e-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 min-h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm" /></label>
    <label className="text-xs font-semibold text-slate-700">Motivo auditável<textarea required minLength={3} maxLength={240} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 min-h-16 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm" /></label>
    <div className="flex gap-2"><button type="submit" disabled={pending} className="min-h-9 rounded-lg bg-teal-800 px-3 text-xs font-semibold text-white disabled:opacity-50">{pending ? "Salvando…" : "Salvar"}</button><button type="button" onClick={() => setOpen(false)} className="min-h-9 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700">Cancelar</button></div>
    {message && <p role="status" className="text-xs text-teal-800">{message}</p>}
  </form>;
}
