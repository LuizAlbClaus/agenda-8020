"use client";

import { CheckCircle2, ArrowDown } from "lucide-react";
import { trackFunnelEvent } from "@/lib/client-analytics";

export function UpsellProgressHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0C2A26] text-white border-b border-[#D4A373]/30 px-3 py-2 sm:py-2.5 shadow-md">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Purchase Confirmation */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="size-4 sm:size-4.5 rounded-full bg-[#3D7164] flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="size-3 sm:size-3.5 text-white stroke-[2.5]" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-[10px] sm:text-xs font-semibold text-[#E8F2EE]">
              <span className="text-[#A8C5BD] sm:text-[#E8F2EE]">Compra confirmada:</span>{" "}
              <strong className="text-white font-bold whitespace-nowrap">Soft Gel Express</strong>
            </p>
          </div>
        </div>

        {/* Right: Direct jump link to course access */}
        <a
          href="#acesso-curso"
          onClick={() => trackFunnelEvent("upsell_skip_to_access")}
          className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full bg-[#0E3D36] hover:bg-[#134e45] border border-[#D4A373]/40 text-[#D4A373] text-[9.5px] sm:text-[11px] font-bold shrink-0 tracking-wide uppercase transition-colors"
          title="Ver orientações de acesso ao curso no rodapé da página"
        >
          <span>Acesso ao curso</span>
          <ArrowDown className="size-2.5 stroke-[2.5]" />
        </a>
      </div>

      {/* Progress bar (Clean, stable visual progress) */}
      <div className="max-w-xl mx-auto w-full bg-[#071916] h-1 mt-1.5 sm:mt-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#3D7164] to-[#D4A373] h-full w-[85%] rounded-full" />
      </div>
    </header>
  );
}
