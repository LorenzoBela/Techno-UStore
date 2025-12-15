"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function MobileHero() {
    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ backgroundColor: '#1f3a93' }}
        >
            {/* Content */}
            <div className="relative flex flex-col px-5 py-10 min-h-[280px] justify-center">
                <h1
                    className="text-3xl font-extrabold tracking-tight leading-tight"
                    style={{ color: '#ffffff' }}
                >
                    Wear Your Pride,{" "}
                    <span className="block" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        Adamson Style.
                    </span>
                </h1>
                <p
                    className="mt-3 text-sm max-w-[280px] leading-relaxed"
                    style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                >
                    Official store for Adamson University apparel, accessories, and supplies.
                </p>

                <div className="flex flex-col gap-3 mt-6">
                    <Link href="/category/apparel" className="w-full">
                        <button
                            className="w-full h-12 text-base font-semibold rounded-md flex items-center justify-center gap-1 transition-colors"
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.7)',
                                color: '#ffffff'
                            }}
                        >
                            Shop Apparel
                            <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                    </Link>
                    <Link href="/category/accessories" className="w-full">
                        <button
                            className="w-full h-12 text-base font-semibold rounded-md flex items-center justify-center transition-colors"
                            style={{
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.7)',
                                color: '#ffffff'
                            }}
                        >
                            View Accessories
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}



