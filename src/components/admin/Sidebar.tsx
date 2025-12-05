"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Settings, Users, FolderTree } from "lucide-react";

const sidebarItems = [
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
        children: [
            {
                title: "All Products",
                href: "/admin/products",
                exact: true,
            },
            {
                title: "Categories",
                href: "/admin/products/categories",
                exact: true,
            },
        ],
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

export function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string, exact: boolean) => {
        if (exact) return pathname === href;
        return pathname?.startsWith(href);
    };

    return (
        <nav className="grid items-start gap-1">
            {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const active = isActive(item.href, item.exact ?? false);
                const hasChildren = item.children && item.children.length > 0;
                const showChildren = hasChildren && pathname?.startsWith(item.href);

                return (
                    <div key={index}>
                        <Link href={item.href}>
                            <span
                                className={cn(
                                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                    active && !hasChildren ? "bg-accent text-accent-foreground" : "transparent"
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{item.title}</span>
                            </span>
                        </Link>
                        {showChildren && (
                            <div className="ml-6 mt-1 space-y-1">
                                {item.children!.map((child, childIndex) => (
                                    <Link key={childIndex} href={child.href}>
                                        <span
                                            className={cn(
                                                "group flex items-center rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                                                isActive(child.href, child.exact ?? false)
                                                    ? "bg-accent/50 text-accent-foreground font-medium"
                                                    : "text-muted-foreground"
                                            )}
                                        >
                                            {child.title}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
