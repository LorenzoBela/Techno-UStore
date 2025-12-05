"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { Star, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";

interface MobileFeaturedSectionProps {
    products: Product[];
}

export function MobileFeaturedSection({ products }: MobileFeaturedSectionProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Track scroll position for pagination
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const cardWidth = 280 + 12; // card width + gap
        const newIndex = Math.round(scrollLeft / cardWidth);
        setActiveIndex(Math.min(newIndex, products.length - 1));
    }, [products.length]);

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener('scroll', handleScroll, { passive: true });
            return () => scrollEl.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    if (!products || products.length === 0) {
        return (
            <section className="py-8 bg-slate-900">
                <div className="px-4">
                    <div className="flex items-center justify-center min-h-[200px] text-slate-400">
                        <div className="text-center">
                            <Star className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No featured products yet</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(price);
    };

    return (
        <section className="py-8 bg-slate-900 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-4">
                <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <h2 className="text-lg font-bold text-white">Featured</h2>
                </div>
                <Link 
                    href="/category/apparel" 
                    className="flex items-center gap-0.5 text-xs text-slate-300 active:text-white"
                >
                    View All
                    <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Horizontal Scroll */}
            <div 
                ref={scrollRef}
                className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            >
                {products.map((product) => (
                    <Link 
                        key={product.id} 
                        href={`/product/${product.id}`}
                        className="flex-shrink-0 snap-start"
                    >
                        <div className="relative w-[280px] aspect-[4/5] rounded-xl overflow-hidden bg-slate-800 active:scale-[0.98] transition-transform">
                            {/* Image */}
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    sizes="280px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                                    <span>No Image</span>
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/60" />

                            {/* Featured Badge */}
                            <div className="absolute top-3 left-3">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 text-black text-[10px] font-semibold rounded-full">
                                    <Star className="h-2.5 w-2.5 fill-current" />
                                    Featured
                                </span>
                            </div>

                            {/* Product Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
                                    {product.category}
                                </span>
                                <h3 className="text-base font-bold text-white line-clamp-2 mt-1">
                                    {product.name}
                                </h3>
                                <span className="text-lg font-bold text-white mt-2 block">
                                    {formatPrice(product.price)}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination Dots */}
            {products.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                    {products.slice(0, 7).map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === activeIndex
                                    ? "w-6 bg-amber-400"
                                    : "w-1.5 bg-white/30"
                            }`}
                        />
                    ))}
                    {products.length > 7 && (
                        <span className="text-[10px] text-slate-400 ml-1">
                            +{products.length - 7}
                        </span>
                    )}
                </div>
            )}
        </section>
    );
}

