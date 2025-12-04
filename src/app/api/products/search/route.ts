"use server";

import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";

// Cache search results for 5 minutes
const searchProducts = unstable_cache(
    async (query: string) => {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { category: { name: { contains: query, mode: "insensitive" } } },
                ],
            },
            select: {
                id: true,
                name: true,
                price: true,
                category: { select: { name: true } },
                images: { take: 1, select: { url: true } },
            },
            take: 10,
        });

        return products.map((p) => ({
            id: p.id,
            name: p.name,
            price: typeof p.price === "number" ? p.price : Number(p.price),
            image: p.images[0]?.url || "",
            category: p.category.name,
        }));
    },
    ["product-search"],
    { revalidate: 300 }
);

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 1) {
        return NextResponse.json([]);
    }

    try {
        const results = await searchProducts(query.toLowerCase());
        
        return NextResponse.json(results, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json([]);
    }
}
