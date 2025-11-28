"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CategorySidebarProps {
    currentCategory: string;
}

const categories = [
    { name: "Apparel", slug: "apparel" },
    { name: "Accessories", slug: "accessories" },
    { name: "Supplies", slug: "supplies" },
    { name: "Uniforms", slug: "uniforms" },
];

const subcategories: Record<string, string[]> = {
    apparel: ["T-Shirts", "Hoodies", "Polos", "Jackets"],
    accessories: ["Caps", "Lanyards", "Tumblers", "Bags"],
    supplies: ["Notebooks", "Pens", "Art Materials"],
    uniforms: ["PE Uniforms", "School Uniforms", "Org Shirts"],
};

export function CategorySidebar({ currentCategory }: CategorySidebarProps) {
    const currentSubcategories = subcategories[currentCategory.toLowerCase()] || [];

    return (
        <div className="flex flex-col gap-6">
            {/* Categories */}
            <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-lg">Categories</h3>
                <div className="flex flex-col gap-2">
                    {categories.map((category) => (
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
                                <div key={sub} className="flex items-center space-x-2">
                                    <Checkbox id={`sub-${sub}`} />
                                    <Label htmlFor={`sub-${sub}`}>{sub}</Label>
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
                        <Checkbox id="price-1" />
                        <Label htmlFor="price-1">Under ₱500</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="price-2" />
                        <Label htmlFor="price-2">₱500 - ₱1000</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="price-3" />
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
                            <Checkbox id={`size-${size}`} />
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
                    <Button variant="outline" className="justify-start">Newest Arrivals</Button>
                    <Button variant="ghost" className="justify-start">Price: Low to High</Button>
                    <Button variant="ghost" className="justify-start">Price: High to Low</Button>
                </div>
            </div>
        </div>
    );
}
