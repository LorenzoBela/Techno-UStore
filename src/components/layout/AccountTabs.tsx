"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
    { name: "Profile", href: "/profile" },
    { name: "Orders", href: "/orders" },
    { name: "Settings", href: "/settings" },
];

export function AccountTabs() {
    const pathname = usePathname();

    return (
        <div className="border-b mb-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                                isActive
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
