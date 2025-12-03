"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Helper to get avatar URL from various OAuth provider metadata
function getAvatarUrl(user: { user_metadata?: Record<string, unknown> } | null): string | undefined {
    if (!user?.user_metadata) return undefined;
    const metadata = user.user_metadata;
    // Check common avatar URL fields from different OAuth providers
    return (
        (metadata.avatar_url as string) ||
        (metadata.picture as string) ||
        (metadata.avatar as string) ||
        undefined
    );
}

export function UserNav() {
    const { user, isLoading, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        toast.success("Signed out successfully");
        router.push("/");
    };

    if (isLoading) {
        return (
            <Button variant="ghost" size="sm" disabled>
                Loading...
            </Button>
        );
    }

    if (!user) {
        return (
            <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
            </Button>
        );
    }

    // Get user display name and initials
    const displayName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const avatarUrl = getAvatarUrl(user);
    const initials = String(displayName)
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={avatarUrl} alt={String(displayName)} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer w-full">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/orders" className="cursor-pointer w-full">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            <span>Orders</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer w-full">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    {user.user_metadata?.role === "admin" && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/admin" className="cursor-pointer w-full font-semibold">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Admin Dashboard</span>
                                </Link>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
