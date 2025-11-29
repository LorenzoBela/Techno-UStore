"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { allProducts, Product } from "@/lib/products";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [filteredProducts, setFilteredProducts] = React.useState<Product[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);

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

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 0) {
            const filtered = allProducts.filter((product) =>
                product.name.toLowerCase().includes(value.toLowerCase()) ||
                product.category.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredProducts(filtered);
            setIsOpen(true);
        } else {
            setFilteredProducts([]);
            setIsOpen(false);
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
                                <div className="mr-3 h-10 w-10 overflow-hidden rounded-md border bg-muted shrink-0">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
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
