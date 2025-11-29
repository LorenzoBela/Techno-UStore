import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Home
      </Link>
      <Link
        href="/category/apparel"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname?.startsWith("/category/apparel")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Apparel
      </Link>
      <Link
        href="/category/accessories"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname?.startsWith("/category/accessories")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Accessories
      </Link>
      <Link
        href="/category/supplies"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname?.startsWith("/category/supplies")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Supplies
      </Link>
      <Link
        href="/category/uniforms"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname?.startsWith("/category/uniforms")
            ? "text-primary"
            : "text-muted-foreground"
        )}
      >
        Uniforms
      </Link>
    </nav>
  );
}
