"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState, useCallback, useMemo, useRef, } from "react";
import { ChevronRight, Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";

interface FeaturedSectionProps {
    products: Product[];
}

// Constants for carousel timing
const AUTOPLAY_DELAY = 8000; // 8 seconds per slide - slower for better viewing
const MAX_PAGINATION_DOTS = 7; // Max visible pagination dots

export function FeaturedSection({ products }: FeaturedSectionProps) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);
    
    // Create autoplay plugin with ref to prevent recreation on every render
    const autoplayPlugin = useRef(
        Autoplay({
            delay: AUTOPLAY_DELAY,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
        })
    );

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    // Group products by category for potential future optimization
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return Array.from(cats);
    }, [products]);

    // Calculate visible pagination dots (show subset for many items)
    const paginationDots = useMemo(() => {
        if (count <= MAX_PAGINATION_DOTS) {
            return Array.from({ length: count }, (_, i) => i);
        }
        
        // For many items, show dots around current position
        const half = Math.floor(MAX_PAGINATION_DOTS / 2);
        let start = Math.max(0, current - half);
        let end = Math.min(count, start + MAX_PAGINATION_DOTS);
        
        // Adjust start if we're near the end
        if (end - start < MAX_PAGINATION_DOTS) {
            start = Math.max(0, end - MAX_PAGINATION_DOTS);
        }
        
        return Array.from({ length: end - start }, (_, i) => start + i);
    }, [count, current]);

    // If no featured products, show a placeholder
    if (!products || products.length === 0) {
        return (
            <section className="py-12 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="container">
                    <div className="flex items-center justify-center min-h-[400px] text-slate-400">
                        <div className="text-center">
                            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No featured products yet</p>
                            <p className="text-sm opacity-75">Mark products as featured in the admin panel</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
            <div className="container">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            Featured Products
                        </h2>
                        {/* Show category count for transparency */}
                        {categories.length > 1 && (
                            <span className="text-xs text-slate-400 hidden sm:inline">
                                from {categories.length} categories
                            </span>
                        )}
                    </div>
                    <Link href="/category/apparel" className="hidden sm:flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors">
                        View All
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Featured Carousel */}
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                        loop: true,
                        skipSnaps: false, // Smoother navigation
                    }}
                    plugins={[autoplayPlugin.current]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {products.map((product) => (
                            <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <FeaturedProductCard product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 bg-white/10 border-white/20 text-white hover:bg-white/20" />
                    <CarouselNext className="right-2 bg-white/10 border-white/20 text-white hover:bg-white/20" />
                </Carousel>

                {/* Optimized Pagination */}
                {count > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {/* Show first dot indicator if not visible */}
                        {paginationDots[0] > 0 && (
                            <>
                                <button
                                    onClick={() => api?.scrollTo(0)}
                                    className="h-2 w-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                                    aria-label="Go to first slide"
                                />
                                <span className="text-white/30 text-xs">...</span>
                            </>
                        )}
                        
                        {/* Visible pagination dots */}
                        {paginationDots.map((index) => (
                            <button
                                key={index}
                                onClick={() => api?.scrollTo(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === current
                                        ? "w-8 bg-amber-400"
                                        : "w-2 bg-white/30 hover:bg-white/50"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                        
                        {/* Show last dot indicator if not visible */}
                        {paginationDots[paginationDots.length - 1] < count - 1 && (
                            <>
                                <span className="text-white/30 text-xs">...</span>
                                <button
                                    onClick={() => api?.scrollTo(count - 1)}
                                    className="h-2 w-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                                    aria-label="Go to last slide"
                                />
                            </>
                        )}
                        
                        {/* Slide counter for many items */}
                        {count > MAX_PAGINATION_DOTS && (
                            <span className="text-xs text-slate-400 ml-2">
                                {current + 1}/{count}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

// Image cycling speed on hover (slower for better viewing)
const IMAGE_CYCLE_DELAY = 3000; // 3 seconds per image - comfortable viewing pace

function FeaturedProductCard({ product }: { product: Product }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    
    // Clear any existing interval - prevents stacking
    const clearImageInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Cycle through images on hover - properly managed
    const handleMouseEnter = useCallback(() => {
        // Clear any existing interval first to prevent stacking
        clearImageInterval();
        
        if (images.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % images.length);
            }, IMAGE_CYCLE_DELAY);
        }
    }, [images.length, clearImageInterval]);

    const handleMouseLeave = useCallback(() => {
        clearImageInterval();
        setCurrentImageIndex(0);
    }, [clearImageInterval]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearImageInterval();
        };
    }, [clearImageInterval]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
        }).format(price);
    };

    return (
        <Link href={`/product/${product.id}`}>
            <div
                className="group relative aspect-4/5 rounded-xl overflow-hidden bg-slate-800 cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Product Image */}
                {images[currentImageIndex] ? (
                    <Image
                        src={images[currentImageIndex]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                        <span>No Image</span>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

                {/* Featured Badge */}
                <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-black text-xs font-semibold rounded-full">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                    </span>
                </div>

                {/* Image Indicators (if multiple images) */}
                {images.length > 1 && (
                    <div className="absolute top-4 right-4 flex gap-1">
                        {images.slice(0, 5).map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                    idx === currentImageIndex ? "bg-white" : "bg-white/40"
                                }`}
                            />
                        ))}
                    </div>
                )}

                {/* Product Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="space-y-2">
                        {/* Category */}
                        <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
                            {product.category}
                        </span>
                        
                        {/* Name */}
                        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-amber-400 transition-colors">
                            {product.name}
                        </h3>
                        
                        {/* Description */}
                        {product.description && (
                            <p className="text-sm text-slate-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {product.description}
                            </p>
                        )}
                        
                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xl font-bold text-white">
                                {formatPrice(product.price)}
                            </span>
                            <Button
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                            >
                                View Product
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
