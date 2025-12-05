"use client";

import { ProductGrid } from "@/components/product/ProductGrid";
import { CategorySidebar } from "@/components/product/CategorySidebar";
import { MobileCategoryPage, ResponsiveStorePage } from "@/components/storefront/mobile";

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

interface CategoryContentProps {
    slug: string;
    categoryName: string;
    products: Product[];
    categories: Category[];
    subcategories: Subcategory[];
}

export function CategoryContent({
    slug,
    categoryName,
    products,
    categories,
    subcategories,
}: CategoryContentProps) {
    const mobileContent = (
        <MobileCategoryPage
            slug={slug}
            categoryName={categoryName}
            products={products}
            categories={categories}
            subcategories={subcategories}
        />
    );

    const desktopContent = (
        <div className="container py-8">
            {/* Enhanced Header Section */}
            <div className="mb-8 rounded-lg bg-primary/5 p-8 text-center md:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-primary">{categoryName}</h1>
                <p className="mt-2 text-muted-foreground">
                    Browse our exclusive collection of {categoryName.toLowerCase()}.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
                {/* Sidebar */}
                <aside className="hidden md:block">
                    <CategorySidebar 
                        currentCategory={slug} 
                        categories={categories} 
                        subcategories={subcategories} 
                    />
                </aside>

                {/* Product Grid */}
                <main>
                    <ProductGrid products={products} />
                </main>
            </div>
        </div>
    );

    return (
        <ResponsiveStorePage
            mobileContent={mobileContent}
            desktopContent={desktopContent}
        />
    );
}

