import { getTopProductsByCategory, getFeaturedProducts } from "@/lib/products";
import { HomeContent } from "@/components/home/HomeContent";

// Revalidate home page every 5 minutes for fresh products
export const revalidate = 300;

export default async function Home() {
  // Fetch all data in parallel for better performance
  const [
    apparelProducts,
    accessoriesProducts,
    suppliesProducts,
    uniformsProducts,
    featuredProducts,
  ] = await Promise.all([
    getTopProductsByCategory("apparel", 4),
    getTopProductsByCategory("accessories", 4),
    getTopProductsByCategory("supplies", 4),
    getTopProductsByCategory("uniforms", 4),
    getFeaturedProducts(12),
  ]);

  return (
    <HomeContent
      apparelProducts={apparelProducts}
      accessoriesProducts={accessoriesProducts}
      suppliesProducts={suppliesProducts}
      uniformsProducts={uniformsProducts}
      featuredProducts={featuredProducts}
    />
  );
}
