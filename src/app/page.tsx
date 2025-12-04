import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { getTopProductsByCategory } from "@/lib/products";
import { Suspense } from "react";

// Revalidate home page every 5 minutes for fresh products
export const revalidate = 300;

// Loading skeleton for category showcases
function CategoryShowcaseSkeleton() {
  return (
    <div className="container py-8">
      <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Server component that fetches products
async function CategoryProducts({ 
  categorySlug, 
  title, 
  href 
}: { 
  categorySlug: string; 
  title: string; 
  href: string; 
}) {
  const products = await getTopProductsByCategory(categorySlug, 4);
  
  if (products.length === 0) return null;
  
  return <CategoryShowcase title={title} href={href} products={products} />;
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <CategoryGrid />

      <Suspense fallback={<CategoryShowcaseSkeleton />}>
        <CategoryProducts 
          categorySlug="apparel" 
          title="Top Apparel" 
          href="/category/apparel" 
        />
      </Suspense>
      
      <Suspense fallback={<CategoryShowcaseSkeleton />}>
        <CategoryProducts 
          categorySlug="accessories" 
          title="Trending Accessories" 
          href="/category/accessories" 
        />
      </Suspense>

      <FeaturedSection />

      <Suspense fallback={<CategoryShowcaseSkeleton />}>
        <CategoryProducts 
          categorySlug="supplies" 
          title="School Supplies" 
          href="/category/supplies" 
        />
      </Suspense>
      
      <Suspense fallback={<CategoryShowcaseSkeleton />}>
        <CategoryProducts 
          categorySlug="uniforms" 
          title="Official Uniforms" 
          href="/category/uniforms" 
        />
      </Suspense>
    </main>
  );
}
