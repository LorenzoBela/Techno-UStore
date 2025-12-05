"use client";

import Link from "next/link";
import { 
    ShoppingBag, 
    Backpack, 
    NotebookPen, 
    GraduationCap, 
    Package,
    Shirt,
    Watch,
    BookOpen,
    Pencil,
    Gift,
    Tag,
    LucideIcon 
} from "lucide-react";
import { useCategories } from "@/lib/categories-context";

// Map category slugs/names to icons
const iconMap: Record<string, LucideIcon> = {
    // By slug
    apparel: ShoppingBag,
    accessories: Backpack,
    supplies: NotebookPen,
    uniforms: GraduationCap,
    clothing: Shirt,
    watches: Watch,
    books: BookOpen,
    stationery: Pencil,
    gifts: Gift,
    merchandise: Tag,
    // Fallback
    default: Package,
};

// Get icon for a category based on slug or name
function getCategoryIcon(slug: string, name: string): LucideIcon {
    // Try slug first
    const slugLower = slug.toLowerCase();
    if (iconMap[slugLower]) {
        return iconMap[slugLower];
    }
    
    // Try matching by name keywords
    const nameLower = name.toLowerCase();
    if (nameLower.includes('apparel') || nameLower.includes('cloth') || nameLower.includes('shirt')) {
        return ShoppingBag;
    }
    if (nameLower.includes('accessor') || nameLower.includes('bag')) {
        return Backpack;
    }
    if (nameLower.includes('suppli') || nameLower.includes('station')) {
        return NotebookPen;
    }
    if (nameLower.includes('uniform') || nameLower.includes('graduat')) {
        return GraduationCap;
    }
    if (nameLower.includes('book')) {
        return BookOpen;
    }
    if (nameLower.includes('watch') || nameLower.includes('jewel')) {
        return Watch;
    }
    if (nameLower.includes('gift')) {
        return Gift;
    }
    
    return iconMap.default;
}

export function MobileCategoryGrid() {
    const { categories } = useCategories();

    // Don't render if no categories
    if (!categories || categories.length === 0) {
        return null;
    }

    // Determine if we should center (4 or fewer categories fit on screen)
    const shouldCenter = categories.length <= 4;

    return (
        <section className="py-6 -mt-2">
            <div 
                className={`
                    flex gap-3 pb-2
                    ${shouldCenter 
                        ? "justify-center px-4" 
                        : "overflow-x-auto scrollbar-hide px-4 -mx-4 snap-x snap-mandatory"
                    }
                `}
            >
                {categories.map((category) => {
                    const Icon = getCategoryIcon(category.slug, category.name);
                    return (
                        <Link 
                            key={category.id} 
                            href={`/category/${category.slug}`}
                            className={shouldCenter ? "" : "flex-shrink-0 snap-start"}
                        >
                            <div className="flex flex-col items-center gap-2 w-[72px]">
                                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center active:scale-95 transition-transform duration-150">
                                    <Icon className="h-7 w-7 text-primary-foreground" />
                                </div>
                                <span className="text-xs font-medium text-center leading-tight">
                                    {category.name}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

