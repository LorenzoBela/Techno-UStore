"use client";

import { ReactNode } from "react";
import { MobileStoreHeader } from "./MobileStoreHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileFooter } from "./MobileFooter";
import { usePathname } from "next/navigation";

interface MobileStoreLayoutProps {
    children: ReactNode;
}

export function MobileStoreLayout({ children }: MobileStoreLayoutProps) {
    const pathname = usePathname();
    
    // Don't apply mobile layout to admin pages
    if (pathname?.startsWith("/admin")) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-background md:hidden">
            <MobileStoreHeader />
            <main className="flex-1">
                {children}
            </main>
            <MobileFooter />
            <MobileBottomNav />
        </div>
    );
}

