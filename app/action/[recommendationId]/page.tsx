import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";
import ActionDetail from "./action-detail";

export default async function ActionPage({ params }: { params: Promise<{ recommendationId: string }> }) {
  const { recommendationId } = await params;
  let supabase; try { supabase = await createClient(); } catch { redirect("/login"); }
  const { data: claims } = await supabase!.auth.getClaims(); const userId = claims?.claims?.sub;
  if (!userId) redirect("/login");
  if (!(await canAccessAgenda(userId))) redirect("/access-blocked");
  const { data, error } = await supabase!.rpc("get_recommendation_detail", { p_recommendation_id: recommendationId });
  if (error || !data) notFound();
  return <ActionDetail detail={data} />;
}
