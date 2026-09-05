"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Check, Sparkles, X, ShieldCheck } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellDownsellBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string;
  finalAccessUrl: string;
}

export function UpsellDownsellBottomSheet({
  isOpen,
  onClose,
  checkoutUrl,
  finalAccessUrl,
}: UpsellDownsellBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Fecha com a tecla ESC e trava o scroll da página enquanto o bottom sheet estiver aberto
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        trackFunnelEvent("upsell_downsell_declined", { trigger: "escape_key" });
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAccept = () => {
    trackFunnelEvent("upsell_downsell_accepted", { plan: "semiannual", price: 97 });
    trackFunnelEvent("downsell_checkout_clicked", { plan: "semiannual", price: 97 });
  };

  const handleDecline = () => {
    trackFunnelEvent("upsell_downsell_declined", { trigger: "explicit_link" });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="downsell-sheet-title"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          trackFunnelEvent("upsell_downsell_declined", { trigger: "backdrop_click" });
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg rounded-t-[28px] bg-[#FBF9F5] p-5 sm:p-6 pb-8 sm:pb-8 shadow-2xl border-t border-[#D4A373]/30 animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto"
      >
        {/* Drag handle visual mobile */}
        <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto mb-3" />

        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={() => {
            trackFunnelEvent("upsell_downsell_declined", { trigger: "close_button" });
            onClose();
          }}
          aria-label="Fechar proposta"
          className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-slate-200/70 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Eyebrow */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FEECE6] border border-[#E07A5F]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#E07A5F] uppercase tracking-wide">
            <Sparkles className="size-3 text-[#E07A5F]" />
            Opção Especial de Formação
          </span>
        </div>

        {/* Headline */}
        <h3
          id="downsell-sheet-title"
          className="text-xl sm:text-2xl font-black tracking-tight text-[#0C2A26] leading-tight text-balance"
        >
          Prefere validar durante seus 6 meses de curso?
        </h3>

        <p className="mt-1.5 text-xs sm:text-sm text-[#3D5650] leading-relaxed">
          Entendemos que 1 ano pode parecer muito compromisso agora. Você pode ter o Agenda 80/20 durante o seu período de treino e primeiras modelos por um valor reduzido.
        </p>

        {/* Box de Preço & Destaque */}
        <div className="mt-4 rounded-2xl bg-[#0C2A26] text-white p-4 text-center border border-white/10 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A373]">
            Acesso por 180 dias (6 meses)
          </span>
          <div className="mt-1 flex items-baseline justify-center gap-1">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none">
              R$ 97
            </span>
            <span className="text-xs text-[#A8C5BD] font-medium">à vista</span>
          </div>
          <p className="text-[11px] text-[#D4A373] mt-1 font-semibold">
            ou até 12x no cartão · Pagamento único sem renovação automática
          </p>

          <ul className="mt-3.5 space-y-2 border-t border-white/10 pt-3 text-left text-xs text-[#E8F2EE]">
            <li className="flex items-start gap-2">
              <div className="size-4 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                <Check className="size-2.5 stroke-[3]" />
              </div>
              <span className="leading-snug">
                <strong>Bússola Diária:</strong> 1 recomendação prática por dia para atrair suas modelos.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="size-4 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                <Check className="size-2.5 stroke-[3]" />
              </div>
              <span className="leading-snug">
                <strong>Roteiros de WhatsApp prontos</strong> para convidar e fechar sem insegurança.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="size-4 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0 mt-0.5">
                <Check className="size-2.5 stroke-[3]" />
              </div>
              <span className="leading-snug">
                <strong>30 dias de Belevy inclusos</strong> para organizar suas primeiras clientes.
              </span>
            </li>
          </ul>
        </div>

        {/* Ações Mobile */}
        <div className="mt-5 flex flex-col gap-2.5">
          <a
            href={checkoutUrl}
            onClick={handleAccept}
            className="w-full min-h-[50px] sm:min-h-[54px] rounded-xl bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm px-4 py-3 flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer uppercase tracking-wider text-center"
          >
            <span>SIM, QUERO O PLANO DE 6 MESES POR R$ 97</span>
            <ArrowRight className="size-4 stroke-[2.5]" />
          </a>

          {/* Saída Limpa e Respeitosa (Zero confirmshaming / Zero armadilha) */}
          <a
            href={finalAccessUrl}
            onClick={handleDecline}
            className="w-full py-2.5 text-center text-xs text-slate-500 hover:text-slate-800 underline underline-offset-4 transition-colors font-medium cursor-pointer"
          >
            Não, obrigado. Quero ir direto para o curso Soft Gel Express.
          </a>
        </div>

        {/* Footnote de Segurança */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="size-3.5 text-[#3D7164]" />
          <span>Compra 100% segura na Cakto · Garantia de 7 dias</span>
        </div>
      </div>
    </div>
  );
}
