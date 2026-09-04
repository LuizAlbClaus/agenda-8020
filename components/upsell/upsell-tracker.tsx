"use client";

import { useEffect } from "react";
import { trackFunnelEvent } from "@/lib/client-analytics";

interface UpsellTrackerProps {
  source?: string;
  variant?: string;
}

export function UpsellTracker({ source = "soft-gel-post-purchase", variant = "soft-gel" }: UpsellTrackerProps) {
  useEffect(() => {
    trackFunnelEvent("upsell_view", { source, variant });
  }, [source, variant]);

  return null;
}
