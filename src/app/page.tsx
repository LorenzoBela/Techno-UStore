import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";

import { topApparel, topAccessories, topSupplies, topUniforms } from "@/lib/products";

export default function Home() {
  // Data imported from @/lib/products

  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <CategoryGrid />

      <CategoryShowcase title="Top Apparel" href="/category/apparel" products={topApparel} />
      <CategoryShowcase title="Trending Accessories" href="/category/accessories" products={topAccessories} />

      <FeaturedSection />

      <CategoryShowcase title="School Supplies" href="/category/supplies" products={topSupplies} />
      <CategoryShowcase title="Official Uniforms" href="/category/uniforms" products={topUniforms} />
    </main>
  );
}
