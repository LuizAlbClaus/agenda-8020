"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { requestNextRecommendation } from "./actions";

export default function NextActionButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function request() {
    setError("");
    startTransition(async () => {
      const result = await requestNextRecommendation();
      if (!result.ok) {
        setError(result.error ?? "Não conseguimos atualizar seu plano agora.");
        return;
      }
      const recommendationId = (result.data as { recommendation_id?: string })?.recommendation_id;
      if (recommendationId) {
        router.push(`/action/${recommendationId}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={request}
        disabled={pending}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[var(--color-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-action-primary)] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Atualizando plano…</span>
          </>
        ) : (
          <>
            <span>Ver minha próxima ação</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </>
        )}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-xs sm:text-sm font-medium text-[var(--color-danger-primary)]">
          {error}
        </p>
      )}
    </div>
  );
}
