"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher({ className }: { className?: string }) {
    const [mounted, setMounted] = React.useState(false);
    const { theme, setTheme } = useTheme();

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className={className} disabled>
                <Sun className="h-5 w-5" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={className}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
