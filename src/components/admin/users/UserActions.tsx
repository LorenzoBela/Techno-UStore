"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Ban, Undo2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { toggleUserBan, sendPasswordReset } from "@/app/admin/users/actions";
import { User } from "@supabase/supabase-js";
import { useState } from "react";

interface UserWithBan extends User {
    banned_until?: string;
}

interface UserActionsProps {
    user: User;
}

export function UserActions({ user }: UserActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const userWithBan = user as UserWithBan;
    const isBanned = userWithBan.banned_until && new Date(userWithBan.banned_until) > new Date();

    async function handleToggleBan() {
        setIsLoading(true);
        const result = await toggleUserBan(user.id, !isBanned);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(isBanned ? "User account enabled" : "User account disabled");
        }
    }

    async function handleResetPassword() {
        setIsLoading(true);
        const result = await sendPasswordReset(user.email!);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Password reset email sent");
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(user.id)}
                >
                    Copy user ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleResetPassword}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={handleToggleBan}
                    className={isBanned ? "text-green-600" : "text-destructive"}
                >
                    {isBanned ? (
                        <>
                            <Undo2 className="mr-2 h-4 w-4" />
                            Enable Account
                        </>
                    ) : (
                        <>
                            <Ban className="mr-2 h-4 w-4" />
                            Disable Account
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
