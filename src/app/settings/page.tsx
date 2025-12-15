"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AccountTabs } from "@/components/layout/AccountTabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useTheme } from "next-themes";

// Helper to get avatar URL from various OAuth provider metadata
function getAvatarUrl(user: User | null): string | undefined {
    if (!user?.user_metadata) return undefined;
    const metadata = user.user_metadata;
    return (
        (metadata.avatar_url as string) ||
        (metadata.picture as string) ||
        (metadata.avatar as string) ||
        undefined
    );
}

interface SettingsRowProps {
    label: string;
    description?: string;
    action?: React.ReactNode;
    value?: string;
}

function SettingsRow({ label, description, action, value }: SettingsRowProps) {
    return (
        <div className="flex items-center justify-between py-6 border-b last:border-0">
            <div className="w-1/3">
                <span className="font-medium text-sm text-foreground">{label}</span>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            <div className="flex-1">
                {value && <span className="text-sm text-muted-foreground">{value}</span>}
            </div>
            <div className="w-auto text-right">
                {action}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const { user, isLoading } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch for theme
    useEffect(() => {
        setMounted(true);
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container flex h-[50vh] flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Not Authenticated</h1>
                <p className="text-muted-foreground">Please log in to view your settings.</p>
                <Button asChild>
                    <a href="/login">Go to Login</a>
                </Button>
            </div>
        );
    }

    const displayName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const avatarUrl = getAvatarUrl(user);
    const initials = String(displayName)
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleChangePassword = () => {
        toast.info("Password change functionality coming soon.");
    };

    const handleConnectGCash = () => {
        toast.info("GCash integration coming soon.");
    };

    return (
        <div className="container max-w-5xl py-10">
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                    <AvatarImage src={avatarUrl} alt={String(displayName)} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{String(displayName)}</h1>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground text-sm">
                        View profile
                    </Button>
                </div>
            </div>

            <AccountTabs />

            <div className="max-w-3xl space-y-8">
                <div>
                    <h3 className="text-lg font-medium mb-4">Security</h3>
                    <div className="border-t">
                        <SettingsRow
                            label="Password"
                            value="Last changed 3 months ago"
                            action={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleChangePassword}
                                    className="text-primary hover:text-primary/80 font-medium"
                                >
                                    Change
                                </Button>
                            }
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                    <div className="border-t">
                        <SettingsRow
                            label="GCash"
                            value="Not connected"
                            action={
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleConnectGCash}
                                    className="text-primary hover:text-primary/80 font-medium"
                                >
                                    Connect
                                </Button>
                            }
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Notifications</h3>
                    <div className="border-t">
                        <SettingsRow
                            label="Order Updates"
                            description="Receive emails about your order status."
                            action={
                                <Switch
                                    checked={notificationsEnabled}
                                    onCheckedChange={setNotificationsEnabled}
                                />
                            }
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-medium mb-4">Preferences</h3>
                    <div className="border-t">
                        <SettingsRow
                            label="Dark Mode"
                            description="Toggle dark mode on or off."
                            action={
                                <Switch
                                    checked={mounted && theme === "dark"}
                                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                    disabled={!mounted}
                                />
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
