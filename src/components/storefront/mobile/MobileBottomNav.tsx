"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";

const navItems = [
    {
        title: "Home",
        href: "/",
        icon: Home,
        exact: true,
    },
    {
        title: "Search",
        href: "/search",
        icon: Search,
        exact: false,
        isSearch: true,
    },
    {
        title: "Cart",
        href: "/cart",
        icon: ShoppingCart,
        exact: false,
        showBadge: true,
    },
    {
        title: "Profile",
        href: "/profile",
        icon: User,
        exact: false,
    },
];

export function MobileBottomNav() {
    const pathname = usePathname();
    const { cartCount } = useCart();

    const isActive = (href: string, exact: boolean) => {
        if (exact) return pathname === href;
        return pathname?.startsWith(href);
    };

    // Don't show on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 md:hidden">
            <div className="flex h-16 items-center justify-around px-2 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, item.exact);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 min-w-[64px] relative",
                                active
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground active:scale-95"
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn(
                                    "h-6 w-6 transition-transform",
                                    active && "scale-110"
                                )} />
                                {item.showBadge && cartCount > 0 && (
                                    <Badge 
                                        className="absolute -top-2 -right-2 h-5 min-w-[20px] justify-center rounded-full p-0 text-[10px] font-bold animate-in zoom-in-50"
                                    >
                                        {cartCount > 99 ? "99+" : cartCount}
                                    </Badge>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-all",
                                active && "font-semibold"
                            )}>
                                {item.title}
                            </span>
                            {active && (
                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

