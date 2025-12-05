"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { toast } from "sonner";
import { Product, ProductVariant } from "@/lib/types";

interface MobileProductDetailProps {
    product: Product;
}

export function MobileProductDetail({ product }: MobileProductDetailProps) {
    const { addItem } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const isWishlisted = isInWishlist(product.id);

    // Get all images
    const allImages = product.images || [product.image].filter(Boolean);

    // Handle scroll to update image index
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const scrollLeft = scrollRef.current.scrollLeft;
        const containerWidth = scrollRef.current.clientWidth;
        const newIndex = Math.round(scrollLeft / containerWidth);
        setCurrentImageIndex(Math.min(newIndex, allImages.length - 1));
    }, [allImages.length]);

    useEffect(() => {
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener('scroll', handleScroll, { passive: true });
            return () => scrollEl.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    // Calculate stock
    const inStock = selectedVariant
        ? selectedVariant.stock > 0
        : (product.stock > 0 || (product.variants?.some((v) => v.stock > 0) ?? false));

    const currentStock = selectedVariant?.stock ?? product.stock;

    // Group variants
    const variantGroups = product.variants?.reduce((acc, variant) => {
        const groupKey = variant.name || variant.color || "default";
        if (!acc[groupKey]) {
            acc[groupKey] = {
                name: variant.name,
                color: variant.color,
                imageUrl: variant.imageUrl,
                sizes: []
            };
        }
        acc[groupKey].sizes.push(variant);
        return acc;
    }, {} as Record<string, { name?: string; color?: string; imageUrl?: string; sizes: ProductVariant[] }>) || {};

    const groupKeys = Object.keys(variantGroups);
    const hasMultipleGroups = groupKeys.length > 1;
    const selectedGroupKey = selectedVariant?.name || selectedVariant?.color || "default";
    const [activeGroup, setActiveGroup] = useState(selectedGroupKey);

    const handleGroupSelect = (groupKey: string) => {
        setActiveGroup(groupKey);
        const group = variantGroups[groupKey];
        if (group && group.sizes.length > 0) {
            const firstInStock = group.sizes.find(v => v.stock > 0) || group.sizes[0];
            setSelectedVariant(firstInStock);
        }
    };

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
    };

    const handleAddToCart = () => {
        if (!inStock) {
            toast.error("This item is out of stock");
            return;
        }

        const displayImage = selectedVariant?.imageUrl || allImages[currentImageIndex] || product.image;

        addItem({
            id: `${product.id}${selectedVariant ? `-${selectedVariant.size}-${selectedVariant.color || ''}` : ''}`,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: displayImage,
            quantity: 1,
            size: selectedVariant?.size,
            color: selectedVariant?.color || selectedVariant?.name,
            category: product.category,
            subcategory: product.subcategory,
        });

        toast.success("Added to cart!", {
            description: `${product.name}${selectedVariant ? ` - ${selectedVariant.size}` : ''}`,
        });
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description || `Check out ${product.name}`,
                    url: window.location.href,
                });
            } catch {
                // User cancelled or error
            }
        } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleToggleWishlist = () => {
        toggleWishlist({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            subcategory: product.subcategory,
        });
        
        if (isWishlisted) {
            toast.success("Removed from wishlist");
        } else {
            toast.success("Added to wishlist", {
                description: product.name,
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-32">
            {/* Image Gallery - Full Width Swipeable */}
            <div className="relative bg-muted">
                <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                >
                    {allImages.map((img, index) => (
                        <div 
                            key={index} 
                            className="relative flex-shrink-0 w-full aspect-square snap-start"
                        >
                            {img ? (
                                <Image
                                    src={img}
                                    alt={`${product.name} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Back Button */}
                <Link
                    href="/"
                    className="absolute top-4 left-4 h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-lg"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Link>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        onClick={handleShare}
                        className="h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-lg"
                    >
                        <Share2 className="h-5 w-5" />
                    </button>
                    <button 
                        onClick={handleToggleWishlist}
                        className="h-10 w-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-lg"
                    >
                        <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                </div>

                {/* Image Pagination */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 rounded-full transition-all ${
                                    index === currentImageIndex
                                        ? "w-6 bg-primary"
                                        : "w-2 bg-background/60"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="px-4 py-5 space-y-4">
                {/* Category & Name */}
                <div>
                    <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                        {product.category}
                    </Badge>
                    <h1 className="text-xl font-bold tracking-tight">
                        {product.name}
                    </h1>
                    <div className="mt-2 text-2xl font-bold text-primary">
                        ₱{product.price.toFixed(2)}
                    </div>
                </div>

                {/* Description */}
                {product.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {product.description}
                    </p>
                )}

                {/* Variant Selector */}
                {product.variants && product.variants.length > 0 ? (
                    <div className="space-y-4 pt-2">
                        {/* Variant Groups (Colors/Types) */}
                        {hasMultipleGroups && (
                            <div>
                                <h3 className="text-sm font-medium mb-2">Variant</h3>
                                <div className="flex flex-wrap gap-2">
                                    {groupKeys.map((groupKey) => {
                                        const group = variantGroups[groupKey];
                                        const isSelected = activeGroup === groupKey;
                                        const totalStock = group.sizes.reduce((sum, v) => sum + v.stock, 0);
                                        const isOutOfStock = totalStock <= 0;

                                        return (
                                            <button
                                                key={groupKey}
                                                onClick={() => handleGroupSelect(groupKey)}
                                                disabled={isOutOfStock}
                                                className={`
                                                    relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
                                                    ${isSelected 
                                                        ? "border-primary bg-primary/5" 
                                                        : "border-muted hover:border-muted-foreground/30"
                                                    }
                                                    ${isOutOfStock ? "opacity-50" : ""}
                                                `}
                                            >
                                                {group.imageUrl && (
                                                    <div className="relative h-6 w-6 rounded overflow-hidden">
                                                        <Image
                                                            src={group.imageUrl}
                                                            alt={groupKey}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                {group.name || group.color || groupKey}
                                                {isSelected && (
                                                    <Check className="h-4 w-4 text-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Size Selector */}
                        {(() => {
                            const currentGroup = variantGroups[activeGroup] || variantGroups[groupKeys[0]];
                            const sizes = currentGroup?.sizes || product.variants || [];
                            const uniqueSizes = sizes.filter((v, i, arr) =>
                                arr.findIndex(x => x.size === v.size) === i
                            );

                            if (uniqueSizes.length > 0) {
                                return (
                                    <div>
                                        <h3 className="text-sm font-medium mb-2">Size</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {uniqueSizes.map((variant, index) => {
                                                const isSelected = selectedVariant?.size === variant.size &&
                                                    (selectedVariant?.name === variant.name || selectedVariant?.color === variant.color);
                                                const isOutOfStock = variant.stock <= 0;

                                                return (
                                                    <button
                                                        key={`${variant.size}-${index}`}
                                                        onClick={() => handleVariantSelect(variant)}
                                                        disabled={isOutOfStock}
                                                        className={`
                                                            h-11 min-w-[48px] px-4 rounded-lg border-2 text-sm font-medium transition-all
                                                            ${isSelected 
                                                                ? "border-primary bg-primary text-primary-foreground" 
                                                                : "border-muted hover:border-muted-foreground/30"
                                                            }
                                                            ${isOutOfStock ? "opacity-40 line-through" : ""}
                                                        `}
                                                    >
                                                        {variant.size}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        {/* Stock Info */}
                        {selectedVariant && (
                            <p className="text-xs text-muted-foreground">
                                {selectedVariant.stock > 0 
                                    ? `${selectedVariant.stock} in stock`
                                    : "Out of stock"
                                }
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50 p-3">
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                            This product has no variants. Stock: {product.stock}
                        </p>
                    </div>
                )}

                {/* Additional Info */}
                <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                    <p>
                        <span className="font-medium text-foreground">Availability:</span>{" "}
                        {inStock ? `In Stock (${currentStock})` : "Out of Stock"}
                    </p>
                    <p>
                        <span className="font-medium text-foreground">Shipping:</span>{" "}
                        Free shipping on orders over ₱1000
                    </p>
                </div>
            </div>

            {/* Sticky Bottom Bar - above bottom nav */}
            <div className="fixed bottom-16 left-0 right-0 bg-background border-t px-4 py-3 flex gap-3 z-40">
                {/* Wishlist Button */}
                <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-12 p-0"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    onClick={handleToggleWishlist}
                >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                
                {/* Add to Cart Button */}
                <Button
                    size="lg"
                    className="flex-1 h-12 text-base font-semibold gap-2"
                    disabled={!inStock}
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="h-5 w-5" />
                    {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
            </div>
        </div>
    );
}

