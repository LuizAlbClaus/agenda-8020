"use client";

import { useState, useTransition } from "react";
import { requestAccountDeletion, requestDataExport } from "./privacy-actions";

export default function PrivacyRequests() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  function run(action: typeof requestDataExport, success: string) {
    setMessage(""); setError(false);
    startTransition(async () => {
      const result = await action();
      setError(!result.ok);
      setMessage(result.ok ? success : result.error);
    });
  }
  function deleteAccount() {
    if (!window.confirm("Solicitar a exclusão dos seus dados do Agenda 80/20?")) return;
    run(requestAccountDeletion, "Solicitação de exclusão registrada.");
  }
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="privacy-requests-heading">
    <h2 id="privacy-requests-heading" className="text-lg font-bold text-slate-900">Seus dados</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Você pode solicitar uma cópia dos dados da sua conta ou pedir a exclusão deles. A solicitação será registrada para atendimento.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <button type="button" disabled={pending} onClick={() => run(requestDataExport, "Solicitação de exportação registrada.")} className="min-h-11 rounded-full border border-teal-800 px-4 text-sm font-semibold text-teal-800 disabled:opacity-50">Solicitar meus dados</button>
      <button type="button" disabled={pending} onClick={deleteAccount} className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-700 disabled:opacity-50">Solicitar exclusão</button>
    </div>
    {message && <p role={error ? "alert" : "status"} className={`mt-4 text-sm ${error ? "text-red-700" : "text-teal-800"}`}>{message}</p>}
  </section>;
}
