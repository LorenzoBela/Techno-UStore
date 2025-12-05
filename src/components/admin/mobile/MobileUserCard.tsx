"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreVertical, Shield, ShieldOff, Mail } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@supabase/supabase-js";

interface MobileUserCardProps {
    user: User;
    onToggleAdmin?: (userId: string, isAdmin: boolean) => void;
}

export function MobileUserCard({ user, onToggleAdmin }: MobileUserCardProps) {
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

    return (
        <Card className="touch-manipulation">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                                {user.user_metadata?.name || "No name"}
                            </span>
                            {isAdmin && (
                                <Badge variant="default" className="text-xs shrink-0">
                                    Admin
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Joined {createdAt}</p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <a href={`mailto:${user.email}`}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Email
                                </a>
                            </DropdownMenuItem>
                            {onToggleAdmin && (
                                <DropdownMenuItem onClick={() => onToggleAdmin(user.id, !isAdmin)}>
                                    {isAdmin ? (
                                        <>
                                            <ShieldOff className="mr-2 h-4 w-4" />
                                            Remove Admin
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Make Admin
                                        </>
                                    )}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}

