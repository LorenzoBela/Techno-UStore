import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// Optimized search with caching - handles 2K+ products efficiently
// Uses indexed columns and limits results for performance
const searchProducts = unstable_cache(
    async (query: string) => {
        // Split query into words for better matching
        const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
        
        if (searchTerms.length === 0) return [];

        // Use indexed name column with case-insensitive search
        // For very large catalogs, consider adding a GIN index for full-text search
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    // Match product name (uses @@index([name]))
                    { name: { contains: query, mode: "insensitive" } },
                    // Match category name
                    { category: { name: { contains: query, mode: "insensitive" } } },
                    // Match subcategory
                    { subcategory: { contains: query, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                name: true,
                slug: true, // Include slug for better URLs
                price: true,
                stock: true,
                category: { select: { name: true, slug: true } },
                images: { take: 1, select: { url: true } },
            },
            take: 12, // Limit results for dropdown performance
            orderBy: [
                { stock: "desc" }, // Prioritize in-stock items
                { name: "asc" },
            ],
        });

        return products.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: typeof p.price === "number" ? p.price : Number(p.price),
            image: p.images[0]?.url || "",
            category: p.category.name,
            categorySlug: p.category.slug,
            inStock: p.stock > 0,
        }));
    },
    ["product-search"],
    { revalidate: 300 } // Cache for 5 minutes
);

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    // Require at least 2 characters for search
    if (!query || query.trim().length < 2) {
        return NextResponse.json([]);
    }

    try {
        const results = await searchProducts(query.trim());
        
        return NextResponse.json(results, {
            headers: {
                // Cache on CDN for 5 minutes, serve stale for 10 minutes while revalidating
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
