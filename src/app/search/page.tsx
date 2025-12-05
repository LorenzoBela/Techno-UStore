"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/ui/search-bar";
import { MobileProductGrid, ResponsiveStorePage } from "@/components/storefront/mobile";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Search, Loader2 } from "lucide-react";

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

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        const fetchResults = async () => {
            setIsLoading(true);
            setHasSearched(true);
            try {
                const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const mobileContent = (
        <div className="flex flex-col min-h-full pb-20">
            {/* Search Header */}
            <div className="sticky top-14 z-30 bg-background border-b px-4 py-3">
                <h1 className="text-lg font-bold mb-3">Search</h1>
                <SearchBar className="w-full" autoFocus />
            </div>

            {/* Results */}
            <div className="flex-1 py-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Searching...</p>
                    </div>
                ) : !hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-base font-semibold">Search Products</h2>
                        <p className="text-sm text-muted-foreground">
                            Type a product name, category, or keyword to find what you&apos;re looking for.
                        </p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-base font-semibold">No results found</h2>
                        <p className="text-sm text-muted-foreground">
                            We couldn&apos;t find anything for &quot;{query}&quot;. Try different keywords.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="px-4 mb-3">
                            <p className="text-sm text-muted-foreground">
                                {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
                            </p>
                        </div>
                        <MobileProductGrid products={results} />
                    </>
                )}
            </div>
        </div>
    );

    const desktopContent = (
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">Search Products</h1>
                <SearchBar className="max-w-xl" autoFocus />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Searching...</p>
                </div>
            ) : !hasSearched ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Search className="h-12 w-12 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Search Products</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                        Enter a search term above to find products by name, category, or description.
                    </p>
                </div>
            ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Search className="h-12 w-12 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">No results found</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                        We couldn&apos;t find any products matching &quot;{query}&quot;. Try different keywords.
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-muted-foreground mb-6">
                        {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
                    </p>
                    <ProductGrid products={results} />
                </>
            )}
        </div>
    );

    return (
        <ResponsiveStorePage
            mobileContent={mobileContent}
            desktopContent={desktopContent}
        />
    );
}

export default function SearchPage() {
    return <SearchContent />;
}

