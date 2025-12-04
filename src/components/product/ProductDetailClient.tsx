"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { Product, ProductVariant } from "@/lib/types";

interface ProductDetailClientProps {
    product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
    const { addItem } = useCart();
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
        product.variants && product.variants.length > 0 ? product.variants[0] : null
    );
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [manualImageSelection, setManualImageSelection] = useState(false);

    // Get all images including variant images
    const allImages = product.images || [product.image].filter(Boolean);

    // Determine which image to show - manual selection overrides variant image
    const displayImage = manualImageSelection
        ? (allImages[currentImageIndex] || product.image)
        : (selectedVariant?.imageUrl || allImages[currentImageIndex] || product.image);

    // Calculate stock
    const inStock = selectedVariant
        ? selectedVariant.stock > 0
        : (product.stock > 0 || (product.variants?.some((v) => v.stock > 0) ?? false));

    const currentStock = selectedVariant?.stock ?? product.stock;

    // Group variants by name (or color) for better display
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

    // Get current group based on selected variant
    const selectedGroupKey = selectedVariant?.name || selectedVariant?.color || "default";
    const [activeGroup, setActiveGroup] = useState(selectedGroupKey);

    const handleGroupSelect = (groupKey: string) => {
        setActiveGroup(groupKey);
        setManualImageSelection(false); // Reset manual selection when variant changes
        // Select the first available size in this group
        const group = variantGroups[groupKey];
        if (group && group.sizes.length > 0) {
            const firstInStock = group.sizes.find(v => v.stock > 0) || group.sizes[0];
            setSelectedVariant(firstInStock);
            if (group.imageUrl) {
                const imageIndex = allImages.indexOf(group.imageUrl);
                if (imageIndex !== -1) {
                    setCurrentImageIndex(imageIndex);
                }
            }
        }
    };

    const handlePrevImage = () => {
        setManualImageSelection(true);
        setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setManualImageSelection(true);
        setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
    };

    const handleThumbnailClick = (index: number) => {
        setManualImageSelection(true);
        setCurrentImageIndex(index);
    };

    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setManualImageSelection(false); // Reset manual selection when variant changes
        // If variant has an image, find its index in allImages or just show variant image
        if (variant.imageUrl) {
            const imageIndex = allImages.indexOf(variant.imageUrl);
            if (imageIndex !== -1) {
                setCurrentImageIndex(imageIndex);
            }
        }
    };

    const handleAddToCart = () => {
        if (!inStock) {
            toast.error("This item is out of stock");
            return;
        }

        const variantInfo = selectedVariant
            ? ` - ${selectedVariant.name || `${selectedVariant.size}${selectedVariant.color ? ` / ${selectedVariant.color}` : ''}`}`
            : '';

        addItem({
            id: `${product.id}${selectedVariant ? `-${selectedVariant.size}-${selectedVariant.color || ''}` : ''}`,
            name: product.name,
            price: product.price,
            image: displayImage,
            quantity: 1,
            size: selectedVariant?.size,
            color: selectedVariant?.color || selectedVariant?.name,
            category: product.category,
            subcategory: product.subcategory,
        });

        toast.success("Added to cart", {
            description: `${product.name}${variantInfo} has been added to your cart.`,
        });
    };

    return (
        <div className="container py-12">
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                {/* Product Image Section with Carousel */}
                <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                        {displayImage ? (
                            <Image
                                src={displayImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <span className="text-2xl font-semibold">No Image Available</span>
                            </div>
                        )}

                        {/* Navigation Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-80 hover:opacity-100"
                                    onClick={handlePrevImage}
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-80 hover:opacity-100"
                                    onClick={handleNextImage}
                                >
                                    <ChevronRight className="h-6 w-6" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail Gallery */}
                    {allImages.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {allImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleThumbnailClick(index)}
                                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${currentImageIndex === index && (manualImageSelection || !selectedVariant?.imageUrl)
                                        ? "border-primary"
                                        : "border-transparent hover:border-muted-foreground/50"
                                        }`}
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Details Section */}
                <div className="flex flex-col gap-6">
                    <div>
                        <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                            {product.category}
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            {product.name}
                        </h1>
                        <div className="mt-4 text-3xl font-bold text-primary">
                            ₱{product.price.toFixed(2)}
                        </div>
                    </div>

                    {product.description && (
                        <div className="prose prose-stone text-muted-foreground">
                            <p>{product.description}</p>
                        </div>
                    )}

                    {/* Variant Selector */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="space-y-4">
                            {/* Variant Name/Color Selector (if multiple groups) */}
                            {hasMultipleGroups && (
                                <div>
                                    <h3 className="mb-3 text-sm font-medium">Select Variant</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {groupKeys.map((groupKey) => {
                                            const group = variantGroups[groupKey];
                                            const isSelected = activeGroup === groupKey;
                                            const totalStock = group.sizes.reduce((sum, v) => sum + v.stock, 0);
                                            const isOutOfStock = totalStock <= 0;

                                            return (
                                                <Button
                                                    key={groupKey}
                                                    variant={isSelected ? "default" : "outline"}
                                                    className={`relative ${isOutOfStock ? "opacity-50" : ""}`}
                                                    onClick={() => handleGroupSelect(groupKey)}
                                                    disabled={isOutOfStock}
                                                >
                                                    {group.imageUrl && (
                                                        <div className="relative h-6 w-6 mr-2 rounded overflow-hidden">
                                                            <Image
                                                                src={group.imageUrl}
                                                                alt={groupKey}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    {group.name || group.color || groupKey}
                                                    {isOutOfStock && (
                                                        <span className="ml-2 text-xs">(Out of Stock)</span>
                                                    )}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size Selector */}
                            {(() => {
                                const currentGroup = variantGroups[activeGroup] || variantGroups[groupKeys[0]];
                                const sizes = currentGroup?.sizes || product.variants || [];

                                // Get unique sizes
                                const uniqueSizes = sizes.filter((v, i, arr) =>
                                    arr.findIndex(x => x.size === v.size) === i
                                );

                                if (uniqueSizes.length > 0) {
                                    return (
                                        <div>
                                            <h3 className="mb-3 text-sm font-medium">Select Size</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {uniqueSizes.map((variant, index) => {
                                                    const isSelected = selectedVariant?.size === variant.size &&
                                                        (selectedVariant?.name === variant.name || selectedVariant?.color === variant.color);
                                                    const isOutOfStock = variant.stock <= 0;

                                                    return (
                                                        <Button
                                                            key={`${variant.size}-${index}`}
                                                            variant={isSelected ? "default" : "outline"}
                                                            className={`h-10 min-w-12 px-4 ${isOutOfStock ? "opacity-50 line-through" : ""}`}
                                                            onClick={() => handleVariantSelect(variant)}
                                                            disabled={isOutOfStock}
                                                        >
                                                            {variant.size}
                                                        </Button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {selectedVariant && (
                                <p className="text-sm text-muted-foreground">
                                    Selected: {selectedVariant.name || selectedVariant.color || ''} {selectedVariant.size}
                                    <span className="ml-2">• Stock: {selectedVariant.stock} available</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-4 sm:flex-row mt-6">
                        <Button
                            size="lg"
                            className="flex-1 gap-2"
                            disabled={!inStock}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                        <Button size="lg" variant="outline" className="gap-2">
                            <Heart className="h-5 w-5" />
                            Wishlist
                        </Button>
                        <Button size="icon" variant="ghost">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">
                        <p>
                            <span className="font-semibold text-foreground">Availability:</span>{" "}
                            {inStock ? `In Stock (${currentStock} available)` : "Out of Stock"}
                        </p>
                        <p className="mt-2">
                            <span className="font-semibold text-foreground">Shipping:</span>{" "}
                            Standard shipping rates apply. Free shipping on orders over ₱1000.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
