"use client";

import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCallback } from "react";

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

interface CategorySidebarProps {
    currentCategory: string;
    categories?: Category[];
    subcategories?: Subcategory[];
}

// Fallback categories if none provided
const defaultCategories: Category[] = [
    { name: "Apparel", slug: "apparel", count: 0 },
    { name: "Accessories", slug: "accessories", count: 0 },
    { name: "Supplies", slug: "supplies", count: 0 },
    { name: "Uniforms", slug: "uniforms", count: 0 },
];

export function CategorySidebar({ currentCategory, categories, subcategories = [] }: CategorySidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const displayCategories = categories && categories.length > 0 ? categories : defaultCategories;
    const currentSubcategories = subcategories;

    // Create Query String
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());

            // Handle multiple values for same key (comma separated)
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

    // Handle single value params (like sort)
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

    return (
        <div className="flex flex-col gap-6">
            {/* Categories */}
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg">Categories</h3>
                <div className="flex flex-col gap-2">
                    {displayCategories.map((category) => (
                        <Link key={category.slug} href={`/category/${category.slug}`}>
                            <Button
                                variant={currentCategory === category.slug ? "default" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                    currentCategory === category.slug
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                )}
                            >
                                {category.name}
                                {(category.count ?? 0) > 0 && (
                                    <span className="ml-auto text-xs opacity-60">({category.count})</span>
                                )}
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>

            {currentSubcategories.length > 0 && (
                <>
                    <Separator />
                    {/* Subcategories Filter */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg">Type</h3>
                        <div className="flex flex-col gap-3">
                            {currentSubcategories.map((sub) => (
                                <div key={sub.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`sub-${sub.slug}`}
                                        checked={isChecked('types', sub.name)}
                                        onCheckedChange={() => {
                                            router.push(pathname + '?' + createQueryString('types', sub.name));
                                        }}
                                    />
                                    <Label htmlFor={`sub-${sub.slug}`}>{sub.name}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <Separator />

            {/* Price Range Filter */}
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg">Price Range</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="price-1"
                            checked={isChecked('priceRange', 'under-500')}
                            onCheckedChange={() => {
                                router.push(pathname + '?' + createQueryString('priceRange', 'under-500'));
                            }}
                        />
                        <Label htmlFor="price-1">Under ₱500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="price-2"
                            checked={isChecked('priceRange', '500-1000')}
                            onCheckedChange={() => {
                                router.push(pathname + '?' + createQueryString('priceRange', '500-1000'));
                            }}
                        />
                        <Label htmlFor="price-2">₱500 - ₱1000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="price-3"
                            checked={isChecked('priceRange', 'above-1000')}
                            onCheckedChange={() => {
                                router.push(pathname + '?' + createQueryString('priceRange', 'above-1000'));
                            }}
                        />
                        <Label htmlFor="price-3">Above ₱1000</Label>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Size Filter */}
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg">Size</h3>
                <div className="flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL", "2XL"].map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                            <Checkbox
                                id={`size-${size}`}
                                checked={isChecked('sizes', size)}
                                onCheckedChange={() => {
                                    router.push(pathname + '?' + createQueryString('sizes', size));
                                }}
                            />
                            <Label htmlFor={`size-${size}`}>{size}</Label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Sort By */}
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg">Sort By</h3>
                <div className="flex flex-col gap-2">
                    <Button
                        variant={searchParams.get('sort') === 'newest' || !searchParams.get('sort') ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => router.push(pathname + '?' + setQueryParam('sort', 'newest'))}
                    >
                        Newest Arrivals
                    </Button>
                    <Button
                        variant={searchParams.get('sort') === 'price-asc' ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => router.push(pathname + '?' + setQueryParam('sort', 'price-asc'))}
                    >
                        Price: Low to High
                    </Button>
                    <Button
                        variant={searchParams.get('sort') === 'price-desc' ? "secondary" : "ghost"}
                        className="justify-start"
                        onClick={() => router.push(pathname + '?' + setQueryParam('sort', 'price-desc'))}
                    >
                        Price: High to Low
                    </Button>
                </div>
            </div>
        </div>
    );
}
