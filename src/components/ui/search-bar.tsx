"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface SearchProduct {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
}

export function SearchBar({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [filteredProducts, setFilteredProducts] = React.useState<SearchProduct[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (value.length > 0) {
            setIsLoading(true);
            // Debounce the API call
            debounceRef.current = setTimeout(async () => {
                try {
                    const response = await fetch(`/api/products/search?q=${encodeURIComponent(value)}`);
                    const results = await response.json();
                    setFilteredProducts(results);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search error:", error);
                    setFilteredProducts([]);
                } finally {
                    setIsLoading(false);
                }
            }, 300);
        } else {
            setFilteredProducts([]);
            setIsOpen(false);
            setIsLoading(false);
        }
    };

    const handleSelect = (productId: string) => {
        router.push(`/product/${productId}`);
        setQuery("");
        setIsOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && filteredProducts.length > 0) {
            handleSelect(filteredProducts[0].id);
        }
    };

    return (
        <div ref={containerRef} className={cn("relative w-full", className)}>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 w-full"
                    value={query}
                    onChange={handleSearch}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (query.length > 0) setIsOpen(true);
                    }}
                    autoFocus={autoFocus}
                />
            </div>
            {isOpen && filteredProducts.length > 0 && (
                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
                    <div className="p-1">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
                                onClick={() => handleSelect(product.id)}
                            >
                                <div className="relative mr-3 h-10 w-10 overflow-hidden rounded-md border bg-muted shrink-0">
                                    {product.image ? (
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground">
                                            No Img
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">{product.name}</span>
                                    <span className="text-xs text-muted-foreground">{product.category}</span>
                                </div>
                                <span className="ml-auto text-xs font-medium">₱{product.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {isOpen && query.length > 0 && filteredProducts.length === 0 && (
                <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md p-2 text-sm text-muted-foreground text-center">
                    No results found.
                </div>
            )}
        </div>
    );
}
