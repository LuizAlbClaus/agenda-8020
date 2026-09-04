"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function UpsellProgressHeader() {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos (600s)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <div className="sticky top-0 z-40 w-full bg-[#0C2A26] text-white border-b border-[#D4A373]/30 px-3 py-2 sm:py-2.5 shadow-md">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-[#E07A5F] animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#E8F2EE]">
            Etapa 2 de 2:{" "}
            <span className="text-[#D4A373]">Oferta Exclusiva de Boas-Vindas</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0E3D36] border border-[#D4A373]/40 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-[#D4A373]">
          <Clock className="size-3 text-[#E07A5F]" />
          <span>
            {minutes}:{seconds}
          </span>
        </div>
      </div>
      {/* Barra de progresso visual de 80% do pedido concluído */}
      <div className="w-full bg-[#071916] h-1.5 mt-1.5 sm:mt-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#D4A373] to-[#E07A5F] h-full w-[80%] rounded-full transition-all duration-500" />
      </div>
    </div>
  );
}
