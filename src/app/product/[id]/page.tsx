import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { prisma } from "@/lib/db";

// Revalidate product pages every 5 minutes
export const revalidate = 300;

// Generate static paths for popular products at build time
export async function generateStaticParams() {
    try {
        // Pre-generate the 50 most recent products
        const products = await prisma.product.findMany({
            select: { id: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return products.map((p) => ({ id: p.id }));
    } catch {
        return [];
    }
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}
