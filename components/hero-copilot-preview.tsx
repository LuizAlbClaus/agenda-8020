"use client";

import { useState } from "react";
import { Check, Copy, Mic, ShieldAlert, Sparkles, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const previewTabs = [
  {
    id: "price",
    label: "Achei Caro",
    subtext: "Quando a cliente acha o serviço caro",
    textScript:
      "Entendo perfeitamente, Ju! Mas deixa eu te contar um detalhe: esse procedimento dura de 28 a 30 dias impecável. Se você dividir, dá menos de R$ 4 por dia para acordar pronta todo dia sem perder tempo no espelho. E você ainda tem minha garantia de 7 dias! Tenho quinta às 14h ou sexta às 10h. Qual fica mais tranquilo para você?",
    audioScript:
      "Oi Ju! Super entendo você, de verdade... Mas deixa eu te contar: esse procedimento dura quase um mês inteirinho perfeito. Dá menos de R$ 4 por dia pra você acordar maravilhosa todo santo dia. E você tem minha garantia de 7 dias. Separei quinta às 14h ou sexta às 10h. Qual dos dois cabe melhor na sua rotina?",
    audioTone: "Voz calma, segura e calorosa, com um sorriso leve.",
    audioSeconds: "22s",
  },
  {
    id: "browse",
    label: "Só o Preço",
    subtext: "Quando perguntam só o valor e somem",
    textScript:
      "Olá! Tudo bem? O valor varia entre R$ 120 e R$ 150 dependendo do estado atual e do efeito que você deseja. Me conta uma coisa rapidinho: você já fez esse procedimento antes ou seria a sua primeira vez?",
    audioScript:
      "Oi, tudo bem? O valor fica entre R$ 120 e R$ 150, depende muito do efeito que você prefere. Me conta uma coisinha: você já fez esse procedimento antes ou seria a primeira vez aqui comigo?",
    audioTone: "Interessada e atenciosa, assumindo postura de especialista.",
    audioSeconds: "18s",
  },
  {
    id: "procrastinate",
    label: "Vou Ver e Te Aviso",
    subtext: "Quando pedem horário e não confirmam",
    textScript:
      "Combinado, Ju! Para você não correr o risco de ficar sem o horário que me pediu, vou deixar a vaga de quinta às 15h pré-reservada no seu nome até às 17h, tá bom? Se até lá você me confirmar, ela é sua! Um beijo!",
    audioScript:
      "Perfeito, Ju! Faz assim: como a minha agenda dessa semana tá quase fechando, vou deixar a vaga de quinta pré-reservada no seu nome até o final da tarde, tá bom? Assim você não perde se decidir fazer!",
    audioTone: "Desapegada e prestativa, ativando reserva de cortesia.",
    audioSeconds: "16s",
  },
];

export function HeroCopilotPreview() {
  const [activeTab, setActiveTab] = useState("price");
  const [scriptMode, setScriptMode] = useState<"text" | "audio">("text");
  const [copied, setCopied] = useState(false);

  const current = previewTabs.find((t) => t.id === activeTab) ?? previewTabs[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptMode === "text" ? current.textScript : current.audioScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      aria-label="Demonstração interativa do SOS Copiloto"
      className="overflow-hidden rounded-[var(--radius-card)] border-2 border-[var(--color-action-primary)]/30 bg-[var(--color-surface-card)] shadow-[var(--shadow-card-elevated)]"
    >
      {/* App Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-action-primary)] text-white shadow-xs">
            <ShieldAlert className="size-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-[var(--color-ink-solid)]">
              SOS Copiloto de Vendas
            </p>
            <p className="text-[10px] text-[var(--color-ink-muted)]">
              No bolso entre atendimentos
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-revenue-subtle)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-revenue-primary)]">
          <Sparkles className="size-3" />
          Ao Vivo
        </span>
      </div>

      <div className="p-4 sm:p-6">
        {/* Objection Selector */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
          O que a cliente disse no WhatsApp?
        </p>
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
          {previewTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "min-h-[38px] shrink-0 rounded-[var(--radius-pill)] px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer border",
                activeTab === tab.id
                  ? "bg-[var(--color-action-primary)] text-white border-[var(--color-action-primary)] shadow-xs"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-ink-solid)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mode Toggle: Texto vs Áudio */}
        <div className="mt-4 flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2.5">
          <p className="text-xs font-semibold text-[var(--color-ink-muted)] truncate mr-2">
            {current.subtext}
          </p>
          <div className="inline-flex p-0.5 rounded-[var(--radius-pill)] bg-[var(--color-surface-muted)] border border-[var(--color-border-subtle)] shrink-0">
            <button
              type="button"
              onClick={() => setScriptMode("text")}
              className={cn(
                "px-2.5 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer",
                scriptMode === "text"
                  ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                  : "text-[var(--color-ink-muted)]"
              )}
            >
              Texto
            </button>
            <button
              type="button"
              onClick={() => setScriptMode("audio")}
              className={cn(
                "px-2.5 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                scriptMode === "audio"
                  ? "bg-white text-[var(--color-action-primary)] shadow-xs"
                  : "text-[var(--color-ink-muted)]"
              )}
            >
              <Mic className="size-3" />
              <span>Áudio</span>
            </button>
          </div>
        </div>

        {/* Script Content */}
        <div className="mt-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] p-3.5 sm:p-4">
          {scriptMode === "text" ? (
            <p className="text-xs sm:text-sm leading-relaxed text-[var(--color-ink-solid)] select-all">
              “{current.textScript}”
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--color-action-primary)] bg-[var(--color-action-subtle)] px-2.5 py-1 rounded-sm border border-[var(--color-action-primary)]/20">
                <span className="flex items-center gap-1">
                  <Volume2 className="size-3.5" />
                  Roteiro de Áudio (~{current.audioSeconds})
                </span>
                <span className="text-[10px] text-[var(--color-ink-muted)]">Pronto para gravar</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-[var(--color-ink-solid)] font-medium">
                “{current.audioScript}”
              </p>
              <p className="text-[11px] text-[var(--color-ink-muted)] italic pt-1 border-t border-[var(--color-border-subtle)]">
                Guia de tom: {current.audioTone}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] font-medium text-[var(--color-revenue-primary)]">
            ✓ Sem desconto. Com autoridade.
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-[var(--radius-button)] bg-[var(--color-action-primary)] px-4 text-xs font-bold text-white shadow-xs hover:bg-[var(--color-action-hover)] transition-all cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-white" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copiar para WhatsApp</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
