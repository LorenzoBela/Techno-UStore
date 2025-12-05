"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";
import { memo, useCallback } from "react";
import { Plus } from "lucide-react";

interface MobileProductCardProps {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    subcategory?: string;
    isNew?: boolean;
    stock?: number;
}

// Memoized price formatter to avoid recreating on each render
const formatPrice = (price: number) => {
    return `₱${price.toLocaleString()}`;
};

export const MobileProductCard = memo(function MobileProductCard({
    id,
    name,
    price,
    image,
    category,
    subcategory,
    isNew,
    stock = 0,
}: MobileProductCardProps) {
    const { addItem } = useCart();

    const handleQuickAdd = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (stock === 0) {
            toast.error("Out of stock");
            return;
        }

        addItem({
            id,
            name,
            price,
            image,
            quantity: 1,
            category,
            subcategory,
        });
        toast.success("Added to cart", {
            description: name,
        });
    }, [id, name, price, image, category, subcategory, stock, addItem]);

    return (
        <Link href={`/product/${id}`} className="block" prefetch={false}>
            <div className="relative active:scale-[0.98] transition-transform duration-150">
                {/* Image Container */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                    {image ? (
                        <Image
                            src={image}
                            alt={name}
                            fill
                            sizes="50vw"
                            className="object-cover"
                            loading="lazy"
                            quality={75}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                        </div>
                    )}

                    {/* Badges */}
                    {isNew && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                            NEW
                        </Badge>
                    )}

                    {/* Out of Stock Overlay */}
                    {stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-xs font-medium px-2 py-1 bg-black/60 rounded">
                                Out of Stock
                            </span>
                        </div>
                    )}

                    {/* Quick Add Button */}
                    {stock > 0 && (
                        <button
                            onClick={handleQuickAdd}
                            className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                            aria-label="Quick add to cart"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Info */}
                <div className="mt-2 space-y-0.5 px-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {category}
                    </p>
                    <h3 className="text-sm font-medium line-clamp-2 leading-tight">
                        {name}
                    </h3>
                    <p className="text-sm font-bold text-primary">
                        {formatPrice(price)}
                    </p>
                </div>
            </div>
        </Link>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for better memoization
    return (
        prevProps.id === nextProps.id &&
        prevProps.price === nextProps.price &&
        prevProps.stock === nextProps.stock &&
        prevProps.isNew === nextProps.isNew
    );
});

