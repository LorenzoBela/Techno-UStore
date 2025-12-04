"use client";

import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { columns } from "@/components/admin/products/columns";
import { Product } from "@/lib/types";
import { Plus, LayoutGrid, LayoutList, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewProductDialog } from "@/components/admin/products/view-product-dialog";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { getProducts } from "./product-actions";

function ProductGridItem({ product }: { product: Product }) {
    const [showViewDialog, setShowViewDialog] = useState(false);

    return (
        <>
            <ViewProductDialog
                open={showViewDialog}
                onOpenChange={setShowViewDialog}
                product={product}
            />
            <Card className="overflow-hidden">
                <div className="aspect-square w-full bg-muted relative">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>
                <CardHeader className="p-4">
                    <div className="flex items-start justify-between space-x-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold leading-none tracking-tight line-clamp-1">
                                {product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between">
                        <span className="font-bold">
                            {new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                            }).format(product.price)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Stock: {product.stock}
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(product.id)}
                            >
                                Copy product ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
                                View details
                            </DropdownMenuItem>
                            <Link href={`/admin/products/${product.id}/edit`}>
                                <DropdownMenuItem>
                                    Edit product
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="text-destructive">
                                Delete product
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardFooter>
            </Card>
        </>
    );
}

export default function ProductsPage() {
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [categories, setCategories] = useState<string[]>([]);

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(10000);

    const fetchProducts = async () => {
        setIsLoading(true);
        const { products: fetchedProducts } = await getProducts(1, 100, {
            category: selectedCategories.length > 0 ? selectedCategories : undefined,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        });
        setProducts(fetchedProducts);

        if (categories.length === 0 && fetchedProducts.length > 0) {
            const uniqueCategories = Array.from(new Set(fetchedProducts.map((p) => p.category)));
            setCategories(uniqueCategories);
        }

        if (fetchedProducts.length > 0) {
            const prices = fetchedProducts.map(p => p.price);
            setMinPrice(Math.min(...prices));
            setMaxPrice(Math.max(...prices));
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, [selectedCategories, priceRange]);

    const handleCategoryChange = (category: string, checked: boolean) => {
        if (checked) {
            setSelectedCategories([...selectedCategories, category]);
        } else {
            setSelectedCategories(selectedCategories.filter((c) => c !== category));
        }
    };

    const handleReset = () => {
        setSelectedCategories([]);
        setPriceRange([0, 10000]);
        fetchProducts();
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center border rounded-md bg-background">
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-2 lg:px-3"
                            onClick={() => setViewMode("table")}
                        >
                            <LayoutList className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-2 lg:px-3"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <Link href="/admin/products/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 shrink-0">
                    <ProductFilters
                        categories={categories}
                        selectedCategories={selectedCategories}
                        onCategoryChange={handleCategoryChange}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        onReset={handleReset}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : viewMode === "table" ? (
                        <ProductTable columns={columns} data={products} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {products.map((product) => (
                                <ProductGridItem key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
