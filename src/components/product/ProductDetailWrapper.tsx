"use client";

import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { MobileProductDetail, ResponsiveStorePage } from "@/components/storefront/mobile";
import { Product } from "@/lib/types";

interface ProductDetailWrapperProps {
    product: Product;
}

export function ProductDetailWrapper({ product }: ProductDetailWrapperProps) {
    return (
        <ResponsiveStorePage
            mobileContent={<MobileProductDetail product={product} />}
            desktopContent={<ProductDetailClient product={product} />}
        />
    );
}

