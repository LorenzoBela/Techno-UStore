"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { SearchBar } from "@/components/ui/search-bar";

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="px-7">
                    <Link
                        href="/"
                        className="flex items-center"
                        onClick={() => setOpen(false)}
                    >
                        <span className="font-bold text-lg">Adamson Store</span>
                    </Link>
                </div>
                <div className="flex flex-col gap-4 py-8 px-7">
                    <SearchBar />
                    <Link
                        href="/"
                        className="text-sm font-medium hover:text-primary"
                        onClick={() => setOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        href="/category/apparel"
                        className="text-sm font-medium hover:text-primary"
                        onClick={() => setOpen(false)}
                    >
                        Apparel
                    </Link>
                    <Link
                        href="/category/accessories"
                        className="text-sm font-medium hover:text-primary"
                        onClick={() => setOpen(false)}
                    >
                        Accessories
                    </Link>
                    <Link
                        href="/category/supplies"
                        className="text-sm font-medium hover:text-primary"
                        onClick={() => setOpen(false)}
                    >
                        Supplies
                    </Link>
                    <Link
                        href="/category/uniforms"
                        className="text-sm font-medium hover:text-primary"
                        onClick={() => setOpen(false)}
                    >
                        Uniforms
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    );
}
