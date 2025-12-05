"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, ShoppingCart } from "lucide-react";
import { useCategories } from "@/lib/categories-context";
import { SearchBar } from "@/components/ui/search-bar";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";
import { UserNav } from "@/components/layout/UserNav";

export function MobileStoreHeader() {
    const [open, setOpen] = React.useState(false);
    const pathname = usePathname();
    const { categories } = useCategories();
    const { cartCount } = useCart();

    // Don't show on admin pages
    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 md:hidden">
            <div className="flex h-14 items-center justify-between px-4">
                {/* Hamburger Menu */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 -ml-2">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        
                        {/* Header */}
                        <div className="flex items-center p-4 border-b">
                            <Link
                                href="/"
                                onClick={() => setOpen(false)}
                                className="font-black tracking-tighter uppercase text-lg"
                            >
                                Adamson UStore
                            </Link>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b">
                            <SearchBar className="w-full" />
                        </div>

                        {/* Navigation */}
                        <div className="flex flex-col py-2 overflow-y-auto max-h-[calc(100vh-180px)]">
                            {/* Home Link */}
                            <Link
                                href="/"
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors",
                                    pathname === "/" 
                                        ? "bg-primary/10 text-primary border-l-4 border-primary" 
                                        : "hover:bg-muted"
                                )}
                            >
                                <span>Home</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>

                            {/* Categories Section */}
                            <div className="px-4 py-2 mt-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Categories
                                </span>
                            </div>

                            {categories.map((category) => {
                                const isActive = pathname === `/category/${category.slug}`;
                                return (
                                    <Link
                                        key={category.id}
                                        href={`/category/${category.slug}`}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors",
                                            isActive 
                                                ? "bg-primary/10 text-primary border-l-4 border-primary" 
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        <span>{category.name}</span>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </Link>
                                );
                            })}

                            {/* Quick Links Section */}
                            <div className="px-4 py-2 mt-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Quick Links
                                </span>
                            </div>
                            
                            <Link
                                href="/orders"
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors",
                                    pathname?.startsWith("/orders")
                                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                                        : "hover:bg-muted"
                                )}
                            >
                                <span>My Orders</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            
                            <Link
                                href="/contact"
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors",
                                    pathname === "/contact"
                                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                                        : "hover:bg-muted"
                                )}
                            >
                                <span>Contact Us</span>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Logo - Center */}
                <Link href="/" className="absolute left-1/2 -translate-x-1/2">
                    <span className="font-black tracking-tighter uppercase text-sm">
                        Adamson UStore
                    </span>
                </Link>

                {/* Right Side - Cart & Account */}
                <div className="flex items-center gap-1">
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative h-9 w-9">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] justify-center rounded-full p-0 text-[10px]">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </Badge>
                            )}
                            <span className="sr-only">Cart</span>
                        </Button>
                    </Link>
                    <UserNav />
                </div>
            </div>
        </header>
    );
}

