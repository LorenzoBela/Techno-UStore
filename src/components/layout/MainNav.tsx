"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { memo, useMemo } from "react";
import { useCategories } from "@/lib/categories-context";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Number of categories to show before "More" dropdown
const MAX_VISIBLE_CATEGORIES = 5;

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
        "px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
  const { visibleItems, overflowItems } = useMemo(() => {
    const items = [{ href: "/", label: "Home", matchExact: true, slug: "home" }];

    // Add categories from database
    categories.forEach((cat) => {
      items.push({
        href: `/category/${cat.slug}`,
        label: cat.name,
        matchExact: false,
        slug: cat.slug,
      });
    });

    // Split into visible and overflow
    const visible = items.slice(0, MAX_VISIBLE_CATEGORIES + 1); // +1 for Home
    const overflow = items.slice(MAX_VISIBLE_CATEGORIES + 1);

    return { visibleItems: visible, overflowItems: overflow };
  }, [categories]);

  const isOverflowActive = overflowItems.some(
    item => item.matchExact
      ? pathname === item.href
      : pathname?.startsWith(item.href)
  );

  return (
    <nav
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      {visibleItems.map((item) => (
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

      {overflowItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
              isOverflowActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            More
            <ChevronDown className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] p-1">
            {overflowItems.map((item) => {
              const isItemActive = item.matchExact
                ? pathname === item.href
                : pathname?.startsWith(item.href);
              return (
                <DropdownMenuItem key={item.href} asChild className="p-0">
                  <Link
                    href={item.href}
                    prefetch={true}
                    className={cn(
                      "w-full px-3 py-2 rounded-md cursor-pointer transition-colors",
                      isItemActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
