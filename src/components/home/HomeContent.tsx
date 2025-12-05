"use client";

import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { 
    MobileHero, 
    MobileCategoryGrid, 
    MobileFeaturedSection, 
    MobileCategoryShowcase,
    ResponsiveStorePage 
} from "@/components/storefront/mobile";
import { Product } from "@/lib/types";

interface HomeContentProps {
    apparelProducts: Product[];
    accessoriesProducts: Product[];
    suppliesProducts: Product[];
    uniformsProducts: Product[];
    featuredProducts: Product[];
}

export function HomeContent({
    apparelProducts,
    accessoriesProducts,
    suppliesProducts,
    uniformsProducts,
    featuredProducts,
}: HomeContentProps) {
    const mobileContent = (
        <main className="flex min-h-screen flex-col">
            <MobileHero />
            <MobileCategoryGrid />
            
            {apparelProducts.length > 0 && (
                <MobileCategoryShowcase 
                    title="Top Apparel" 
                    href="/category/apparel" 
                    products={apparelProducts} 
                />
            )}
            
            {accessoriesProducts.length > 0 && (
                <MobileCategoryShowcase 
                    title="Trending Accessories" 
                    href="/category/accessories" 
                    products={accessoriesProducts} 
                />
            )}

            {featuredProducts.length > 0 && (
                <MobileFeaturedSection products={featuredProducts} />
            )}

            {suppliesProducts.length > 0 && (
                <MobileCategoryShowcase 
                    title="School Supplies" 
                    href="/category/supplies" 
                    products={suppliesProducts} 
                />
            )}
            
            {uniformsProducts.length > 0 && (
                <MobileCategoryShowcase 
                    title="Official Uniforms" 
                    href="/category/uniforms" 
                    products={uniformsProducts} 
                />
            )}
        </main>
    );

    const desktopContent = (
        <main className="flex min-h-screen flex-col">
            <Hero />
            <CategoryGrid />
            
            {apparelProducts.length > 0 && (
                <CategoryShowcase 
                    title="Top Apparel" 
                    href="/category/apparel" 
                    products={apparelProducts} 
                />
            )}
            
            {accessoriesProducts.length > 0 && (
                <CategoryShowcase 
                    title="Trending Accessories" 
                    href="/category/accessories" 
                    products={accessoriesProducts} 
                />
            )}

            {featuredProducts.length > 0 && (
                <FeaturedSection products={featuredProducts} />
            )}

            {suppliesProducts.length > 0 && (
                <CategoryShowcase 
                    title="School Supplies" 
                    href="/category/supplies" 
                    products={suppliesProducts} 
                />
            )}
            
            {uniformsProducts.length > 0 && (
                <CategoryShowcase 
                    title="Official Uniforms" 
                    href="/category/uniforms" 
                    products={uniformsProducts} 
                />
            )}
        </main>
    );

    return (
        <ResponsiveStorePage 
            mobileContent={mobileContent} 
            desktopContent={desktopContent} 
        />
    );
}

