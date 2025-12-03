import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Product } from "@/lib/types";

interface ViewProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
}

export function ViewProductDialog({
    open,
    onOpenChange,
    product,
}: ViewProductDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Product Details</DialogTitle>
                    <DialogDescription>
                        Detailed view of {product.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Left Column: Image */}
                    <div className="flex flex-col space-y-4">
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                                ID: {product.id.substring(0, 8)}...
                            </Badge>
                            {product.isNew && <Badge className="bg-blue-600 hover:bg-blue-700">New Arrival</Badge>}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-2xl leading-tight">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">{product.category}</p>
                        </div>

                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-bold text-primary">
                                {new Intl.NumberFormat("en-PH", {
                                    style: "currency",
                                    currency: "PHP",
                                }).format(product.price)}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Stock & Variants</h4>
                            {product.variants && product.variants.length > 0 ? (
                                <div className="rounded-md border overflow-hidden">
                                    <div className="grid grid-cols-4 border-b bg-muted/50 p-2 text-xs font-medium text-muted-foreground">
                                        <div className="col-span-2">Variant</div>
                                        <div>Color</div>
                                        <div className="text-right">Stock</div>
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto">
                                        {product.variants.map((variant, index) => (
                                            <div key={index} className="grid grid-cols-4 items-center p-2 text-sm border-b last:border-0 hover:bg-muted/30">
                                                <div className="col-span-2 flex items-center gap-2">
                                                    {variant.imageUrl && (
                                                        <div className="h-8 w-8 rounded border overflow-hidden shrink-0">
                                                            <img src={variant.imageUrl} alt="" className="h-full w-full object-cover" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{variant.size}</span>
                                                </div>
                                                <div className="text-muted-foreground text-xs">{variant.color || "-"}</div>
                                                <div className="text-right font-mono">{variant.stock}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between rounded-md border p-3 bg-muted/20">
                                    <span className="text-sm font-medium">Total Stock</span>
                                    <span className="text-sm font-bold">{product.stock} units</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
