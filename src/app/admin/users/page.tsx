import { getSupabaseAdmin } from "@/lib/supabase";
import { UsersContent } from "@/components/admin/UsersContent";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const supabaseAdmin = getSupabaseAdmin();
    const {
        data: { users },
        error,
    } = await supabaseAdmin.auth.admin.listUsers();

    return (
        <UsersContent 
            users={users || []} 
            error={error?.message}
        />
    );
}
