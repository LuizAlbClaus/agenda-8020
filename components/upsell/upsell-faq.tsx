"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { UPSELL_FAQS } from "./upsell-types";
import { trackFunnelEvent } from "@/lib/client-analytics";

export function UpsellFaq() {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleFaq = (index: number) => {
    setOpenIndices((prev) => {
      const exists = prev.includes(index);
      if (!exists) {
        trackFunnelEvent("upsell_faq_open", {
          faqIndex: index,
          question: UPSELL_FAQS[index].question,
        });
        return [...prev, index];
      }
      return prev.filter((i) => i !== index);
    });
  };

  return (
    <section className="bg-[#FBF9F5] py-14 px-4 border-t border-[#0C2A26]/5">
      <div className="max-w-xl mx-auto text-left">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#4E7A6E]/40 bg-[#E8F2EE] text-[#0C2A26] text-[11px] font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="size-3 text-[#3D7164]" />
            <span>Perguntas Frequentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0C2A26]">
            Dúvidas comuns sobre o Agenda 80/20
          </h2>
          <p className="text-xs sm:text-sm text-[#527068] mt-1">
            Respostas diretas para as 4 dúvidas mais frequentes de quem acabou de comprar o curso.
          </p>
        </div>

        {/* 4 Essential FAQs */}
        <div className="space-y-3">
          {UPSELL_FAQS.map((faq, index) => {
            const isOpen = openIndices.includes(index);

            return (
              <div
                key={index}
                className="rounded-2xl bg-white border border-[#0C2A26]/10 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  id={`faq-trigger-${index}`}
                  aria-controls={`faq-panel-${index}`}
                  aria-expanded={isOpen}
                  onClick={() => toggleFaq(index)}
                  className="w-full min-h-[52px] p-4 text-left font-bold text-xs sm:text-sm text-[#0C2A26] flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`size-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#E07A5F]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-trigger-${index}`}
                    className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
