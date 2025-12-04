import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { memo } from "react";

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

const NAV_ITEMS = [
    { href: "/", label: "Home", matchExact: true },
    { href: "/category/apparel", label: "Apparel", matchExact: false },
    { href: "/category/accessories", label: "Accessories", matchExact: false },
    { href: "/category/supplies", label: "Supplies", matchExact: false },
    { href: "/category/uniforms", label: "Uniforms", matchExact: false },
] as const;

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {NAV_ITEMS.map((item) => (
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
