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
    }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1", 10);
    const category = params.category || "";
    const search = params.search || "";
    const stockFilter = (params.stock || "all") as "all" | "in-stock" | "low-stock" | "out-of-stock";

    // Parallel fetch for products and categories
    const [{ products, count, totalPages }, categories] = await Promise.all([
        getProducts(page, 25, {
            category: category ? [category] : undefined,
            search: search || undefined,
            stockFilter,
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
            categories={categories}
        />
    );
}
