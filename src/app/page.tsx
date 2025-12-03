import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { getTopProductsByCategory } from "@/lib/products";

// Force dynamic rendering to prevent prerender errors with database
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch products from database
  const [topApparel, topAccessories, topSupplies, topUniforms] = await Promise.all([
    getTopProductsByCategory("apparel", 4),
    getTopProductsByCategory("accessories", 4),
    getTopProductsByCategory("supplies", 4),
    getTopProductsByCategory("uniforms", 4),
  ]);

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <CategoryGrid />

      {topApparel.length > 0 && (
        <CategoryShowcase title="Top Apparel" href="/category/apparel" products={topApparel} />
      )}
      {topAccessories.length > 0 && (
        <CategoryShowcase title="Trending Accessories" href="/category/accessories" products={topAccessories} />
      )}

      <FeaturedSection />

      {topSupplies.length > 0 && (
        <CategoryShowcase title="School Supplies" href="/category/supplies" products={topSupplies} />
      )}
      {topUniforms.length > 0 && (
        <CategoryShowcase title="Official Uniforms" href="/category/uniforms" products={topUniforms} />
      )}
    </main>
  );
}
