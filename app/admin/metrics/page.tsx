import { listAdminResource } from "@/lib/admin";
import { readableValue } from "@/lib/admin-types";
import { AdminNotice } from "../admin-ui";
import { Users, CheckCircle, Flame, Clock, Activity, Shuffle, Calendar, ThumbsUp, Layers } from "lucide-react";

export default async function MetricsPage() {
  const result = await listAdminResource("admin_get_metrics");
  const row = result.rows[0] ?? {};

  const PRIMARY_SIGNALS: Record<string, { label: string; description: string; icon: typeof Activity }> = {
    active_users: {
      label: "Usuários ativos (30 dias)",
      description: "Pessoas usuárias com login nos últimos 30 dias",
      icon: Users,
    },
    onboarding_completed: {
      label: "Onboardings concluídos",
      description: "Pessoas usuárias com diagnóstico inicial preenchido",
      icon: CheckCircle,
    },
    first_action_users: {
      label: "Com primeira recomendação",
      description: "Pessoas usuárias com ao menos uma ação gerada",
      icon: Layers,
    },
    actions_completed: {
      label: "Ações executadas",
      description: "Execuções de protocolos registradas",
      icon: Flame,
    },
    swaps: {
      label: "Trocas solicitadas (Swaps)",
      description: "Substituições solicitadas no fluxo do orientador",
      icon: Shuffle,
    },
    pending_outcomes: {
      label: "Pendências de desfecho",
      description: "Ações em período de maturação aguardando resultado",
      icon: Clock,
    },
    interests: {
      label: "Sinais de interesse",
      description: "Clientes interessados registrados nos desfechos",
      icon: ThumbsUp,
    },
    bookings: {
      label: "Agendamentos reportados",
      description: "Horários agendados registrados nos desfechos",
      icon: Calendar,
    },
  };

  // Scalar metrics from RPC, avoiding duplicate pending vs pending_outcomes
  const scalarMetrics = Object.entries(row).filter(
    ([key, value]) => typeof value !== "object" && key !== "pending"
  );

  const swapReasons = typeof row.swap_reasons === "object" && row.swap_reasons !== null ? (row.swap_reasons as Record<string, number>) : {};
  const recommendedByAction = typeof row.recommended_by_action === "object" && row.recommended_by_action !== null ? (row.recommended_by_action as Record<string, number>) : {};
  const resultsByCategory = typeof row.results_by_category === "object" && row.results_by_category !== null ? (row.results_by_category as Record<string, { interest?: number; booking?: number }>) : {};

  return (
    <div className="space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-900">
          <span>Telemetria Operacional</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Métricas e Sinais do Banco Operacional
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          Snapshot direto extraído do banco de dados operacional. Sinais canônicos de adesão, execução de protocolos e desfechos reportados.
        </p>
      </div>

      <AdminNotice error={result.error} />

      {/* Sinais Escalares do Banco */}
      <section aria-labelledby="signals-grid-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="signals-grid-heading" className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Sinais Operacionais Registrados
          </h2>
          <span className="text-xs font-medium text-slate-500">Snapshot server-side</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scalarMetrics.map(([key, value]) => {
            const info = PRIMARY_SIGNALS[key] ?? {
              label: key.replaceAll("_", " "),
              description: "Sinal operacional registrado no sistema",
              icon: Activity,
            };
            const Icon = info.icon;

            return (
              <div
                key={key}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {info.label}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-3xl font-black tracking-tight text-slate-950">
                    {readableValue(value)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{info.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detalhamentos Reais por Categoria, Motivo de Troca e Recomendações */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Motivos de Troca de Ação */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Motivos de Troca (Swaps)
          </h3>
          <p className="mt-1 text-xs text-slate-500">Distribuição informada pelas pessoas usuárias</p>
          <div className="mt-4 space-y-2">
            {Object.entries(swapReasons).length > 0 ? (
              Object.entries(swapReasons).map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <span className="font-medium text-slate-700">{reason}</span>
                  <span className="font-mono font-bold text-slate-950">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Nenhum swap registrado até o momento.</p>
            )}
          </div>
        </div>

        {/* Recomendações por Ação */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recomendações Emitidas
          </h3>
          <p className="mt-1 text-xs text-slate-500">Volume gerado pelo motor por protocolo</p>
          <div className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-1">
            {Object.entries(recommendedByAction).length > 0 ? (
              Object.entries(recommendedByAction).map(([actionTitle, count]) => (
                <div key={actionTitle} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <span className="truncate pr-2 font-medium text-slate-700" title={actionTitle}>
                    {actionTitle}
                  </span>
                  <span className="font-mono font-bold text-slate-950">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Nenhuma recomendação registrada.</p>
            )}
          </div>
        </div>

        {/* Resultados por Categoria */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Resultados por Categoria
          </h3>
          <p className="mt-1 text-xs text-slate-500">Interesses e agendamentos reportados</p>
          <div className="mt-4 space-y-2">
            {Object.entries(resultsByCategory).length > 0 ? (
              Object.entries(resultsByCategory).map(([category, data]) => (
                <div key={category} className="rounded-xl bg-slate-50 p-3 text-xs">
                  <span className="font-bold text-slate-900 capitalize">{category}</span>
                  <div className="mt-2 flex items-center justify-between text-slate-600">
                    <span>Interesses: <strong className="text-slate-950 font-mono">{data.interest ?? 0}</strong></span>
                    <span>Agendamentos: <strong className="text-emerald-800 font-mono">{data.booking ?? 0}</strong></span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Nenhum resultado computado.</p>
            )}
          </div>
        </div>
      </div>

      {result.rows.length === 0 && !result.error && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          Ainda não há dados suficientes para exibição de métricas operacionais.
        </div>
      )}
    </div>
  );
}
