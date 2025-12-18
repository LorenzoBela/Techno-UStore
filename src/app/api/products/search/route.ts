import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// =============================================================================
// High-Performance Search API - Optimized for 2K+ products with images
// =============================================================================
// Features:
// - Fast in-memory LRU cache for instant responses on repeated searches
// - Short TTL to ensure fresh results without stale data issues
// - Efficient database queries with indexed columns
// - Minimal data transfer (only essential fields)
// =============================================================================

// Simple LRU cache for in-memory storage (handles rapid typing scenarios)
const CACHE_MAX_SIZE = 100;
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL for fresh results

interface CacheEntry {
    data: SearchResult[];
    timestamp: number;
}

interface SearchResult {
    id: string;
    slug: string;
    name: string;
    price: number;
    image: string;
    category: string;
    categorySlug: string;
    inStock: boolean;
}

// In-memory cache with automatic cleanup
const searchCache = new Map<string, CacheEntry>();

function getCachedResult(key: string): SearchResult[] | null {
    const entry = searchCache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        searchCache.delete(key);
        return null;
    }

    return entry.data;
}

function setCachedResult(key: string, data: SearchResult[]): void {
    // Enforce max size with simple LRU eviction
    if (searchCache.size >= CACHE_MAX_SIZE) {
        // Delete oldest entry (first key in Map)
        const firstKey = searchCache.keys().next().value;
        if (firstKey) searchCache.delete(firstKey);
    }

    searchCache.set(key, { data, timestamp: Date.now() });
}

// Optimized database search function
async function searchProducts(query: string): Promise<SearchResult[]> {
    const products = await prisma.product.findMany({
        where: {
            OR: [
                // Match product name (primary indexed column)
                { name: { contains: query, mode: "insensitive" } },
                // Match category name
                { category: { name: { contains: query, mode: "insensitive" } } },
                // Match subcategory
                { subcategory: { contains: query, mode: "insensitive" } },
            ],
        },
        select: {
            // Only fetch essential fields for performance
            id: true,
            name: true,
            slug: true,
            price: true,
            stock: true,
            category: { select: { name: true, slug: true } },
            // Only fetch first image for dropdown preview
            images: { take: 1, select: { url: true } },
        },
        take: 12, // Limit dropdown results
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
        image: p.images[0]?.url || "/product-placeholder.png",
        category: p.category.name,
        categorySlug: p.category.slug,
        inStock: p.stock > 0,
    }));
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.trim() || "";

    // Require at least 2 characters for search
    if (query.length < 2) {
        return NextResponse.json([]);
    }

    // Normalize query for cache key
    const cacheKey = query.toLowerCase();

    try {
        // Check in-memory cache first (fastest path)
        const cachedResult = getCachedResult(cacheKey);
        if (cachedResult) {
            return NextResponse.json(cachedResult, {
                headers: {
                    'X-Cache': 'HIT',
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
                },
            });
        }

        // Fetch from database
        const results = await searchProducts(query);

        // Cache the results
        setCachedResult(cacheKey, results);

        return NextResponse.json(results, {
            headers: {
                'X-Cache': 'MISS',
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
