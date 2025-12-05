"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, ChevronDown, X, Loader2 } from "lucide-react";
import { MobileProductGrid } from "./MobileProductGrid";
import { useCallback, useState, useMemo, useTransition } from "react";
import Link from "next/link";

const ITEMS_PER_PAGE = 20;

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

interface Category {
    name: string;
    slug: string;
    count?: number;
}

interface Subcategory {
    id: string;
    name: string;
    slug: string;
}

interface MobileCategoryPageProps {
    slug: string;
    categoryName: string;
    products: Product[];
    categories: Category[];
    subcategories: Subcategory[];
}

export function MobileCategoryPage({
    slug,
    categoryName,
    products,
    categories,
    subcategories,
}: MobileCategoryPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [isPending, startTransition] = useTransition();

    // Memoize visible products for performance
    const visibleProducts = useMemo(() => {
        return products.slice(0, visibleCount);
    }, [products, visibleCount]);

    const hasMore = visibleCount < products.length;
    const remainingCount = products.length - visibleCount;

    // Load more products
    const loadMore = useCallback(() => {
        startTransition(() => {
            setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, products.length));
        });
    }, [products.length]);

    // Count active filters
    const activeFilters = [
        searchParams.get('types'),
        searchParams.get('priceRange'),
        searchParams.get('sizes'),
    ].filter(Boolean).length;

    // Create Query String for multi-value params
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            const current = params.get(name);
            let newValues = current ? current.split(',') : [];

            if (newValues.includes(value)) {
                newValues = newValues.filter(v => v !== value);
            } else {
                newValues.push(value);
            }

            if (newValues.length > 0) {
                params.set(name, newValues.join(','));
            } else {
                params.delete(name);
            }

            return params.toString();
        },
        [searchParams]
    );

    // Set single value param
    const setQueryParam = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);
            return params.toString();
        },
        [searchParams]
    );

    const isChecked = (name: string, value: string) => {
        const current = searchParams.get(name);
        return current ? current.split(',').includes(value) : false;
    };

    const clearAllFilters = () => {
        router.push(pathname);
    };

    const currentSort = searchParams.get('sort') || 'newest';
    const sortLabels: Record<string, string> = {
        'newest': 'Newest',
        'price-asc': 'Price ↑',
        'price-desc': 'Price ↓',
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="sticky top-14 z-30 bg-background border-b">
                <div className="px-4 py-3">
                    <h1 className="text-xl font-bold">{categoryName}</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {products.length} product{products.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Filter & Sort Bar */}
                <div className="flex items-center gap-2 px-4 pb-3">
                    {/* Filter Button */}
                    <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                                {activeFilters > 0 && (
                                    <Badge className="h-5 w-5 p-0 justify-center text-[10px]">
                                        {activeFilters}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
                            <SheetHeader className="text-left pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <SheetTitle>Filters</SheetTitle>
                                    {activeFilters > 0 && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={clearAllFilters}
                                            className="text-destructive"
                                        >
                                            Clear All
                                        </Button>
                                    )}
                                </div>
                            </SheetHeader>

                            <div className="overflow-y-auto py-4 space-y-6 max-h-[calc(85vh-140px)]">
                                {/* Categories */}
                                <div>
                                    <h3 className="font-semibold mb-3">Category</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <Link
                                                key={cat.slug}
                                                href={`/category/${cat.slug}`}
                                                onClick={() => setFilterOpen(false)}
                                            >
                                                <Badge
                                                    variant={slug === cat.slug ? "default" : "outline"}
                                                    className="cursor-pointer py-1.5 px-3"
                                                >
                                                    {cat.name}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Subcategories */}
                                {subcategories.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold mb-3">Type</h3>
                                        <div className="space-y-3">
                                            {subcategories.map((sub) => (
                                                <div key={sub.id} className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={`mobile-sub-${sub.slug}`}
                                                        checked={isChecked('types', sub.name)}
                                                        onCheckedChange={() => {
                                                            router.push(pathname + '?' + createQueryString('types', sub.name));
                                                        }}
                                                    />
                                                    <Label htmlFor={`mobile-sub-${sub.slug}`} className="text-sm">
                                                        {sub.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Price Range */}
                                <div>
                                    <h3 className="font-semibold mb-3">Price Range</h3>
                                    <div className="space-y-3">
                                        {[
                                            { value: 'under-500', label: 'Under ₱500' },
                                            { value: '500-1000', label: '₱500 - ₱1000' },
                                            { value: 'above-1000', label: 'Above ₱1000' },
                                        ].map((price) => (
                                            <div key={price.value} className="flex items-center space-x-3">
                                                <Checkbox
                                                    id={`mobile-price-${price.value}`}
                                                    checked={isChecked('priceRange', price.value)}
                                                    onCheckedChange={() => {
                                                        router.push(pathname + '?' + createQueryString('priceRange', price.value));
                                                    }}
                                                />
                                                <Label htmlFor={`mobile-price-${price.value}`} className="text-sm">
                                                    {price.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sizes */}
                                <div>
                                    <h3 className="font-semibold mb-3">Size</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {["XS", "S", "M", "L", "XL", "2XL"].map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => {
                                                    router.push(pathname + '?' + createQueryString('sizes', size));
                                                }}
                                                className={`
                                                    h-10 min-w-[48px] px-4 rounded-lg border-2 text-sm font-medium transition-all
                                                    ${isChecked('sizes', size)
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-muted hover:border-muted-foreground/30"
                                                    }
                                                `}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Apply Button */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                                <Button 
                                    className="w-full h-12" 
                                    onClick={() => setFilterOpen(false)}
                                >
                                    Show {products.length} Results
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Sort Button */}
                    <Sheet open={sortOpen} onOpenChange={setSortOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1">
                                {sortLabels[currentSort]}
                                <ChevronDown className="h-3 w-3" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-2xl">
                            <SheetHeader className="text-left pb-4">
                                <SheetTitle>Sort By</SheetTitle>
                            </SheetHeader>
                            <div className="space-y-1 pb-4">
                                {[
                                    { value: 'newest', label: 'Newest Arrivals' },
                                    { value: 'price-asc', label: 'Price: Low to High' },
                                    { value: 'price-desc', label: 'Price: High to Low' },
                                ].map((sort) => (
                                    <button
                                        key={sort.value}
                                        onClick={() => {
                                            router.push(pathname + '?' + setQueryParam('sort', sort.value));
                                            setSortOpen(false);
                                        }}
                                        className={`
                                            w-full text-left px-4 py-3 rounded-lg transition-colors
                                            ${currentSort === sort.value 
                                                ? "bg-primary/10 text-primary font-medium" 
                                                : "hover:bg-muted"
                                            }
                                        `}
                                    >
                                        {sort.label}
                                    </button>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Active Filter Pills */}
                    {activeFilters > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 py-4">
                <MobileProductGrid products={visibleProducts} />
                
                {/* Load More Button */}
                {hasMore && (
                    <div className="px-4 py-6">
                        <Button
                            variant="outline"
                            className="w-full h-12"
                            onClick={loadMore}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                `Load More (${remainingCount} remaining)`
                            )}
                        </Button>
                    </div>
                )}

                {/* End of list indicator */}
                {!hasMore && products.length > ITEMS_PER_PAGE && (
                    <p className="text-center text-sm text-muted-foreground py-6">
                        You&apos;ve seen all {products.length} products
                    </p>
                )}
            </div>
        </div>
    );
}

