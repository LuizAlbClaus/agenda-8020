"use client";

import { useState, useTransition } from "react";
import type { AdminMutation } from "../admin-ui";
import { Mail, Check, X, ShieldAlert } from "lucide-react";

export default function SupportEmailCorrection({
  purchaseId,
  currentEmail,
  mutate,
}: {
  purchaseId?: string;
  currentEmail: string;
  mutate: AdminMutation;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(currentEmail);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    startTransition(async () => {
      if (!purchaseId) {
        setMessage("Não há uma compra vinculada para retificação.");
        setIsError(true);
        return;
      }

      const result = await mutate({
        operation: "correct_email",
        id: purchaseId,
        values: { new_email: email, reason },
      });

      if (result.ok) {
        setMessage("E-mail retificado e registrado no log de auditoria.");
        setIsError(false);
        setOpen(false);
        setReason("");
      } else {
        setMessage(result.error ?? "Não foi possível concluir a retificação do e-mail.");
        setIsError(true);
      }
    });
  }

  if (!purchaseId) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setEmail(currentEmail);
          setOpen(true);
        }}
        className="inline-flex min-h-[48px] items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400"
      >
        <Mail className="h-4 w-4 text-slate-500" />
        <span>Corrigir e-mail</span>
      </button>
    );
  }

  return (
    <div className="relative mt-2 w-full min-w-[280px] max-w-sm rounded-2xl border border-slate-300 bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span>Retificação Auditada de E-mail</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setMessage("");
          }}
          className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label="Fechar formulário de retificação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={submit} className="mt-3 space-y-3">
        <div>
          <label htmlFor={`correct-email-${purchaseId}`} className="block text-[11px] font-bold text-slate-700">
            Novo e-mail da pessoa compradora
          </label>
          <input
            id={`correct-email-${purchaseId}`}
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nome@dominio.com"
            className="mt-1 min-h-[48px] w-full rounded-xl border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div>
          <label htmlFor={`correct-reason-${purchaseId}`} className="block text-[11px] font-bold text-slate-700">
            Motivo da correção (obrigatório para auditoria)
          </label>
          <textarea
            id={`correct-reason-${purchaseId}`}
            required
            minLength={3}
            maxLength={240}
            rows={2}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ex.: Pessoa compradora digitou gmai.com no checkout e solicitou ajuste via suporte."
            className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 outline-none transition focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
          />
          <span className="text-[10px] text-slate-400">Entre 3 e 240 caracteres</span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-800 px-3.5 text-xs font-semibold text-white transition hover:bg-teal-900 disabled:opacity-50"
          >
            {pending ? (
              <span>Salvando…</span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Salvar retificação</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={pending}
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>

        {message && (
          <p
            role={isError ? "alert" : "status"}
            className={`mt-2 text-xs font-medium ${isError ? "text-red-700" : "text-emerald-700"}`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
