import Link from "next/link";
import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Home
      </Link>
      <Link
        href="/category/apparel"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Apparel
      </Link>
      <Link
        href="/category/accessories"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Accessories
      </Link>
      <Link
        href="/category/supplies"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Supplies
      </Link>
      <Link
        href="/category/uniforms"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Uniforms
      </Link>
    </nav>
  );
}
