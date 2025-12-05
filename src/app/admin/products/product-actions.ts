"use server";

import { prisma } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath, revalidateTag } from "next/cache";

// Helper to revalidate all product-related caches
function revalidateProducts() {
    revalidatePath("/admin/products");
    revalidatePath("/"); // Home page showcases
    revalidatePath("/category", "layout"); // All category pages
    revalidateTag("products", "max"); // Clear unstable_cache for featured products
}

// Maximum file size: 5MB (reasonable for product images)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadProductImage(formData: FormData) {
    const supabase = getSupabaseAdmin();
    const file = formData.get("file") as File;

    if (!file) {
        return { error: "No file uploaded" };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
        return { error: "File too large. Maximum size is 5MB." };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { error: "Invalid file type. Allowed: JPEG, PNG, WebP, AVIF" };
    }

    // Generate unique filename with timestamp to prevent collisions
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
            cacheControl: "31536000", // Cache for 1 year (images are immutable)
            upsert: false, // Don't overwrite
        });

    if (uploadError) {
        return { error: uploadError.message };
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return { url: data.publicUrl };
}

// Batch upload multiple images at once (more efficient for products with multiple images)
export async function uploadProductImages(formData: FormData) {
    const files = formData.getAll("files") as File[];
    
    if (files.length === 0) {
        return { error: "No files uploaded", urls: [] };
    }

    if (files.length > 10) {
        return { error: "Maximum 10 images per upload", urls: [] };
    }

    // Validate all files first
    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            return { error: `File "${file.name}" is too large. Maximum size is 5MB.`, urls: [] };
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            return { error: `File "${file.name}" has invalid type. Allowed: JPEG, PNG, WebP, AVIF`, urls: [] };
        }
    }

    const supabase = getSupabaseAdmin();
    const results: string[] = [];
    const errors: string[] = [];

    // Upload all files in parallel for speed
    const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const fileName = `${timestamp}-${randomStr}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file, {
                cacheControl: "31536000",
                upsert: false,
            });

        if (uploadError) {
            errors.push(`${file.name}: ${uploadError.message}`);
            return null;
        }

        const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
        return data.publicUrl;
    });

    const uploadResults = await Promise.all(uploadPromises);
    
    for (const url of uploadResults) {
        if (url) results.push(url);
    }

    if (errors.length > 0 && results.length === 0) {
        return { error: errors.join(", "), urls: [] };
    }

    return { 
        urls: results, 
        error: errors.length > 0 ? `Some uploads failed: ${errors.join(", ")}` : undefined 
    };
}

interface CreateProductData {
    name: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    stock: number;
    isFeatured?: boolean;
    images: string[];
    variants: { name: string; size: string; color: string; stock: number; imageUrl?: string }[];
}

export async function createProduct(data: CreateProductData) {
    try {
        // Use transaction to ensure all-or-nothing creation
        await prisma.$transaction(async (tx) => {
            // 1. Handle Category (Find or Create)
            let category = await tx.category.findUnique({
                where: { name: data.category },
            });

            if (!category) {
                // Generate slug for category
                const categorySlug = data.category.toLowerCase().replace(/ /g, "-");
                category = await tx.category.create({
                    data: {
                        name: data.category,
                        slug: categorySlug,
                    },
                });
            }

            // 2. Create Product with Relations
            // Use timestamp + random for unique slug to prevent collisions with concurrent admins
            const timestamp = Date.now();
            const productSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + timestamp.toString(36);

            await tx.product.create({
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    slug: productSlug,
                    isFeatured: data.isFeatured ?? false,
                    category: { connect: { id: category.id } },
                    subcategory: data.subcategory,
                    images: {
                        create: data.images.map((url) => ({
                            url: url,
                        })),
                    },
                    variants: {
                        create: data.variants.map((variant) => ({
                            name: variant.name,
                            size: variant.size,
                            color: variant.color,
                            stock: variant.stock,
                            imageUrl: variant.imageUrl,
                        })),
                    },
                },
            });
        });

        revalidateProducts();
        return { success: true };
    } catch (error: any) {
        console.error("Error creating product:", error);
        // Check for unique constraint violation
        if (error.code === 'P2002') {
            return { error: "A product with this name already exists. Please use a different name." };
        }
        return { error: error.message || "Failed to create product" };
    }
}

export async function updateProduct(
    id: string, 
    data: {
        name: string;
        description: string;
        price: number;
        stock: number;
        category: string;
        subcategory?: string;
        isFeatured?: boolean;
        images: string[];
        variants?: { name?: string; size: string; color?: string; stock: number; imageUrl?: string }[];
    },
    expectedUpdatedAt?: string // For optimistic locking - pass the updatedAt from when product was loaded
) {
    try {
        // Use transaction for atomic updates with optimistic locking
        await prisma.$transaction(async (tx) => {
            // 1. Verify product still exists and check for concurrent modifications
            const existingProduct = await tx.product.findUnique({
                where: { id },
                select: { id: true, updatedAt: true },
            });
            
            if (!existingProduct) {
                throw new Error("Product not found. It may have been deleted by another admin.");
            }

            // Optimistic locking: check if product was modified since admin loaded it
            if (expectedUpdatedAt) {
                const expectedDate = new Date(expectedUpdatedAt);
                if (existingProduct.updatedAt.getTime() !== expectedDate.getTime()) {
                    throw new Error(
                        "This product was modified by another admin. Please refresh the page and try again."
                    );
                }
            }

            // 2. Find or create category
            const category = await tx.category.upsert({
                where: { name: data.category },
                update: {},
                create: { name: data.category, slug: data.category.toLowerCase().replace(/ /g, "-") },
            });

            // 3. Update Product (updatedAt will be auto-updated by Prisma)
            await tx.product.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    isFeatured: data.isFeatured,
                    category: { connect: { id: category.id } },
                    subcategory: data.subcategory,
                },
            });

            // 4. Update Images (Delete all and recreate)
            await tx.productImage.deleteMany({ where: { productId: id } });
            if (data.images.length > 0) {
                await tx.productImage.createMany({
                    data: data.images.map((url) => ({
                        productId: id,
                        url: url,
                    })),
                });
            }

            // 5. Handle Variants
            if (data.variants) {
                await tx.productVariant.deleteMany({
                    where: { productId: id },
                });

                if (data.variants.length > 0) {
                    await tx.productVariant.createMany({
                        data: data.variants.map((v) => ({
                            productId: id,
                            name: v.name,
                            size: v.size,
                            color: v.color,
                            stock: v.stock,
                            imageUrl: v.imageUrl,
                        })),
                    });
                }
            }
        });

        revalidateProducts();
        // Also revalidate the specific product page
        revalidatePath(`/product/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { error: error.message || "Failed to update product" };
    }
}

export interface ProductFilters {
    category?: string[];
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    stockFilter?: "all" | "in-stock" | "low-stock" | "out-of-stock";
}

export interface PaginatedProducts {
    products: any[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Optimized products fetch with proper pagination for 2K+ products
export async function getProducts(
    page = 1, 
    pageSize = 25, 
    filters?: ProductFilters
): Promise<PaginatedProducts> {
    try {
        const where: any = {};

        // Category filter
        if (filters?.category && filters.category.length > 0) {
            where.category = {
                name: { in: filters.category }
            };
        }

        // Price range filter
        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.price = {};
            if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
            if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
        }

        // Search filter (name only for performance, use full-text for better results)
        if (filters?.search && filters.search.trim()) {
            where.OR = [
                { name: { contains: filters.search.trim(), mode: "insensitive" } },
                { description: { contains: filters.search.trim(), mode: "insensitive" } },
            ];
        }

        // Stock filter
        if (filters?.stockFilter && filters.stockFilter !== "all") {
            switch (filters.stockFilter) {
                case "in-stock":
                    where.stock = { gt: 10 };
                    break;
                case "low-stock":
                    where.stock = { gt: 0, lte: 10 };
                    break;
                case "out-of-stock":
                    where.stock = { lte: 0 };
                    break;
            }
        }

        // Parallel count and fetch for efficiency
        const [products, count] = await Promise.all([
            prisma.product.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    stock: true,
                    subcategory: true,
                    isFeatured: true,
                    createdAt: true,
                    category: { select: { name: true } },
                    images: { take: 1, select: { url: true } }, // Only first image for list view
                    variants: { select: { name: true, size: true, color: true, stock: true, imageUrl: true } },
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: "desc" },
            }),
            prisma.product.count({ where }),
        ]);

        // Transform to match Product interface
        const transformedProducts = products.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            price: Number(p.price),
            image: p.images[0]?.url || "",
            images: p.images.map((img) => img.url),
            category: p.category.name,
            subcategory: p.subcategory || undefined,
            stock: p.stock,
            isFeatured: p.isFeatured,
            variants: p.variants.map((v) => ({
                name: v.name || undefined,
                size: v.size,
                color: v.color || undefined,
                stock: v.stock,
                imageUrl: v.imageUrl || undefined
            })),
            isNew: (Date.now() - new Date(p.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000
        }));

        return { 
            products: transformedProducts, 
            count,
            page,
            pageSize,
            totalPages: Math.ceil(count / pageSize),
        };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { products: [], count: 0, page: 1, pageSize: 25, totalPages: 0 };
    }
}

export async function getProduct(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                variants: true,
                category: true,
            },
        });

        if (!product) return null;

        return {
            id: product.id,
            name: product.name,
            description: product.description || "",
            price: Number(product.price),
            image: product.images[0]?.url || "",
            images: product.images.map((img) => img.url),
            category: product.category.name,
            subcategory: product.subcategory || undefined,
            stock: product.stock,
            isFeatured: product.isFeatured,
            updatedAt: product.updatedAt.toISOString(), // For optimistic locking
            variants: product.variants.map((v) => ({
                name: v.name || undefined,
                size: v.size,
                color: v.color || undefined,
                stock: v.stock,
                imageUrl: v.imageUrl || undefined
            })),
        };
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

// Delete product with proper cleanup
export async function deleteProduct(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // Check if product exists
            const product = await tx.product.findUnique({
                where: { id },
                include: { images: true },
            });
            
            if (!product) {
                throw new Error("Product not found. It may have already been deleted.");
            }

            // Delete product (cascades to images and variants due to schema)
            await tx.product.delete({
                where: { id },
            });
        });

        revalidateProducts();
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { error: error.message || "Failed to delete product" };
    }
}

// Bulk delete products
export async function deleteProducts(ids: string[]) {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.product.deleteMany({
                where: { id: { in: ids } },
            });
        });

        revalidateProducts();
        return { success: true, deleted: ids.length };
    } catch (error: any) {
        console.error("Error deleting products:", error);
        return { error: error.message || "Failed to delete products" };
    }
}

// Get all categories for filters
export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            select: { name: true },
            orderBy: { name: "asc" },
        });
        return categories.map(c => c.name);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

// Toggle featured status for a product
export async function toggleFeaturedProduct(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            select: { isFeatured: true },
        });

        if (!product) {
            return { error: "Product not found" };
        }

        await prisma.product.update({
            where: { id },
            data: { isFeatured: !product.isFeatured },
        });

        revalidateProducts();
        return { success: true, isFeatured: !product.isFeatured };
    } catch (error: any) {
        console.error("Error toggling featured status:", error);
        return { error: error.message || "Failed to toggle featured status" };
    }
}

// Set featured status for a product (explicit value)
export async function setFeaturedProduct(id: string, isFeatured: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isFeatured },
        });

        revalidateProducts();
        return { success: true };
    } catch (error: any) {
        console.error("Error setting featured status:", error);
        return { error: error.message || "Failed to set featured status" };
    }
}