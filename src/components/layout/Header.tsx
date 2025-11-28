"use client";

import Link from "next/link";
import { MainNav } from "./MainNav";
import { MobileNav } from "./MobileNav";
import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";

export function Header() {
    const { cartCount } = useCart();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container relative flex h-16 items-center justify-between">
                {/* Left Section: Mobile Nav & Logo */}
                <div className="flex items-center gap-4">
                    <MobileNav />
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-black tracking-tighter uppercase text-xl sm:text-2xl" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                            Adamson UStore
                        </span>
                    </Link>
                </div>

                {/* Center Section: Main Nav (Desktop) */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <MainNav />
                </div>

                {/* Right Section: Search & User Actions */}
                <div className="flex items-center space-x-4">
                    <div className="w-full md:w-auto hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="pl-8 w-[200px] lg:w-[300px]"
                            />
                        </div>
                    </div>
                    <nav className="flex items-center space-x-2">
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                                        {cartCount}
                                    </Badge>
                                )}
                                <span className="sr-only">Cart</span>
                            </Button>
                        </Link>
                        <UserNav />
                    </nav>
                </div>
            </div>
        </header>
    );
}
