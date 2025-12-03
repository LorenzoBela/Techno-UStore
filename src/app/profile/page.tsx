"use client";

import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AccountTabs } from "@/components/layout/AccountTabs";

interface ProfileRowProps {
    label: string;
    value: string;
    onSave?: (newValue: string) => Promise<void>;
    editable?: boolean;
}

function ProfileRow({ label, value, onSave, editable = false }: ProfileRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!onSave) return;
        setIsLoading(true);
        try {
            await onSave(currentValue);
            setIsEditing(false);
            toast.success(`${label} updated successfully`);
        } catch {
            toast.error("Failed to update");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-between py-6 border-b last:border-0">
            <div className="w-1/3">
                <span className="font-medium text-sm text-foreground">{label}</span>
            </div>
            <div className="flex-1">
                {isEditing ? (
                    <Input
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        className="max-w-md"
                    />
                ) : (
                    <span className="text-sm text-muted-foreground">{value || "N/A"}</span>
                )}
            </div>
            <div className="w-20 text-right">
                {editable && (
                    isEditing ? (
                        <div className="flex items-center gap-2 justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(false)}
                                disabled={isLoading}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSave}
                                disabled={isLoading}
                                className="text-primary hover:text-primary/80 font-medium"
                            >
                                {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="text-primary hover:text-primary/80 font-medium"
                        >
                            Edit
                        </Button>
                    )
                )}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user, isLoading } = useAuth();

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
                <p className="text-muted-foreground">Please log in to view your profile.</p>
                <Button asChild>
                    <a href="/login">Go to Login</a>
                </Button>
            </div>
        );
    }

    const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User";
    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleUpdatePhone = async (newPhone: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Updating phone to:", newPhone);
    };

    return (
        <div className="container max-w-5xl py-10">
            <div className="flex items-center gap-4 mb-8">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={displayName} />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground text-sm">
                        View profile
                    </Button>
                </div>
            </div>

            <AccountTabs />

            <div className="max-w-3xl">
                <ProfileRow
                    label="Name"
                    value={displayName}
                />
                <ProfileRow
                    label="Email"
                    value={user.email || ""}
                />
                <ProfileRow
                    label="Phone Number"
                    value={user.phone || "+63 900 000 0000"}
                    editable
                    onSave={handleUpdatePhone}
                />
            </div>
        </div>
    );
}
