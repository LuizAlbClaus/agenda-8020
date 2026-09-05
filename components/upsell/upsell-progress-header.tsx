import { CheckCircle2, Sparkles } from "lucide-react";

export function UpsellProgressHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0C2A26] text-white border-b border-[#D4A373]/30 px-3 py-2.5 shadow-md">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Purchase Confirmation */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="size-4 rounded-full bg-[#3D7164] flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="size-3 text-white stroke-[2.5]" />
          </div>
          <span className="text-[11px] sm:text-xs font-semibold text-[#E8F2EE] truncate">
            Compra confirmada: <strong className="text-white font-bold">Soft Gel Express</strong>
          </span>
        </div>

        {/* Right: Step Indicator */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0E3D36] border border-[#D4A373]/40 text-[#D4A373] text-[10px] sm:text-[11px] font-bold shrink-0 tracking-wide uppercase">
          <Sparkles className="size-2.5 text-[#D4A373]" />
          <span>Etapa 2 de 2</span>
        </div>
      </div>

      {/* Progress bar (Clean, stable visual progress without fake countdown) */}
      <div className="max-w-xl mx-auto w-full bg-[#071916] h-1 mt-2 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#3D7164] to-[#D4A373] h-full w-[85%] rounded-full" />
      </div>
    </header>
  );
}
