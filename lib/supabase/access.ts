import { createClient } from "./server";

export async function canAccessAgenda(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("can_access_agenda", { user_id: userId });
    if (error) { console.error("Entitlement lookup failed", { code: error.code }); return false; }
    return data === true;
  } catch (error) {
    console.error("Access check unavailable", error instanceof Error ? error.message : "unknown error");
    return false;
  }
}
