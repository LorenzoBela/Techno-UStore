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
import { Product } from "@/lib/products";

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
                    <div className="flex flex-col items-center justify-start space-y-4">
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
                        <div className="flex w-full items-center justify-between">
                            <Badge variant="outline" className="text-sm">
                                {product.id}
                            </Badge>
                            {product.isNew && <Badge>New Arrival</Badge>}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-2xl leading-none tracking-tight">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                        </div>

                        <div className="flex items-baseline space-x-2">
                            <span className="text-3xl font-bold text-primary">
                                {new Intl.NumberFormat("en-PH", {
                                    style: "currency",
                                    currency: "PHP",
                                }).format(product.price)}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-sm">Stock & Variants</h4>
                            {product.variants && product.variants.length > 0 ? (
                                <div className="rounded-md border">
                                    <div className="grid grid-cols-2 border-b bg-muted/50 p-2 text-xs font-medium text-muted-foreground">
                                        <div>Size</div>
                                        <div className="text-right">Quantity</div>
                                    </div>
                                    <div className="max-h-[150px] overflow-y-auto">
                                        {product.variants.map((variant, index) => (
                                            <div key={index} className="grid grid-cols-2 p-2 text-sm border-b last:border-0">
                                                <div className="font-medium">{variant.size}</div>
                                                <div className="text-right text-muted-foreground">{variant.stock} units</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between rounded-md border p-3">
                                    <span className="text-sm font-medium">Total Stock</span>
                                    <span className="text-sm text-muted-foreground">{product.stock} units</span>
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
