"use client";

import { useDeviceDetect } from "@/lib/hooks/useDeviceDetect";
import { MobileHeader } from "@/components/admin/mobile/MobileHeader";
import { MobileProductForm } from "@/components/admin/mobile/MobileProductForm";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { Product } from "@/lib/types";

interface EditProductContentProps {
    product: Product;
}

export function EditProductContent({ product }: EditProductContentProps) {
    const { isMobile, isLoading } = useDeviceDetect();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen">
                <MobileHeader title="Edit Product" showBack backHref="/admin/products" />
                <div className="flex-1 p-4">
                    <MobileProductForm initialData={product} />
                </div>
            </div>
        );
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

