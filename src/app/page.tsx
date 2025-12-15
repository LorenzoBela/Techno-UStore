import { getTopProductsByCategory, getFeaturedProducts } from "@/lib/products";
import { HomeContent } from "@/components/home/HomeContent";

// Revalidate home page every 5 minutes for fresh products
export const revalidate = 300;

export default async function Home() {
  // Fetch all data in parallel for better performance
  // Updated to use new category slugs that have products
  const [
    apparelProducts,
    accessoriesProducts,
    bagsProducts,
    drinkwareProducts,
    featuredProducts,
  ] = await Promise.all([
    getTopProductsByCategory("apparel", 4),
    getTopProductsByCategory("accessories", 4),
    getTopProductsByCategory("bags", 4),
    getTopProductsByCategory("drinkware", 4),
    getFeaturedProducts(12),
  ]);

  return (
    <HomeContent
      apparelProducts={apparelProducts ?? []}
      accessoriesProducts={accessoriesProducts ?? []}
      bagsProducts={bagsProducts ?? []}
      drinkwareProducts={drinkwareProducts ?? []}
      featuredProducts={featuredProducts ?? []}
    />
  );
}
