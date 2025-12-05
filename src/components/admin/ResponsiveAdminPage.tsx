"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { ReactNode } from "react";

interface ResponsiveAdminPageProps {
    mobileContent: ReactNode;
    desktopContent: ReactNode;
}

export function ResponsiveAdminPage({ mobileContent, desktopContent }: ResponsiveAdminPageProps) {
    const { isMobile, isLoading } = useDeviceDetect();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return isMobile ? mobileContent : desktopContent;
}

