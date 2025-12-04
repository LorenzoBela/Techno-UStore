"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MainNav } from "./MainNav";
import { MobileNav } from "./MobileNav";
import { UserNav } from "./UserNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { SearchBar } from "@/components/ui/search-bar";

export function Header() {
    const { cartCount } = useCart();
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    if (isSearchOpen) {
        return (
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container relative flex h-16 items-center gap-4">
                    <SearchBar className="flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                        <span className="sr-only">Close search</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-5 w-5"
                        >
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </Button>
                </div>
            </header>
        );
    }

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
                        <SearchBar className="w-[200px] lg:w-[300px]" />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
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
