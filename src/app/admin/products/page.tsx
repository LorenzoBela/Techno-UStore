import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { columns } from "@/components/admin/products/columns";
import { Product } from "@/lib/types";
import { Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import { getProducts, getCategories } from "./product-actions";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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

    // Build URL helper for pagination
    const buildUrl = (newPage: number) => {
        const params = new URLSearchParams();
        params.set("page", newPage.toString());
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        if (stockFilter !== "all") params.set("stock", stockFilter);
        return `/admin/products?${params.toString()}`;
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {count.toLocaleString()} products total
                    </p>
                </div>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>

            {/* Filters - Server-side via URL params */}
            <div className="flex flex-col sm:flex-row gap-4">
                <form className="flex-1 max-w-sm">
                    <Input
                        name="search"
                        placeholder="Search products..."
                        defaultValue={search}
                        className="w-full"
                    />
                    <input type="hidden" name="category" value={category} />
                    <input type="hidden" name="stock" value={stockFilter} />
                </form>
                <form className="flex gap-2">
                    <input type="hidden" name="search" value={search} />
                    <Select name="category" defaultValue={category || "all"}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select name="stock" defaultValue={stockFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Stock" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stock</SelectItem>
                            <SelectItem value="in-stock">In Stock (&gt;10)</SelectItem>
                            <SelectItem value="low-stock">Low Stock (1-10)</SelectItem>
                            <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button type="submit" variant="secondary">Filter</Button>
                </form>
            </div>

            {/* Products Table */}
            <div className="rounded-md border">
                {products.length === 0 ? (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        {search || category ? "No products match your filters" : "No products yet"}
                    </div>
                ) : (
                    <ProductTable columns={columns} data={products as Product[]} />
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Page {page} of {totalPages} ({count.toLocaleString()} products)
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={buildUrl(1)}>
                            <Button variant="outline" size="icon" disabled={page <= 1}>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={buildUrl(Math.max(1, page - 1))}>
                            <Button variant="outline" size="icon" disabled={page <= 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <span className="text-sm px-2">{page} / {totalPages}</span>
                        <Link href={buildUrl(Math.min(totalPages, page + 1))}>
                            <Button variant="outline" size="icon" disabled={page >= totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href={buildUrl(totalPages)}>
                            <Button variant="outline" size="icon" disabled={page >= totalPages}>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
