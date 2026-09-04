"use client";

import { Sprout } from "lucide-react";

export function LandingBelevy() {
  return (
    <section className="relative pt-4 pb-12 overflow-hidden text-center">
      <div className="max-w-md mx-auto px-4">
        <div className="rounded-2xl bg-[#EAF3EF] border border-emerald-900/10 p-4 flex items-center gap-3.5 text-left shadow-xs">
          <div className="size-10 rounded-full bg-emerald-700/15 text-[#0E3D36] flex items-center justify-center shrink-0">
            <Sprout className="size-5 text-[#0E3D36]" />
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-snug">
            Quando sua operação pedir mais estrutura, o Belevy pode ser uma{" "}
            <strong className="text-[#0C2A26] font-bold">continuação opcional.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}
