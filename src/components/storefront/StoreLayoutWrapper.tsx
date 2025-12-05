"use client";

import { ReactNode } from "react";
import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { usePathname } from "next/navigation";
import { MobileStoreLayout } from "./mobile/MobileStoreLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface StoreLayoutWrapperProps {
    children: ReactNode;
}

export function StoreLayoutWrapper({ children }: StoreLayoutWrapperProps) {
    const { isMobile, isLoading } = useDeviceDetect();
    const pathname = usePathname();

    // Don't apply store layout to admin pages - admin has its own layout
    if (pathname?.startsWith("/admin")) {
        return <>{children}</>;
    }

    // Show a minimal loading state to prevent layout shift
    if (isLoading) {
        return (
            <div className="relative flex min-h-screen flex-col">
                {/* Desktop header placeholder - hidden on mobile via CSS */}
                <div className="sticky top-0 z-50 w-full h-16 border-b bg-background/95 backdrop-blur hidden md:block" />
                {/* Mobile header placeholder - hidden on desktop via CSS */}
                <div className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur md:hidden" />
                <main className="flex-1">{children}</main>
            </div>
        );
    }

    // Mobile Layout
    if (isMobile) {
        return <MobileStoreLayout>{children}</MobileStoreLayout>;
    }

    // Desktop Layout - uses original Header and Footer
    return (
        <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

