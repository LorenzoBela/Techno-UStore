import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

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
