"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Reset on navigation complete
        setIsNavigating(false);
        setProgress(100);
        const timeout = setTimeout(() => setProgress(0), 200);
        return () => clearTimeout(timeout);
    }, [pathname, searchParams]);

    useEffect(() => {
        if (isNavigating) {
            // Animate progress
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + 10;
                });
            }, 100);
            return () => clearInterval(interval);
        }
    }, [isNavigating]);

    // Listen for link clicks to show progress immediately
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");
            if (
                anchor &&
                anchor.href &&
                anchor.href.startsWith(window.location.origin) &&
                !anchor.target &&
                !anchor.download &&
                !e.ctrlKey &&
                !e.metaKey
            ) {
                setIsNavigating(true);
                setProgress(10);
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    if (progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1">
            <div
                className="h-full bg-primary transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
