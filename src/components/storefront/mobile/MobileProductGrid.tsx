"use client";

import { MobileProductCard } from "./MobileProductCard";
import { memo, useMemo } from "react";
import { Package } from "lucide-react";

interface Product {
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
}

interface MobileProductGridProps {
    products: Product[];
}

export const MobileProductGrid = memo(function MobileProductGrid({ products }: MobileProductGridProps) {
    // Memoize the product list to avoid unnecessary re-renders
    const productList = useMemo(() => products, [products]);

    if (!productList || productList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold mb-1">No products found</h3>
                <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 px-4">
            {productList.map((product) => (
                <MobileProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    images={product.images}
                    category={product.category}
                    subcategory={product.subcategory}
                    isNew={product.isNew}
                    stock={product.stock}
                />
            ))}
        </div>
    );
});

