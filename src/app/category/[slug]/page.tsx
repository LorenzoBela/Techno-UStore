import { ProductGrid } from "@/components/product/ProductGrid";
import { CategorySidebar } from "@/components/product/CategorySidebar";
import { getProductsByCategory, getAllCategories, getSubcategoriesByCategorySlug } from "@/lib/products";
import { Suspense } from "react";

// Revalidate category pages every 5 minutes
export const revalidate = 300;

// Pre-generate category pages at build time for instant navigation
export async function generateStaticParams() {
    const categories = await getAllCategories();
    return categories.map((cat) => ({ slug: cat.slug }));
}

// Loading skeleton for the product grid
function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                    <div className="aspect-square bg-muted animate-pulse rounded-lg" />
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                </div>
            ))}
        </div>
    );
}

// Server component that fetches products
async function ProductsLoader({
    slug,
    filters,
}: {
    slug: string;
    filters: {
        types?: string[];
        priceRange?: string[];
        sizes?: string[];
        sort?: string;
    };
}) {
    const products = await getProductsByCategory(slug, filters);
    return <ProductGrid products={products} />;
}

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

    // Fetch categories and subcategories (cached)
    const [categories, subcategories] = await Promise.all([
        getAllCategories(),
        getSubcategoriesByCategorySlug(slug),
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
                    <CategorySidebar currentCategory={slug} categories={categories} subcategories={subcategories} />
                </aside>

                {/* Product Grid with Suspense for streaming */}
                <main>
                    <Suspense fallback={<ProductGridSkeleton />}>
                        <ProductsLoader slug={slug} filters={filters} />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
