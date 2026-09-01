import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessAgenda } from "@/lib/supabase/access";
import { BrandMark } from "@/components/ui/brand-mark";
import { DiagnosticClientView } from "./diagnostic-client-view";
import { fetchActiveValueDiagnostic, fetchDiagnosticQuestions } from "./actions";

export default async function DiagnosticPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login");
  }

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) redirect("/login");
  if (!(await canAccessAgenda(userId))) redirect("/access-blocked");

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  const workspaceId = member?.workspace_id;
  if (!workspaceId) {
    redirect("/onboarding");
  }

  const [activeDiagnostic, questions] = await Promise.all([
    fetchActiveValueDiagnostic(workspaceId),
    fetchDiagnosticQuestions(),
  ]);

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] pb-16">
      <div className="mx-auto w-full max-w-xl px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] mb-6">
          <BrandMark showLabel={false} />
        </header>

        <DiagnosticClientView
          workspaceId={workspaceId}
          initialDiagnostic={activeDiagnostic}
          questions={questions}
        />
      </div>
    </main>
  );
}
