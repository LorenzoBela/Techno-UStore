"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { MobileProductCard } from "@/components/admin/mobile/MobileProductCard";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { columns } from "@/components/admin/products/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/types";

interface ProductsContentProps {
    products: Product[];
    count: number;
    totalPages: number;
    page: number;
    category: string;
    search: string;
    stockFilter: string;
    categories: string[];
}

export function ProductsContent({
    products,
    count,
    totalPages,
    page,
    category,
    search,
    stockFilter,
    categories,
}: ProductsContentProps) {
    const { isMobile, isLoading } = useDeviceDetect();

    const buildUrl = (newPage: number) => {
        const params = new URLSearchParams();
        params.set("page", newPage.toString());
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        if (stockFilter !== "all") params.set("stock", stockFilter);
        return `/admin/products?${params.toString()}`;
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    // Mobile View
    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen">
                <MobileHeader 
                    title="Products" 
                    action={
                        <Link href="/admin/products/new">
                            <Button size="icon" className="h-9 w-9">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </Link>
                    }
                />
                
                <div className="flex-1 p-4 space-y-4">
                    {/* Search and Filters */}
                    <div className="space-y-3">
                        <form className="relative">
                            <Input
                                name="search"
                                placeholder="Search products..."
                                defaultValue={search}
                                className="pr-10"
                            />
                            <input type="hidden" name="category" value={category} />
                            <input type="hidden" name="stock" value={stockFilter} />
                        </form>
                        
                        <div className="flex gap-2">
                            <form className="flex-1">
                                <input type="hidden" name="search" value={search} />
                                <input type="hidden" name="stock" value={stockFilter} />
                                <Select name="category" defaultValue={category || "all"}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </form>
                            <form className="flex-1">
                                <input type="hidden" name="search" value={search} />
                                <input type="hidden" name="category" value={category} />
                                <Select name="stock" defaultValue={stockFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Stock" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Stock</SelectItem>
                                        <SelectItem value="in-stock">In Stock</SelectItem>
                                        <SelectItem value="low-stock">Low Stock</SelectItem>
                                        <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </form>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {count.toLocaleString()} products
                    </p>

                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                {search || category ? "No products match your filters" : "No products yet"}
                            </p>
                            <Link href="/admin/products/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {products.map((product) => (
                                <MobileProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4">
                            <Link href={buildUrl(Math.max(1, page - 1))}>
                                <Button variant="outline" size="sm" disabled={page <= 1}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                            </Link>
                            <span className="text-sm text-muted-foreground">
                                {page} / {totalPages}
                            </span>
                            <Link href={buildUrl(Math.min(totalPages, page + 1))}>
                                <Button variant="outline" size="sm" disabled={page >= totalPages}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Desktop View
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {count.toLocaleString()} products total
                    </p>
                </div>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <form className="flex-1 max-w-sm">
                    <Input
                        name="search"
                        placeholder="Search products..."
                        defaultValue={search}
                        className="w-full"
                    />
                    <input type="hidden" name="category" value={category} />
                    <input type="hidden" name="stock" value={stockFilter} />
                </form>
                <form className="flex gap-2">
                    <input type="hidden" name="search" value={search} />
                    <Select name="category" defaultValue={category || "all"}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select name="stock" defaultValue={stockFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Stock" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stock</SelectItem>
                            <SelectItem value="in-stock">In Stock (&gt;10)</SelectItem>
                            <SelectItem value="low-stock">Low Stock (1-10)</SelectItem>
                            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" variant="secondary">Filter</Button>
                </form>
            </div>

            <div className="rounded-md border">
                {products.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        {search || category ? "No products match your filters" : "No products yet"}
                    </div>
                ) : (
                    <ProductTable columns={columns} data={products} />
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages} ({count.toLocaleString()} products)
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={buildUrl(1)}>
                            <Button variant="outline" size="icon" disabled={page <= 1}>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={buildUrl(Math.max(1, page - 1))}>
                            <Button variant="outline" size="icon" disabled={page <= 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <span className="text-sm px-2">{page} / {totalPages}</span>
                        <Link href={buildUrl(Math.min(totalPages, page + 1))}>
                            <Button variant="outline" size="icon" disabled={page >= totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={buildUrl(totalPages)}>
                            <Button variant="outline" size="icon" disabled={page >= totalPages}>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

