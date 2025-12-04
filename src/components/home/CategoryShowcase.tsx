"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { memo } from "react";

interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    images?: string[];
    category: string;
    isNew?: boolean;
    stock?: number;
    description?: string;
}

interface CategoryShowcaseProps {
    title: string;
    href: string;
    products: Product[];
}

// Memoize to prevent unnecessary re-renders
export const CategoryShowcase = memo(function CategoryShowcase({ 
    title, 
    href, 
    products 
}: CategoryShowcaseProps) {
    return (
        <section className="py-12">
            <div className="container">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    <Link href={href} prefetch={true}>
                        <Button variant="ghost" className="gap-2">
                            View All <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        </section>
    );
});
