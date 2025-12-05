"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { ReactNode } from "react";

interface ResponsiveStorePageProps {
    mobileContent: ReactNode;
    desktopContent: ReactNode;
}

export function ResponsiveStorePage({ mobileContent, desktopContent }: ResponsiveStorePageProps) {
    const { isMobile, isLoading } = useDeviceDetect();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 min-h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return isMobile ? mobileContent : desktopContent;
}

