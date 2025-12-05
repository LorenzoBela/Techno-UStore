import { getProduct } from "../../product-actions";
import { notFound } from "next/navigation";
import { EditProductContent } from "@/components/admin/EditProductContent";

// Force dynamic rendering to prevent prerender errors with database
export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return <EditProductContent product={product} />;
}
