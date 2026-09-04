import type { Metadata } from "next";
import { UpsellView } from "@/components/upsell/upsell-view";

export const metadata: Metadata = {
  title: "Sua Compra do Soft Gel Express foi Confirmada — Agenda 80/20",
  description: "Antes de começar o curso, prepare o que vem depois da técnica com o Agenda 80/20.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UpsellPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  return <UpsellView searchParams={searchParams} />;
}
