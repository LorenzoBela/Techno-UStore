"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { useState, useEffect, useRef, memo } from "react";
import { Eye, ShoppingCart } from "lucide-react";

// Low quality blur placeholder for faster initial load
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
    typeof window === "undefined"
        ? Buffer.from(str).toString("base64")
        : window.btoa(str);

const blurDataURL = `data:image/svg+xml;base64,${toBase64(shimmer(300, 300))}`;

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    subcategory?: string;
    isNew?: boolean;
    stock?: number;
    description?: string;
    viewMode?: "grid" | "list";
}

export function ProductCard({
    id,
    name,
    price,
    image,
    images,
    category,
    subcategory,
    isNew,
    stock = 0,
    description,
    viewMode = "grid",
}: ProductCardProps) {
    const { addItem } = useCart();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Combine all images (main image + additional images)
    const allImages = (() => {
        const imageList: string[] = [];
        if (image) imageList.push(image);
        if (images) {
            images.forEach(img => {
                if (img && !imageList.includes(img)) imageList.push(img);
            });
        }
        return imageList.length > 0 ? imageList : ["/product-placeholder.png"];
    })();

    const hasMultipleImages = allImages.length > 1;

    // Handle hover image cycling
    useEffect(() => {
        if (isHovering && hasMultipleImages) {
            intervalRef.current = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % allImages.length);
            }, 1200); // Cycle every 1.2 seconds
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setCurrentImageIndex(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isHovering, hasMultipleImages, allImages.length]);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to product page
        addItem({
            id,
            name,
            price,
            image,
            quantity: 1,
            category,
            subcategory,
        });
        // Feedback
        toast.success("Added to cart", {
            description: `${name} has been added to your cart.`,
        });
    };

    // List view layout
    if (viewMode === "list") {
        return (
            <Card
                className="group overflow-hidden rounded-lg transition-all hover:shadow-lg"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div className="flex flex-col sm:flex-row">
                    <div className="relative aspect-square w-full sm:w-48 md:w-64 overflow-hidden flex-shrink-0">
                        <Link href={`/product/${id}`} prefetch={true}>
                            {/* Only render current image + preload next for performance */}
                            <Image
                                src={allImages[currentImageIndex]}
                                alt={`${name}`}
                                fill
                                className="object-cover transition-opacity duration-300"
                                sizes="(max-width: 768px) 100vw, 256px"
                                placeholder="blur"
                                blurDataURL={blurDataURL}
                                loading="lazy"
                            />
                            {/* Preload next image */}
                            {hasMultipleImages && (
                                <link
                                    rel="prefetch"
                                    href={allImages[(currentImageIndex + 1) % allImages.length]}
                                    as="image"
                                />
                            )}
                        </Link>
                        {isNew && (
                            <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground">
                                New
                            </Badge>
                        )}
                        {hasMultipleImages && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                {allImages.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentImageIndex
                                            ? "bg-white shadow-md"
                                            : "bg-white/50"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                        <div className="flex-1">
                            <div className="text-sm text-muted-foreground">{category}</div>
                            <Link href={`/product/${id}`} prefetch={true}>
                                <h3 className="text-lg font-semibold hover:underline group-hover:text-primary transition-colors">
                                    {name}
                                </h3>
                            </Link>
                            {description && (
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                    {description}
                                </p>
                            )}
                            <p className="mt-2 text-xl font-bold">₱{price.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                                {stock > 0 ? `${stock} in stock` : "Out of stock"}
                            </p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={handleAddToCart}
                                disabled={stock === 0}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </Button>
                            <Link href={`/product/${id}`}>
                                <Button variant="outline" size="icon">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    // Grid view layout (default)
    return (
        <Card
            className="group overflow-hidden rounded-lg border-0 bg-transparent shadow-none transition-all hover:shadow-md"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <CardContent className="p-0 relative aspect-square overflow-hidden rounded-lg bg-secondary/20">
                {isNew && (
                    <Badge className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground">
                        New
                    </Badge>
                )}
                {hasMultipleImages && (
                    <>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                            {allImages.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentImageIndex
                                        ? "bg-white shadow-md"
                                        : "bg-white/50"
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {currentImageIndex + 1}/{allImages.length}
                        </div>
                    </>
                )}
                <Link href={`/product/${id}`} prefetch={true}>
                    <div className="relative h-full w-full">
                        {/* Only render current image + preload next for performance */}
                        <Image
                            src={allImages[currentImageIndex]}
                            alt={`${name}`}
                            fill
                            className="object-cover transition-opacity duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                            loading="lazy"
                        />
                        {/* Preload next image */}
                        {hasMultipleImages && (
                            <link
                                rel="prefetch"
                                href={allImages[(currentImageIndex + 1) % allImages.length]}
                                as="image"
                            />
                        )}
                    </div>
                </Link>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 p-4">
                <div className="text-sm text-muted-foreground">{category}</div>
                <Link href={`/product/${id}`} prefetch={true} className="font-semibold hover:underline">
                    {name}
                </Link>
                <div className="flex w-full items-center justify-between">
                    <div className="font-bold">₱{price.toFixed(2)}</div>
                    <Button size="sm" variant="secondary" onClick={handleAddToCart} disabled={stock === 0}>
                        Add to Cart
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

// Memoize the component to prevent unnecessary re-renders
export const MemoizedProductCard = memo(ProductCard);
