"use client";

import { useState, useMemo, useCallback } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";

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
    initialPageSize?: number;
    enablePagination?: boolean;
}

const PAGE_SIZE_OPTIONS = [12, 24, 48];

export function ProductGrid({ 
    products, 
    initialPageSize = 24,
    enablePagination = true 
}: ProductGridProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Memoized pagination calculations
    const { paginatedProducts, totalPages, startIndex, endIndex } = useMemo(() => {
        if (!enablePagination) {
            return {
                paginatedProducts: products,
                totalPages: 1,
                startIndex: 0,
                endIndex: products.length,
            };
        }
        
        const total = Math.ceil(products.length / pageSize);
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, products.length);
        
        return {
            paginatedProducts: products.slice(start, end),
            totalPages: total,
            startIndex: start,
            endIndex: end,
        };
    }, [products, currentPage, pageSize, enablePagination]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Scroll to top of grid smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize);
        setCurrentPage(1); // Reset to first page
    }, []);

    return (
        <div>
            {/* View Toggle Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm text-muted-foreground">
                    {enablePagination && products.length > pageSize 
                        ? `Showing ${startIndex + 1}-${endIndex} of ${products.length} products`
                        : `${products.length} product${products.length !== 1 ? "s" : ""} found`
                    }
                </p>
                <div className="flex items-center gap-2">
                    {/* Page Size Selector */}
                    {enablePagination && products.length > PAGE_SIZE_OPTIONS[0] && (
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="text-sm border rounded px-2 py-1 bg-background"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size} per page
                                </option>
                            ))}
                        </select>
                    )}
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
            {paginatedProducts.length > 0 ? (
                <div
                    className={
                        viewMode === "grid"
                            ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                            : "flex flex-col gap-4"
                    }
                >
                    {paginatedProducts.map((product) => (
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

            {/* Pagination Controls */}
            {enablePagination && totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => handlePageChange(pageNum)}
                                    className="w-10"
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
