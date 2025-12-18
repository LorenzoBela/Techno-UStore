import { Product } from "@/lib/types";
import { getProducts, getCategories } from "./product-actions";
import { ProductsContent } from "@/components/admin/ProductsContent";

// Force dynamic to ensure fresh data for admins
export const dynamic = 'force-dynamic';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        category?: string;
        search?: string;
        stock?: string;
        featured?: string;
        visibility?: string;
    }>;
}) {
    const params = await searchParams;
    const page = parseInt(Array.isArray(params.page) ? params.page[0] : (params.page || "1"), 10);

    // Normalize string/array inputs
    const getParam = (p: string | string[] | undefined) => Array.isArray(p) ? p[0] : (p || "");

    const rawCategory = getParam(params.category);
    const category = rawCategory === "all" ? "" : rawCategory;

    const search = getParam(params.search);

    const rawStock = getParam(params.stock) || "all";
    const stockFilter = rawStock as "all" | "in-stock" | "low-stock" | "out-of-stock";

    const rawFeatured = getParam(params.featured) || "all";
    const featuredFilter = rawFeatured as "all" | "featured" | "not-featured";

    const rawVisibility = getParam(params.visibility) || "all";
    const visibilityFilter = rawVisibility as "all" | "visible" | "hidden";

    // Parallel fetch for products and categories
    const [{ products, count, totalPages }, categories] = await Promise.all([
        getProducts(page, 25, {
            category: category ? [category] : undefined,
            search: search || undefined,
            stockFilter,
            featuredFilter,
            visibilityFilter,
        }),
        getCategories(),
    ]);

    return (
        <ProductsContent
            products={products as Product[]}
            count={count}
            totalPages={totalPages}
            page={page}
            category={category}
            search={search}
            stockFilter={stockFilter}
            featuredFilter={featuredFilter}
            visibilityFilter={visibilityFilter}
            categories={categories}
        />
    );
}

