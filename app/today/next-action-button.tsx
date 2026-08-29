"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { requestNextRecommendation } from "./actions";

export default function NextActionButton() {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [error, setError] = useState("");
  function request() { setError(""); startTransition(async () => { const result = await requestNextRecommendation(); if (!result.ok) { setError(result.error ?? "Não conseguimos atualizar seu plano agora."); return; } const recommendationId = (result.data as { recommendation_id?: string })?.recommendation_id; if (recommendationId) router.push(`/action/${recommendationId}`); else router.refresh(); }); }
  return <div><button type="button" onClick={request} disabled={pending} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-teal-800 px-5 font-semibold text-white disabled:opacity-50">{pending ? "Atualizando…" : "Ver minha próxima ação"}</button>{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>;
}
