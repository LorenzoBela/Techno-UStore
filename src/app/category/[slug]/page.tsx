import { ProductGrid } from "@/components/product/ProductGrid";
import { CategorySidebar } from "@/components/product/CategorySidebar";
import { getProductsByCategory, getAllCategories } from "@/lib/products";

// Force dynamic rendering to prevent prerender errors with database
export const dynamic = 'force-dynamic';

export default async function CategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

    // Parse filters from searchParams
    const filters = {
        types: typeof resolvedSearchParams.types === 'string' ? resolvedSearchParams.types.split(',') : undefined,
        priceRange: typeof resolvedSearchParams.priceRange === 'string' ? resolvedSearchParams.priceRange.split(',') : undefined,
        sizes: typeof resolvedSearchParams.sizes === 'string' ? resolvedSearchParams.sizes.split(',') : undefined,
        sort: typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined,
    };

    // Fetch products and categories from database
    const [products, categories] = await Promise.all([
        getProductsByCategory(slug, filters),
        getAllCategories(),
    ]);

    return (
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
                    <CategorySidebar currentCategory={slug} categories={categories} />
                </aside>

                {/* Mobile Filter (Optional - for now just hiding sidebar on mobile, 
                    but in real app would use a Sheet or Accordion) */}

                {/* Product Grid with View Toggle */}
                <main>
                    <ProductGrid products={products} />
                </main>
            </div>
        </div>
    );
}
