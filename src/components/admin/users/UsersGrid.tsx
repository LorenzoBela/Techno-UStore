"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserActions } from "./UserActions";
import type { User } from "@supabase/supabase-js";
import { Mail, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface UsersGridProps {
    data: User[];
}

const ITEMS_PER_PAGE = 12;

export function UsersGrid({ data }: UsersGridProps) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(0);

    // Filter users based on search query
    const filteredUsers = React.useMemo(() => {
        if (!searchQuery.trim()) return data;
        const query = searchQuery.toLowerCase();
        return data.filter((user) => {
            const email = user.email?.toLowerCase() || "";
            const name = (user.user_metadata?.name || "").toLowerCase();
            return email.includes(query) || name.includes(query);
        });
    }, [data, searchQuery]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    // Reset to first page when search changes
    React.useEffect(() => {
        setCurrentPage(0);
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="flex items-center">
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Users Grid */}
            {paginatedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
                    <p className="text-muted-foreground">No users found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedUsers.map((user) => (
                        <UserCard key={user.id} user={user} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Showing {paginatedUsers.length} of {filteredUsers.length} users
                </p>
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage >= totalPages - 1}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

function UserCard({ user }: { user: User }) {
    const isAdmin = user.user_metadata?.role === "admin";
    const initials = (user.user_metadata?.name || user.email || "U")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const createdAt = new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const lastSignIn = user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : null;

    return (
        <Card className="group hover:shadow-md transition-shadow duration-200 overflow-hidden">
            <CardContent className="p-0">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 pb-8 relative">
                    <div className="absolute top-2 right-2">
                        <UserActions user={user} />
                    </div>
                </div>

                {/* Avatar (overlapping header) */}
                <div className="px-4 -mt-6">
                    <Avatar className="h-16 w-16 border-4 border-background shadow-md">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-lg font-semibold bg-primary/10">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* User Info */}
                <div className="p-4 pt-3 space-y-3">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base truncate">
                                {user.user_metadata?.name || "No name"}
                            </h3>
                            {isAdmin && (
                                <Badge variant="default" className="text-xs">
                                    Admin
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{user.email}</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Joined {createdAt}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                                {lastSignIn ? `Last active ${lastSignIn}` : "Never signed in"}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
