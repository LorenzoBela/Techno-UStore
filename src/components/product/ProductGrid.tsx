"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    isNew?: boolean;
    stock?: number;
    description?: string;
}

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    return (
        <div>
            {/* View Toggle Header */}
            <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    {products.length} product{products.length !== 1 ? "s" : ""} found
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">View:</span>
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("grid")}
                        title="Grid view"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setViewMode("list")}
                        title="List view"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Product Display */}
            {products.length > 0 ? (
                <div
                    className={
                        viewMode === "grid"
                            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            : "flex flex-col gap-4"
                    }
                >
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={product.price}
                            image={product.image}
                            images={product.images}
                            category={product.category}
                            isNew={product.isNew}
                            stock={product.stock}
                            description={product.description}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                    <h3 className="text-xl font-semibold text-muted-foreground">
                        No products found in this category.
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Try selecting a different category from the sidebar.
                    </p>
                </div>
            )}
        </div>
    );
}
