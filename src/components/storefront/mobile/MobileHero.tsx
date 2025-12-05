"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export function MobileHero() {
    return (
        <section className="relative w-full overflow-hidden bg-primary">
            {/* Content */}
            <div className="relative flex flex-col px-5 py-10 min-h-[280px] justify-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-primary-foreground leading-tight">
                    Wear Your Pride,{" "}
                    <span className="text-white block">Adamson Style.</span>
                </h1>
                <p className="mt-3 text-sm text-primary-foreground/90 max-w-[280px] leading-relaxed">
                    Official store for Adamson University apparel, accessories, and supplies.
                </p>
                
                {/* CTA Buttons - Stack vertically on mobile */}
                <div className="flex flex-col gap-3 mt-6">
                    <Link href="/category/apparel" className="w-full">
                        <Button 
                            size="lg" 
                            className="w-full font-semibold bg-white text-primary hover:bg-white/90 h-12 text-base"
                        >
                            Shop Apparel
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/category/accessories" className="w-full">
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="w-full font-semibold border-white/50 text-white hover:bg-white/10 bg-transparent h-12 text-base"
                        >
                            View Accessories
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

