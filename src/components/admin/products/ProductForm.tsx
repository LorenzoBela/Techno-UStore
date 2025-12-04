"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, uploadProductImage } from "@/app/admin/products/product-actions";
import { X, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Product } from "@/lib/types";

interface ProductFormProps {
    initialData?: Product;
}

interface Variant {
    name: string;
    size: string;
    color: string;
    stock: number;
    imageUrl?: string;
}

const subcategories: Record<string, string[]> = {
    Apparel: ["T-Shirts", "Hoodies", "Polos", "Jackets"],
    Accessories: ["Caps", "Lanyards", "Tumblers", "Bags"],
    Supplies: ["Notebooks", "Pens", "Art Materials"],
    Uniforms: ["PE Uniforms", "School Uniforms", "Org Shirts"],
};

export function ProductForm({ initialData }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price.toString() || "");
    const [stock, setStock] = useState(initialData?.stock.toString() || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [subcategory, setSubcategory] = useState(initialData?.subcategory || "");

    // Image State
    // For existing images, we store URLs. For new uploads, we store Files.
    // To simplify, we'll manage a list of "display objects" that can be either a URL or a File preview.
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);

    // Combined list for display and selection
    const allImages = [...existingImages, ...newFilePreviews];

    // Variant State
    const [variants, setVariants] = useState<Variant[]>(
        initialData?.variants?.map(v => ({
            name: v.name || "",
            size: v.size,
            color: v.color || "",
            stock: v.stock,
            imageUrl: v.imageUrl
        })) || []
    );
    const [newVariant, setNewVariant] = useState<Variant>({ name: "", size: "", color: "", stock: 0, imageUrl: "" });

    // Auto-calculate stock based on variants
    useEffect(() => {
        if (variants.length > 0) {
            const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
            setStock(totalStock.toString());
        }
    }, [variants]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewFiles((prev) => [...prev, ...files]);

            const previews = files.map((file) => URL.createObjectURL(file));
            setNewFilePreviews((prev) => [...prev, ...previews]);
        }
    };

    const removeImage = (index: number) => {
        if (index < existingImages.length) {
            // Removing an existing image
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
        } else {
            // Removing a new file
            const newIndex = index - existingImages.length;
            setNewFiles((prev) => prev.filter((_, i) => i !== newIndex));
            setNewFilePreviews((prev) => prev.filter((_, i) => i !== newIndex));
        }
    };

    const addVariant = () => {
        if (newVariant.name && newVariant.size && newVariant.stock >= 0) {
            setVariants([...variants, newVariant]);
            setNewVariant({ name: "", size: "", color: "", stock: 0, imageUrl: "" });
        } else {
            toast.error("Please fill in variant name, size, and valid stock");
        }
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (!category) {
                toast.error("Please select a category");
                setIsLoading(false);
                return;
            }

            // Upload New Images
            const uploadedImageUrls: string[] = [];
            for (const file of newFiles) {
                const formData = new FormData();
                formData.append("file", file);
                const result = await uploadProductImage(formData);
                if (result.error) {
                    toast.error(`Failed to upload image: ${result.error}`);
                    setIsLoading(false);
                    return;
                }
                if (result.url) {
                    uploadedImageUrls.push(result.url);
                }
            }

            // Combine existing and new image URLs
            const finalImages = [...existingImages, ...uploadedImageUrls];

            // Map variant image indices to actual URLs if they were selected from previews
            // If a variant selected a "new file preview", we need to find the corresponding uploaded URL.
            // This is tricky because indices shift.
            // Strategy:
            // 1. We have `allImages` array which was used for selection.
            // 2. `finalImages` corresponds to `allImages` but with new URLs replacing previews.
            // 3. So if variant.imageUrl was `allImages[i]`, we should use `finalImages[i]`.

            const finalVariants = variants.map(v => {
                const imageIndex = allImages.indexOf(v.imageUrl || "");
                if (imageIndex !== -1 && imageIndex < finalImages.length) {
                    return { ...v, imageUrl: finalImages[imageIndex] };
                }
                return v;
            });

            const productData = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                category,
                subcategory,
                images: finalImages,
                variants: finalVariants,
            };

            let result;
            if (initialData) {
                result = await updateProduct(initialData.id, productData);
            } else {
                result = await createProduct(productData);
            }

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(initialData ? "Product updated" : "Product created");
                router.push("/admin/products");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Product name"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Product description"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Total Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="0"
                                required
                                disabled={variants.length > 0}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Apparel">Apparel</SelectItem>
                                <SelectItem value="Accessories">Accessories</SelectItem>
                                <SelectItem value="Supplies">Supplies</SelectItem>
                                <SelectItem value="Uniforms">Uniforms</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {category && (
                        <div className="grid gap-2">
                            <Label>Subcategory</Label>
                            <Select value={subcategory} onValueChange={setSubcategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subcategory" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subcategories[category]?.map((sub) => (
                                        <SelectItem key={sub} value={sub}>
                                            {sub}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Product Images</Label>
                        <Input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="cursor-pointer"
                        />
                        {allImages.length > 0 && (
                            <div className="mt-4">
                                <Carousel className="w-full max-w-xs mx-auto">
                                    <CarouselContent>
                                        {allImages.map((src, index) => (
                                            <CarouselItem key={index}>
                                                <div className="relative aspect-square">
                                                    <Image
                                                        src={src}
                                                        alt={`Preview ${index}`}
                                                        fill
                                                        className="object-cover rounded-md"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-2 right-2 h-6 w-6"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 border p-4 rounded-md">
                        <div className="flex items-center justify-between">
                            <Label>Variants (Optional)</Label>
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Variant Name (e.g. Navy Blue - Large)"
                                value={newVariant.name}
                                onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="Size (e.g. S, M, L)"
                                    value={newVariant.size}
                                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                                />
                                <Input
                                    placeholder="Color (Optional)"
                                    value={newVariant.color}
                                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Stock"
                                    value={newVariant.stock}
                                    onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                                />
                                <Select
                                    value={newVariant.imageUrl || "none"}
                                    onValueChange={(val) => setNewVariant({ ...newVariant, imageUrl: val === "none" ? "" : val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Link Image" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No Image</SelectItem>
                                        {allImages.map((src, index) => (
                                            <SelectItem key={index} value={src}>
                                                Image {index + 1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button type="button" onClick={addVariant} variant="secondary" size="sm" className="w-full">
                            <Plus className="mr-2 h-4 w-4" /> Add Variant
                        </Button>

                        {variants.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {variants.map((variant, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-md text-sm">
                                        <div className="h-10 w-10 relative rounded overflow-hidden border shrink-0">
                                            {variant.imageUrl ? (
                                                <Image src={variant.imageUrl} alt="Variant" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No</div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <Input
                                                value={variant.name}
                                                onChange={(e) => {
                                                    const newVariants = [...variants];
                                                    newVariants[index].name = e.target.value;
                                                    setVariants(newVariants);
                                                }}
                                                placeholder="Variant Name"
                                                className="h-8 text-xs font-medium"
                                            />
                                            <div className="grid grid-cols-4 gap-1">
                                                <Input
                                                    value={variant.size}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].size = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    placeholder="Size"
                                                    className="h-7 text-xs"
                                                />
                                                <Input
                                                    value={variant.color}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].color = e.target.value;
                                                        setVariants(newVariants);
                                                    }}
                                                    placeholder="Color"
                                                    className="h-7 text-xs"
                                                />
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].stock = parseInt(e.target.value) || 0;
                                                        setVariants(newVariants);
                                                    }}
                                                    placeholder="Stock"
                                                    className="h-7 text-xs"
                                                />
                                                <Select
                                                    value={variant.imageUrl || "none"}
                                                    onValueChange={(val) => {
                                                        const newVariants = [...variants];
                                                        newVariants[index].imageUrl = val === "none" ? "" : val;
                                                        setVariants(newVariants);
                                                    }}
                                                >
                                                    <SelectTrigger className="h-7 text-xs">
                                                        <SelectValue placeholder="Img" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">No Image</SelectItem>
                                                        {allImages.map((src, idx) => (
                                                            <SelectItem key={idx} value={src}>
                                                                Img {idx + 1}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeVariant(index)}
                                            className="h-8 w-8 p-0 text-destructive shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : (initialData ? "Update Product" : "Create Product")}
                </Button>
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
            </div>
        </form >
    );
}
