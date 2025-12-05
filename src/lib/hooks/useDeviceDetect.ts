"use client";

import { useState, useEffect } from "react";

export type DeviceType = "mobile" | "desktop";

const MOBILE_BREAKPOINT = 768; // pixels

export function useDeviceDetect(): {
    device: DeviceType;
    isMobile: boolean;
    isDesktop: boolean;
    isLoading: boolean;
} {
    const [device, setDevice] = useState<DeviceType>("desktop");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for manual override cookie first
        const cookieMatch = document.cookie.match(/admin-device-preference=(mobile|desktop)/);
        const preference = cookieMatch ? cookieMatch[1] as DeviceType : null;

        function detectDevice() {
            if (preference) {
                setDevice(preference);
            } else {
                // Use window.innerWidth for resolution-based detection
                const isMobileSize = window.innerWidth < MOBILE_BREAKPOINT;
                setDevice(isMobileSize ? "mobile" : "desktop");
            }
            setIsLoading(false);
        }

        // Initial detection
        detectDevice();

        // Listen for resize events (only if no manual preference)
        if (!preference) {
            const handleResize = () => {
                const isMobileSize = window.innerWidth < MOBILE_BREAKPOINT;
                setDevice(isMobileSize ? "mobile" : "desktop");
            };

            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    return {
        device,
        isMobile: device === "mobile",
        isDesktop: device === "desktop",
        isLoading,
    };
}

export function setDevicePreference(preference: "mobile" | "desktop" | "auto"): void {
    if (typeof document === "undefined") return;
    
    if (preference === "auto") {
        // Remove the cookie to use automatic detection
        document.cookie = "admin-device-preference=; path=/; max-age=0";
    } else {
        // Set preference cookie for 30 days
        document.cookie = `admin-device-preference=${preference}; path=/; max-age=${60 * 60 * 24 * 30}`;
    }
    
    // Reload to apply the change
    window.location.reload();
}

