"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

export function LandingStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    trackFunnelEvent("sticky_cta_clicked", { destination: "oferta" });
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Ação rápida de inscrição"
      className="fixed bottom-0 left-0 right-0 z-50 p-2.5 bg-[#0C2A26]/95 backdrop-blur-md border-t border-[#D4A373]/30 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] md:hidden animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="text-left pl-1">
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#D4A373]">
            <Sparkles className="size-2.5" />
            <span>agenda 80/20</span>
          </div>
          <p className="text-xs font-black text-white">12x de R$ 15,19</p>
        </div>
        <Link
          href="#oferta"
          onClick={handleClick}
          className="min-h-[44px] bg-[#E07A5F] hover:bg-[#D36A4F] active:scale-98 text-white font-extrabold text-xs uppercase px-5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <span>Montar Meu Plano</span>
          <ArrowRight className="size-3.5 stroke-[2.5]" />
        </Link>
      </div>
    </aside>
  );
}
