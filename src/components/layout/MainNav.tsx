"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";
import { useCategories } from "@/lib/categories-context";

// Memoize navigation links to prevent re-renders
const NavLink = memo(function NavLink({ 
    href, 
    label, 
    isActive 
}: { 
    href: string; 
    label: string; 
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            prefetch={true}
            className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive ? "text-primary" : "text-muted-foreground"
            )}
        >
            {label}
        </Link>
    );
});

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const { categories } = useCategories();

  // Build nav items from categories context
  const navItems = useMemo(() => {
    const items = [{ href: "/", label: "Home", matchExact: true }];
    
    // Add categories from database
    categories.forEach((cat) => {
      items.push({
        href: `/category/${cat.slug}`,
        label: cat.name,
        matchExact: false,
      });
    });

    return items;
  }, [categories]);

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          isActive={
            item.matchExact 
              ? pathname === item.href 
              : pathname?.startsWith(item.href) ?? false
          }
        />
      ))}
    </nav>
  );
}
