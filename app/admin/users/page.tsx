import { listAdminResource } from "@/lib/admin";
import { AdminNotice } from "../admin-ui";
import { mutateUsers } from "../actions";
import UsersSearch from "./users-search";
export default async function UsersPage() { const result = await listAdminResource("admin_list_users", { p_email: null }); return <><h1 className="text-2xl font-bold tracking-tight text-slate-950">Usuários</h1><AdminNotice error={result.error} /><UsersSearch initialRows={result.rows} initialError={result.error} mutate={mutateUsers} /></>; }
