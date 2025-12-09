"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Star } from "lucide-react";
import { useState, useTransition } from "react";
import { useAuth } from "@/lib/auth-context";
import { ViewProductDialog } from "./view-product-dialog";
import Link from "next/link";
import { toggleFeaturedProduct, deleteProduct } from "@/app/admin/products/product-actions";
import { toast } from "sonner";

// Featured toggle cell component
function FeaturedToggle({ product }: { product: Product }) {
    const [isPending, startTransition] = useTransition();
    const [isFeatured, setIsFeatured] = useState(product.isFeatured ?? false);

    const handleToggle = () => {
        startTransition(async () => {
            const result = await toggleFeaturedProduct(product.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                setIsFeatured(result.isFeatured ?? false);
                toast.success(result.isFeatured ? "Product featured" : "Product unfeatured");
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Switch
                checked={isFeatured}
                onCheckedChange={handleToggle}
                disabled={isPending}
                className="data-[state=checked]:bg-amber-500"
            />
            {isFeatured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
        </div>
    );
}

export const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
            const image = row.getValue("image") as string;
            return (
                <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                    {image ? (
                        <Image
                            src={image}
                            alt={row.getValue("name")}
                            fill
                            sizes="40px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            No Img
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "name",
        id: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        enableColumnFilter: true,
        filterFn: "includesString",
    },
    {
        accessorKey: "category",
        header: "Category",
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("price"));
            const formatted = new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
            }).format(amount);

            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        id: "featured",
        header: "Featured",
        cell: ({ row }) => {
            const product = row.original;
            return <FeaturedToggle product={product} />;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original;
            const [showViewDialog, setShowViewDialog] = useState(false);
            const { user } = useAuth();

            return (
                <>
                    <ViewProductDialog
                        open={showViewDialog}
                        onOpenChange={setShowViewDialog}
                        product={product}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(product.id)}
                            >
                                Copy product ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
                                View details
                            </DropdownMenuItem>
                            <Link href={`/admin/products/${product.id}/edit`}>
                                <DropdownMenuItem>
                                    Edit product
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
                                        toast.promise(deleteProduct(product.id, user?.id, user?.email || undefined), {
                                            loading: "Deleting product...",
                                            success: (data) => {
                                                if (data.error) throw new Error(data.error);
                                                return "Product deleted successfully";
                                            },
                                            error: (err) => err.message || "Failed to delete product"
                                        });
                                    }
                                }}
                            >
                                Delete product
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            );
        },
    },
];
