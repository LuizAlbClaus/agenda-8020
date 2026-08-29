import { createClient } from "@/lib/supabase/server";
import type { AdminResult, AdminRow } from "@/lib/admin-types";
export type { AdminResult, AdminRow } from "@/lib/admin-types";

function asObject(value: unknown): AdminRow {
  return value && typeof value === "object" && !Array.isArray(value) ? value as AdminRow : {};
}

function isAdminContext(value: unknown) {
  const context = asObject(Array.isArray(value) ? value[0] : value);
  if (context.is_admin === false || context.isAdmin === false) return false;
  if (typeof context.role === "string" && !["admin", "support", "content_editor"].includes(context.role)) return false;
  return Boolean((context.is_admin ?? context.isAdmin ?? ["admin", "support", "content_editor"].includes(String(context.role))));
}

export async function getAdminClient() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return { supabase, userId: null, error: "Faça login para acessar o painel." };

  const { data: context, error } = await supabase.rpc("admin_get_session_context");
  if (error || !isAdminContext(context)) {
    return { supabase, userId: null, error: "Você não tem permissão para acessar o painel." };
  }
  return { supabase, userId, error: null, context };
}

export async function listAdminResource(rpcName: string, args: AdminRow = {}) {
  try {
    const access = await getAdminClient();
    if (access.error) return { rows: [] as AdminRow[], error: access.error };
    const { data, error } = await access.supabase.rpc(rpcName, args);
    if (error) return { rows: [] as AdminRow[], error: "Não conseguimos carregar estes dados agora." };
    const record = asObject(data);
    const value = Array.isArray(data) ? data : record.items ?? record.rows ?? record.data ?? (Object.keys(record).length ? [record] : []);
    const items = Array.isArray(value) ? value.map(asObject) : [];
    const rows = items.flatMap((item) => {
      const protocol = asObject(item.protocol);
      const versions = Array.isArray(item.versions) ? item.versions.map(asObject) : [];
      if (Object.keys(protocol).length && versions.length) return versions.map((version) => ({ ...protocol, ...version, protocol_id: protocol.id, protocol_slug: protocol.slug, action_version_id: version.id }));
      if (Object.keys(protocol).length) return [{ ...protocol, protocol_id: protocol.id, protocol_slug: protocol.slug }];
      const template = asObject(item.template);
      const messageVersions = Array.isArray(item.versions) ? item.versions.map(asObject) : [];
      if (Object.keys(template).length && messageVersions.length) return messageVersions.map((version) => ({ ...template, ...version, template_id: template.id, template_slug: template.slug, message_version_id: version.id }));
      if (Object.keys(template).length) return [{ ...template, template_id: template.id, template_slug: template.slug }];
      return [item];
    });
    return { rows, error: null };
  } catch {
    return { rows: [] as AdminRow[], error: "Não conseguimos carregar estes dados agora." };
  }
}

export async function runAdminMutation(rpcName: string, args: AdminRow, path: string): Promise<AdminResult> {
  try {
    const access = await getAdminClient();
    if (access.error) return { ok: false, error: access.error };
    const { data, error } = await access.supabase.rpc(rpcName, args);
    if (error) return { ok: false, error: "A operação não pôde ser concluída. Revise os dados e tente novamente." };
    const { revalidatePath } = await import("next/cache");
    revalidatePath(path);
    return { ok: true, data };
  } catch {
    return { ok: false, error: "O painel está temporariamente indisponível." };
  }
}
