import { getSupabaseAdmin } from "@/lib/supabase";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { columns } from "@/components/admin/users/columns";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const supabaseAdmin = getSupabaseAdmin();
    const {
        data: { users },
        error,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                </div>
                <div className="rounded-md border border-destructive/50 p-4 text-destructive">
                    Error fetching users: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            </div>
            <UsersTable columns={columns} data={users} />
        </div>
    );
}
