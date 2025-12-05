"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileFooter() {
    const pathname = usePathname();

    // Don't show on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <footer className="border-t bg-background pb-20 md:hidden">
            <div className="px-4 py-6">
                {/* Links */}
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                        Contact
                    </Link>
                    <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                        Terms
                    </Link>
                    <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                        Privacy
                    </Link>
                </div>
                
                {/* Copyright */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                    © {new Date().getFullYear()} Adamson University Store
                </p>
            </div>
        </footer>
    );
}

