"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { memo, useRef, useState, useEffect, useCallback } from "react";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    isNew?: boolean;
    stock?: number;
}

interface MobileCategoryShowcaseProps {
    title: string;
    href: string;
    products: Product[];
}

export const MobileCategoryShowcase = memo(function MobileCategoryShowcase({ 
    title, 
    href, 
    products 
}: MobileCategoryShowcaseProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const cardWidth = 156 + 12; // card width + gap
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (!products || products.length === 0) return null;

    return (
        <section className="py-6">
            {/* Header */}
            <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="text-lg font-bold tracking-tight">{title}</h2>
                <Link 
                    href={href}
                    className="flex items-center gap-0.5 text-xs font-medium text-primary active:opacity-70"
                >
                    View All
                    <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Horizontal Scroll Products */}
            <div 
                ref={scrollRef}
                className="flex gap-3 px-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
            >
                {products.map((product) => (
                    <Link 
                        key={product.id} 
                        href={`/product/${product.id}`}
                        className="flex-shrink-0 snap-start"
                    >
                        <div className="w-[156px] active:scale-[0.98] transition-transform">
                            {/* Image */}
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        sizes="156px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                                        No Image
                                    </div>
                                )}
                                
                                {/* New Badge */}
                                {product.isNew && (
                                    <div className="absolute top-2 left-2">
                                        <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded">
                                            NEW
                                        </span>
                                    </div>
                                )}

                                {/* Out of Stock Overlay */}
                                {product.stock === 0 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-medium line-clamp-2 leading-tight">
                                    {product.name}
                                </h3>
                                <p className="text-sm font-bold text-primary">
                                    {formatPrice(product.price)}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination dots (only show if more than visible) */}
            {products.length > 2 && (
                <div className="flex items-center justify-center gap-1 mt-2">
                    {products.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 rounded-full transition-all duration-200 ${
                                idx === activeIndex
                                    ? "w-4 bg-primary"
                                    : "w-1 bg-muted-foreground/30"
                            }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
});

