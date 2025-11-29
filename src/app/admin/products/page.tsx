"use client";

import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { columns } from "@/components/admin/products/columns";
import { allProducts } from "@/lib/products";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                <Link href="/admin/products/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                    </Button>
                </Link>
            </div>
            <ProductTable columns={columns} data={allProducts} />
        </div>
    );
}
