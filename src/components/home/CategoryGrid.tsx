"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
    ShoppingBag,
    Backpack,
    Coffee,
    PenTool,
    Cpu,
    Home,
    Sparkles,
    Package
} from "lucide-react";
import { useCategories } from "@/lib/categories-context";

// Icon mapping for categories - add new icons as needed
const iconMap: Record<string, React.ElementType> = {
    "apparel": ShoppingBag,
    "bags": Backpack,
    "accessories": Sparkles,
    "drinkware": Coffee,
    "stationery": PenTool,
    "tech-electronics": Cpu,
    "home-living": Home,
    "stickers-novelty": Package,
};

// Default icon for unmapped categories
const DefaultIcon = Package;

export function CategoryGrid() {
    const { categories } = useCategories();

    // Take first 8 categories for the grid (4 on mobile, 8 on desktop)
    const displayCategories = categories.slice(0, 8);

    if (displayCategories.length === 0) {
        return null;
    }

    return (
        <section className="py-12">
            <div className="container">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
                    {displayCategories.map((category) => {
                        const Icon = iconMap[category.slug] || DefaultIcon;
                        return (
                            <Link key={category.id} href={`/category/${category.slug}`}>
                                <Card className="h-full transition-all hover:bg-muted/50 hover:shadow-md group">
                                    <CardContent className="flex flex-col items-center justify-center gap-3 p-4 sm:p-6 text-center">
                                        <div className="rounded-full p-3 sm:p-4 bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                            <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                                        </div>
                                        <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
                                            {category.name}
                                        </h3>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
