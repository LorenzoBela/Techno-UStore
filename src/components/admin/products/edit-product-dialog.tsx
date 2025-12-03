import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { updateProduct } from "@/app/admin/products/product-actions";
import { toast } from "sonner";

interface EditProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product;
}

export function EditProductDialog({
    open,
    onOpenChange,
    product,
}: EditProductDialogProps) {
    const [formData, setFormData] = useState<Product>(product);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFormData(product);
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateProduct(product.id, {
            name: formData.name,
            description: formData.description || "",
            price: formData.price,
            stock: formData.stock,
            category: formData.category,
            images: formData.images || [],
            variants: formData.variants?.map(v => ({
                name: v.name,
                size: v.size,
                color: v.color,
                stock: v.stock,
                imageUrl: v.imageUrl
            }))
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Product updated successfully");
            onOpenChange(false);
        }
        setIsLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>
                        Make changes to the product here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {(formData.category === "Apparel" ||
                            formData.category === "Uniforms") ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Variants</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                variants: [
                                                    ...(prev.variants || []),
                                                    { name: "", size: "", color: "", stock: 0 },
                                                ],
                                            }))
                                        }
                                    >
                                        Add Variant
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.variants && formData.variants.length > 0 && (
                                        <div className="grid grid-cols-7 gap-2 px-1">
                                            <Label className="col-span-2 text-xs text-muted-foreground">Name</Label>
                                            <Label className="col-span-1 text-xs text-muted-foreground">Size</Label>
                                            <Label className="col-span-2 text-xs text-muted-foreground">Color</Label>
                                            <Label className="col-span-1 text-xs text-muted-foreground">Stock</Label>
                                            <span className="col-span-1"></span>
                                        </div>
                                    )}
                                    {formData.variants?.map((variant, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-7 items-center gap-2"
                                        >
                                            <Input
                                                placeholder="Variant Name"
                                                value={variant.name || ""}
                                                onChange={(e) => {
                                                    const newVariants = [...(formData.variants || [])];
                                                    newVariants[index] = { ...newVariants[index], name: e.target.value };
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        variants: newVariants,
                                                    }));
                                                }}
                                                className="col-span-2"
                                            />
                                            <Input
                                                placeholder="Size"
                                                value={variant.size}
                                                onChange={(e) => {
                                                    const newVariants = [...(formData.variants || [])];
                                                    newVariants[index].size = e.target.value;
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        variants: newVariants,
                                                    }));
                                                }}
                                                className="col-span-1"
                                            />
                                            <Input
                                                placeholder="Color"
                                                value={variant.color || ""}
                                                onChange={(e) => {
                                                    const newVariants = [...(formData.variants || [])];
                                                    newVariants[index].color = e.target.value;
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        variants: newVariants,
                                                    }));
                                                }}
                                                className="col-span-2"
                                            />
                                            <Input
                                                type="number"
                                                placeholder="Stock"
                                                value={variant.stock}
                                                onChange={(e) => {
                                                    const newVariants = [...(formData.variants || [])];
                                                    newVariants[index].stock = parseInt(e.target.value) || 0;
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        variants: newVariants,
                                                    }));
                                                }}
                                                className="col-span-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="col-span-1 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                onClick={() => {
                                                    const newVariants = [...(formData.variants || [])];
                                                    newVariants.splice(index, 1);
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        variants: newVariants,
                                                    }));
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                <Label htmlFor="stock">Stock</Label>
                                <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    value={formData.stock}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
