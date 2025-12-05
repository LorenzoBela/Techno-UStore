"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { MobileUserCard } from "@/components/admin/mobile/MobileUserCard";
import { UsersTable } from "@/components/admin/users/UsersTable";
import { columns } from "@/components/admin/users/columns";
import type { User } from "@supabase/supabase-js";

interface UsersContentProps {
    users: User[];
    error?: string;
}

export function UsersContent({ users, error }: UsersContentProps) {
    const { isMobile, isLoading } = useDeviceDetect();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (error) {
        if (isMobile) {
            return (
                <div className="flex flex-col min-h-screen">
                    <MobileHeader title="Users" />
                    <div className="flex-1 p-4">
                        <div className="rounded-lg border border-destructive/50 p-4 text-destructive text-sm">
                            Error loading users: {error}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                </div>
                <div className="rounded-md border border-destructive/50 p-4 text-destructive">
                    Error fetching users: {error}
                </div>
            </div>
        );
    }

    // Mobile View
    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen">
                <MobileHeader title="Users" />
                
                <div className="flex-1 p-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {users.length} registered users
                    </p>

                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground">No users yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {users.map((user) => (
                                <MobileUserCard key={user.id} user={user} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop View
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
            </div>
            <UsersTable columns={columns} data={users} />
        </div>
    );
}

