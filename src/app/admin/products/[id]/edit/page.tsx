import { ProductForm } from "@/components/admin/products/ProductForm";
import { getProduct } from "../../product-actions";
import { notFound } from "next/navigation";

// Force dynamic rendering to prevent prerender errors with database
export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            </div>
            <ProductForm initialData={product} />
        </div>
    );
}
