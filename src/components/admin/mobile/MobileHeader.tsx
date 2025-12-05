"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/UserNav";
import { Store, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface MobileHeaderProps {
    title: string;
    showBack?: boolean;
    backHref?: string;
    action?: React.ReactNode;
}

export function MobileHeader({ title, showBack = false, backHref, action }: MobileHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (backHref) {
            router.push(backHref);
        } else {
            router.back();
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={handleBack}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <h1 className="font-semibold text-lg truncate">{title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    {action}
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <Store className="h-5 w-5" />
                        </Button>
                    </Link>
                    <UserNav />
                </div>
            </div>
        </header>
    );
}

