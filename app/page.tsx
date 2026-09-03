import { LandingPageView } from "@/components/landing/landing-page-view";
import type { LandingVariant } from "@/components/landing/types";

function resolveVariant(
  searchParams?: Record<string, string | string[] | undefined>
): LandingVariant {
  const lpParam = searchParams?.lp;
  const lp =
    typeof lpParam === "string"
      ? lpParam.toLowerCase()
      : Array.isArray(lpParam) && typeof lpParam[0] === "string"
      ? lpParam[0].toLowerCase()
      : undefined;

  if (lp === "soft-gel" || lp === "softgel" || lp === "sge") return "soft-gel";
  if (lp === "organic" || lp === "organico") return "organic";
  if (lp === "cold") return "cold";

  // Fallbacks de UTM sem quebrar tracking
  const utmCampaign = typeof searchParams?.utm_campaign === "string" ? searchParams.utm_campaign.toLowerCase() : "";
  if (
    utmCampaign.includes("soft-gel") ||
    utmCampaign.includes("softgel") ||
    utmCampaign.includes("sge")
  ) {
    return "soft-gel";
  }

  const utmMedium = typeof searchParams?.utm_medium === "string" ? searchParams.utm_medium.toLowerCase() : "";
  const utmSource = typeof searchParams?.utm_source === "string" ? searchParams.utm_source.toLowerCase() : "";

  if (
    utmMedium === "organic" ||
    utmSource === "organic" ||
    utmSource === "instagram_bio" ||
    utmSource === "bio"
  ) {
    return "organic";
  }

  return "cold";
}

export default async function Home(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const variant = resolveVariant(searchParams);

  return <LandingPageView variant={variant} searchParams={searchParams} />;
}
