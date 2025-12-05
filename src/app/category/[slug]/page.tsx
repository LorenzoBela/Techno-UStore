import { getProductsByCategory, getAllCategories, getSubcategoriesByCategorySlug } from "@/lib/products";
import { CategoryContent } from "@/components/product/CategoryContent";

// Revalidate category pages every 5 minutes
export const revalidate = 300;

// Pre-generate category pages at build time for instant navigation
export async function generateStaticParams() {
    const categories = await getAllCategories();
    return categories.map((cat) => ({ slug: cat.slug }));
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

    // Fetch all data in parallel
    const [products, categories, subcategories] = await Promise.all([
        getProductsByCategory(slug, filters),
        getAllCategories(),
        getSubcategoriesByCategorySlug(slug),
    ]);

    return (
        <CategoryContent
            slug={slug}
            categoryName={categoryName}
            products={products}
            categories={categories}
            subcategories={subcategories}
        />
    );
}
