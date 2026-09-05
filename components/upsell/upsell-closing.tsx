"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, Check, Sparkles } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellClosingProps {
  checkoutUrl: string;
  declineUrl: string;
}

export function UpsellClosing({ checkoutUrl, declineUrl }: UpsellClosingProps) {
  const handleCtaClick = () => {
    trackFunnelEvent("upsell_primary_cta_click", { location: "closing" });
    trackFunnelEvent("upsell_accept", { location: "closing" });
    trackFunnelEvent("upsell_cta_click", { location: "closing" });
    trackFunnelEvent("upsell_checkout_redirect", { location: "closing" });
  };

  const handleDeclineClick = () => {
    trackFunnelEvent("upsell_decline", { location: "closing" });
    trackFunnelEvent("upsell_decline_click", { location: "closing" });
  };

  return (
    <section className="bg-[#0C2A26] text-white pt-12 pb-16 px-4 border-t border-white/10 text-center">
      <div className="max-w-xl mx-auto">
        {/* Check Circle */}
        <div className="size-12 rounded-full border-2 border-[#D4A373] bg-[#0E3D36] flex items-center justify-center mx-auto mb-4 text-[#D4A373] shadow-md">
          <Check className="size-6 stroke-[2.5]" />
        </div>

        {/* Pre-headline */}
        <p className="text-xs sm:text-sm text-[#A8C5BD] font-medium max-w-md mx-auto leading-relaxed">
          Você acabou de decidir aprender uma nova técnica.
        </p>

        {/* Headline */}
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white leading-tight text-balance">
          Agora pode decidir se, quando chegar a hora de atender, vai{" "}
          <span className="text-[#D4A373] block sm:inline">
            começar do zero ou já ter um caminho.
          </span>
        </h2>

        {/* Simple Visual Step Flow */}
        <div className="mt-8 flex items-center justify-center gap-3 sm:gap-6 text-xs font-bold max-w-sm mx-auto">
          <div className="rounded-xl bg-[#0E3D36] border border-white/10 px-3.5 py-2 text-white">
            <span className="text-[#A8C5BD] text-[10px] block uppercase">Soft Gel Express</span>
            <span>Aprender a técnica</span>
          </div>

          <span className="text-[#D4A373] font-black text-base">→</span>

          <div className="rounded-xl bg-[#0E3D36] border border-[#D4A373]/40 px-3.5 py-2 text-[#D4A373]">
            <span className="text-white text-[10px] block uppercase">Agenda 80/20</span>
            <span>Agir com clareza</span>
          </div>
        </div>

        <div className="w-12 h-0.5 bg-[#D4A373]/40 rounded-full mx-auto my-6" />

        {/* Big Primary CTA Button */}
        <div className="max-w-md mx-auto">
          <a
            href={checkoutUrl}
            onClick={handleCtaClick}
            className="w-full min-h-[56px] rounded-2xl bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-[0.98] text-white font-black text-sm sm:text-base px-6 py-4 flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer uppercase tracking-wider text-center"
          >
            <span>SIM, QUERO ADICIONAR O AGENDA 80/20</span>
            <ArrowRight className="size-4.5 stroke-[2.5]" />
          </a>

          <p className="mt-2 text-[11px] text-[#A8C5BD]">
            12x de R$ 15,19 ou R$ 147 à vista · Pagamento único · Garantia de 7 dias
          </p>

          {/* Clean, respectful decline link (zero confirmshaming / zero dark pattern) */}
          <div className="mt-5">
            <Link
              href={declineUrl}
              onClick={handleDeclineClick}
              className="inline-block py-2 px-3 text-xs text-[#A8C5BD]/80 hover:text-white underline underline-offset-4 transition-colors font-medium cursor-pointer"
            >
              Não, obrigado. Quero continuar apenas com o Soft Gel Express.
            </Link>
          </div>
        </div>

        {/* Security footnote */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-[#A8C5BD]">
          <ShieldCheck className="size-4 text-[#3D7164]" />
          <span>Compra segura · Acesso imediato · Suporte dedicado</span>
        </div>
      </div>
    </section>
  );
}
