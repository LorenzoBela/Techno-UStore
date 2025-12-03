"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { UserActions } from "./UserActions";

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        id: "name",
        header: "Name",
        accessorFn: (row) => row.user_metadata?.name || "N/A",
    },
    {
        accessorKey: "id",
        header: "User ID",
        cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
    },
    {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => {
            const date = new Date(row.getValue("created_at"));
            return <div>{date.toLocaleDateString()} {date.toLocaleTimeString()}</div>;
        },
    },
    {
        accessorKey: "last_sign_in_at",
        header: "Last Sign In",
        cell: ({ row }) => {
            const val = row.getValue("last_sign_in_at") as string | null;
            if (!val) return <div className="text-muted-foreground">Never</div>;
            const date = new Date(val);
            return <div>{date.toLocaleDateString()} {date.toLocaleTimeString()}</div>;
        },
    },
    {
        id: "role",
        header: "Role",
        accessorFn: (row) => row.user_metadata?.role || "user",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            return <div className="capitalize">{role}</div>;
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <UserActions user={row.original} />,
    },
];
