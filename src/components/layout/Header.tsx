"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Search, ShoppingCart, Heart, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useCategories } from "@/lib/categories-context";
import { SearchBar } from "@/components/ui/search-bar";
import { UserNav } from "./UserNav";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { cn } from "@/lib/utils";

export function Header() {
    const { cartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const { categories } = useCategories();
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    // Full screen search mode
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
            <div className="flex h-16 items-center justify-between">
                {/* Left Section: Burger Menu & Logo */}
                <div className="flex items-center">
                    {/* Burger Menu - All the way to left */}
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 ml-2 sm:ml-4">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

                            {/* Menu Header */}
                            <div className="p-6 border-b">
                                <Link
                                    href="/"
                                    className="flex items-center"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="font-black tracking-tighter uppercase text-xl">
                                        Adamson UStore
                                    </span>
                                </Link>
                            </div>

                            {/* Search in Menu */}
                            <div className="p-4 border-b">
                                <SearchBar />
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex flex-col p-4">
                                <Link
                                    href="/"
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                        pathname === "/"
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-muted"
                                    )}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="font-medium">Home</span>
                                </Link>

                                <div className="my-2 px-4">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Categories
                                    </span>
                                </div>

                                {categories.map((category) => {
                                    const isActive = pathname?.startsWith(`/category/${category.slug}`);
                                    return (
                                        <Link
                                            key={category.id}
                                            href={`/category/${category.slug}`}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "hover:bg-muted"
                                            )}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <span className="font-medium">{category.name}</span>
                                        </Link>
                                    );
                                })}

                                {/* Dark Mode Toggle in Mobile Menu */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between px-4 py-2">
                                        <span className="text-sm font-medium">Dark Mode</span>
                                        <ThemeSwitcher />
                                    </div>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-black tracking-tighter uppercase text-xl sm:text-2xl" style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
                            Adamson UStore
                        </span>
                    </Link>
                </div>

                {/* Right Section: Search & User Actions */}
                <div className="flex items-center space-x-2 sm:space-x-4 mr-2 sm:mr-4">
                    {/* Desktop Search */}
                    <div className="hidden md:block">
                        <SearchBar className="w-[200px] lg:w-[300px]" />
                    </div>

                    {/* Mobile Search Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>

                    {/* Theme Toggle - visible on all screen sizes */}
                    <ThemeSwitcher />

                    {/* User Actions */}
                    <nav className="flex items-center space-x-1 sm:space-x-2">
                        <Link href="/wishlist">
                            <Button variant="ghost" size="icon" className="relative">
                                <Heart className="h-5 w-5" />
                                {wishlistCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                                        {wishlistCount}
                                    </Badge>
                                )}
                                <span className="sr-only">Wishlist</span>
                            </Button>
                        </Link>
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
