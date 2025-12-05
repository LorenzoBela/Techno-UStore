"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Eye, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types";

interface MobileProductCardProps {
    product: Product;
    onDelete?: (id: string) => void;
}

export function MobileProductCard({ product, onDelete }: MobileProductCardProps) {
    const stockStatus = product.stock === 0
        ? { label: "Out of Stock", variant: "destructive" as const }
        : product.stock <= 10
            ? { label: "Low Stock", variant: "secondary" as const }
            : { label: "In Stock", variant: "default" as const };

    return (
        <Card className="touch-manipulation overflow-hidden">
            <CardContent className="p-0">
                <div className="flex gap-3 p-3">
                    {/* Product Image */}
                    <div className="relative h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                        {product.images?.[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                                No image
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-medium text-sm truncate">{product.name}</h3>
                                <p className="text-xs text-muted-foreground truncate">
                                    {product.category}
                                    {product.subcategory && ` / ${product.subcategory}`}
                                </p>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/product/${product.id}`}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/products/${product.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    {onDelete && (
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => onDelete(product.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <span className="font-semibold text-sm">
                                ₱{product.price.toLocaleString()}
                            </span>
                            <Badge variant={stockStatus.variant} className="text-xs">
                                {stockStatus.label} ({product.stock})
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

