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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct, uploadProductImage, getCategories } from "@/app/admin/products/product-actions";
import { getSubcategoriesByCategoryName } from "@/app/admin/products/categories/category-actions";
import { X, Plus, Trash2, Loader2, Star, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Product } from "@/lib/types";
import { Switch } from "@/components/ui/switch";

interface MobileProductFormProps {
    initialData?: Product;
}

interface Variant {
    name: string;
    size: string;
    color: string;
    stock: number;
    imageUrl?: string;
}

interface SubcategoryOption {
    id: string;
    name: string;
    slug: string;
}

export function MobileProductForm({ initialData }: MobileProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Category and subcategory options
    const [categories, setCategories] = useState<string[]>([]);
    const [subcategories, setSubcategories] = useState<SubcategoryOption[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    // Form State
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [price, setPrice] = useState(initialData?.price.toString() || "");
    const [stock, setStock] = useState(initialData?.stock.toString() || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [subcategory, setSubcategory] = useState(initialData?.subcategory || "");
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);

    // Image State
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);

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
    const [showVariantForm, setShowVariantForm] = useState(false);
    const [newVariant, setNewVariant] = useState<Variant>({ name: "", size: "", color: "", stock: 0, imageUrl: "" });

    // Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            setLoadingCategories(true);
            const cats = await getCategories();
            setCategories(cats);
            setLoadingCategories(false);
        }
        fetchCategories();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        async function fetchSubcategories() {
            if (!category) {
                setSubcategories([]);
                return;
            }
            setLoadingSubcategories(true);
            const subs = await getSubcategoriesByCategoryName(category);
            setSubcategories(subs);
            setLoadingSubcategories(false);
            
            if (subcategory && !subs.find(s => s.name === subcategory)) {
                setSubcategory("");
            }
        }
        fetchSubcategories();
    }, [category]);

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
            setExistingImages((prev) => prev.filter((_, i) => i !== index));
        } else {
            const newIndex = index - existingImages.length;
            setNewFiles((prev) => prev.filter((_, i) => i !== newIndex));
            setNewFilePreviews((prev) => prev.filter((_, i) => i !== newIndex));
        }
    };

    const addVariant = () => {
        if (newVariant.name && newVariant.size && newVariant.stock >= 0) {
            setVariants([...variants, newVariant]);
            setNewVariant({ name: "", size: "", color: "", stock: 0, imageUrl: "" });
            setShowVariantForm(false);
        } else {
            toast.error("Please fill in variant name, size, and stock");
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

            const finalImages = [...existingImages, ...uploadedImageUrls];

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
                isFeatured,
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
        <form onSubmit={handleSubmit} className="space-y-4 pb-24">
            {/* Basic Info */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter product name"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Product description"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price *</Label>
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
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock *</Label>
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
                </CardContent>
            </Card>

            {/* Category */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select value={category} onValueChange={setCategory} disabled={loadingCategories}>
                            <SelectTrigger>
                                {loadingCategories ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <SelectValue placeholder="Select category" />
                                )}
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {category && (
                        <div className="space-y-2">
                            <Label>Subcategory</Label>
                            <Select 
                                value={subcategory} 
                                onValueChange={setSubcategory}
                                disabled={loadingSubcategories}
                            >
                                <SelectTrigger>
                                    {loadingSubcategories ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Loading...</span>
                                        </div>
                                    ) : (
                                        <SelectValue placeholder="Select subcategory" />
                                    )}
                                </SelectTrigger>
                                <SelectContent>
                                    {subcategories.length === 0 ? (
                                        <SelectItem value="_none" disabled>No subcategories</SelectItem>
                                    ) : (
                                        subcategories.map((sub) => (
                                            <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="flex items-center gap-2">
                            <Star className={`h-4 w-4 ${isFeatured ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                            <Label htmlFor="featured" className="text-sm">Featured Product</Label>
                        </div>
                        <Switch
                            id="featured"
                            checked={isFeatured}
                            onCheckedChange={setIsFeatured}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Images */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Images</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                        {allImages.map((src, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                                <Image
                                    src={src}
                                    alt={`Image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground mt-1">Add</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Variants */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Variants</CardTitle>
                        {!showVariantForm && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowVariantForm(true)}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {variants.map((variant, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{variant.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {variant.size} {variant.color && `• ${variant.color}`} • {variant.stock} in stock
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-destructive"
                                onClick={() => removeVariant(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    {showVariantForm && (
                        <div className="space-y-3 p-3 border rounded-lg">
                            <Input
                                placeholder="Variant Name (e.g. Navy Blue - Large)"
                                value={newVariant.name}
                                onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="Size"
                                    value={newVariant.size}
                                    onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                                />
                                <Input
                                    placeholder="Color"
                                    value={newVariant.color}
                                    onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                                />
                            </div>
                            <Input
                                type="number"
                                placeholder="Stock"
                                value={newVariant.stock || ""}
                                onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setShowVariantForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="flex-1"
                                    onClick={addVariant}
                                >
                                    Add Variant
                                </Button>
                            </div>
                        </div>
                    )}

                    {variants.length === 0 && !showVariantForm && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                            No variants added
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Submit Button - Fixed at bottom */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        initialData ? "Update Product" : "Create Product"
                    )}
                </Button>
            </div>
        </form>
    );
}

