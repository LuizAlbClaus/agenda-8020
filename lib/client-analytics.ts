"use client";

/**
 * Utilitário de telemetria client-side para o funil público da Landing Page.
 * Encaminha eventos para dataLayer (GTM / Meta Pixel) e registra em logs controlados.
 */

type FunnelEvent =
  | "landing_page_view"
  | "landing_variant_viewed"
  | "hero_cta_clicked"
  | "sticky_cta_clicked"
  | "pricing_viewed"
  | "checkout_redirect_clicked"
  | "downsell_modal_opened"
  | "downsell_checkout_clicked"
  | "demo_situation_changed"
  | "demo_script_copied"
  | "mechanism_viewed"
  | "faq_item_toggled"
  | "closing_cta_clicked"
  | "upsell_view"
  | "upsell_cta_click"
  | "upsell_demo_interaction"
  | "upsell_faq_open"
  | "upsell_checkout_redirect"
  | "upsell_decline_click";

export function trackFunnelEvent(event: FunnelEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...params,
  };

  // 1. Suporte a Google Tag Manager / Meta Pixel dataLayer
  if (Array.isArray((window as unknown as { dataLayer?: unknown[] }).dataLayer)) {
    (window as unknown as { dataLayer: unknown[] }).dataLayer.push(payload);
  }

  // 2. Disparo de CustomEvent padrão do navegador
  try {
    window.dispatchEvent(new CustomEvent("agenda8020:analytics", { detail: payload }));
  } catch {}

  // 3. Log informativo de telemetria em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    console.info(`[Funnel Analytics] ${event}`, payload);
  }
}
