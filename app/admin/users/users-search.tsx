"use client";

import { useState, useTransition } from "react";
import { AdminResource, type AdminMutation } from "../admin-ui";
import type { AdminRow } from "@/lib/admin-types";
import { searchUsers } from "../actions";
import SupportEmailCorrection from "./support-email-correction";
import { Search, RotateCcw, AlertCircle } from "lucide-react";

export default function UsersSearch({
  initialRows,
  initialError,
  mutate,
}: {
  initialRows: AdminRow[];
  initialError?: string | null;
  mutate: AdminMutation;
}) {
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

  function handleClear() {
    setEmail("");
    startTransition(async () => {
      setError("");
      const result = await searchUsers("");
      setRows(result.rows);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      {/* Barra de Busca de Usuário */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5">
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-center" role="search">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <label htmlFor="admin-user-email" className="sr-only">
              Buscar conta por e-mail
            </label>
            <input
              id="admin-user-email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Digite o e-mail completo ou parcial cadastrado…"
              className="min-h-[48px] w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-slate-950"
            >
              {pending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Buscando…</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Buscar</span>
                </>
              )}
            </button>

            {email && (
              <button
                type="button"
                disabled={pending}
                onClick={handleClear}
                className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <RotateCcw className="h-4 w-4 text-slate-500" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-700" role="alert">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tabela de Usuários e Suporte (Sem benefits, apenas colunas do RPC) */}
      <AdminResource
        title="Registros de Acesso e Contas"
        description="Consulte os dados estritos para suporte: e-mail cadastrado, vigência do acesso, data de conclusão do onboarding, último uso ativo e ID da compra vinculada."
        rows={rows}
        columns={[
          "email",
          "access_status",
          "expires_at",
          "onboarding_completed_at",
          "last_used_at",
          "purchase_id",
        ]}
        fields={[]}
        mutate={mutate}
        operations={["resend"]}
        rowActions={(row) => (
          <SupportEmailCorrection
            purchaseId={typeof row.purchase_id === "string" ? row.purchase_id : undefined}
            currentEmail={String(row.email ?? "")}
            mutate={mutate}
          />
        )}
      />
    </div>
  );
}
