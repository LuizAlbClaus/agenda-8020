"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellStickyCtaProps {
  checkoutUrl: string;
}

export function UpsellStickyCta({ checkoutUrl }: UpsellStickyCtaProps) {
  const handleClick = () => {
    trackFunnelEvent("upsell_cta_click", { location: "sticky_mobile_bottom" });
    trackFunnelEvent("upsell_checkout_redirect", { location: "sticky_mobile_bottom" });
  };

  return (
    <aside
      aria-label="Ação rápida de adicionar ao pedido"
      className="fixed bottom-0 left-0 right-0 z-50 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-bold line-through">De R$ 297 por</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-[#0C2A26]">12x</span>
            <span className="text-base font-black text-[#0C2A26] leading-none">R$ 15,19</span>
          </div>
          <span className="text-[9px] text-[#3D7164] font-semibold">ou R$ 147 à vista</span>
        </div>
        <a
          href={checkoutUrl}
          onClick={handleClick}
          className="flex-1 min-h-[48px] bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-98 text-white font-black text-xs uppercase tracking-wide rounded-xl px-4 py-3 flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer text-center"
        >
          <span>Adicionar ao Pedido</span>
          <ArrowRight className="size-3.5 stroke-[3]" />
        </a>
      </div>
      <div className="flex items-center justify-center gap-1 text-[9px] text-slate-500 mt-1.5 font-medium">
        <ShieldCheck className="size-3 text-emerald-600 shrink-0" />
        <span>1 cliente paga o ano todo · Garantia de 7 dias</span>
      </div>
    </aside>
  );
}
