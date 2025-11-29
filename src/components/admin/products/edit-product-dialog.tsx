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
import { Product } from "@/lib/products";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would call an API to update the product
        console.log("Updated product:", formData);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
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
                                                    { size: "", stock: 0 },
                                                ],
                                            }))
                                        }
                                    >
                                        Add Variant
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.variants && formData.variants.length > 0 && (
                                        <div className="grid grid-cols-5 gap-4 px-1">
                                            <Label className="col-span-2 text-xs text-muted-foreground">Size</Label>
                                            <Label className="col-span-2 text-xs text-muted-foreground">Stock</Label>
                                            <span className="col-span-1"></span>
                                        </div>
                                    )}
                                    {formData.variants?.map((variant, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-5 items-center gap-4"
                                        >
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
                                                className="col-span-2"
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
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
