"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Settings, Users } from "lucide-react";

const navItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        title: "Products",
        href: "/admin/products",
        icon: Package,
        exact: false,
    },
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingCart,
        exact: false,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        exact: false,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
        exact: false,
    },
];

export function MobileNav() {
    const pathname = usePathname();

    const isActive = (href: string, exact: boolean) => {
        if (exact) return pathname === href;
        return pathname?.startsWith(href);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-pb">
            <div className="flex h-16 items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                                active
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", active && "text-primary")} />
                            <span className="text-[10px] font-medium">{item.title}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

