"use server";

import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.length < 1) {
        return NextResponse.json([]);
    }

    try {
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { category: { name: { contains: query, mode: "insensitive" } } },
                ],
            },
            include: {
                category: true,
                images: true,
            },
            take: 10,
        });

        const results = products.map((p) => ({
            id: p.id,
            name: p.name,
            price: typeof p.price === "number" ? p.price : Number(p.price),
            image: p.images[0]?.url || "",
            category: p.category.name,
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json([]);
    }
}
